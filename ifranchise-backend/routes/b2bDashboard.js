const express = require("express");
const router = express.Router();
const pool = require("../db");

const number = value => Number(value || 0);
const keyOf = (...parts) => parts.map(value => String(value ?? "").trim().toLowerCase()).join("::");

function monthWindow(rawMonth) {
  const month = /^\d{4}-\d{2}$/.test(String(rawMonth || ""))
    ? String(rawMonth)
    : new Date().toISOString().slice(0, 7);
  const start = `${month}-01`;
  const [year, value] = month.split("-").map(Number);
  const next = value === 12 ? `${year + 1}-01-01` : `${year}-${String(value + 1).padStart(2, "0")}-01`;
  const previous = value === 1 ? `${year - 1}-12-01` : `${year}-${String(value - 1).padStart(2, "0")}-01`;
  return { month, start, next, previous };
}

function matchesFilter(row, query) {
  return (!query.branch || row.branch_name === query.branch)
    && (!query.brand || row.brand_name === query.brand);
}

function riskLabel(row) {
  if (row.pos_revenue <= 0) return "Normal";
  if (row.order_coverage != null && row.order_coverage < 50) return "High Risk";
  if (row.order_coverage != null && row.order_coverage < 80) return "Watch";
  return "Normal";
}

function riskReason(row) {
  if (row.risk === "High Risk") return "Less than 50% of recipe-based POS consumption is supported by received HQ stock during the selected month.";
  if (row.risk === "Watch") return "Received HQ stock covers less than 80% of recipe-based POS consumption during the selected month.";
  return "No material supply-versus-consumption exception was detected for the selected month.";
}

