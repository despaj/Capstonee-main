// utils/stockTransfer.js
async function transferStockForSupplyOrder(client, order) {
  // order.items = [{ ingredient_name, brand, quantity }]
  for (const line of order.items) {
    // 1. Find source (Head Office) ingredient + its batches
    const { rows: [source] } = await client.query(
      `SELECT * FROM ingredients WHERE brand=$1 AND branch='Head Office' AND name=$2`,
      [line.brand, line.ingredient_name]
    );
    if (!source || source.stock < line.quantity) {
      throw new Error(`Insufficient HO stock for ${line.ingredient_name}`);
    }

    // 2. Deduct FIFO/FEFO from HO batches (reuse your existing deduct-stock logic)
    const deductedBatches = await deductStockFIFO(client, source.id, line.quantity);

    // 3. Upsert destination ingredient row (brand+branch+name)
    let { rows: [dest] } = await client.query(
      `SELECT * FROM ingredients WHERE brand=$1 AND branch=$2 AND name=$3`,
      [line.brand, order.destination_branch, line.ingredient_name]
    );
    if (!dest) {
      const insert = await client.query(
        `INSERT INTO ingredients (name, brand, branch, unit, min_stock, cost_per_unit, perishable, stock)
         VALUES ($1,$2,$3,$4,$5,$6,$7,0) RETURNING *`,
        [source.name, source.brand, order.destination_branch, source.unit, source.min_stock, source.cost_per_unit, source.perishable]
      );
      dest = insert.rows[0];
    }

    // 4. Recreate batches at destination, preserving expiry/lot for FEFO continuity
    for (const b of deductedBatches) {
      await client.query(
        `INSERT INTO ingredient_batches
           (ingredient_id, stock, exp_date, mfg_date, cost_per_unit, supplier, lot_number, ndc_code, batch_number, notes, supply_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())`,
        [dest.id, b.stock_taken, b.exp_date, b.mfg_date, b.cost_per_unit, b.supplier, b.lot_number, b.ndc_code, b.batch_number,
         `Transferred from Head Office · Order #${order.id}`]
      );
    }

    // 5. Recalc both stock totals from batches (same syncIngredientStock pattern you use in the frontend)
    await syncIngredientStockFromBatches(client, source.id);
    await syncIngredientStockFromBatches(client, dest.id);
  }
}