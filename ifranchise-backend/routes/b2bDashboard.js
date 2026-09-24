const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth");
router.use(authenticate);
router.use(authorize("Super Admin", "Franchisee Operations Admin", "Sales Admin", "Manager"));
const pool = require("../db");

// Monetary values are summed as integer centavos in the model.
const number = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const nullable = (value) =>
  value == null || value === "" || !Number.isFinite(Number(value))
    ? null
    : Number(value);
const keyOf = (...parts) =>
  JSON.stringify(
    parts.map((v) =>
      String(v ?? "")
        .trim()
        .toLowerCase(),
    ),
  );
function cents(value) {
  const text = String(value ?? "").trim();
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(text))
    throw new Error("Missing or invalid monetary value");
  const negative = text.startsWith("-"),
    [whole, fraction = ""] = text.replace(/^[+-]/, "").split(".");
  let result = BigInt(whole) * 100n + BigInt((fraction + "00").slice(0, 2));
  if (Number(fraction[2] || 0) >= 5) result++;
  result = negative ? -result : result;
  if (
    result > BigInt(Number.MAX_SAFE_INTEGER) ||
    result < BigInt(Number.MIN_SAFE_INTEGER)
  )
    throw new Error("Monetary value exceeds supported precision");
  return Number(result);
}
const moneySum = (values) => {
  const sum = values.reduce((sum, v) => sum + cents(v), 0);
  if (!Number.isSafeInteger(sum))
    throw new Error("Monetary sum exceeds supported precision");
  return sum / 100;
};
const growthRate = (current, previous) =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;
function monthWindow(rawMonth) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  const month =
    rawMonth == null || rawMonth === ""
      ? `${parts.year}-${parts.month}`
      : String(rawMonth);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    const e = new Error("month must be YYYY-MM with a valid month");
    e.status = 400;
    throw e;
  }
  const [y, m] = month.split("-").map(Number);
  const format = (year, value) =>
    `${year}-${String(value).padStart(2, "0")}-01T00:00:00+08:00`;
  return {
    month,
    start: format(y, m),
    next: m === 12 ? format(y + 1, 1) : format(y, m + 1),
    previous: m === 1 ? format(y - 1, 12) : format(y, m - 1),
  };
}
function matchesFilter(row, query) {
  return (
    (!query.branch || row.branch_name === query.branch) &&
    (!query.brand || row.brand_name === query.brand)
  );
}
function growthTarget(query) {
  const value =
    query.growthTargetPct == null || query.growthTargetPct === ""
      ? 10
      : Number(query.growthTargetPct);
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 500 ||
    Math.abs(value * 10000 - Math.round(value * 10000)) > 1e-7
  ) {
    const e = new Error(
      "growthTargetPct must be between 0 and 500 with at most four decimal places",
    );
    e.status = 400;
    throw e;
  }
  return value;
}

function targetAmount(previous, growth) {
  if (previous <= 0) return null;
  const numerator =
    BigInt(cents(previous)) * (1000000n + BigInt(Math.round(growth * 10000)));
  const result = Number((numerator + 500000n) / 1000000n);
  if (!Number.isSafeInteger(result))
    throw new Error("Target exceeds supported precision");
  return result / 100;
}

