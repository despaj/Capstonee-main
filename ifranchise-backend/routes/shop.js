const express = require("express");
const router = express.Router();
const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");

router.get("/shop-items", async (req, res) => {
  try {
    const { brand } = req.query;
    const result = brand
      ? await pool.query(`SELECT id, name, price, unit, image_url, is_visible, shop, brand, stock, branches FROM shop_items WHERE brand=$1 ORDER BY created_at DESC`, [brand])
      : await pool.query(`SELECT id, name, price, unit, image_url, is_visible, shop, brand, stock, branches FROM shop_items ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shop items" });
  }
});

router.post("/shop-items", async (req, res) => {
  console.log("[DEBUG] shop-items body:", req.body.latitude, req.body.longitude, "ip:", req.socket.remoteAddress, req.headers["x-forwarded-for"]);
  try {
    const { name, price, unit, image_url, shop, brand, stock, is_visible, branches, performed_by, latitude, longitude, imported } = req.body;
    const result = await pool.query(
      `INSERT INTO shop_items (name, price, unit, image_url, shop, brand, stock, is_visible, branches) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, parseFloat(price), unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true, branches]
    );
    const item = result.rows[0];

    await logActivity(
      imported ? "import" : "create",
      item.name,
      performed_by || "System",
      { shop, brand, stock: item.stock, price: item.price, unit: item.unit },
      req, shop, "Mobile Shop", latitude, longitude
    );

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: "Failed to add shop item" });
  }
});

router.put("/shop-items/:id", async (req, res) => {
  try {
    const { name, price, unit, image_url, shop, brand, stock, is_visible, branches, performed_by, latitude, longitude } = req.body;

    const before = await pool.query("SELECT * FROM shop_items WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const oldItem = before.rows[0];

    const result = await pool.query(
      `UPDATE shop_items SET name=$1, price=$2, unit=$3, image_url=$4, shop=$5, brand=$6, stock=$7, is_visible=$8, branches=$9 WHERE id=$10 RETURNING *`,
      [name, parseFloat(price), unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true, branches || [], req.params.id]
    );
    const updatedItem = result.rows[0];

    const changes = {};
    for (const field of ["name", "price", "unit", "shop", "brand", "stock", "is_visible"]) {
      if (String(oldItem[field] ?? "") !== String(updatedItem[field] ?? ""))
        changes[field] = { from: oldItem[field], to: updatedItem[field] };
    }
    await logActivity("update", updatedItem.name, performed_by || "System", changes, req, updatedItem.shop, "Mobile Shop", latitude, longitude);

    res.json({ success: true, item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: "Failed to update shop item" });
  }
});

router.put("/shop-items/:id/toggle", async (req, res) => {
  try {
    const { performed_by, latitude, longitude } = req.body || {};

    const current = await pool.query("SELECT * FROM shop_items WHERE id=$1", [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const item = current.rows[0];

    const result = await pool.query("UPDATE shop_items SET is_visible=$1 WHERE id=$2 RETURNING *", [!item.is_visible, req.params.id]);
    const updated = result.rows[0];

    await logActivity(
      updated.is_visible ? "show" : "hide",
      item.name,
      performed_by || "System",
      { note: updated.is_visible ? "Item made visible" : "Item hidden" },
      req, item.shop, "Mobile Shop", latitude, longitude
    );

    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle visibility" });
  }
});

router.delete("/shop-items/:id", async (req, res) => {
  try {
    const { deleted_by, latitude, longitude } = req.body || {};

    const before = await pool.query("SELECT * FROM shop_items WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const item = before.rows[0];

    await pool.query("DELETE FROM shop_items WHERE id=$1", [req.params.id]);

    await logActivity("delete", item.name, deleted_by || "System",
      { shop: item.shop, brand: item.brand, stock: item.stock, price: item.price },
      req, item.shop, "Mobile Shop", latitude, longitude);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete shop item" });
  }
});

module.exports = router;