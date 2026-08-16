const { convertUnit } = require("./unitConversion");

// Recalculates inventory.cost for every product that uses this ingredient,
// converting each recipe line into the ingredient's own unit before pricing it.
async function recomputeProductCosts(client, ingredientId) {
  const affectedProducts = await client.query(
    `SELECT DISTINCT inventory_id FROM product_ingredients WHERE ingredient_id=$1`,
    [ingredientId]
  );

  for (const row of affectedProducts.rows) {
    const recipeRows = await client.query(
      `SELECT pi.quantity, pi.unit AS recipe_unit, i.cost_per_unit, i.unit AS ingredient_unit
       FROM product_ingredients pi JOIN ingredients i ON i.id=pi.ingredient_id
       WHERE pi.inventory_id=$1`,
      [row.inventory_id]
    );

    let totalCost = 0;
    for (const r of recipeRows.rows) {
      const qtyInIngredientUnit = convertUnit(parseFloat(r.quantity) || 0, r.recipe_unit, r.ingredient_unit);
      totalCost += qtyInIngredientUnit * (parseFloat(r.cost_per_unit) || 0);
    }

    await client.query(
      `UPDATE inventory SET cost=$1, updated_at=NOW() WHERE id=$2`,
      [totalCost, row.inventory_id]
    );
  }

  return affectedProducts.rows.length;
}

module.exports = { recomputeProductCosts };