async function loadEvidence(month) {
  const period = monthWindow(month);
  const [catalog, orders, transactions, soldProducts, usage, receipts, closing] = await Promise.all([
    pool.query(`
      SELECT br.id AS branch_id, br.name AS branch_name, br.address AS location,
             b.id AS brand_id, b.name AS brand_name
      FROM branches br JOIN brands b ON b.id=br.brand_id
      ORDER BY b.name, br.name`),
    pool.query(`
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             COALESCE(SUM(CASE WHEN o.created_at >= $1::date AND o.created_at < $2::date
                               AND o.status='received' THEN o.total_amount ELSE 0 END),0) AS hq_revenue,
             COALESCE(SUM(CASE WHEN o.created_at >= $3::date AND o.created_at < $1::date
                               AND o.status='received' THEN o.total_amount ELSE 0 END),0) AS previous_hq_revenue
      FROM branches br JOIN brands b ON b.id=br.brand_id
      LEFT JOIN orders o ON o.branch=br.name AND o.brand=b.name
      GROUP BY br.id, br.name, b.id, b.name`, [period.start, period.next, period.previous]),
    pool.query(`
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             COALESCE(SUM(CASE WHEN t.created_at >= $1::date AND t.created_at < $2::date
                               THEN t.total ELSE 0 END),0) AS pos_revenue,
             COUNT(*) FILTER (WHERE t.created_at >= $1::date AND t.created_at < $2::date) AS transactions,
             COALESCE(SUM(CASE WHEN t.created_at >= $3::date AND t.created_at < $1::date
                               THEN t.total ELSE 0 END),0) AS previous_pos_revenue
      FROM branches br JOIN brands b ON b.id=br.brand_id
      LEFT JOIN transactions t ON t.branch=br.name AND (t.is_voided=FALSE OR t.is_voided IS NULL)
      GROUP BY br.id, br.name, b.id, b.name`, [period.start, period.next, period.previous]),
    pool.query(`
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             inv.id AS product_id, COALESCE(inv.id::text, item.value->>'sku', item.value->>'id') AS sku,
             COALESCE(inv.name, item.value->>'name', 'Unnamed Product') AS product_name,
             SUM(COALESCE(NULLIF(item.value->>'qty','')::numeric,0)) AS sold_qty,
             SUM(COALESCE(NULLIF(item.value->>'price','')::numeric,0)
                 * COALESCE(NULLIF(item.value->>'qty','')::numeric,0)) AS line_revenue,
             COUNT(DISTINCT t.id) AS transaction_count, MAX(t.created_at) AS last_sale
      FROM transactions t
      JOIN branches br ON br.name=t.branch JOIN brands b ON b.id=br.brand_id
      CROSS JOIN LATERAL jsonb_array_elements(COALESCE(t.items,'[]'::jsonb)) item(value)
      LEFT JOIN inventory inv ON inv.id = CASE WHEN COALESCE(item.value->>'id','') ~ '^\\d+$'
                                               THEN (item.value->>'id')::integer END
      WHERE t.created_at >= $1::date AND t.created_at < $2::date
        AND (t.is_voided=FALSE OR t.is_voided IS NULL)
      GROUP BY br.id, br.name, b.id, b.name, inv.id, inv.name, item.value->>'sku', item.value->>'id', item.value->>'name'`, [period.start, period.next]),
    pool.query(`
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             inv.id AS product_id, inv.name AS product_name, i.id AS ingredient_id,
             i.name AS ingredient_name, i.unit,
             SUM(COALESCE(NULLIF(item.value->>'qty','')::numeric,0) * pi.quantity) AS expected_usage
      FROM transactions t
      JOIN branches br ON br.name=t.branch JOIN brands b ON b.id=br.brand_id
      CROSS JOIN LATERAL jsonb_array_elements(COALESCE(t.items,'[]'::jsonb)) item(value)
      JOIN inventory inv ON inv.id = CASE WHEN COALESCE(item.value->>'id','') ~ '^\\d+$'
                                          THEN (item.value->>'id')::integer END
      JOIN product_ingredients pi ON pi.inventory_id=inv.id
      JOIN ingredients i ON i.id=pi.ingredient_id
      WHERE t.created_at >= $1::date AND t.created_at < $2::date
        AND (t.is_voided=FALSE OR t.is_voided IS NULL)
      GROUP BY br.id, br.name, b.id, b.name, inv.id, inv.name, i.id, i.name, i.unit`, [period.start, period.next]),
    pool.query(`
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             dest.id AS ingredient_id, dest.name AS ingredient_name, dest.unit,
             SUM(ost.quantity) AS received_qty
      FROM orders o
      JOIN branches br ON br.name=o.branch JOIN brands b ON b.id=br.brand_id
      JOIN order_stock_transfers ost ON ost.order_id=o.id AND ost.applied=TRUE
      JOIN ingredients source ON source.id=ost.ingredient_id
      LEFT JOIN ingredients dest ON dest.branch=br.name AND dest.brand=b.name AND dest.name=source.name
      WHERE o.status='received' AND o.created_at >= $1::date AND o.created_at < $2::date
      GROUP BY br.id, br.name, b.id, b.name, dest.id, dest.name, dest.unit`, [period.start, period.next]),
    pool.query(`
      SELECT br.id AS branch_id, br.name AS branch_name, b.id AS brand_id, b.name AS brand_name,
             i.id AS ingredient_id, i.name AS ingredient_name, i.unit,
             COALESCE(SUM(ib.stock), i.stock, 0) AS closing_stock
      FROM branches br JOIN brands b ON b.id=br.brand_id
      JOIN ingredients i ON i.branch=br.name AND (i.brand=b.name OR i.brand IS NULL)
      LEFT JOIN ingredient_batches ib ON ib.ingredient_id=i.id
      GROUP BY br.id, br.name, b.id, b.name, i.id, i.name, i.unit, i.stock`),
  ]);
  return { period, catalog:catalog.rows, orders:orders.rows, transactions:transactions.rows,
    soldProducts:soldProducts.rows, usage:usage.rows, receipts:receipts.rows, closing:closing.rows };
}

