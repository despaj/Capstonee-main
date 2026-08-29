const express = require("express");
const router = express.Router();
const pool = require("../db");
const { logActivity } = require("../utils/activityLogger");
const { convertUnit } = require("../utils/unitConversion");
const { recomputeProductCosts } = require("../utils/recomputeProductCosts");
const { syncIngredientFromBatches } = require("../utils/inventoryAutomation");

function computeNextOutCost(batches, brand, perishable) {
  const active = batches.filter(b => Number(b.stock) > 0);
  if (active.length === 0) return null; // no stock left — leave cost_per_unit as-is

  const isFefo = (brand || "").toLowerCase().includes("ipharma") || !!perishable;
  const sorted = [...active].sort((a, b) => {
    if (isFefo) {
      const da = a.exp_date ? new Date(a.exp_date).getTime() : Infinity;
      const db = b.exp_date ? new Date(b.exp_date).getTime() : Infinity;
      return da - db;
    }
    const da = new Date(a.supply_date || a.mfg_date || a.created_at || 0).getTime();
    const db = new Date(b.supply_date || b.mfg_date || b.created_at || 0).getTime();
    return da - db;
  });

  return Number(sorted[0].cost_per_unit) || 0;
}

router.get("/ingredients", async (req, res) => {
  try {
    const { branch, brand } = req.query;
    let query = "SELECT * FROM ingredients";
    const params = [];
    const conditions = [];

    if (branch) { params.push(branch); conditions.push(`branch=$${params.length}`); }
    if (brand)  { params.push(brand);  conditions.push(`brand=$${params.length}`); }

    if (conditions.length) query += " WHERE " + conditions.join(" AND ");
    query += " ORDER BY name";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
});

router.post("/ingredients", async (req, res) => {
  try {
    const { name, branch, brand, unit, stock, min_stock, cost_per_unit, extra_fields, perishable, list_in_shop, shop_price, shop_unit, shop_brand, shop_category, performed_by, latitude, longitude, restored, imported, performed_by_role } = req.body;
    if (!name || !unit) return res.status(400).json({ error: "Name and unit are required" });

    const result = await pool.query(
      `INSERT INTO ingredients (name, branch, brand, unit, stock, min_stock, cost_per_unit, extra_fields, perishable)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, branch || null, brand || null, unit,
       parseFloat(stock) || 0, parseFloat(min_stock) || 0,
       parseFloat(cost_per_unit) || 0, JSON.stringify(extra_fields || {}), !!perishable]
    );
    const ingredient = result.rows[0];

    if (list_in_shop && shop_price && shop_brand) {
      await pool.query(
        `INSERT INTO shop_items (name, price, unit, shop, brand, stock, is_visible, ingredient_id)
         VALUES ($1,$2,$3,$4,$5,$6,true,$7)
         ON CONFLICT (ingredient_id) DO UPDATE SET name=$1, price=$2, unit=$3, shop=$4, brand=$5, stock=$6`,
        [name, parseFloat(shop_price), shop_unit || unit, shop_category || null, shop_brand, parseFloat(stock) || 0, ingredient.id]
      );
    }

    const action = restored ? "restore" : imported ? "import" : "create";
    await logActivity({
      action,
      itemName: ingredient.name,
      performedBy: performed_by || "System",
      details: {
        branch, brand, unit, stock: ingredient.stock, min_stock: ingredient.min_stock, cost_per_unit: ingredient.cost_per_unit,
        ...(restored ? { note: "Restored from delete history" } : {}),
      },
      req,
      branch,
      module: "Stock Inventory",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, item: ingredient });
  } catch (err) {
    console.error("POST /ingredients error:", err);
    res.status(500).json({ error: "Failed to add ingredient" });
  }
});

router.put("/ingredients/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, branch, brand, unit, stock, min_stock, cost_per_unit, extra_fields, perishable, performed_by, latitude, longitude, performed_by_role } = req.body;
    await client.query("BEGIN");

    const before = await client.query("SELECT * FROM ingredients WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) { await client.query("ROLLBACK"); return res.status(404).json({ error: "Ingredient not found" }); }
    const oldItem = before.rows[0];

    const result = await client.query(
      `UPDATE ingredients SET name=$1, branch=$2, brand=$3, unit=$4, stock=$5, min_stock=$6,
       cost_per_unit=$7, extra_fields=$8, perishable=$9, updated_at=NOW() WHERE id=$10 RETURNING *`,
      [name, branch || null, brand || null, unit,
       parseFloat(stock) || 0, parseFloat(min_stock) || 0,
       parseFloat(cost_per_unit) || 0, JSON.stringify(extra_fields || {}), !!perishable, req.params.id]
    );

    const updatedItem = result.rows[0];
    const updatedProductsCount = await recomputeProductCosts(client, req.params.id);

    await client.query(
      `UPDATE shop_items
        SET stock = $1,
            price = ROUND($2::numeric * 1.10, 2)
      WHERE brand = $3 AND name = $4`,
      [updatedItem.stock, updatedItem.cost_per_unit, updatedItem.brand, updatedItem.name]
    );

    await client.query("COMMIT");

    const changes = {};
    for (const field of ["name", "branch", "brand", "unit", "stock", "min_stock", "cost_per_unit", "perishable"]) {
      if (String(oldItem[field] ?? "") !== String(updatedItem[field] ?? ""))
        changes[field] = { from: oldItem[field], to: updatedItem[field] };
    }
    await logActivity({
      action: "update",
      itemName: updatedItem.name,
      performedBy: performed_by || "System",
      details: changes,
      req,
      branch: updatedItem.branch,
      module: "Stock Inventory",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, item: updatedItem, updatedProducts: updatedProductsCount });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT /ingredients/:id error:", err);
    res.status(500).json({ error: "Failed to update ingredient" });
  } finally {
    client.release();
  }
});

router.delete("/ingredients/:id", async (req, res) => {
  try {
    const { deleted_by, latitude, longitude, performed_by_role } = req.body || {};

    const before = await pool.query("SELECT * FROM ingredients WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) return res.status(404).json({ error: "Ingredient not found" });
    const item = before.rows[0];

    const result = await pool.query("DELETE FROM ingredients WHERE id=$1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Ingredient not found" });
    
    await pool.query(`UPDATE shop_items SET stock=0 WHERE ingredient_id=$1`, [req.params.id]);
    
    await logActivity({
      action: "delete",
      itemName: item.name,
      performedBy: deleted_by || "System",
      details: { branch: item.branch, unit: item.unit, stock: item.stock, cost_per_unit: item.cost_per_unit },
      req,
      branch: item.branch,
      module: "Stock Inventory",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete ingredient" });
  }
});

router.patch("/ingredients/:id/visibility", async (req, res) => {
  try {
    const { is_visible, performed_by, latitude, longitude, performed_by_role } = req.body;

    const ing = await pool.query("SELECT * FROM ingredients WHERE id=$1", [req.params.id]);
    if (ing.rows.length === 0) return res.status(404).json({ error: "Ingredient not found" });

    const result = await pool.query(
      `UPDATE shop_items SET is_visible=$1 WHERE ingredient_id=$2 RETURNING *`,
      [!!is_visible, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Shop item not found for this ingredient" });

    await logActivity({
      action: is_visible ? "show" : "hide",
      itemName: ing.rows[0].name,
      performedBy: performed_by || "System",
      details: { ingredient_id: req.params.id },
      req,
      branch: ing.rows[0].branch,
      module: "Stock Inventory",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("PATCH /ingredients/:id/visibility error:", err);
    res.status(500).json({ error: "Failed to update visibility" });
  }
});
// Ingredient delete history
router.get("/ingredient-delete-history", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ingredient_delete_history ORDER BY deleted_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ingredient delete history" });
  }
});

router.post("/ingredient-delete-history", async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO ingredient_delete_history (ingredient_data, deleted_by) VALUES ($1,$2)",
      [JSON.stringify(req.body.ingredient_data), req.body.deleted_by || "Unknown"]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save ingredient delete history" });
  }
});

router.delete("/ingredient-delete-history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM ingredient_delete_history WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete history entry" });
  }
});

// Ingredient batches
router.get("/ingredient-batches", async (req, res) => {
  try {
    const { ingredient_id } = req.query;
    if (!ingredient_id) return res.status(400).json({ error: "ingredient_id is required" });
    const result = await pool.query(
      `SELECT * FROM ingredient_batches WHERE ingredient_id=$1 ORDER BY supply_date DESC, created_at DESC`,
      [ingredient_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch batches" });
  }
});

router.post("/ingredient-batches", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      ingredient_id, stock, mfg_date, exp_date, supply_date, cost_per_unit, supplier, perishable, notes,
      lot_number, ndc_code, dosage_form, strength, storage_requirement, controlled_substance,
      tank_id, grade, octane_rating, delivery_temp, truck_id, volume_correction,
    } = req.body;
    if (!ingredient_id) return res.status(400).json({ error: "ingredient_id is required" });

    await client.query("BEGIN");

    const countResult = await client.query(
      `SELECT 
        (SELECT COUNT(*) FROM ingredient_batches WHERE ingredient_id=$1) +
        (SELECT COUNT(*) FROM ingredient_batch_delete_history WHERE ingredient_id=$1) AS total`,
      [ingredient_id]
    );
    const total = parseInt(countResult.rows[0].total) || 0;
    const letter = String.fromCharCode(65 + Math.floor(total / 999));
    const num = (total % 999) + 1;
    const batch_number = `${letter}${String(num).padStart(3, "0")}`;

    const result = await client.query(
      `INSERT INTO ingredient_batches
        (ingredient_id, batch_number, stock, mfg_date, exp_date, supply_date, cost_per_unit, supplier, perishable, notes,
         lot_number, ndc_code, dosage_form, strength, storage_requirement, controlled_substance,
         tank_id, grade, octane_rating, delivery_temp, truck_id, volume_correction)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22) RETURNING *`,
      [
        ingredient_id, batch_number, parseFloat(stock) || 0, mfg_date || null, exp_date || null,
        supply_date || null, parseFloat(cost_per_unit) || 0, supplier || null, !!perishable, notes || null,
        lot_number || null, ndc_code || null, dosage_form || null, strength || null,
        storage_requirement || null, !!controlled_substance,
        tank_id || null, grade || null, octane_rating || null,
        delivery_temp === '' || delivery_temp == null ? null : Number(delivery_temp),
        truck_id || null, volume_correction === '' || volume_correction == null ? null : Number(volume_correction),
      ]
    );  

    const syncResult = await syncIngredientFromBatches(client, ingredient_id);
    const total_stock = syncResult?.totalStock || 0;
    await client.query("COMMIT");
    
    const ingRow = await pool.query("SELECT name, branch FROM ingredients WHERE id=$1", [ingredient_id]);
    const ing = ingRow.rows[0] || {};
    await logActivity({
      action: "receive",
      itemName: ing.name,
      performedBy: req.body.performed_by || "System",
      details: { batch_number, stock: parseFloat(stock) || 0, supplier: req.body.supplier || null, exp_date: exp_date || null },
      req,
      branch: ing.branch,
      module: "Stock Inventory",
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      role: req.body.performed_by_role || "Unknown",
    });
    res.json({ success: true, batch: result.rows[0], total_stock });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to add batch" });
  } finally {
    client.release();
  }
});

router.put("/ingredient-batches/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      batch_number, stock, mfg_date, exp_date, supply_date, cost_per_unit, supplier, perishable, notes,
      lot_number, ndc_code, dosage_form, strength, storage_requirement, controlled_substance,
      tank_id, grade, octane_rating, delivery_temp, truck_id, volume_correction,
    } = req.body;
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE ingredient_batches SET
        batch_number=$1, stock=$2, mfg_date=$3, exp_date=$4, supply_date=$5,
        cost_per_unit=$6, supplier=$7, perishable=$8, notes=$9,
        lot_number=$10, ndc_code=$11, dosage_form=$12, strength=$13, storage_requirement=$14,
        controlled_substance=$15, tank_id=$16, grade=$17, octane_rating=$18,
        delivery_temp=$19, truck_id=$20, volume_correction=$21, updated_at=NOW()
       WHERE id=$22 RETURNING *`,
      [
        batch_number || null, parseFloat(stock) || 0, mfg_date || null, exp_date || null, supply_date || null,
        parseFloat(cost_per_unit) || 0, supplier || null, !!perishable, notes || null,
        lot_number || null, ndc_code || null, dosage_form || null, strength || null,
        storage_requirement || null, !!controlled_substance,
        tank_id || null, grade || null, octane_rating || null,
        delivery_temp === '' || delivery_temp == null ? null : Number(delivery_temp),
        truck_id || null, volume_correction === '' || volume_correction == null ? null : Number(volume_correction),
        req.params.id,
      ]
    );
    if (result.rows.length === 0) { await client.query("ROLLBACK"); return res.status(404).json({ error: "Batch not found" }); }

    const ingredient_id = result.rows[0].ingredient_id;
    const syncResult = await syncIngredientFromBatches(client, ingredient_id);
    const total_stock = syncResult?.totalStock || 0;

    await client.query("COMMIT");

    const ingRow = await pool.query("SELECT name, branch FROM ingredients WHERE id=$1", [ingredient_id]);
    const ing = ingRow.rows[0] || {};
    await logActivity({
      action: "edit",
      itemName: ing.name,
      performedBy: req.body.performed_by || "System",
      details: { batch_number, stock: parseFloat(stock) || 0, exp_date: exp_date || null },
      req,
      branch: ing.branch,
      module: "Stock Inventory",
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      role: req.body.performed_by_role || "Unknown",
    });

    res.json({ success: true, batch: result.rows[0], total_stock });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to update batch" });
  } finally {
    client.release();
  }
});

