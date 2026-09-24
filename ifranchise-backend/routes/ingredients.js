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
const { logActivity } = require("../utils/activityLogger");
const { convertUnit } = require("../utils/unitConversion");
const { recomputeProductCosts } = require("../utils/recomputeProductCosts");
const { syncIngredientFromBatches } = require("../utils/inventoryAutomation");
const { priceFromCost } = require("./shop");

function computeNextOutCost(batches, brand, perishable) {
  const active = batches.filter((b) => Number(b.stock) > 0);
  if (active.length === 0) return null; // no stock left — leave cost_per_unit as-is

  const isFefo =
    (brand || "").toLowerCase().includes("ipharma") || !!perishable;
  const sorted = [...active].sort((a, b) => {
    if (isFefo) {
      const da = a.exp_date ? new Date(a.exp_date).getTime() : Infinity;
      const db = b.exp_date ? new Date(b.exp_date).getTime() : Infinity;
      return da - db;
    }
    const da = new Date(
      a.supply_date || a.mfg_date || a.created_at || 0,
    ).getTime();
    const db = new Date(
      b.supply_date || b.mfg_date || b.created_at || 0,
    ).getTime();
    return da - db;
  });

  return Number(sorted[0].cost_per_unit) || 0;
}

function slug(str, maxLen = 6) {
  return String(str || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, maxLen);
}

const CATEGORY_CODE_MAP = {
  "coffee & base ingredients": "BASE",
  "syrups & flavorings": "SYR",
  "milk & dairy": "MLK",
  ice: "ICE",
  "packaging & supplies": "PKG",
  "vitamins & supplements": "VIT",
  antibiotic: "ANT",
  medicine: "MED",
  "first aid": "AID",
  "medical supplies": "SUP",
  "health devices": "DEV",
  "regular gasoline": "REG",
  "ethanol-blended gasoline": "ETH",
  "premium gasoline": "PRM",
  diesel: "DSL",
};

const DIRECT_COST_RATE = 0.35;
function computeDirectSellingPrice(cost) {
  const base = Number(cost || 0);
  return base > 0 ? Math.round((base / DIRECT_COST_RATE) * 100) / 100 : 0;
}

function isDirectSellBrand(brand) {
  const b = (brand || "").toLowerCase();
  return b.includes("ipharma") || b.includes("ifuel");
}

function inferCategoryCode(name, brand, category) {
  const b = (brand || "").toLowerCase();
  if (category) {
    const mapped = CATEGORY_CODE_MAP[category.trim().toLowerCase()];
    if (mapped) return mapped;
    return slug(category, 4) || "MISC";
  }
  if (b.includes("ipharma")) return "MED";
  if (b.includes("ifuel")) return "FUEL";
  const found = CATEGORY_KEYWORDS.find((c) => c.match.test(name));
  return found ? found.code : "MISC";
}
function extractVariant(name) {
  const paren = String(name || "").match(/\(([^)]+)\)/);
  if (paren) return slug(paren[1]);
  const dose = String(name || "").match(/(\d+\s?(mg|ml|g|kg|oz|l))\b/i);
  if (dose) return slug(dose[1]);
  return "";
}

const MANUAL_ITEM_CODES = {
  "cinnamon powder": "CNMPWD",
  "matcha powder": "MTCPWD",
};

function abbreviateWord(word, len = 3) {
  const clean = word.replace(/[^a-zA-Z]/g, "");
  if (clean.length <= len) return clean.toUpperCase();
  const firstChar = clean[0];
  const rest = clean.slice(1).replace(/[aeiou]/gi, "");
  return (firstChar + rest).slice(0, len).toUpperCase();
}