function buildModel(raw, query) {
  const branchMap = new Map(raw.catalog.map(row => [keyOf(row.brand_id,row.branch_id), {
    ...row, hq_revenue:0, previous_hq_revenue:0, pos_revenue:0, previous_pos_revenue:0,
    transactions:0, received_qty:0, expected_usage:0, closing_stock:0,
  }]));
  for (const row of raw.orders) Object.assign(branchMap.get(keyOf(row.brand_id,row.branch_id)) || {}, {
    hq_revenue:number(row.hq_revenue), previous_hq_revenue:number(row.previous_hq_revenue),
  });
  for (const row of raw.transactions) Object.assign(branchMap.get(keyOf(row.brand_id,row.branch_id)) || {}, {
    pos_revenue:number(row.pos_revenue), previous_pos_revenue:number(row.previous_pos_revenue), transactions:number(row.transactions),
  });
  for (const row of raw.receipts) {
    const target=branchMap.get(keyOf(row.brand_id,row.branch_id)); if(target) target.received_qty += number(row.received_qty);
  }
  for (const row of raw.usage) {
    const target=branchMap.get(keyOf(row.brand_id,row.branch_id)); if(target) target.expected_usage += number(row.expected_usage);
  }
  for (const row of raw.closing) {
    const target=branchMap.get(keyOf(row.brand_id,row.branch_id)); if(target) target.closing_stock += number(row.closing_stock);
  }
  const growth = Math.max(0, number(query.growthTargetPct || 10));
  const branches = [...branchMap.values()].filter(row=>matchesFilter(row,query)).map(row=>{
    const target=row.previous_hq_revenue*(1+growth/100);
    const coverage=row.expected_usage>0 ? Math.min(100,row.received_qty/row.expected_usage*100) : null;
    const result={...row, supplied_qty:row.received_qty, sold_qty:row.expected_usage,
      order_coverage:coverage, target_pct:target>0?row.hq_revenue/target*100:null,
      target_gap:target>0?Math.max(0,target-row.hq_revenue):null,
      mom_growth:row.previous_hq_revenue>0?(row.hq_revenue-row.previous_hq_revenue)/row.previous_hq_revenue*100:null};
    result.risk=riskLabel(result); result.reason=riskReason(result); return result;
  });
  const brandsMap=new Map();
  for(const row of branches){const target=brandsMap.get(row.brand_id)||{brand_id:row.brand_id,brand_name:row.brand_name,hq_revenue:0,pos_revenue:0,supplied_qty:0,sold_qty:0,ending_stock:0};
    target.hq_revenue+=row.hq_revenue;target.pos_revenue+=row.pos_revenue;target.supplied_qty+=row.received_qty;target.sold_qty+=row.expected_usage;target.ending_stock+=row.closing_stock;brandsMap.set(row.brand_id,target);}
  const brands=[...brandsMap.values()].map(row=>({...row,sell_through:row.supplied_qty>0?row.sold_qty/row.supplied_qty*100:null}));
  const products=raw.soldProducts.filter(row=>matchesFilter(row,query)).map(row=>({...row,sold_qty:number(row.sold_qty),line_revenue:number(row.line_revenue),transaction_count:number(row.transaction_count)}));
  const anomalies=branches.filter(row=>row.risk!=="Normal").map(row=>({id:`${row.brand_id}-${row.branch_id}`,branch_id:row.branch_id,branch_name:row.branch_name,brand_id:row.brand_id,brand_name:row.brand_name,severity:row.risk,rule:"HQ supply coverage",reason:row.reason,recommendation:"Verify opening stock, received transfers, recipes, physical count, and any unrecorded disposal before taking corrective action."}));
  return {branches,brands,products,anomalies};
}

router.get("/dashboard/b2b/overview", async (req,res)=>{try{const raw=await loadEvidence(req.query.month);const model=buildModel(raw,req.query);const sum=(field)=>model.branches.reduce((total,row)=>total+number(row[field]),0);const hq=sum("hq_revenue"),prevHq=sum("previous_hq_revenue"),pos=sum("pos_revenue"),prevPos=sum("previous_pos_revenue"),supplied=sum("received_qty"),used=sum("expected_usage"),target=prevHq*(1+Math.max(0,number(req.query.growthTargetPct||10))/100);res.json({month:raw.period.month,hq_supply_revenue:hq,previous_hq_supply_revenue:prevHq,pos_revenue:pos,previous_pos_revenue:prevPos,monthly_target:target,target_gap:Math.max(0,target-hq),target_attainment_pct:target>0?hq/target*100:null,order_coverage:used>0?Math.min(100,supplied/used*100):null,at_risk_branches:model.anomalies.length,unexplained_stock:null,sell_through:used>0&&supplied>0?used/supplied*100:null,transactions:sum("transactions"),products:model.products});}catch(err){console.error("GET /dashboard/b2b/overview error:",err);res.status(500).json({error:"Failed to build B2B overview"});}});
router.get("/dashboard/b2b/branches", async (req,res)=>{try{const raw=await loadEvidence(req.query.month);let rows=buildModel(raw,req.query).branches;if(req.query.risk&&req.query.risk!=="all")rows=rows.filter(row=>row.risk.toLowerCase().includes(String(req.query.risk).toLowerCase().replace("high-risk","high")));res.json(rows);}catch(err){console.error("GET /dashboard/b2b/branches error:",err);res.status(500).json({error:"Failed to build branch evidence"});}});
router.get("/dashboard/b2b/brands", async (req,res)=>{try{const raw=await loadEvidence(req.query.month);res.json(buildModel(raw,req.query).brands);}catch(err){console.error("GET /dashboard/b2b/brands error:",err);res.status(500).json({error:"Failed to build brand evidence"});}});
router.get("/dashboard/b2b/anomalies", async (req,res)=>{try{const raw=await loadEvidence(req.query.month);res.json(buildModel(raw,req.query).anomalies);}catch(err){console.error("GET /dashboard/b2b/anomalies error:",err);res.status(500).json({error:"Failed to build anomaly evidence"});}});
router.get("/dashboard/b2b/products", async (req,res)=>{try{const raw=await loadEvidence(req.query.month);res.json(buildModel(raw,req.query).products);}catch(err){console.error("GET /dashboard/b2b/products error:",err);res.status(500).json({error:"Failed to build product evidence"});}});