router.delete("/ingredient-batches/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const before = await client.query("SELECT ingredient_id FROM ingredient_batches WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0) { await client.query("ROLLBACK"); return res.status(404).json({ error: "Batch not found" }); }
    const { ingredient_id } = before.rows[0];

    const batchRow = await client.query(
      `SELECT b.batch_number, i.name AS ingredient_name, i.branch
      FROM ingredient_batches b JOIN ingredients i ON i.id = b.ingredient_id
      WHERE b.id=$1`,
      [req.params.id]
    );
    const batchInfo = batchRow.rows[0] || {};

    await client.query("DELETE FROM ingredient_batches WHERE id=$1", [req.params.id]);

    const syncResult = await syncIngredientFromBatches(client, ingredient_id);
    const total_stock = syncResult?.totalStock || 0;

    await client.query("COMMIT");

    await logActivity({
      action: "delete",
      itemName: batchInfo.ingredient_name,
      performedBy: req.body?.deleted_by || "System",
      details: { batch_number: batchInfo.batch_number },
      req,
      branch: batchInfo.branch,
      module: "Stock Inventory",
      latitude: req.body?.latitude,
      longitude: req.body?.longitude,
      role: req.body?.performed_by_role || "Unknown",
    });

    res.json({ success: true, total_stock });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to delete batch" });
  } finally {
    client.release();
  }
});

