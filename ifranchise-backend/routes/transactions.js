const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/transactions", async (req, res) => {
  try {
    const { branch } = req.query;
    const result = branch
      ? await pool.query("SELECT * FROM transactions WHERE branch=$1 AND (is_voided=false OR is_voided IS NULL) ORDER BY created_at DESC", [branch])
      : await pool.query("SELECT * FROM transactions WHERE (is_voided=false OR is_voided IS NULL) ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.get("/transactions/voided", async (req, res) => {
  try {
    const { branch } = req.query;
    const result = branch
      ? await pool.query("SELECT * FROM transactions WHERE branch=$1 AND is_voided=true ORDER BY voided_at DESC", [branch])
      : await pool.query("SELECT * FROM transactions WHERE is_voided=true ORDER BY voided_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch voided transactions" });
  }
});

router.post("/transactions", async (req, res) => {
  const client = await pool.connect();
  try {
    const { branch, cashier, shop, payment_method, cash_received, discount_pct, subtotal, discount_amt, vat_enabled, vat_amt, total, change_due, note, items } = req.body;
    await client.query("BEGIN");

    let cogs = 0;
    for (const item of (items || [])) {
      const qty = parseInt(item.qty || 0);
      const product = await client.query("SELECT cost FROM inventory WHERE id=$1", [item.id]);
      cogs += parseFloat(product.rows[0]?.cost || 0) * qty;
    }

    const result = await client.query(
      `INSERT INTO transactions (branch, cashier, shop, payment_method, cash_received, discount_pct, subtotal, discount_amt, vat_enabled, vat_amt, total, change_due, note, items, cogs)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [branch, cashier, shop, payment_method, parseFloat(cash_received)||0, parseFloat(discount_pct)||0, parseFloat(subtotal)||0, parseFloat(discount_amt)||0, vat_enabled||false, parseFloat(vat_amt)||0, parseFloat(total)||0, parseFloat(change_due)||0, note||null, JSON.stringify(items||[]), cogs]
    );

    for (const item of (items || [])) {
      const recipe = await client.query(
        `SELECT pi.ingredient_id, pi.quantity, i.name, i.stock
         FROM product_ingredients pi JOIN ingredients i ON i.id=pi.ingredient_id
         WHERE pi.inventory_id=$1`,
        [item.id]
      );

      for (const ing of recipe.rows) {
        const deductAmount = parseFloat(ing.quantity) * parseInt(item.qty);
        const batchRows = await client.query(
          `SELECT id, stock FROM ingredient_batches WHERE ingredient_id=$1 AND stock>0 ORDER BY supply_date ASC NULLS LAST, created_at ASC`,
          [ing.ingredient_id]
        );

        let remaining = deductAmount;
        for (const batch of batchRows.rows) {
          if (remaining <= 0) break;
          const deductFromBatch = Math.min(remaining, parseFloat(batch.stock));
          await client.query(`UPDATE ingredient_batches SET stock=stock-$1, updated_at=NOW() WHERE id=$2`, [deductFromBatch, batch.id]);
          remaining -= deductFromBatch;
        }

        await client.query(
          `UPDATE ingredients SET stock=(SELECT COALESCE(SUM(stock),0) FROM ingredient_batches WHERE ingredient_id=$1), updated_at=NOW() WHERE id=$1`,
          [ing.ingredient_id]
        );
      }

      await client.query(`UPDATE inventory SET stock=stock-$1, updated_at=NOW() WHERE id=$2`, [parseInt(item.qty), item.id]);
    }

    await client.query("COMMIT");
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /transactions error:", err);
    res.status(500).json({ error: "Failed to save transaction" });
  } finally {
    client.release();
  }
});

router.post("/transactions/:id/void", async (req, res) => {
  try {
    const { voided_by, reason } = req.body || {};   // ← add `|| {}`
    const result = await pool.query(
      `UPDATE transactions SET is_voided=true, voided_at=NOW(), voided_by=$1, void_reason=$2
       WHERE id=$3 AND (is_voided=false OR is_voided IS NULL) RETURNING *`,
      [voided_by || "Manager", reason || "Manual void", req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Transaction not found or already voided" });
    res.json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    console.error("POST /transactions/:id/void error:", err);
    res.status(500).json({ error: "Failed to void transaction" });
  }
});

router.post("/transactions/:id/retrieve", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE transactions SET is_voided=false, voided_at=NULL, voided_by=NULL, void_reason=NULL
       WHERE id=$1 AND is_voided=true RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Transaction not found or not voided" });
    res.json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve transaction" });
  }
});

module.exports = router;