function extractItemCode(name) {
  const key = String(name || "")
    .trim()
    .toLowerCase();
  if (MANUAL_ITEM_CODES[key]) return MANUAL_ITEM_CODES[key];

  const base = String(name || "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\d+\s?(mg|ml|g|kg|oz|l)\b/gi, "")
    .trim();
  const words = base.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "ITEM";
  return words.map((w) => abbreviateWord(w, 3)).join("");
}

function buildSkuBase({ name, brand, category }) {
  const catCode = inferCategoryCode(name, brand, category);
  const itemCode = extractItemCode(name);
  const variant = extractVariant(name);
  return ["STK", catCode, itemCode, variant].filter(Boolean).join("-");
}

async function generateUniqueSku(client, { name, brand, category }) {
  const base = buildSkuBase({ name, brand, category });
  let candidate = base;
  let n = 2;
  while (true) {
    const check = await client.query("SELECT 1 FROM ingredients WHERE sku=$1", [
      candidate,
    ]);
    if (check.rows.length === 0) return candidate;
    candidate = `${base}-${n}`;
    n++;
  }
}

router.get(
  "/ingredients",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Franchisee",
    "Manager",
    "Staff",
  ),
  enforceQueryScope(),
  async (req, res) => {
    try {
      const { branch, brand } = req.query;
      let query = "SELECT * FROM ingredients";
      const params = [];
      const conditions = [];

      if (branch) {
        params.push(branch);
        conditions.push(`branch=$${params.length}`);
      }
      if (brand) {
        params.push(brand);
        conditions.push(`brand=$${params.length}`);
      }

      if (conditions.length) query += " WHERE " + conditions.join(" AND ");
      query += " ORDER BY name";

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  },
);

router.post(
  "/ingredients",
  authorize("Super Admin", "Sales Admin", "Manager", "Franchisee"),
  enforceInputScope(),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        name,
        branch,
        brand,
        unit,
        stock,
        min_stock,
        cost_per_unit,
        bulk_qty,
        extra_fields,
        perishable,
        category,
        list_in_shop,
        shop_price,
        shop_unit,
        shop_brand,
        shop_category,
        performed_by,
        latitude,
        longitude,
        restored,
        imported,
        performed_by_role,
      } = req.body;
      if (!name || !unit)
        return res.status(400).json({ error: "Name and unit are required" });

      await client.query("BEGIN");
      const sku = await generateUniqueSku(client, { name, brand, category });

      const result = await client.query(
        `INSERT INTO ingredients (name, branch, brand, unit, stock, min_stock, cost_per_unit, bulk_qty, extra_fields, perishable, sku, category)
 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [
          name,
          branch || null,
          brand || null,
          unit,
          parseFloat(stock) || 0,
          parseFloat(min_stock) || 0,
          parseFloat(cost_per_unit) || 0,
          bulk_qty ? parseFloat(bulk_qty) : null,
          JSON.stringify(extra_fields || {}),
          !!perishable,
          sku,
          category || null,
        ],
      );
      const ingredient = result.rows[0];

      if (list_in_shop && shop_price && shop_brand) {
        await client.query(
          `INSERT INTO shop_items (name, price, unit, shop, brand, stock, is_visible, ingredient_id)
         VALUES ($1,$2,$3,$4,$5,$6,true,$7)
ON CONFLICT (ingredient_id) DO UPDATE SET name=$1, price=$2, unit=$3, shop=$4, brand=$5, stock=$6`,
          [
            name,
            parseFloat(shop_price),
            shop_unit || unit,
            shop_category || null,
            shop_brand,
            parseFloat(stock) || 0,
            ingredient.id,
          ],
        );
      }

      await client.query("COMMIT");

      const action = restored ? "restore" : imported ? "import" : "create";
      await logActivity({
        action,
        itemName: ingredient.name,
        performedBy: performed_by || "System",
        details: {
          branch,
          brand,
          unit,
          stock: ingredient.stock,
          min_stock: ingredient.min_stock,
          cost_per_unit: ingredient.cost_per_unit,
          sku,
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
      await client.query("ROLLBACK");
      console.error("POST /ingredients error:", err);
      res.status(500).json({ error: "Failed to add ingredient" });
    } finally {
      client.release();
    }
  },
);

router.put(
  "/ingredients/:id",
  authorize("Super Admin", "Sales Admin", "Manager", "Franchisee"),
  requireResourceScope({ table: "ingredients" }),
  enforceInputScope(),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        name,
        branch,
        brand,
        unit,
        stock,
        min_stock,
        cost_per_unit,
        bulk_qty,
        extra_fields,
        perishable,
        category,
        performed_by,
        latitude,
        longitude,
        performed_by_role,
      } = req.body;
      await client.query("BEGIN");

      const before = await client.query(
        "SELECT * FROM ingredients WHERE id=$1",
        [req.params.id],
      );
      if (before.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Ingredient not found" });
      }
      const oldItem = before.rows[0];
      const sku =
        oldItem.sku ||
        (await generateUniqueSku(client, {
          name,
          brand,
          category: req.body.category,
        }));

      const result = await client.query(
        `UPDATE ingredients SET name=$1, branch=$2, brand=$3, unit=$4, stock=$5, min_stock=$6,
 cost_per_unit=$7, bulk_qty=$8, extra_fields=$9, perishable=$10, sku=$11, category=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
        [
          name,
          branch || null,
          brand || null,
          unit,
          parseFloat(stock) || 0,
          parseFloat(min_stock) || 0,
          parseFloat(cost_per_unit) || 0,
          bulk_qty ? parseFloat(bulk_qty) : null,
          JSON.stringify(extra_fields || {}),
          !!perishable,
          sku,
          category || null,
          req.params.id,
        ],
      );
      const updatedItem = result.rows[0];
      const updatedProductsCount = await recomputeProductCosts(
        client,
        req.params.id,
      );

      await client.query(
        `UPDATE shop_items SET stock = $1, price = ROUND($2::numeric * 1.15, 2) WHERE ingredient_id = $3`,
        [updatedItem.stock, updatedItem.cost_per_unit, req.params.id],
      );

      await client.query("COMMIT");

      const changes = {};
      for (const field of [
        "name",
        "branch",
        "brand",
        "unit",
        "stock",
        "min_stock",
        "cost_per_unit",
        "perishable",
      ]) {
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

      res.json({
        success: true,
        item: updatedItem,
        updatedProducts: updatedProductsCount,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("PUT /ingredients/:id error:", err);
      res.status(500).json({ error: "Failed to update ingredient" });
    } finally {
      client.release();
    }
  },
);

router.delete(
  "/ingredients/:id",
  authorize("Super Admin", "Sales Admin"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { deleted_by, latitude, longitude, performed_by_role } =
        req.body || {};

      await client.query("BEGIN");

      // 1. Get the Stock Inventory item first
      const before = await client.query(
        "SELECT * FROM ingredients WHERE id=$1",
        [req.params.id],
      );

      if (before.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          error: "Ingredient not found",
        });
      }

      const item = before.rows[0];

      // 2. Find Product Catalogue items linked to this Stock Inventory item.
      // product_ingredients is the bridge between inventory and ingredients.
      const linkedProducts = await client.query(
        `
      SELECT DISTINCT
        inv.id,
        inv.name,
        inv.brand,
        inv.branch,
        inv.category,
        inv.cost,
        inv.price,
        inv.image_url
      FROM inventory inv
      JOIN product_ingredients pi
        ON pi.inventory_id = inv.id
      WHERE pi.ingredient_id = $1
      `,
        [req.params.id],
      );

      const directBrand = isDirectSellBrand(item.brand);

      let deletedCatalogueItems = [];

      // 3. For iPharma / iFuel:
      // deleting Stock Inventory also deletes its Product Catalogue item.
      if (directBrand && linkedProducts.rows.length > 0) {
        for (const product of linkedProducts.rows) {
          // Save Product Catalogue delete history first
          const productIngredients = await client.query(
            `
          SELECT
            pi.quantity AS qty_required,
            pi.unit,
            i.id,
            i.name
          FROM product_ingredients pi
          JOIN ingredients i
            ON i.id = pi.ingredient_id
          WHERE pi.inventory_id = $1
          `,
            [product.id],
          );

          await client.query(
            `
          INSERT INTO inventory_delete_history
            (
              inventory_data,
              ingredients_data,
              deleted_by,
              deleted_at
            )
          VALUES ($1, $2, $3, NOW())
          `,
            [
              JSON.stringify({
                name: product.name,
                category: product.category,
                branch: product.branch,
                brand: product.brand,
                cost: product.cost,
                price: product.price,
                image_url: product.image_url,
              }),
              JSON.stringify(productIngredients.rows),
              deleted_by || "System",
            ],
          );

          // Remove Product Catalogue ↔ Stock Inventory link
          await client.query(
            "DELETE FROM product_ingredients WHERE inventory_id=$1",
            [product.id],
          );

          // Delete Product Catalogue item
          await client.query("DELETE FROM inventory WHERE id=$1", [product.id]);

          deletedCatalogueItems.push({
            id: product.id,
            name: product.name,
          });
        }
      } else {
        // Coffee Spot / recipe-based brands:
        // don't delete whole menu products.
        // Just remove the deleted ingredient from their recipes.
        await client.query(
          "DELETE FROM product_ingredients WHERE ingredient_id=$1",
          [req.params.id],
        );
      }

      // 4. Remove any Mobile Shop record completely
      // rather than leaving a dead item with stock = 0.
      await client.query("DELETE FROM shop_items WHERE ingredient_id=$1", [
        req.params.id,
      ]);

      // 5. Delete ingredient batches if your FK doesn't already cascade.
      await client.query(
        "DELETE FROM ingredient_batches WHERE ingredient_id=$1",
        [req.params.id],
      );

      // 6. Finally delete Stock Inventory item
      const result = await client.query(
        "DELETE FROM ingredients WHERE id=$1 RETURNING id",
        [req.params.id],
      );

      if (result.rows.length === 0) {
        throw new Error("Failed to delete Stock Inventory item.");
      }

      await client.query("COMMIT");

      // 7. Log Stock Inventory deletion
      await logActivity({
        action: "delete",
        itemName: item.name,
        performedBy: deleted_by || "System",
        details: {
          branch: item.branch,
          brand: item.brand,
          unit: item.unit,
          stock: item.stock,
          cost_per_unit: item.cost_per_unit,
          deleted_catalogue_items: deletedCatalogueItems,
        },
        req,
        branch: item.branch,
        module: "Stock Inventory",
        latitude,
        longitude,
        role: performed_by_role || "Unknown",
      });

      // Optional separate Product Catalogue activity logs
      for (const product of deletedCatalogueItems) {
        await logActivity({
          action: "delete",
          itemName: product.name,
          performedBy: deleted_by || "System",
          details: {
            reason: "Source Stock Inventory item was deleted",
            source_ingredient_id: req.params.id,
            source_ingredient_name: item.name,
          },
          req,
          branch: item.branch,
          module: "Menu Inventory",
          latitude,
          longitude,
          role: performed_by_role || "Unknown",
        });
      }

      res.json({
        success: true,

        deleted_stock_item: {
          id: item.id,
          name: item.name,
        },

        deleted_catalogue_items: deletedCatalogueItems,

        message:
          deletedCatalogueItems.length > 0
            ? `${item.name} and its linked Product Catalogue item(s) were deleted.`
            : `${item.name} was deleted from Stock Inventory.`,
      });
    } catch (err) {
      await client.query("ROLLBACK");

      console.error("DELETE /ingredients/:id error:", err);

      res.status(500).json({
        error: "Failed to delete Stock Inventory item",
        details: err.message,
      });
    } finally {
      client.release();
    }
  },
);