// Ingredient batch delete history
router.get("/ingredient-batch-delete-history", async (req, res) => {
  try {
    const { ingredient_id } = req.query;
    if (!ingredient_id) return res.status(400).json({ error: "ingredient_id is required" });
    const result = await pool.query(
      "SELECT * FROM ingredient_batch_delete_history WHERE ingredient_id=$1 ORDER BY deleted_at DESC",
      [ingredient_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch batch delete history" });
  }
});

router.post("/ingredient-batch-delete-history", async (req, res) => {
  try {
    const { batch_data, ingredient_id, ingredient_name, deleted_by } = req.body;
    await pool.query(
      `INSERT INTO ingredient_batch_delete_history (batch_data, ingredient_id, ingredient_name, deleted_by)
       VALUES ($1,$2,$3,$4)`,
      [JSON.stringify(batch_data), ingredient_id, ingredient_name || null, deleted_by || "Unknown"]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("POST /ingredient-batch-delete-history error:", err);
    res.status(500).json({ error: "Failed to save batch delete history" });
  }
});

router.delete("/ingredient-batch-delete-history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM ingredient_batch_delete_history WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete batch history entry" });
  }
});

router.get("/ingredient-activity-log", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users_activity_log
       WHERE module = $1
       ORDER BY created_at DESC
       LIMIT 300`,
      ["Stock Inventory"]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /ingredient-activity-log error:", err);
    res.status(500).json({ error: "Failed to fetch ingredient activity log" });
  }
});

router.get("/ingredient-batches/:id/transfer-history", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.quantity, t.applied, t.created_at AS transferred_at,
              o.id AS order_id, o.branch AS destination_branch, o.brand AS destination_brand
       FROM order_stock_transfers t
       JOIN orders o ON o.id = t.order_id
       WHERE t.source_batch_id = $1
       ORDER BY t.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /ingredient-batches/:id/transfer-history error:", err);
    res.status(500).json({ error: "Failed to fetch batch transfer history" });
  }
});

module.exports = router;