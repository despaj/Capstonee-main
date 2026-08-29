const { convertUnit } = require('./unitConversion');
const { recomputeProductCosts } = require('./recomputeProductCosts');

const DEFAULT_MARKUP = 0.40;

function brandKey(brand = '') {
  return String(brand || '').trim().toLowerCase();
}

function isPharmaBrand(brand) {
  return brandKey(brand).includes('ipharma') || brandKey(brand).includes('pharma');
}

function isFuelBrand(brand) {
  return brandKey(brand).includes('ifuel') || brandKey(brand).includes('fuel');
}

function isDirectCatalogueBrand(brand) {
  return isPharmaBrand(brand) || isFuelBrand(brand);
}

function rotationMethod({ brand, perishable }) {
  // Pharmacy is always FEFO. Other perishable goods (e.g. milk/food) use FEFO.
  // Fuel and non-perishable supplies use FIFO.
  return isPharmaBrand(brand) || !!perishable ? 'FEFO' : 'FIFO';
}

function sortBatches(batches, ingredient) {
  const method = rotationMethod(ingredient);
  return [...batches].sort((a, b) => {
    if (method === 'FEFO') {
      const da = a.exp_date ? new Date(a.exp_date).getTime() : Number.POSITIVE_INFINITY;
      const db = b.exp_date ? new Date(b.exp_date).getTime() : Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
    }
    const da = new Date(a.supply_date || a.mfg_date || a.created_at || 0).getTime();
    const db = new Date(b.supply_date || b.mfg_date || b.created_at || 0).getTime();
    return da - db;
  });
}

function isExpired(batch) {
  if (!batch.exp_date) return false;
  const exp = new Date(batch.exp_date);
  exp.setHours(23, 59, 59, 999);
  return exp.getTime() < Date.now();
}

async function getIngredient(client, ingredientId, lock = false) {
  const result = await client.query(
    `SELECT * FROM ingredients WHERE id=$1${lock ? ' FOR UPDATE' : ''}`,
    [ingredientId]
  );
  return result.rows[0] || null;
}

async function getActiveBatches(client, ingredientId, ingredient, lock = false) {
  const result = await client.query(
    `SELECT * FROM ingredient_batches
     WHERE ingredient_id=$1 AND stock > 0
     ${lock ? 'FOR UPDATE' : ''}`,
    [ingredientId]
  );
  const method = rotationMethod(ingredient);
  const usable = method === 'FEFO'
    ? result.rows.filter(batch => !isExpired(batch))
    : result.rows;
  return sortBatches(usable, ingredient);
}