router.patch(
  "/ingredients/:id/visibility",
  authorize("Super Admin", "Sales Admin", "Manager", "Franchisee"),
  requireResourceScope({ table: "ingredients" }),
  async (req, res) => {
    try {
      const {
        is_visible,
        performed_by,
        latitude,
        longitude,
        performed_by_role,
      } = req.body;

      const ing = await pool.query("SELECT * FROM ingredients WHERE id=$1", [
        req.params.id,
      ]);
      if (ing.rows.length === 0)
        return res.status(404).json({ error: "Ingredient not found" });

      const result = await pool.query(
        `UPDATE shop_items SET is_visible=$1 WHERE ingredient_id=$2 RETURNING *`,
        [!!is_visible, req.params.id],
      );
      if (result.rows.length === 0)
        return res
          .status(404)
          .json({ error: "Shop item not found for this ingredient" });

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
  },
);
// Ingredient delete history
router.get(
  "/ingredient-delete-history",
  authorize(
    "Super Admin",
    "Sales Admin",
    "Franchisee Operations Admin",
    "Franchisee",
    "Manager",
  ),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM ingredient_delete_history ORDER BY deleted_at DESC",
      );
      res.json(result.rows);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to fetch ingredient delete history" });
    }
  },
);

router.post(
  "/ingredient-delete-history",
  authorize("Super Admin", "Sales Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      await pool.query(
        "INSERT INTO ingredient_delete_history (ingredient_data, deleted_by) VALUES ($1,$2)",
        [
          JSON.stringify(req.body.ingredient_data),
          req.body.deleted_by || "Unknown",
        ],
      );
      res.json({ success: true });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to save ingredient delete history" });
    }
  },
);