router.get("/dashboard/b2b/branches/:branchId",async(req,res)=>{try{const raw=await loadEvidence(req.query.month);const row=buildModel(raw,req.query).branches.find(item=>String(item.branch_id)===String(req.params.branchId));if(!row)return res.status(404).json({error:"Branch not found"});res.json(row);}catch(err){res.status(500).json({error:"Failed to build branch evidence"});}});
router.get("/dashboard/b2b/branches/:branchId/brands/:brandId",async(req,res)=>{try{const raw=await loadEvidence(req.query.month);const model=buildModel(raw,req.query);const branch=model.branches.find(item=>String(item.branch_id)===String(req.params.branchId)&&String(item.brand_id)===String(req.params.brandId));if(!branch)return res.status(404).json({error:"Brand and branch pair not found"});res.json({...branch,products:model.products.filter(item=>String(item.branch_id)===String(req.params.branchId)&&String(item.brand_id)===String(req.params.brandId))});}catch(err){res.status(500).json({error:"Failed to build brand and branch evidence"});}});

router.get("/dashboard/b2b/reconcile",async(req,res)=>{try{const {branchId,productId}=req.query;if(!branchId||!productId)return res.status(400).json({error:"branchId and productId are required"});const raw=await loadEvidence(req.query.month);const branch=raw.catalog.find(row=>String(row.branch_id)===String(branchId));if(!branch)return res.status(404).json({error:"Branch not found"});const product=raw.soldProducts.find(row=>String(row.branch_id)===String(branchId)&&String(row.product_id)===String(productId));const ingredients=raw.usage.filter(row=>String(row.branch_id)===String(branchId)&&String(row.product_id)===String(productId)).map(row=>{const received=raw.receipts.filter(item=>String(item.branch_id)===String(branchId)&&keyOf(item.ingredient_name)===keyOf(row.ingredient_name)).reduce((sum,item)=>sum+number(item.received_qty),0);const closing=raw.closing.find(item=>String(item.branch_id)===String(branchId)&&keyOf(item.ingredient_name)===keyOf(row.ingredient_name));return{ingredient_id:row.ingredient_id,ingredient_name:row.ingredient_name,unit:row.unit,expected_pos_usage:number(row.expected_usage),hq_received:received,closing_stock:closing?number(closing.closing_stock):null,opening_stock:null,disposal:null,transfer_in:received,transfer_out:null,manual_adjustment:null,variance:null};});res.json({branch_id:branch.branch_id,branch:branch.branch_name,brand_id:branch.brand_id,brand:branch.brand_name,product_id:productId,sku:product?.sku||String(productId),product:product?.product_name||"Product",pos_sold:number(product?.sold_qty),pos_revenue:number(product?.line_revenue),opening_stock:null,hq_received:ingredients.reduce((sum,row)=>sum+row.hq_received,0),closing_stock:null,variance:null,ingredients,note:"Opening stock, disposals, manual adjustments, and historical closing counts are not stored by the current schema; these values are intentionally null, not estimated."});}catch(err){console.error("GET /dashboard/b2b/reconcile error:",err);res.status(500).json({error:"Failed to reconcile product evidence"});}});

module.exports = router;
