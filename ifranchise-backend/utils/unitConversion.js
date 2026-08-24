const UNIT_GROUPS = {
  // weight
  g:      { base: "g",  factor: 1 },
  kg:     { base: "g",  factor: 1000 },
  // volume
  ml:     { base: "ml", factor: 1 },
  liters: { base: "ml", factor: 1000 },
  tbsp:   { base: "ml", factor: 15 },
  tsp:    { base: "ml", factor: 5 },
  cups:   { base: "ml", factor: 240 },
  // count — each unit is its own base; only convertible to itself
  pcs:     { base: "pcs",     factor: 1 },
  bottles: { base: "bottles", factor: 1 },
  packs:   { base: "packs",   factor: 1 },
  bags:    { base: "bags",    factor: 1 },
  boxes:   { base: "boxes",   factor: 1 },
  cans:    { base: "cans",    factor: 1 },
};

function convertUnit(quantity, fromUnit, toUnit) {
  if (!fromUnit || !toUnit || fromUnit === toUnit) return quantity;
  const from = UNIT_GROUPS[fromUnit];
  const to   = UNIT_GROUPS[toUnit];
  if (!from || !to || from.base !== to.base) return quantity; // incompatible/unknown units — never throw, just skip conversion
  return (quantity * from.factor) / to.factor;
}

module.exports = { convertUnit, UNIT_GROUPS };