router.delete(
  "/ingredient-delete-history/:id",
  authorize("Super Admin", "Sales Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM ingredient_delete_history WHERE id=$1", [
        req.params.id,
      ]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete history entry" });
    }
  },
);

// Ingredient batches
router.get(
  "/ingredient-batches",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Franchisee",
    "Manager",
    "Staff",
  ),
  async (req, res) => {
    try {
      const { ingredient_id } = req.query;
      if (!ingredient_id)
        return res.status(400).json({ error: "ingredient_id is required" });
      const result = await pool.query(
        `SELECT * FROM ingredient_batches WHERE ingredient_id=$1 ORDER BY supply_date DESC, created_at DESC`,
        [ingredient_id],
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch batches" });
    }
  },
);

router.post(
  "/ingredient-batches",
  authorize("Super Admin", "Sales Admin", "Manager", "Franchisee"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        ingredient_id,
        stock,
        mfg_date,
        exp_date,
        supply_date,
        cost_per_unit,
        supplier,
        perishable,
        notes,
        lot_number,
        ndc_code,
        dosage_form,
        strength,
        storage_requirement,
        controlled_substance,
        tank_id,
        grade,
        octane_rating,
        delivery_temp,
        truck_id,
        volume_correction,
      } = req.body;
      if (!ingredient_id)
        return res.status(400).json({ error: "ingredient_id is required" });

      await client.query("BEGIN");

      const countResult = await client.query(
        `SELECT 
        (SELECT COUNT(*) FROM ingredient_batches WHERE ingredient_id=$1) +
        (SELECT COUNT(*) FROM ingredient_batch_delete_history WHERE ingredient_id=$1) AS total`,
        [ingredient_id],
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
          ingredient_id,
          batch_number,
          parseFloat(stock) || 0,
          mfg_date || null,
          exp_date || null,
          supply_date || null,
          parseFloat(cost_per_unit) || 0,
          supplier || null,
          !!perishable,
          notes || null,
          lot_number || null,
          ndc_code || null,
          dosage_form || null,
          strength || null,
          storage_requirement || null,
          !!controlled_substance,
          tank_id || null,
          grade || null,
          octane_rating || null,
          delivery_temp === "" || delivery_temp == null
            ? null
            : Number(delivery_temp),
          truck_id || null,
          volume_correction === "" || volume_correction == null
            ? null
            : Number(volume_correction),
        ],
      );

      const syncResult = await syncIngredientFromBatches(client, ingredient_id);
      const total_stock = syncResult?.totalStock || 0;
      await client.query("COMMIT");

      const ingRow = await pool.query(
        "SELECT name, branch FROM ingredients WHERE id=$1",
        [ingredient_id],
      );
      const ing = ingRow.rows[0] || {};
      await logActivity({
        action: "receive",
        itemName: ing.name,
        performedBy: req.body.performed_by || "System",
        details: {
          batch_number,
          stock: parseFloat(stock) || 0,
          supplier: req.body.supplier || null,
          exp_date: exp_date || null,
        },
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
      console.error("POST /ingredient-batches error:", err);
      res.status(500).json({ error: "Failed to add batch" });
    } finally {
      client.release();
    }
  },
);

