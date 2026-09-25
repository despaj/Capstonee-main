const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth");
const {
  enforceInputScope,
  enforceQueryScope,
  requireResourceScope,
} = require("../middleware/resourceScope");
router.use(authenticate);
const pool = require("../db");
const { syncIngredientFromBatches } = require("../utils/inventoryAutomation");

router.get(
  "/transactions",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Franchisee",
    "Manager",
    "Staff",
  ),
  enforceQueryScope({ brandField: null }),
  async (req, res) => {
    try {
      const { branch } = req.query;
      const result = branch
        ? await pool.query(
            "SELECT * FROM transactions WHERE branch=$1 AND (is_voided=false OR is_voided IS NULL) ORDER BY created_at DESC",
            [branch],
          )
        : await pool.query(
            "SELECT * FROM transactions WHERE (is_voided=false OR is_voided IS NULL) ORDER BY created_at DESC",
          );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  },
);

router.get(
  "/transactions/voided",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Franchisee",
    "Manager",
    "Staff",
  ),
  enforceQueryScope({ brandField: null }),
  async (req, res) => {
    try {
      const { branch } = req.query;
      const result = branch
        ? await pool.query(
            "SELECT * FROM transactions WHERE branch=$1 AND is_voided=true ORDER BY voided_at DESC",
            [branch],
          )
        : await pool.query(
            "SELECT * FROM transactions WHERE is_voided=true ORDER BY voided_at DESC",
          );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch voided transactions" });
    }
  },
);

