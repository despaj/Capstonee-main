// Converts a quantity from one unit to another, as long as both units
// belong to the same measurement group (weight, volume, or count).
const UNIT_GROUPS = {
  g:      { base: "kg",      factor: 0.001 },
  kg:     { base: "kg",      factor: 1 },
  ml:     { base: "liters",  factor: 0.001 },
  liters: { base: "liters",  factor: 1 },
  pcs:    { base: "pcs",     factor: 1 },
};

function convertUnit(quantity, fromUnit, toUnit) {
  if (fromUnit === toUnit) return quantity;

  const from = UNIT_GROUPS[fromUnit];
  const to = UNIT_GROUPS[toUnit];
  if (!from || !to || from.base !== to.base) {
    throw new Error(`Cannot convert incompatible units: ${fromUnit} -> ${toUnit}`);
  }

  const inBaseUnit = quantity * from.factor;
  return inBaseUnit / to.factor;
}

module.exports = { convertUnit };