router.put(
  "/ingredient-batches/:id",
  authorize("Super Admin", "Sales Admin", "Manager", "Franchisee"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        batch_number,
        stock,
        mfg_date,
        exp_date,
        supply_date,
        cost_per_unit,
        supplier,
        perishable,
        notes,
        lot_number,
        ndc_code,
        dosage_form,
        strength,
        storage_requirement,
        controlled_substance,
        tank_id,
        grade,
        octane_rating,
        delivery_temp,
        truck_id,
        volume_correction,
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
          batch_number || null,
          parseFloat(stock) || 0,
          mfg_date || null,
          exp_date || null,
          supply_date || null,
          parseFloat(cost_per_unit) || 0,
          supplier || null,
          !!perishable,
          notes || null,
          lot_number || null,
          ndc_code || null,
          dosage_form || null,
          strength || null,
          storage_requirement || null,
          !!controlled_substance,
          tank_id || null,
          grade || null,
          octane_rating || null,
          delivery_temp === "" || delivery_temp == null
            ? null
            : Number(delivery_temp),
          truck_id || null,
          volume_correction === "" || volume_correction == null
            ? null
            : Number(volume_correction),
          req.params.id,
        ],
      );
      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Batch not found" });
      }

      const ingredient_id = result.rows[0].ingredient_id;
      const syncResult = await syncIngredientFromBatches(client, ingredient_id);
      const total_stock = syncResult?.totalStock || 0;

      await client.query("COMMIT");

      const ingRow = await pool.query(
        "SELECT name, branch FROM ingredients WHERE id=$1",
        [ingredient_id],
      );
      const ing = ingRow.rows[0] || {};
      await logActivity({
        action: "edit",
        itemName: ing.name,
        performedBy: req.body.performed_by || "System",
        details: {
          batch_number,
          stock: parseFloat(stock) || 0,
          exp_date: exp_date || null,
        },
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
  },
);

