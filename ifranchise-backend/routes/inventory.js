const express = require("express");
const router = express.Router();
const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");

router.get("/inventory", async (req, res) => {
  try {
    const { branch } = req.query;
    const result = branch
      ? await pool.query("SELECT * FROM inventory WHERE branch=$1 ORDER BY name", [branch])
      : await pool.query("SELECT * FROM inventory ORDER BY name");

    const items = await Promise.all(result.rows.map(async item => {
      const ings = await pool.query(
        `SELECT pi.quantity AS qty_required, pi.unit, i.id, i.name, i.stock
         FROM product_ingredients pi
         JOIN ingredients i ON i.id = pi.ingredient_id
         WHERE pi.inventory_id = $1`,
        [item.id]
      );
      return { ...item, ingredients: ings.rows };
    }));

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});


router.put("/inventory/:id", async (req, res) => {
  try {
    const { name, category, branch, brand, stock, min_stock, minStock, cost, price, image_url, latitude, longitude } = req.body;

    const before = await pool.query("SELECT * FROM inventory WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const oldItem = before.rows[0];

    const result = await pool.query(
      `UPDATE inventory
       SET name=$1, category=$2, branch=$3, brand=$4, stock=$5, min_stock=$6, cost=$7, price=$8, image_url=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [name, category, branch, brand || null,
       parseInt(stock) || 0, parseInt(min_stock ?? minStock) || 0,
       parseFloat(cost) || 0, parseFloat(price) || 0,
       image_url || null, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const updatedItem = result.rows[0];

    const changes = {};
    for (const field of ["name", "category", "branch", "brand", "stock", "min_stock", "cost", "price", "image_url"]) {
      if (String(oldItem[field] ?? "") !== String(updatedItem[field] ?? ""))
        changes[field] = { from: oldItem[field], to: updatedItem[field] };
    }
    
    await logActivity("update", updatedItem.name, req.body?.performed_by || "System",
  changes, req, updatedItem.branch, "Menu Inventory", latitude, longitude);

    res.json({ success: true, item: updatedItem });

  } catch (err) {
    console.error("PUT /inventory/:id error:", err);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

router.delete("/inventory/:id", async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const before = await pool.query("SELECT * FROM inventory WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const item = before.rows[0];

    const ings = await pool.query(
      `SELECT pi.quantity AS qty_required, pi.unit, i.id, i.name
       FROM product_ingredients pi
       JOIN ingredients i ON i.id = pi.ingredient_id
       WHERE pi.inventory_id = $1`,
      [item.id]
    );

    await pool.query(
      `INSERT INTO inventory_delete_history (inventory_data, ingredients_data, deleted_by, deleted_at)
       VALUES ($1,$2,$3,NOW())`,
      [
        JSON.stringify({ name: item.name, category: item.category, branch: item.branch, brand: item.brand, stock: item.stock, min_stock: item.min_stock, cost: item.cost, price: item.price, image_url: item.image_url }),
        JSON.stringify(ings.rows),
        req.body?.deleted_by || "Unknown",
      ]
    );

    await logActivity("delete", item.name, req.body?.deleted_by || "System",
  { category: item.category, stock: item.stock, cost: item.cost, price: item.price },
  req, item.branch, "Menu Inventory", latitude, longitude);

    await pool.query("DELETE FROM inventory WHERE id=$1", [item.id]);  
    res.json({ success: true });                               
  } catch (err) {
    console.error("DELETE /inventory/:id error:", err);
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
});

router.get("/inventory-delete-history", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory_delete_history ORDER BY deleted_at DESC");
    res.json(result.rows.map(row => ({
      id: row.id,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
      inventory_data: typeof row.inventory_data === "string" ? JSON.parse(row.inventory_data) : row.inventory_data,
      ingredients_data: typeof row.ingredients_data === "string" ? JSON.parse(row.ingredients_data) : row.ingredients_data,
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch delete history" });
  }
});

router.delete("/inventory-delete-history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM inventory_delete_history WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove history entry" });
  }
});

router.get("/inventory/:id/ingredients", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pi.*, i.name AS ingredient_name, i.unit AS ingredient_unit,
              i.stock AS ingredient_stock, i.cost_per_unit
       FROM product_ingredients pi
       JOIN ingredients i ON i.id = pi.ingredient_id
       WHERE pi.inventory_id = $1 ORDER BY i.name`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product ingredients" });
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const { name, category, branch, brand, stock, min_stock, minStock, cost, price, image_url, latitude, longitude, restored } = req.body;
    if (!branch) return res.status(400).json({ error: "Branch is required" });

    const result = await pool.query(
      `INSERT INTO inventory (name, category, branch, brand, stock, min_stock, cost, price, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, category, branch, brand || null,
       parseInt(stock) || 0, parseInt(min_stock ?? minStock) || 0,
       parseFloat(cost) || 0, parseFloat(price) || 0, image_url || null]
    );

    const newItem = result.rows[0];

    await logActivity(
      restored ? "restore" : "create",
      newItem.name,
      req.body?.performed_by || "System",
      { category, branch, brand, stock: newItem.stock, min_stock: newItem.min_stock, cost: newItem.cost, price: newItem.price,
        ...(restored ? { note: "Restored from delete history" } : {}) },
      req, branch, "Menu Inventory", latitude, longitude
    );

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.error("POST /inventory error:", err);
    res.status(500).json({ error: "Failed to add inventory item" });
  }
});

router.post("/inventory/:id/sell", async (req, res) => {
  const client = await pool.connect();
  try {
    const { quantity = 1 } = req.body;
    await client.query("BEGIN");

    const productResult = await client.query(
      `UPDATE inventory SET stock=stock-$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [parseInt(quantity), req.params.id]
    );
    if (productResult.rows.length === 0) { await client.query("ROLLBACK"); return res.status(404).json({ error: "Product not found" }); }
    if (productResult.rows[0].stock < 0) { await client.query("ROLLBACK"); return res.status(400).json({ error: "Insufficient product stock" }); }

    const recipe = await client.query(
      `SELECT pi.ingredient_id, pi.quantity, i.stock AS current_stock, i.name
       FROM product_ingredients pi JOIN ingredients i ON i.id=pi.ingredient_id
       WHERE pi.inventory_id=$1`,
      [req.params.id]
    );

    for (const row of recipe.rows) {
      if (parseFloat(row.current_stock) < parseFloat(row.quantity) * parseInt(quantity)) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Insufficient stock for ingredient: ${row.name}` });
      }
    }
    for (const row of recipe.rows) {
      await client.query(
        `UPDATE ingredients SET stock=stock-$1, updated_at=NOW() WHERE id=$2`,
        [parseFloat(row.quantity) * parseInt(quantity), row.ingredient_id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, product: productResult.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to process sale" });
  } finally {
    client.release();
  }
});

module.exports = router;