async function loadEvidence(month) {
  const period = monthWindow(month);
  const client = await pool.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const [
      catalog,
      orders,
      transactions,
      soldProducts,
      usage,
      receipts,
      closing,
    ] = await Promise.all([
      client.query(`
      SELECT br.id AS branch_id, br.name AS branch_name, br.address AS location,
             b.id AS brand_id, b.name AS brand_name
      FROM brands b LEFT JOIN branches br ON b.id=br.brand_id
      ORDER BY b.name, br.name`),
      client.query(
        `
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             COALESCE(SUM(CASE WHEN o.received_at >= $1::timestamptz AND o.received_at < $2::timestamptz
                               AND o.status='received' THEN ROUND(o.total_amount::numeric,2) ELSE 0 END),0) AS hq_revenue,
             COALESCE(SUM(CASE WHEN o.received_at >= $3::timestamptz AND o.received_at < $1::timestamptz
                               AND o.status='received' THEN ROUND(o.total_amount::numeric,2) ELSE 0 END),0) AS previous_hq_revenue,
             COUNT(o.id) FILTER (WHERE o.status='received' AND o.received_at >= $1::timestamptz AND o.received_at < $2::timestamptz) AS order_count,
             COUNT(o.id) FILTER (WHERE o.status='received' AND o.received_at IS NULL) AS undated_received_orders,
             COALESCE(jsonb_agg(jsonb_build_object('id',o.id,'brand',o.brand,'branch',o.branch,'status',o.status,'created_at',o.created_at,'received_at',o.received_at,'total_amount',o.total_amount,
               'items',COALESCE((SELECT jsonb_agg(jsonb_build_object('shop_item_id',oi.shop_item_id,'name',si.name,'unit',si.unit,'qty',oi.quantity,'price',oi.price)) FROM order_items oi LEFT JOIN shop_items si ON si.id=oi.shop_item_id WHERE oi.order_id=o.id),o.items::jsonb,'[]'::jsonb))) FILTER (WHERE o.id IS NOT NULL AND o.status='received'),'[]'::jsonb) AS order_records
      FROM branches br JOIN brands b ON b.id=br.brand_id
      LEFT JOIN orders o ON o.branch=br.name AND o.brand=b.name AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(o.items::jsonb)='array' THEN o.items::jsonb ELSE '[]'::jsonb END) demo_item WHERE lower(COALESCE(demo_item->>'is_demo','false')) IN ('true','1') OR COALESCE(demo_item->>'name','') LIKE '[DEMO]%')
      GROUP BY br.id, br.name, b.id, b.name`,
        [period.start, period.next, period.previous],
      ),
      client.query(
        `
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             COALESCE(SUM(CASE WHEN t.created_at >= $1::timestamptz AND t.created_at < $2::timestamptz
                               THEN ROUND(t.total::numeric,2) ELSE 0 END),0) AS pos_revenue,
             COUNT(*) FILTER (WHERE t.created_at >= $1::timestamptz AND t.created_at < $2::timestamptz) AS transactions,
             COALESCE(SUM(CASE WHEN t.created_at >= $3::timestamptz AND t.created_at < $1::timestamptz
                               THEN ROUND(t.total::numeric,2) ELSE 0 END),0) AS previous_pos_revenue,
             COALESCE(jsonb_agg(to_jsonb(t) || jsonb_build_object('brand',b.name,'branch',br.name)) FILTER (WHERE t.id IS NOT NULL),'[]'::jsonb) AS transaction_records
      FROM branches br JOIN brands b ON b.id=br.brand_id
      LEFT JOIN transactions t ON t.branch=br.name AND (NULLIF(to_jsonb(t)->>'brand','')=b.name OR (NULLIF(to_jsonb(t)->>'brand','') IS NULL AND (SELECT COUNT(*) FROM branches unique_branch WHERE unique_branch.name=t.branch)=1)) AND (t.is_voided=FALSE OR t.is_voided IS NULL)
        AND lower(COALESCE(to_jsonb(t)->>'status','')) IN ('','paid','completed','complete','success','successful')
        AND lower(COALESCE(to_jsonb(t)->>'voided','false')) NOT IN ('true','1')
        AND lower(COALESCE(to_jsonb(t)->>'is_demo','false')) NOT IN ('true','1')
      GROUP BY br.id, br.name, b.id, b.name`,
        [period.start, period.next, period.previous],
      ),
      client.query(
        `
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             inv.id AS product_id, COALESCE(inv.id::text, item.value->>'sku', item.value->>'id') AS sku,
             COALESCE(inv.name, item.value->>'name', 'Unnamed Product') AS product_name,
             SUM(COALESCE(COALESCE(NULLIF(item.value->>'qty',''),NULLIF(item.value->>'quantity',''))::numeric,0)) AS sold_qty,
             SUM(COALESCE(NULLIF(item.value->>'price','')::numeric,0)
                 * COALESCE(COALESCE(NULLIF(item.value->>'qty',''),NULLIF(item.value->>'quantity',''))::numeric,0)) AS line_revenue,
             COUNT(DISTINCT t.id) AS transaction_count, MAX(t.created_at) AS last_sale
      FROM transactions t
      JOIN branches br ON br.name=t.branch JOIN brands b ON b.id=br.brand_id AND (NULLIF(to_jsonb(t)->>'brand','')=b.name OR (NULLIF(to_jsonb(t)->>'brand','') IS NULL AND (SELECT COUNT(*) FROM branches unique_branch WHERE unique_branch.name=t.branch)=1))
      CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(t.items::jsonb)='array' THEN t.items::jsonb ELSE '[]'::jsonb END) item(value)
      LEFT JOIN inventory inv ON inv.id = CASE WHEN COALESCE(item.value->>'id','') ~ '^\\d+$'
                                               THEN (item.value->>'id')::integer END AND inv.branch=br.name AND inv.brand=b.name
      WHERE t.created_at >= $1::timestamptz AND t.created_at < $2::timestamptz
        AND (t.is_voided=FALSE OR t.is_voided IS NULL)
        AND lower(COALESCE(to_jsonb(t)->>'status','')) IN ('','paid','completed','complete','success','successful')
        AND lower(COALESCE(to_jsonb(t)->>'voided','false')) NOT IN ('true','1')
        AND lower(COALESCE(to_jsonb(t)->>'is_demo','false')) NOT IN ('true','1')
      GROUP BY br.id, br.name, b.id, b.name, inv.id, inv.name, item.value->>'sku', item.value->>'id', item.value->>'name'`,
        [period.start, period.next],
      ),
      client.query(
        `
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             inv.id AS product_id, inv.name AS product_name, i.id AS ingredient_id,
             i.name AS ingredient_name, i.unit,
             CASE WHEN COUNT(*) FILTER (WHERE COALESCE(NULLIF(item.value->>'qty',''),NULLIF(item.value->>'quantity','')) IS NULL OR COALESCE(NULLIF(item.value->>'qty',''),NULLIF(item.value->>'quantity',''))::numeric<0 OR pi.quantity IS NULL OR pi.quantity<0 OR
               (NULLIF(to_jsonb(pi)->>'unit','') IS NOT NULL AND lower(to_jsonb(pi)->>'unit')<>lower(i.unit)))>0
             THEN NULL ELSE SUM(COALESCE(COALESCE(NULLIF(item.value->>'qty',''),NULLIF(item.value->>'quantity',''))::numeric,0)*pi.quantity) END AS expected_usage
      FROM transactions t
      JOIN branches br ON br.name=t.branch JOIN brands b ON b.id=br.brand_id AND (NULLIF(to_jsonb(t)->>'brand','')=b.name OR (NULLIF(to_jsonb(t)->>'brand','') IS NULL AND (SELECT COUNT(*) FROM branches unique_branch WHERE unique_branch.name=t.branch)=1))
      CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(t.items::jsonb)='array' THEN t.items::jsonb ELSE '[]'::jsonb END) item(value)
      JOIN inventory inv ON inv.id = CASE WHEN COALESCE(item.value->>'id','') ~ '^\\d+$'
                                          THEN (item.value->>'id')::integer END AND inv.branch=br.name AND inv.brand=b.name
      JOIN product_ingredients pi ON pi.inventory_id=inv.id
      JOIN ingredients i ON i.id=pi.ingredient_id AND i.branch=br.name AND i.brand=b.name
      WHERE t.created_at >= $1::timestamptz AND t.created_at < $2::timestamptz
        AND (t.is_voided=FALSE OR t.is_voided IS NULL)
        AND lower(COALESCE(to_jsonb(t)->>'status','')) IN ('','paid','completed','complete','success','successful')
        AND lower(COALESCE(to_jsonb(t)->>'voided','false')) NOT IN ('true','1')
        AND lower(COALESCE(to_jsonb(t)->>'is_demo','false')) NOT IN ('true','1')
      GROUP BY br.id, br.name, b.id, b.name, inv.id, inv.name, i.id, i.name, i.unit`,
        [period.start, period.next],
      ),
      client.query(
        `
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             dest.id AS ingredient_id, dest.name AS ingredient_name, dest.unit,
             SUM(ost.quantity) AS received_qty
      FROM orders o
      JOIN branches br ON br.name=o.branch JOIN brands b ON b.id=br.brand_id AND b.name=o.brand
      JOIN order_stock_transfers ost ON ost.order_id=o.id AND ost.applied=TRUE
      JOIN ingredients source ON source.id=ost.ingredient_id
      LEFT JOIN ingredients dest ON dest.branch=br.name AND dest.brand=b.name AND dest.name=source.name AND dest.unit=source.unit AND (SELECT COUNT(*) FROM ingredients d WHERE d.branch=br.name AND d.brand=b.name AND d.name=source.name AND d.unit=source.unit)=1
      WHERE dest.id IS NOT NULL AND source.brand=b.name AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(o.items::jsonb)='array' THEN o.items::jsonb ELSE '[]'::jsonb END) demo_item WHERE lower(COALESCE(demo_item->>'is_demo','false')) IN ('true','1') OR COALESCE(demo_item->>'name','') LIKE '[DEMO]%') AND o.status='received' AND o.received_at >= $1::timestamptz AND o.received_at < $2::timestamptz
      GROUP BY br.id, br.name, b.id, b.name, dest.id, dest.name, dest.unit`,
        [period.start, period.next],
      ),
      client.query(`
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             i.id AS ingredient_id, i.name AS ingredient_name, i.unit,
             COALESCE(SUM(ib.stock), i.stock) AS closing_stock
      FROM branches br JOIN brands b ON b.id=br.brand_id
      JOIN ingredients i ON i.branch=br.name AND i.brand=b.name
      LEFT JOIN ingredient_batches ib ON ib.ingredient_id=i.id
      GROUP BY br.id, br.name, b.id, b.name, i.id, i.name, i.unit, i.stock`),
    ]);
    await client.query("COMMIT");
    return {
      period,
      catalog: catalog.rows,
      orders: orders.rows,
      transactions: transactions.rows,
      soldProducts: soldProducts.rows,
      usage: usage.rows,
      receipts: receipts.rows,
      closing: closing.rows,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function allocatedProducts(raw, query) {
  const products = new Map();
  for (const scope of raw.transactions.filter((r) => matchesFilter(r, query)))
    for (const tx of scope.transaction_records || []) {
      const at = new Date(tx.created_at).getTime();
      if (
        !Number.isFinite(at) ||
        at < new Date(raw.period.start).getTime() ||
        at >= new Date(raw.period.next).getTime()
      )
        continue;
      if (nullable(tx.total) == null)
        throw new Error("Transaction total is missing or invalid");
      const totalCents = cents(tx.total);
      let items = Array.isArray(tx.items) ? tx.items : [];
      let weights = items.map((i) => {
        const qty = nullable(i.qty ?? i.quantity),
          price = nullable(i.price);
        return qty != null && qty >= 0 && price != null && price >= 0
          ? Math.round(qty * price * 100)
          : null;
      });
      // Unknown lines get one explicit unallocated bucket, never invented products/prices.
      if (
        !items.length ||
        weights.some((w) => w == null || !Number.isSafeInteger(w)) ||
        weights.reduce((a, b) => a + b, 0) <= 0
      ) {
        items = [{ name: "Unallocated transaction amount", qty: null }];
        weights = [1];
      }
      const weightSum = weights.reduce((a, b) => a + b, 0),
        absolute = Math.abs(totalCents);
      if (!Number.isSafeInteger(weightSum))
        throw new Error("Item allocation exceeds supported precision");
      const shares = weights.map((w, index) => ({
        index,
        cents: Math.floor(
          Number((BigInt(absolute) * BigInt(w)) / BigInt(weightSum)),
        ),
        remainder: Number((BigInt(absolute) * BigInt(w)) % BigInt(weightSum)),
      }));
      let pennies = absolute - shares.reduce((n, r) => n + r.cents, 0);
      for (const share of [...shares].sort(
        (a, b) => b.remainder - a.remainder || a.index - b.index,
      )) {
        if (pennies <= 0) break;
        share.cents++;
        pennies--;
      }
      items.forEach((item, index) => {
        const id = item.product_id ?? item.inventory_id ?? item.id;
        const known =
          id == null
            ? undefined
            : raw.soldProducts.find(
                (r) =>
                  keyOf(r.branch_id, r.brand_id, r.product_id) ===
                  keyOf(scope.branch_id, scope.brand_id, id),
              );
        const name =
          known?.product_name ||
          item.name ||
          item.product_name ||
          "Unnamed item";
        const key = keyOf(scope.brand_id, scope.branch_id, id ?? name);
        const row = products.get(key) || {
          branch_id: scope.branch_id,
          branch_name: scope.branch_name,
          brand_id: scope.brand_id,
          brand_name: scope.brand_name,
          product_id: known?.product_id ?? null,
          sku: known?.sku ?? String(id ?? "—"),
          product_name: name,
          sold_qty: 0,
          line_cents: 0,
          transaction_ids: new Set(),
          last_sale: null,
        };
        const qty = nullable(item.qty ?? item.quantity);
        row.sold_qty =
          qty == null || row.sold_qty == null ? null : row.sold_qty + qty;
        row.line_cents += shares[index].cents * Math.sign(totalCents);
        if (!Number.isSafeInteger(row.line_cents))
          throw new Error("Product revenue exceeds supported precision");
        row.transaction_ids.add(String(tx.id));
        if (!row.last_sale || at > new Date(row.last_sale).getTime())
          row.last_sale = tx.created_at;
        products.set(key, row);
      });
    }
  return [...products.values()].map(
    ({ line_cents, transaction_ids, ...row }) => ({
      ...row,
      line_revenue: line_cents / 100,
      transaction_count: transaction_ids.size,
      transaction_ids: [...transaction_ids],
      revenue_basis:
        "Transaction net total allocated by gross item value with centavo rounding; unallocated amounts shown separately",
    }),
  );
}

function buildModel(raw, query) {
  const growth = growthTarget(query);
  for (const scope of raw.orders)
    for (const order of scope.order_records || []) {
      if (
        order.received_at &&
        new Date(order.received_at) >= new Date(raw.period.previous) &&
        new Date(order.received_at) < new Date(raw.period.next)
      )
        cents(order.total_amount);
    }
  for (const scope of raw.transactions)
    for (const tx of scope.transaction_records || []) {
      if (
        tx.created_at &&
        new Date(tx.created_at) >= new Date(raw.period.previous) &&
        new Date(tx.created_at) < new Date(raw.period.next)
      )
        cents(tx.total);
    }
  const branchMap = new Map(
    raw.catalog
      .filter((r) => r.branch_id != null)
      .map((r) => [
        keyOf(r.brand_id, r.branch_id),
        {
          ...r,
          hq_revenue: 0,
          previous_hq_revenue: 0,
          pos_revenue: 0,
          previous_pos_revenue: 0,
          transactions: 0,
          order_count: 0,
          undated_received_orders: 0,
        },
      ]),
  );
  for (const r of raw.orders) {
    const row = branchMap.get(keyOf(r.brand_id, r.branch_id));
    if (row)
      Object.assign(row, {
        hq_revenue: nullable(r.hq_revenue),
        previous_hq_revenue: nullable(r.previous_hq_revenue),
        order_count: number(r.order_count),
        undated_received_orders: number(r.undated_received_orders),
      });
  }
  for (const r of raw.transactions) {
    const row = branchMap.get(keyOf(r.brand_id, r.branch_id));
    if (row)
      Object.assign(row, {
        pos_revenue: nullable(r.pos_revenue),
        previous_pos_revenue: nullable(r.previous_pos_revenue),
        transactions: number(r.transactions),
      });
  }
  const branches = [...branchMap.values()]
    .filter((r) => matchesFilter(r, query))
    .map((r) => {
      const target = targetAmount(r.previous_hq_revenue, growth);
      return {
        ...r,
        hq_supply_revenue: r.hq_revenue,
        monthly_target: target,
        target_gap:
          target == null
            ? null
            : Math.max(0, Math.round((target - r.hq_revenue) * 100) / 100),
        target_pct: target > 0 ? (r.hq_revenue / target) * 100 : null,
        mom_growth: growthRate(r.hq_revenue, r.previous_hq_revenue),
        supplied_qty: null,
        sold_qty: null,
        order_coverage: null,
        sell_through: null,
        stock_variance: null,
        closing_stock: null,
        risk:
          r.transactions === 0 && r.order_count === 0
            ? "No transactions yet"
            : "Insufficient evidence",
        reason:
          "Historical opening/closing counts and complete movement records are unavailable. Coverage, variance and revenue loss cannot be verified.",
      };
    })
    .sort(
      (a, b) =>
        b.hq_revenue - a.hq_revenue ||
        b.pos_revenue - a.pos_revenue ||
        a.branch_name.localeCompare(b.branch_name),
    );
  const brandMap = new Map(
    raw.catalog
      .filter((r) => !query.brand || r.brand_name === query.brand)
      .map((r) => [
        r.brand_id,
        { brand_id: r.brand_id, brand_name: r.brand_name },
      ]),
  );
  const brands = [...brandMap.values()]
    .map((r) => {
      const rows = branches.filter((b) => b.brand_id === r.brand_id);
      return {
        ...r,
        hq_revenue: moneySum(rows.map((x) => x.hq_revenue)),
        hq_supply_revenue: moneySum(rows.map((x) => x.hq_revenue)),
        pos_revenue: moneySum(rows.map((x) => x.pos_revenue)),
        supplied_qty: null,
        sold_qty: null,
        ending_stock: null,
        sell_through: null,
        stock_variance: null,
        branches: rows,
      }; // ← added
    })
    .filter(
      (r) => !query.branch || branches.some((b) => b.brand_id === r.brand_id),
    );
  const products = allocatedProducts(raw, query);
  if (
    cents(moneySum(products.map((r) => r.line_revenue))) !==
    cents(moneySum(branches.map((r) => r.pos_revenue)))
  )
    throw new Error(
      "POS item allocation does not reconcile to the branch totals",
    );
  return { branches, brands, products, anomalies: [] };
}
function overview(raw, query, model) {
  const sum = (field) => moneySum(model.branches.map((r) => r[field]));
  const hq = sum("hq_revenue"),
    previous = sum("previous_hq_revenue"),
    pos = sum("pos_revenue"),
    prevPos = sum("previous_pos_revenue");
  const target =
    previous > 0
      ? moneySum(model.branches.map((r) => r.monthly_target ?? 0))
      : null;
  const allowed = new Set(
    model.branches.map((r) => keyOf(r.brand_id, r.branch_id)),
  );
  return {
    month: raw.period.month,
    calculation_version: "qa-evidence-v2",
    time_zone: "Asia/Manila",
    revenue_date_basis: "received_at",
    hq_supply_revenue: hq,
    previous_hq_supply_revenue: previous,
    pos_revenue: pos,
    previous_pos_revenue: prevPos,
    monthly_target: target,
    target_gap:
      target == null
        ? null
        : Math.max(0, Math.round((target - hq) * 100) / 100),
    target_attainment_pct: target > 0 ? (hq / target) * 100 : null,
    order_coverage: null,
    sell_through: null,
    unexplained_stock: null,
    at_risk_branches: null,
    unassessed_branches: model.branches.length,
    undated_received_orders: model.branches.reduce(
      (n, r) => n + r.undated_received_orders,
      0,
    ),
    transactions: model.branches.reduce((n, r) => n + r.transactions, 0),
    ...model,
    order_evidence: raw.orders
      .filter((r) => allowed.has(keyOf(r.brand_id, r.branch_id)))
      .flatMap((r) => r.order_records || []),
    transaction_evidence: raw.transactions
      .filter((r) => allowed.has(keyOf(r.brand_id, r.branch_id)))
      .flatMap((r) => r.transaction_records || []),
    note: "Unbranded POS records are matched only when the branch name is unique. Invalid or unmatched item identifiers cannot produce recipe proof. Received orders without received_at are excluded from monthly revenue. Marked demo orders are excluded. No complete historical stock ledger is available; null values are not zero.",
  };
}
function reconcile(raw, query, model) {
  const { branchId, productId } = query;
  if (!branchId || !productId) {
    const e = new Error("branchId and productId are required");
    e.status = 400;
    throw e;
  }
  const branch = model.branches.find(
    (r) => String(r.branch_id) === String(branchId),
  );
  const product = model.products.find(
    (r) =>
      String(r.branch_id) === String(branchId) &&
      String(r.product_id) === String(productId) &&
      r.brand_id === branch?.brand_id,
  );
  if (!branch || !product) {
    const e = new Error("Product not found in this brand, branch and period");
    e.status = 404;
    throw e;
  }
  const ingredients = raw.usage
    .filter(
      (r) =>
        keyOf(r.branch_id, r.brand_id, r.product_id) ===
        keyOf(branch.branch_id, branch.brand_id, productId),
    )
    .map((r) => {
      const matches = (x) =>
        keyOf(x.branch_id, x.brand_id, x.ingredient_id, x.unit) ===
        keyOf(r.branch_id, r.brand_id, r.ingredient_id, r.unit);
      const receipts = raw.receipts.filter(matches),
        current = raw.closing.find(matches);
      return {
        ingredient_id: r.ingredient_id,
        ingredient_name: r.ingredient_name,
        unit: r.unit,
        expected_pos_usage: nullable(r.expected_usage),
        hq_received:
          receipts.length &&
          receipts.every((x) => nullable(x.received_qty) != null)
            ? receipts.reduce((n, x) => n + Number(x.received_qty), 0)
            : null,
        current_stock: current ? nullable(current.closing_stock) : null,
        opening_stock: null,
        closing_stock: null,
        disposal: null,
        transfer_in: null,
        transfer_out: null,
        manual_adjustment: null,
        variance: null,
        usage_basis:
          "Current recipe quantity in ingredient unit; historical recipe version unavailable",
        receipt_scope:
          "All branch receipts for this ingredient; shared by products, not allocated to this product",
      };
    });
  return {
    branch_id: branch.branch_id,
    branch: branch.branch_name,
    brand_id: branch.brand_id,
    brand: branch.brand_name,
    product_id: productId,
    product: product.product_name,
    sku: product.sku,
    pos_sold: product.sold_qty,
    pos_revenue: product.line_revenue,
    opening_stock: null,
    hq_received: null,
    closing_stock: null,
    variance: null,
    ingredients,
    note: "Ingredient values are shown separately by unit. Current on-hand is not a historical closing count. Recipe usage is an estimate under the current recipe; receipts are branch-wide and must not be summed across product panels.",
  };
}
const endpoint = (handler) => async (req, res) => {
  try {
    const raw = await loadEvidence(req.query.month);
    const model = buildModel(raw, req.query);
    res.json(handler(raw, req.query, model, req.params));
  } catch (e) {
    console.error("B2B evidence", e);
    res.status(e.status || 500).json({
      error: e.status
        ? e.message
        : "Failed to load QA evidence; no estimated substitute is returned.",
    });
  }
};
router.get("/dashboard/b2b/overview", endpoint(overview));
router.get(
  "/dashboard/b2b/branches",
  endpoint((raw, q, m) =>
    m.branches.filter(
      (r) =>
        !q.risk ||
        q.risk === "all" ||
        r.risk.toLowerCase().includes(q.risk.toLowerCase()),
    ),
  ),
);
router.get(
  "/dashboard/b2b/brands",
  endpoint((raw, q, m) => m.brands),
);
router.get(
  "/dashboard/b2b/products",
  endpoint((raw, q, m) => m.products),
);
router.get(
  "/dashboard/b2b/anomalies",
  endpoint((raw, q, m) => m.anomalies),
);
router.get("/dashboard/b2b/reconcile", endpoint(reconcile));
router.get(
  "/dashboard/b2b/branches/:branchId",
  endpoint((raw, q, m, p) => {
    const row = m.branches.find((r) => String(r.branch_id) === p.branchId);
    if (!row) {
      const e = new Error("Branch not found");
      e.status = 404;
      throw e;
    }
    return row;
  }),
);
router.get(
  "/dashboard/b2b/branches/:branchId/brands/:brandId",
  endpoint((raw, q, m, p) => {
    const row = m.branches.find(
      (r) =>
        String(r.branch_id) === p.branchId && String(r.brand_id) === p.brandId,
    );
    if (!row) {
      const e = new Error("Brand and branch not found");
      e.status = 404;
      throw e;
    }
    return {
      ...row,
      products: m.products.filter(
        (r) => r.branch_id === row.branch_id && r.brand_id === row.brand_id,
      ),
    };
  }),
);
module.exports = router;
