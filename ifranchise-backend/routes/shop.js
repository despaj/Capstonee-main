const express = require("express");
const router = express.Router();
const pool = require("../db");

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
  try {
    const { name, price, unit, image_url, shop, brand, stock, is_visible, branches } = req.body;
    const result = await pool.query(
      `INSERT INTO shop_items (name, price, unit, image_url, shop, brand, stock, is_visible, branches) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, parseFloat(price), unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true, branches]
    );
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to add shop item" });
  }
});

router.put("/shop-items/:id", async (req, res) => {
  try {
    const { name, price, unit, image_url, shop, brand, stock, is_visible, branches } = req.body;
    const result = await pool.query(
      `UPDATE shop_items SET name=$1, price=$2, unit=$3, image_url=$4, shop=$5, brand=$6, stock=$7, is_visible=$8, branches=$9 WHERE id=$10 RETURNING *`,
      [name, parseFloat(price), unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true, branches || [], req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update shop item" });
  }
});

router.put("/shop-items/:id/toggle", async (req, res) => {
  try {
    const current = await pool.query("SELECT is_visible FROM shop_items WHERE id=$1", [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const result = await pool.query("UPDATE shop_items SET is_visible=$1 WHERE id=$2 RETURNING *", [!current.rows[0].is_visible, req.params.id]);
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle visibility" });
  }
});

router.delete("/shop-items/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM shop_items WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete shop item" });
  }
});

module.exports = router;