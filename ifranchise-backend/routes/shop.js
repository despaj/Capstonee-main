const express = require("express");
const router = express.Router();
const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");

async function priceFromCost(brand, name, fallback) {
  const r = await pool.query(
    "SELECT cost_per_unit FROM ingredients WHERE brand=$1 AND name=$2 ORDER BY updated_at DESC LIMIT 1",
    [brand, name]
  );
  if (r.rows.length === 0) return fallback;
  return Math.round(Number(r.rows[0].cost_per_unit) * 1.10 * 100) / 100;
}

router.get("/shop-items", async (req, res) => {
  try {
    const { brand } = req.query;
    const cols = `id, name, price, unit, image_url, is_visible, shop, brand, stock, branches, ingredient_id`;
    const result = brand
      ? await pool.query(
          `SELECT ${cols} FROM shop_items WHERE LOWER(TRIM(brand)) = LOWER(TRIM($1)) ORDER BY created_at DESC`,
          [brand]
        )
      : await pool.query(`SELECT ${cols} FROM shop_items ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /shop-items error:", err.message);
    res.status(500).json({ error: "Failed to fetch shop items" });
  }
});

router.post("/shop-items", async (req, res) => {
  try {
    const { name, price, unit, image_url, shop, brand, stock, is_visible, branches, performed_by, latitude, longitude, imported, ingredient_id, performed_by_role, restored } = req.body;
    const finalPrice = await priceFromCost(brand, name, parseFloat(price));
    const result = await pool.query(
      `INSERT INTO shop_items (name, price, unit, image_url, shop, brand, stock, is_visible, branches, ingredient_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, finalPrice, unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true, branches, ingredient_id || null]
    );
    const item = result.rows[0];

    const action = restored ? "restore" : imported ? "import" : "create";
    await logActivity({
      action,
      itemName: item.name,
      performedBy: performed_by || "System",
      details: {
        shop, brand, stock: item.stock, price: item.price, unit: item.unit,
        ...(restored ? { note: "Restored from delete history" } : {}),
      },
      req,
      branch: shop,
      module: "Mobile Shop",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: "Failed to add shop item" });
  }
});
router.put("/shop-items/:id", async (req, res) => {
  try {
    const { name, price, unit, image_url, shop, brand, stock, is_visible, branches, performed_by, latitude, longitude, performed_by_role } = req.body;

    const before = await pool.query("SELECT * FROM shop_items WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const oldItem = before.rows[0];
    const finalPrice = await priceFromCost(brand, name, parseFloat(price));
    const result = await pool.query(
      `UPDATE shop_items SET name=$1, price=$2, unit=$3, image_url=$4, shop=$5, brand=$6, stock=$7, is_visible=$8, branches=$9 WHERE id=$10 RETURNING *`,
      [name, finalPrice, unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true, branches || [], req.params.id]
    );
    const updatedItem = result.rows[0];

    const changes = {};
    for (const field of ["name", "price", "unit", "shop", "brand", "stock", "is_visible"]) {
      if (String(oldItem[field] ?? "") !== String(updatedItem[field] ?? ""))
        changes[field] = { from: oldItem[field], to: updatedItem[field] };
    }
    await logActivity({
      action: "update",
      itemName: updatedItem.name,
      performedBy: performed_by || "System",
      details: changes,
      req,
      branch: updatedItem.shop,
      module: "Mobile Shop",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });
    res.json({ success: true, item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: "Failed to update shop item" });
  }
});

router.put("/shop-items/:id/toggle", async (req, res) => {
  try {
    const { performed_by, latitude, longitude, performed_by_role } = req.body || {};

    const current = await pool.query("SELECT * FROM shop_items WHERE id=$1", [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const item = current.rows[0];

    const result = await pool.query("UPDATE shop_items SET is_visible=$1 WHERE id=$2 RETURNING *", [!item.is_visible, req.params.id]);
    const updated = result.rows[0];

    await logActivity({
      action: updated.is_visible ? "show" : "hide",
      itemName: item.name,
      performedBy: performed_by || "System",
      details: { note: updated.is_visible ? "Item made visible" : "Item hidden" },
      req,
      branch: item.shop,
      module: "Mobile Shop",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle visibility" });
  }
});

router.patch("/shop-items/:id/deduct-stock", async (req, res) => {
  const client = await pool.connect();
  try {
    const { quantity, performed_by, order_id, performed_by_role, latitude, longitude } = req.body;
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

    await client.query("BEGIN");

    const dupe = await client.query(
      `SELECT 1 FROM stock_deduction_log WHERE order_id = $1 AND shop_item_id = $2`,
      [order_id, req.params.id]
    );
    if (dupe.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.json({ success: true, alreadyDeducted: true });
    }

    const itemRes = await client.query(
      `UPDATE shop_items SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING *`,
      [qty, req.params.id]
    );
if (itemRes.rows.length === 0) {
  const cur = await client.query(`SELECT stock FROM shop_items WHERE id=$1`, [req.params.id]);
  console.log(`[deduct-stock] shop_items.stock insufficient — item ${req.params.id}, have ${cur.rows[0]?.stock}, need ${qty}`);
  await client.query("ROLLBACK");
  return res.status(409).json({ error: "Insufficient stock to deduct" });
}
    const item = itemRes.rows[0];

    let ingredientResult = null;

    if (item.ingredient_id) {
      const ingRow = await client.query(`SELECT brand, perishable FROM ingredients WHERE id=$1`, [item.ingredient_id]);
      const brand = ingRow.rows[0]?.brand || "";
      const isFefo = brand.toLowerCase().includes("ipharma") || !!ingRow.rows[0]?.perishable;

      const batchesRes = await client.query(
        `SELECT * FROM ingredient_batches WHERE ingredient_id=$1 AND stock > 0`,
        [item.ingredient_id]
      );

      const sortedBatches = [...batchesRes.rows].sort((a, b) => {
        if (isFefo) {
          const da = a.exp_date ? new Date(a.exp_date).getTime() : Infinity;
          const db = b.exp_date ? new Date(b.exp_date).getTime() : Infinity;
          return da - db;
        }
        const da = new Date(a.supply_date || a.mfg_date || a.created_at || 0).getTime();
        const db = new Date(b.supply_date || b.mfg_date || b.created_at || 0).getTime();
        return da - db;
      });

      const totalAvailable = sortedBatches.reduce((s, b) => s + Number(b.stock || 0), 0);
      if (totalAvailable < qty) {
        console.log(`[deduct-stock] ingredient batch stock insufficient — ingredient ${item.ingredient_id}, have ${totalAvailable}, need ${qty}`);
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "Insufficient linked ingredient stock to deduct" });
      }

      let remaining = qty;
      for (const b of sortedBatches) {
        if (remaining <= 0) break;
        const take = Math.min(remaining, Number(b.stock));
        await client.query(`UPDATE ingredient_batches SET stock = stock - $1, updated_at=NOW() WHERE id=$2`, [take, b.id]);
        remaining -= take;
      }

      const totals = await client.query(
        `SELECT COALESCE(SUM(stock),0) AS total_stock, MIN(exp_date) FILTER (WHERE exp_date IS NOT NULL) AS earliest_exp
         FROM ingredient_batches WHERE ingredient_id=$1`,
        [item.ingredient_id]
      );
      const { total_stock, earliest_exp } = totals.rows[0];
      const ingRes = await client.query(
        `UPDATE ingredients SET stock=$1, extra_fields=extra_fields || jsonb_build_object('exp_date',$2::text), updated_at=NOW() WHERE id=$3 RETURNING *`,
        [total_stock, earliest_exp || null, item.ingredient_id]
      );
      ingredientResult = ingRes.rows[0];
    }

    await client.query("COMMIT");

      await logActivity({
        action: "deduct",
        itemName: item.name,
        performedBy: performed_by || "System",
        details: {
          note: `-${qty} deducted for Order #${order_id ?? "?"}`,
          remaining_shop_stock: item.stock,
          ...(ingredientResult ? { linked_ingredient: ingredientResult.name, remaining_ingredient_stock: ingredientResult.stock } : {}),
        },
        req,
        branch: item.shop,
        module: "Mobile Shop",
        latitude,
        longitude,
        role: performed_by_role || "Unknown",
      });

    res.json({ success: true, item, ingredient: ingredientResult });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PATCH /shop-items/:id/deduct-stock error:", err);
    res.status(500).json({ error: "Failed to deduct stock" });
  } finally {
    client.release();
  }
});

router.delete("/shop-items/:id", async (req, res) => {
  try {
    const { deleted_by, latitude, longitude, performed_by_role } = req.body || {};

    const before = await pool.query("SELECT * FROM shop_items WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const item = before.rows[0];

    await pool.query(
      "INSERT INTO shop_item_delete_history (shop_item_data, deleted_by) VALUES ($1,$2)",
      [JSON.stringify(item), deleted_by || "Unknown"]
    );

    await pool.query("DELETE FROM shop_items WHERE id=$1", [req.params.id]);

    await logActivity({
      action: "delete",
      itemName: item.name,
      performedBy: deleted_by || "System",
      details: { shop: item.shop, brand: item.brand, stock: item.stock, price: item.price },
      req,
      branch: item.shop,
      module: "Mobile Shop",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /shop-items/:id error:", err);
    if (err.code === "23503") {
      return res.status(409).json({ error: "This item can't be deleted because it's linked to past orders. Hide it instead." });
    }
    res.status(500).json({ error: "Failed to delete shop item" });
  }
});

router.get("/shop-item-delete-history", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM shop_item_delete_history ORDER BY deleted_at DESC");
    res.json(result.rows.map(row => ({
      id: row.id,
      data: row.shop_item_data,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shop item delete history" });
  }
});

router.delete("/shop-item-delete-history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM shop_item_delete_history WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete history entry" });
  }
});

router.get("/shop-activity-log", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users_activity_log
       WHERE module = $1
       ORDER BY created_at DESC
       LIMIT 300`,
      ["Mobile Shop"]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /shop-activity-log error:", err);
    res.status(500).json({ error: "Failed to fetch shop activity log" });
  }
});

module.exports = router;