async function syncDirectCatalogue(client, ingredientId) {
  const ingredient = await getIngredient(client, ingredientId, false);
  if (!ingredient || !isDirectCatalogueBrand(ingredient.brand)) return null;

  const extra = ingredient.extra_fields && typeof ingredient.extra_fields === 'object'
    ? ingredient.extra_fields
    : {};
  const defaultCategory = isPharmaBrand(ingredient.brand)
    ? (extra.dosage_form || extra.category || 'Medicine')
    : (extra.fuel_grade || extra.category || 'Fuel');

  const cost = Number(ingredient.cost_per_unit || 0);
  const activeBatches = await getActiveBatches(client, ingredientId, ingredient, false);
  const sellableStock = activeBatches.reduce((sum, batch) => sum + Number(batch.stock || 0), 0);
  const suggestedPrice = Number((cost * (1 + DEFAULT_MARKUP)).toFixed(2));

  const existing = await client.query(
    `SELECT * FROM inventory
     WHERE branch=$1 AND COALESCE(brand,'')=COALESCE($2,'') AND LOWER(name)=LOWER($3)
     ORDER BY id ASC LIMIT 1`,
    [ingredient.branch, ingredient.brand || null, ingredient.name]
  );

  let product;
  if (existing.rows.length > 0) {
    const current = existing.rows[0];
    const sellingPrice = Number(current.price || 0) > 0 ? Number(current.price) : suggestedPrice;
    const updated = await client.query(
      `UPDATE inventory
       SET cost=$1, price=$2, stock=$3, min_stock=$4,
           category=COALESCE(NULLIF(category,''),$5), updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [cost, sellingPrice, sellableStock, Number(ingredient.min_stock || 0), defaultCategory, current.id]
    );
    product = updated.rows[0];
  } else {
    const created = await client.query(
      `INSERT INTO inventory (name, category, branch, brand, cost, price, stock, min_stock, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NULL) RETURNING *`,
      [ingredient.name, defaultCategory, ingredient.branch, ingredient.brand || null,
       cost, suggestedPrice, sellableStock, Number(ingredient.min_stock || 0)]
    );
    product = created.rows[0];
  }

  // Direct products are a 1:1 link to their Stock Inventory item.
  await client.query('DELETE FROM product_ingredients WHERE inventory_id=$1', [product.id]);
  await client.query(
    `INSERT INTO product_ingredients (inventory_id, ingredient_id, quantity, unit)
     VALUES ($1,$2,$3,$4)`,
    [product.id, ingredient.id, 1, ingredient.unit || 'pcs']
  );

  return product;
}

async function syncIngredientFromBatches(client, ingredientId) {
  const ingredient = await getIngredient(client, ingredientId, false);
  if (!ingredient) return null;

  const totals = await client.query(
    `SELECT COALESCE(SUM(stock),0) AS total_stock,
            MIN(exp_date) FILTER (WHERE exp_date IS NOT NULL AND stock > 0) AS earliest_exp
     FROM ingredient_batches WHERE ingredient_id=$1`,
    [ingredientId]
  );
  const totalStock = Number(totals.rows[0]?.total_stock || 0);
  const earliestExp = totals.rows[0]?.earliest_exp || null;

  const active = await getActiveBatches(client, ingredientId, ingredient, false);
  const nextCost = active.length > 0
    ? Number(active[0].cost_per_unit || ingredient.cost_per_unit || 0)
    : Number(ingredient.cost_per_unit || 0);

  await client.query(
    `UPDATE ingredients
     SET stock=$1, cost_per_unit=$2,
         extra_fields=COALESCE(extra_fields,'{}'::jsonb) || jsonb_build_object('exp_date',$3::text),
         updated_at=NOW()
     WHERE id=$4`,
    [totalStock, nextCost, earliestExp, ingredientId]
  );

  // Keep the franchise mobile shop stock in sync where this ingredient is listed.
  await client.query(
    `UPDATE shop_items SET stock=$1 WHERE ingredient_id=$2`,
    [totalStock, ingredientId]
  ).catch(() => {});

  // Recipe products recalculate from their current stock-item costs.
  await recomputeProductCosts(client, ingredientId);

  // iPharma and iFuel automatically mirror Stock Inventory into Product Catalogue.
  await syncDirectCatalogue(client, ingredientId);

  return { totalStock, nextCost, earliestExp };
}

async function allocateIngredientStock(client, ingredientId, requestedQuantity, options = {}) {
  const ingredient = await getIngredient(client, ingredientId, true);
  if (!ingredient) {
    const err = new Error('Stock item not found');
    err.status = 404;
    throw err;
  }

  const qty = Number(requestedQuantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    const err = new Error('Quantity must be greater than zero');
    err.status = 400;
    throw err;
  }

  const method = rotationMethod(ingredient);
  const batches = await getActiveBatches(client, ingredientId, ingredient, true);
  const available = batches.reduce((sum, batch) => sum + Number(batch.stock || 0), 0);

  if (available + 1e-9 < qty) {
    const err = new Error(`Insufficient usable stock for ${ingredient.name}`);
    err.status = 409;
    err.details = { requested: qty, available, rotation_method: method };
    throw err;
  }

  let remaining = qty;
  let cogs = 0;
  const allocations = [];
  for (const batch of batches) {
    if (remaining <= 1e-9) break;
    const take = Math.min(remaining, Number(batch.stock || 0));
    if (take <= 0) continue;

    if (options.apply !== false) {
      await client.query(
        `UPDATE ingredient_batches SET stock=stock-$1, updated_at=NOW() WHERE id=$2`,
        [take, batch.id]
      );
    }

    const batchCost = Number(batch.cost_per_unit || ingredient.cost_per_unit || 0);
    cogs += take * batchCost;
    allocations.push({
      batch_id: batch.id,
      batch_number: batch.batch_number,
      quantity: take,
      cost_per_unit: batchCost,
      exp_date: batch.exp_date,
      mfg_date: batch.mfg_date,
      supply_date: batch.supply_date,
      supplier: batch.supplier,
      lot_number: batch.lot_number,
      ndc_code: batch.ndc_code,
    });
    remaining -= take;
  }

  if (options.apply !== false) {
    await syncIngredientFromBatches(client, ingredientId);
  }

  return {
    ingredient,
    rotation_method: method,
    requested: qty,
    cogs,
    allocations,
  };
}

async function allocateProductStock(client, inventoryId, quantity) {
  const productResult = await client.query('SELECT * FROM inventory WHERE id=$1 FOR UPDATE', [inventoryId]);
  const product = productResult.rows[0];
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  const saleQty = Number(quantity);
  if (!Number.isFinite(saleQty) || saleQty <= 0) {
    const err = new Error('Sale quantity must be greater than zero');
    err.status = 400;
    throw err;
  }

  const recipe = await client.query(
    `SELECT pi.ingredient_id, pi.quantity, pi.unit AS recipe_unit,
            i.name, i.brand, i.perishable, i.unit AS ingredient_unit
     FROM product_ingredients pi
     JOIN ingredients i ON i.id=pi.ingredient_id
     WHERE pi.inventory_id=$1`,
    [inventoryId]
  );

  if (recipe.rows.length === 0) {
    const err = new Error(`${product.name} is not linked to Stock Inventory`);
    err.status = 409;
    throw err;
  }

  let cogs = 0;
  const ingredientAllocations = [];
  for (const row of recipe.rows) {
    let needed = Number(row.quantity || 0) * saleQty;
    try {
      needed = convertUnit(needed, row.recipe_unit || row.ingredient_unit, row.ingredient_unit);
    } catch {
      // Keep raw quantity if units are already equivalent or a legacy unit is present.
    }

    const allocation = await allocateIngredientStock(client, row.ingredient_id, needed, { apply: true });
    cogs += allocation.cogs;
    ingredientAllocations.push({
      ingredient_id: row.ingredient_id,
      ingredient_name: row.name,
      quantity: needed,
      unit: row.ingredient_unit,
      rotation_method: allocation.rotation_method,
      batches: allocation.allocations,
    });
  }

  // Inventory.stock is a derived display value. For recipes it is recomputed by GET /inventory;
  // for direct products it is synchronized from the linked ingredient by syncDirectCatalogue.
  if (!isDirectCatalogueBrand(product.brand)) {
    const current = Number(product.stock || 0);
    await client.query(
      `UPDATE inventory SET stock=GREATEST(0,$1), updated_at=NOW() WHERE id=$2`,
      [current - saleQty, inventoryId]
    ).catch(() => {});
  }

  return { product, cogs, ingredientAllocations };
}

module.exports = {
  isPharmaBrand,
  isFuelBrand,
  isDirectCatalogueBrand,
  rotationMethod,
  sortBatches,
  syncIngredientFromBatches,
  syncDirectCatalogue,
  allocateIngredientStock,
  allocateProductStock,
};