router.post(
  "/transactions",
  authorize("Super Admin", "Franchisee", "Manager", "Staff"),
  enforceInputScope({ brandField: null }),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        branch,
        cashier,
        shop,
        payment_method,
        cash_received,
        discount_pct,
        subtotal,
        discount_amt,
        vat_enabled,
        vat_amt,
        total,
        change_due,
        note,
        items,
      } = req.body;
      await client.query("BEGIN");

      let cogs = 0;
      for (const item of items || []) {
        const qty = parseInt(item.qty || 0);
        if (item.source === "ingredient") {
          const ingredientId = item.baseProductId || item.id;

          const ing = await client.query(
            "SELECT cost_per_unit FROM ingredients WHERE id=$1",
            [ingredientId],
          );

          const costPerPiece = parseFloat(ing.rows[0]?.cost_per_unit || 0);

          const piecesPerSellingUnit = parseFloat(item.unit_pcs || 1);

          const totalPiecesSold = qty * piecesPerSellingUnit;

          cogs += costPerPiece * totalPiecesSold;
        }
      }

      const result = await client.query(
        `INSERT INTO transactions (branch, cashier, shop, payment_method, cash_received, discount_pct, subtotal, discount_amt, vat_enabled, vat_amt, total, change_due, note, items, cogs)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [
          branch,
          cashier,
          shop,
          payment_method,
          parseFloat(cash_received) || 0,
          parseFloat(discount_pct) || 0,
          parseFloat(subtotal) || 0,
          parseFloat(discount_amt) || 0,
          vat_enabled || false,
          parseFloat(vat_amt) || 0,
          parseFloat(total) || 0,
          parseFloat(change_due) || 0,
          note || null,
          JSON.stringify(items || []),
          cogs,
        ],
      );

      for (const item of items || []) {
        const qty = parseInt(item.qty || 0);
        if (item.source === "ingredient") {
          const ingredientId = item.baseProductId || item.id;

          const ingRow = await client.query(
            `SELECT brand, perishable
     FROM ingredients
     WHERE id=$1`,
            [ingredientId],
          );

          const brand = ingRow.rows[0]?.brand || "";
          const perishable = ingRow.rows[0]?.perishable;

          const isFefo =
            brand.toLowerCase().includes("ipharma") || !!perishable;

          const orderClause = isFefo
            ? "exp_date ASC NULLS LAST, created_at ASC"
            : "supply_date ASC NULLS LAST, created_at ASC";

          const batchRows = await client.query(
            `SELECT id, stock
     FROM ingredient_batches
     WHERE ingredient_id=$1
       AND stock > 0
     ORDER BY ${orderClause}`,
            [ingredientId],
          );

          const piecesPerSellingUnit = Number(item.unit_pcs) || 1;

          let remaining = qty * piecesPerSellingUnit;

          for (const batch of batchRows.rows) {
            if (remaining <= 0) break;

            const available = Number(batch.stock) || 0;

            const deductFromBatch = Math.min(remaining, available);

            await client.query(
              `UPDATE ingredient_batches
       SET stock = stock - $1,
           updated_at = NOW()
       WHERE id=$2`,
              [deductFromBatch, batch.id],
            );

            remaining -= deductFromBatch;
          }

          if (remaining > 0) {
            throw new Error(
              `Insufficient stock for ${ing.name || ing.ingredient_id}`,
            );
          }

          await syncIngredientFromBatches(client, ingredientId);

          continue;
        }

        // Recipe-based menu item (unchanged)
        const recipe = await client.query(
          `SELECT pi.ingredient_id, pi.quantity, i.name, i.stock
     FROM product_ingredients pi JOIN ingredients i ON i.id=pi.ingredient_id
     WHERE pi.inventory_id=$1`,
          [item.id],
        );

        for (const ing of recipe.rows) {
          const deductAmount = parseFloat(ing.quantity) * qty;
          const batchRows = await client.query(
            `SELECT id, stock FROM ingredient_batches WHERE ingredient_id=$1 AND stock>0 ORDER BY supply_date ASC NULLS LAST, created_at ASC`,
            [ing.ingredient_id],
          );
          let remaining = deductAmount;
          for (const batch of batchRows.rows) {
            if (remaining <= 0) break;
            const deductFromBatch = Math.min(
              remaining,
              parseFloat(batch.stock),
            );
            await client.query(
              `UPDATE ingredient_batches SET stock=stock-$1, updated_at=NOW() WHERE id=$2`,
              [deductFromBatch, batch.id],
            );
            remaining -= deductFromBatch;
          }
          await client.query(
            `UPDATE ingredients SET stock=(SELECT COALESCE(SUM(stock),0) FROM ingredient_batches WHERE ingredient_id=$1), updated_at=NOW() WHERE id=$1`,
            [ing.ingredient_id],
          );
        }
      }

      await client.query("COMMIT");
      res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("POST /transactions error:", err);
      const isStockError = err.message?.startsWith("Insufficient stock");

      res.status(isStockError ? 409 : 500).json({
        error: isStockError ? err.message : "Failed to save transaction",
      });
    } finally {
      client.release();
    }
  },
);

router.post(
  "/transactions/:id/void",
  authorize("Super Admin", "Manager"),
  requireResourceScope({ table: "transactions", brandColumn: null }),
  async (req, res) => {
    try {
      const { voided_by, reason } = req.body || {}; // ← add `|| {}`
      const result = await pool.query(
        `UPDATE transactions SET is_voided=true, voided_at=NOW(), voided_by=$1, void_reason=$2
       WHERE id=$3 AND (is_voided=false OR is_voided IS NULL) RETURNING *`,
        [voided_by || "Manager", reason || "Manual void", req.params.id],
      );
      if (result.rows.length === 0)
        return res
          .status(404)
          .json({ error: "Transaction not found or already voided" });
      res.json({ success: true, transaction: result.rows[0] });
    } catch (err) {
      console.error("POST /transactions/:id/void error:", err);
      res.status(500).json({ error: "Failed to void transaction" });
    }
  },
);

router.post(
  "/transactions/:id/retrieve",
  authorize("Super Admin", "Manager"),
  requireResourceScope({ table: "transactions", brandColumn: null }),
  async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE transactions SET is_voided=false, voided_at=NULL, voided_by=NULL, void_reason=NULL
       WHERE id=$1 AND is_voided=true RETURNING *`,
        [req.params.id],
      );
      if (result.rows.length === 0)
        return res
          .status(404)
          .json({ error: "Transaction not found or not voided" });
      res.json({ success: true, transaction: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve transaction" });
    }
  },
);

module.exports = router;
