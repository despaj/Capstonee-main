const express = require("express");
const router = express.Router();
const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");
const { convertUnit } = require("../utils/unitConversion");
const { isPharmaBrand, isFuelBrand, isDirectCatalogueBrand, rotationMethod, allocateProductStock } = require("../utils/inventoryAutomation");

function computeAvailability(ingredients) {
  if (!ingredients || ingredients.length === 0) return { available: null, lowIngredients: [] };

  let minPortions = Infinity;
  const lowIngredients = [];

  for (const ing of ingredients) {
    const stock = parseFloat(ing.stock) || 0;
    let qtyRequired;
    try {
      qtyRequired = convertUnit(parseFloat(ing.qty_required) || 0, ing.recipe_unit || ing.ingredient_unit, ing.ingredient_unit);
    } catch {
      qtyRequired = parseFloat(ing.qty_required) || 0; // fall back to raw qty if conversion fails
    }
    if (qtyRequired <= 0) continue;

    const portions = Math.floor(stock / qtyRequired);
    if (portions < minPortions) minPortions = portions;

    if (ing.min_stock != null && stock <= parseFloat(ing.min_stock)) {
      lowIngredients.push(ing.name);
    }
  }

  return {
    available: minPortions === Infinity ? null : minPortions,
    lowIngredients,
  };
}
router.get("/inventory", async (req, res) => {
  try {
    const { branch } = req.query;
    const result = branch
      ? await pool.query("SELECT * FROM inventory WHERE branch=$1 ORDER BY name", [branch])
      : await pool.query("SELECT * FROM inventory ORDER BY name");

    const items = await Promise.all(result.rows.map(async item => {
      const ings = await pool.query(
        `SELECT pi.quantity AS qty_required, pi.unit AS unit, pi.unit AS recipe_unit,
                i.id, i.name, i.stock, i.min_stock, i.unit AS ingredient_unit,
                i.brand, i.perishable, i.cost_per_unit, i.extra_fields,
                CASE
                  WHEN LOWER(COALESCE(i.brand,'')) LIKE '%pharma%' THEN
                    COALESCE((SELECT SUM(b.stock) FROM ingredient_batches b
                              WHERE b.ingredient_id=i.id AND b.stock>0
                                AND (b.exp_date IS NULL OR b.exp_date >= CURRENT_DATE)),0)
                  ELSE COALESCE((SELECT SUM(b.stock) FROM ingredient_batches b
                                 WHERE b.ingredient_id=i.id AND b.stock>0), i.stock, 0)
                END AS sellable_stock
        FROM product_ingredients pi
        JOIN ingredients i ON i.id = pi.ingredient_id
        WHERE pi.inventory_id = $1`,
        [item.id]
      );
      const { available, lowIngredients } = computeAvailability(ings.rows);
      const direct = isDirectCatalogueBrand(item.brand);
      const linked = ings.rows[0] || null;
      const effectiveStock = direct && linked ? Number(linked.sellable_stock ?? linked.stock ?? 0) : available;
      const productType = isPharmaBrand(item.brand) ? "DIRECT" : isFuelBrand(item.brand) ? "FUEL" : "RECIPE";
      return {
        ...item,
        stock: effectiveStock != null ? effectiveStock : item.stock,
        min_stock: direct && linked ? Number(linked.min_stock || 0) : item.min_stock,
        ingredients: ings.rows,
        available_stock: effectiveStock,
        low_ingredients: lowIngredients,
        is_low: direct && linked ? Number(linked.sellable_stock ?? linked.stock ?? 0) <= Number(linked.min_stock || 0) : lowIngredients.length > 0,
        product_type: productType,
        stock_unit: direct && linked ? linked.ingredient_unit : null,
        rotation_method: linked ? rotationMethod(linked) : null,
      };
    }));

    res.json(items);
  } catch (err) {
    console.error("GET /inventory error:", err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

router.put("/inventory/:id", async (req, res) => {
  try {
    const { name, category, branch, brand, cost, price, image_url, latitude, longitude, performed_by_role } = req.body;

    const before = await pool.query("SELECT * FROM inventory WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const oldItem = before.rows[0];

    const result = await pool.query(
      `UPDATE inventory
       SET name=$1, category=$2, branch=$3, brand=$4, cost=$5, price=$6, image_url=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [name, category, branch, brand || null,
       parseFloat(cost) || 0, parseFloat(price) || 0,
       image_url || null, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    const updatedItem = result.rows[0];

    const changes = {};
    for (const field of ["name", "category", "branch", "brand", "cost", "price", "image_url"]) {
      if (String(oldItem[field] ?? "") !== String(updatedItem[field] ?? ""))
        changes[field] = { from: oldItem[field], to: updatedItem[field] };
    }
    
    await logActivity({
      action: "update",
      itemName: updatedItem.name,
      performedBy: req.body?.performed_by || "System",
      details: changes,
      req,
      branch: updatedItem.branch,
      module: "Menu Inventory",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, item: updatedItem });

  } catch (err) {
    console.error("PUT /inventory/:id error:", err);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

router.delete("/inventory/:id", async (req, res) => {
  const { latitude, longitude, performed_by_role } = req.body;
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
        JSON.stringify({ name: item.name, category: item.category, branch: item.branch, brand: item.brand, cost: item.cost, price: item.price, image_url: item.image_url }),
        JSON.stringify(ings.rows),
        req.body?.deleted_by || "Unknown",
      ]
    );

    await logActivity({
      action: "delete",
      itemName: item.name,
      performedBy: req.body?.deleted_by || "System",
      details: { category: item.category, cost: item.cost, price: item.price },
      req,
      branch: item.branch,
      module: "Menu Inventory",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    await pool.query("DELETE FROM inventory WHERE id=$1", [item.id]);  
    res.json({ success: true });                               
  } catch (err) {
    console.error("DELETE /inventory/:id error:", err);
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
});

router.get("/menu-activity-log", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users_activity_log
       WHERE module = $1
       ORDER BY created_at DESC
       LIMIT 300`,
      ["Menu Inventory"]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /menu-activity-log error:", err);
    res.status(500).json({ error: "Failed to fetch menu activity log" });
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

router.post("/inventory/:id/ingredients", async (req, res) => {
  const client = await pool.connect();
  try {
    const { ingredients } = req.body; // [{ ingredient_id, quantity, unit }]

    await client.query("BEGIN");

    const check = await client.query("SELECT id FROM inventory WHERE id=$1", [req.params.id]);
    if (check.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Item not found" });
    }

    // Replace the full ingredient list for this product
    await client.query("DELETE FROM product_ingredients WHERE inventory_id=$1", [req.params.id]);

    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const values = [];
      const params = [];
      ingredients.forEach((ing, i) => {
        const base = i * 4;
        values.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4})`);
        params.push(req.params.id, ing.ingredient_id, parseFloat(ing.quantity) || 0, ing.unit || ing.recipe_unit || "pcs");
      });
      await client.query(
        `INSERT INTO product_ingredients (inventory_id, ingredient_id, quantity, unit) VALUES ${values.join(",")}`,
        params
      );
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /inventory/:id/ingredients error:", err);
    res.status(500).json({ error: "Failed to save ingredients" });
  } finally {
    client.release();
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const { name, category, branch, brand, cost, price, image_url, latitude, longitude, restored, performed_by_role } = req.body;
    if (!branch) return res.status(400).json({ error: "Branch is required" });

    const result = await pool.query(
      `INSERT INTO inventory (name, category, branch, brand, cost, price, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, category, branch, brand || null,
       parseFloat(cost) || 0, parseFloat(price) || 0, image_url || null]
    );

    const newItem = result.rows[0];

    await logActivity({
      action: restored ? "restore" : "create",
      itemName: newItem.name,
      performedBy: req.body?.performed_by || "System",
      details: {
        category, branch, brand, cost: newItem.cost, price: newItem.price,
        ...(restored ? { note: "Restored from delete history" } : {}),
      },
      req,
      branch,
      module: "Menu Inventory",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.error("POST /inventory error:", err);
    res.status(500).json({ error: "Failed to add inventory item" });
  }
});

router.post("/inventory/:id/sell", async (req, res) => {
  const client = await pool.connect();
  try {
    const quantity = Number(req.body?.quantity ?? 1);
    await client.query("BEGIN");
    const allocation = await allocateProductStock(client, req.params.id, quantity);
    await client.query("COMMIT");
    res.json({
      success: true,
      product: allocation.product,
      cogs: Number(allocation.cogs.toFixed(4)),
      stock_allocations: allocation.ingredientAllocations,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(err.status || 500).json({
      error: err.message || "Failed to process sale",
      details: err.details || undefined,
    });
  } finally {
    client.release();
  }
});

module.exports = router;