router.delete(
  "/ingredient-batches/:id",
  authorize("Super Admin"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const before = await client.query(
        "SELECT ingredient_id FROM ingredient_batches WHERE id=$1",
        [req.params.id],
      );
      if (before.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Batch not found" });
      }
      const { ingredient_id } = before.rows[0];

      const batchRow = await client.query(
        `SELECT b.batch_number, i.name AS ingredient_name, i.branch
      FROM ingredient_batches b JOIN ingredients i ON i.id = b.ingredient_id
      WHERE b.id=$1`,
        [req.params.id],
      );
      const batchInfo = batchRow.rows[0] || {};

      await client.query("DELETE FROM ingredient_batches WHERE id=$1", [
        req.params.id,
      ]);

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
  },
);

// Ingredient batch delete history
router.get(
  "/ingredient-batch-delete-history",
  authorize("Super Admin"),
  async (req, res) => {
    try {
      const { ingredient_id } = req.query;
      if (!ingredient_id)
        return res.status(400).json({ error: "ingredient_id is required" });
      const result = await pool.query(
        "SELECT * FROM ingredient_batch_delete_history WHERE ingredient_id=$1 ORDER BY deleted_at DESC",
        [ingredient_id],
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch batch delete history" });
    }
  },
);

router.post(
  "/ingredient-batch-delete-history",
  authorize("Super Admin"),
  async (req, res) => {
    try {
      const { batch_data, ingredient_id, ingredient_name, deleted_by } =
        req.body;
      await pool.query(
        `INSERT INTO ingredient_batch_delete_history (batch_data, ingredient_id, ingredient_name, deleted_by)
       VALUES ($1,$2,$3,$4)`,
        [
          JSON.stringify(batch_data),
          ingredient_id,
          ingredient_name || null,
          deleted_by || "Unknown",
        ],
      );
      res.json({ success: true });
    } catch (err) {
      console.error("POST /ingredient-batch-delete-history error:", err);
      res.status(500).json({ error: "Failed to save batch delete history" });
    }
  },
);

router.delete(
  "/ingredient-batch-delete-history/:id",
  authorize("Super Admin"),
  async (req, res) => {
    try {
      await pool.query(
        "DELETE FROM ingredient_batch_delete_history WHERE id=$1",
        [req.params.id],
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete batch history entry" });
    }
  },
);

router.get(
  "/ingredient-activity-log",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Franchisee",
    "Manager",
  ),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM users_activity_log
       WHERE module = $1
       ORDER BY created_at DESC
       LIMIT 300`,
        ["Stock Inventory"],
      );
      res.json(result.rows);
    } catch (err) {
      console.error("GET /ingredient-activity-log error:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch ingredient activity log" });
    }
  },
);

router.get(
  "/ingredient-batches/:id/transfer-history",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Franchisee",
    "Manager",
  ),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT t.id, t.quantity, t.applied, t.created_at AS transferred_at,
              o.id AS order_id, o.branch AS destination_branch, o.brand AS destination_brand
       FROM order_stock_transfers t
       JOIN orders o ON o.id = t.order_id
       WHERE t.source_batch_id = $1
       ORDER BY t.created_at DESC`,
        [req.params.id],
      );
      res.json(result.rows);
    } catch (err) {
      console.error("GET /ingredient-batches/:id/transfer-history error:", err);
      res.status(500).json({ error: "Failed to fetch batch transfer history" });
    }
  },
);

module.exports = router;
module.exports.priceFromCost = priceFromCost;
