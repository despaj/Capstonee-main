const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/dashboard/stats", async (req, res) => {
  try {
    const { preset, from, to, branch, branches } = req.query;
    const params = [], conditions = [];
    let paramIdx = 1;

    if (from && to) {
      conditions.push(`created_at>=$${paramIdx} AND created_at<=$${paramIdx+1}::date+interval '1 day'`);
      params.push(from, to); paramIdx += 2;
    } else {
      const presetMap = { day: `created_at>=CURRENT_DATE`, week: `created_at>=date_trunc('week',CURRENT_DATE)`, month: `created_at>=date_trunc('month',CURRENT_DATE)`, year: `created_at>=date_trunc('year',CURRENT_DATE)` };
      conditions.push(presetMap[preset] || presetMap["month"]);
    }

    if (branch) { conditions.push(`branch=$${paramIdx}`); params.push(branch); paramIdx++; }
    else if (branches) {
      const list = branches.split(",").map(b => b.trim()).filter(Boolean);
      if (list.length > 0) {
        conditions.push(`branch IN (${list.map((_,i) => `$${paramIdx+i}`).join(",")})`);
        params.push(...list); paramIdx += list.length;
      }
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT COALESCE(SUM(total),0) AS "salesRevenue", COALESCE(SUM(total),0) AS "totalSales",
       COALESCE(SUM(cogs),0) AS "cogs", COALESCE(SUM(total)-SUM(cogs),0) AS "salesProfit",
       COUNT(*) AS "txCount",
       CASE WHEN COUNT(*)>0 THEN COALESCE(AVG(total),0) ELSE 0 END AS "avgOrder"
       FROM transactions ${whereClause}`,
      params
    );

    const row = result.rows[0];
    res.json({
      salesRevenue: parseFloat(row.salesRevenue),
      totalSales:   parseFloat(row.totalSales),
      cogs:         parseFloat(row.cogs),
      salesProfit:  parseFloat(row.salesProfit),
      txCount:      parseInt(row.txCount),
      avgOrder:     parseFloat(row.avgOrder),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/dashboard/product-analytics", async (req, res) => {
  try {
    const { preset, from, to, branch, branches } = req.query;
    const params = [], conditions = [];
    let paramIdx = 1;

    if (from && to) {
      conditions.push(`created_at>=$${paramIdx} AND created_at<=$${paramIdx+1}::date+interval '1 day'`);
      params.push(from, to); paramIdx += 2;
    } else {
      const presetMap = { day:`created_at>=CURRENT_DATE`, week:`created_at>=date_trunc('week',CURRENT_DATE)`, month:`created_at>=date_trunc('month',CURRENT_DATE)`, year:`created_at>=date_trunc('year',CURRENT_DATE)` };
      conditions.push(presetMap[preset] || presetMap["month"]);
    }

    if (branch) { conditions.push(`branch=$${paramIdx}`); params.push(branch); paramIdx++; }
    else if (branches) {
      const list = branches.split(",").map(b => b.trim()).filter(Boolean);
      if (list.length > 0) { conditions.push(`branch IN (${list.map((_,i) => `$${paramIdx+i}`).join(",")})`); params.push(...list); paramIdx += list.length; }
    }
    conditions.push(`(is_voided=false OR is_voided IS NULL)`);

    const result = await pool.query(`SELECT branch, items, cashier FROM transactions WHERE ${conditions.join(" AND ")}`, params);
    const REGION_MAP = { NCR:"Luzon","Region 1":"Luzon","Region 2":"Luzon","Region 3":"Luzon","Region 4A":"Luzon","Region 4B":"Luzon","Region 5":"Luzon","Region 6":"Visayas","Region 7":"Visayas","Region 8":"Visayas","Region 9":"Mindanao","Region 10":"Mindanao","Region 11":"Mindanao","Region 12":"Mindanao","BARMM":"Mindanao","CAR":"Luzon","CARAGA":"Mindanao" };

    const branchRegionRows = await pool.query(`SELECT name, region FROM branches`);
    const branchToRegion = {};
    branchRegionRows.rows.forEach(r => { branchToRegion[r.name] = REGION_MAP[r.region] || r.region || "Other"; });

    const productMap = {}, buyerProductMap = {};
    for (const tx of result.rows) {
      const items = typeof tx.items === "string" ? JSON.parse(tx.items) : (tx.items || []);
      const region = branchToRegion[tx.branch] || "Other";
      const cashier = tx.cashier || "Unknown";
      for (const item of items) {
        const name = item.name || "Unknown";
        const qty = parseInt(item.qty || 0);
        const rev = parseFloat(item.price || 0) * qty;
        if (!productMap[name]) productMap[name] = { name, totalQty:0, totalRevenue:0, branchBreakdown:{}, regionBreakdown:{Luzon:0,Visayas:0,Mindanao:0,Other:0} };
        productMap[name].totalQty += qty;
        productMap[name].totalRevenue += rev;
        productMap[name].branchBreakdown[tx.branch] = (productMap[name].branchBreakdown[tx.branch] || 0) + qty;
        productMap[name].regionBreakdown[region] = (productMap[name].regionBreakdown[region] || 0) + qty;
        if (!buyerProductMap[cashier]) buyerProductMap[cashier] = {};
        buyerProductMap[cashier][name] = (buyerProductMap[cashier][name] || 0) + qty;
      }
    }

    const allProducts = Object.values(productMap).sort((a,b) => b.totalQty - a.totalQty);
    const avgQty = allProducts.reduce((s,p) => s+p.totalQty, 0) / Math.max(allProducts.length, 1);

    const regionSummary = { Luzon:{}, Visayas:{}, Mindanao:{}, Other:{} };
    for (const p of allProducts) {
      for (const [region, qty] of Object.entries(p.regionBreakdown)) {
        if (qty > 0) regionSummary[region][p.name] = (regionSummary[region][p.name] || 0) + qty;
      }
    }
    const regionTop5 = {};
    for (const [region, products] of Object.entries(regionSummary)) {
      regionTop5[region] = Object.entries(products).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,qty])=>({name,qty}));
    }

    res.json({
      top10: allProducts.slice(0,10),
      fastMoving: allProducts.filter(p=>p.totalQty>=avgQty*1.5).slice(0,10),
      slowMoving: allProducts.filter(p=>p.totalQty<=avgQty*0.5&&p.totalQty>0).slice(0,10),
      topBuyers: Object.entries(buyerProductMap).map(([name,products])=>({ name, totalItems:Object.values(products).reduce((s,v)=>s+v,0), topProduct:Object.entries(products).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—" })).sort((a,b)=>b.totalItems-a.totalItems).slice(0,10),
      regionTop5,
      totalProducts: allProducts.length,
      avgQty: Math.round(avgQty),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product analytics" });
  }
});

router.post("/ai/report", async (req, res) => {
  try {
    const prompt = req.body.messages?.[0]?.content || "";
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 1000 }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Failed to generate report.";
    res.json({ content: [{ text }] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/ai/dashboard-analysis", async (req, res) => {
  try {
    const { transactions, preset, filterLabel } = req.body;
    const branchTotals = {}, dayTotals = {Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0,Sun:0};
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    let totalRevenue = 0, totalCogs = 0;

    (transactions || []).forEach(tx => {
      const branch = tx.branch || "Unknown";
      const total = parseFloat(tx.total || 0);
      const cogs  = parseFloat(tx.cogs  || 0);
      const day   = dayNames[new Date(tx.created_at).getDay()];
      branchTotals[branch] = (branchTotals[branch] || 0) + total;
      dayTotals[day]       = (dayTotals[day]       || 0) + total;
      totalRevenue += total; totalCogs += cogs;
    });

    const txCount  = transactions?.length || 0;
    const avgOrder = txCount > 0 ? totalRevenue / txCount : 0;
    const profit   = totalRevenue - totalCogs;
    const profitPct = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : "0";

    let inventoryRows = [];
    try {
      const invResult = await pool.query(`SELECT name, branch, stock, min_stock, price, cost FROM inventory ORDER BY branch, name`);
      inventoryRows = invResult.rows;
    } catch {}

    const stockByBranch = {};
    for (const item of inventoryRows) {
      const br = item.branch || "Unknown";
      if (!stockByBranch[br]) stockByBranch[br] = { lowStock:[], zeroStock:[], totalItems:0 };
      stockByBranch[br].totalItems++;
      const stock = parseFloat(item.stock || 0), minStock = parseFloat(item.min_stock || 0);
      if (stock === 0) stockByBranch[br].zeroStock.push(item.name);
      else if (minStock > 0 && stock <= minStock) stockByBranch[br].lowStock.push({ name:item.name, stock, minStock });
    }

    const anomalies = [];
    for (const [branch, s] of Object.entries(stockByBranch)) {
      const hasRevenue = (branchTotals[branch] || 0) > 0;
      if (hasRevenue && s.zeroStock.length > 0) anomalies.push({ branch, type:"ghost_sales", revenue:branchTotals[branch], zeroStockItems:s.zeroStock.slice(0,5), zeroCount:s.zeroStock.length, lowCount:s.lowStock.length });
      if (hasRevenue && s.lowStock.length >= 3 && s.zeroStock.length === 0) anomalies.push({ branch, type:"low_stock_no_reorder", revenue:branchTotals[branch], lowStockItems:s.lowStock.slice(0,5).map(i=>`${i.name} (${i.stock}/${i.minStock})`), lowCount:s.lowStock.length });
      if (!hasRevenue && s.totalItems > 0 && s.zeroStock.length === 0 && s.lowStock.length === 0) anomalies.push({ branch, type:"dead_stock", totalItems:s.totalItems, revenue:0 });
    }

    const sortedBranches = Object.entries(branchTotals).sort((a,b)=>b[1]-a[1]);
    const avgBranchRev = sortedBranches.length > 0 ? sortedBranches.reduce((s,[,v])=>s+v,0)/sortedBranches.length : 0;
    const dayEntries = Object.entries(dayTotals);
    const avgDayRev  = dayEntries.reduce((s,[,v])=>s+v,0)/7;
    const peakDayEntry    = dayEntries.reduce((a,b)=>b[1]>a[1]?b:a, ["—",0]);
    const slowestDayEntry = dayEntries.reduce((a,b)=>b[1]<a[1]?b:a, ["—",Infinity]);
    const slowestDropPct  = avgDayRev>0 ? Math.round(((avgDayRev-slowestDayEntry[1])/avgDayRev)*100) : 0;
    const weeklyRunRate   = txCount>0 ? Math.round((totalRevenue/txCount)*(txCount/7)*7) : 0;

    const topBranchesDetailed = sortedBranches.slice(0,8).map(([name,rev])=>{
      const pctOfAvg = avgBranchRev>0?(((rev-avgBranchRev)/avgBranchRev)*100).toFixed(1):"0";
      const flag = rev>avgBranchRev?"▲ above avg":"▼ below avg";
      const s = stockByBranch[name];
      const stockNote = !s?"":s.zeroStock.length>0?` | ⚠ ${s.zeroStock.length} items at ZERO stock`:s.lowStock.length>0?` | ⚠ ${s.lowStock.length} items low stock`:"";
      return `  • ${name}: ₱${rev.toLocaleString("en-PH",{maximumFractionDigits:0})} (${flag} by ${Math.abs(pctOfAvg)}%)${stockNote}`;
    }).join("\n");

    const dayBreakdownDetailed = dayEntries.map(([d,v])=>{
      const pct = avgDayRev>0?(((v-avgDayRev)/avgDayRev)*100).toFixed(0):"0";
      return `${d}: ₱${v.toLocaleString("en-PH",{maximumFractionDigits:0})} (${Number(pct)>=0?"+":""}${pct}%)`;
    }).join(", ");

    const anomalyBlock = anomalies.length===0?"  None detected.":anomalies.map(a=>{
      if (a.type==="ghost_sales") return `  • [GHOST SALES] ${a.branch}: ₱${a.revenue.toLocaleString("en-PH",{maximumFractionDigits:0})} in sales but ${a.zeroCount} items at ZERO stock. Selling: ${a.zeroStockItems.join(", ")}.`;
      if (a.type==="low_stock_no_reorder") return `  • [LOW STOCK / NOT REORDERING] ${a.branch}: Has ₱${a.revenue.toLocaleString("en-PH",{maximumFractionDigits:0})} in sales but ${a.lowCount} items below minimum. Items: ${a.lowStockItems.join(", ")}.`;
      if (a.type==="dead_stock") return `  • [DEAD STOCK] ${a.branch}: Has ${a.totalItems} inventory items but ₱0 in sales.`;
      return "";
    }).join("\n");

    const prompt = `You are a prescriptive business analyst for iFranchise (Filipino franchise management system).
Period: ${preset||"this month"} | Scope: ${filterLabel||"All Brands & Branches"}
Revenue: ₱${totalRevenue.toLocaleString("en-PH",{maximumFractionDigits:0})} | Profit: ₱${profit.toLocaleString("en-PH",{maximumFractionDigits:0})} (${profitPct}%) | COGS: ₱${totalCogs.toLocaleString("en-PH",{maximumFractionDigits:0})}
Transactions: ${txCount} | Avg order: ₱${avgOrder.toFixed(0)} | Avg branch revenue: ₱${avgBranchRev.toLocaleString("en-PH",{maximumFractionDigits:0})}
Branch performance:\n${topBranchesDetailed||"  No branch data"}
Day-of-week breakdown: ${dayBreakdownDetailed}
Peak: ${peakDayEntry[0]} | Slowest: ${slowestDayEntry[0]} (${slowestDropPct}% below avg)
STOCK VS SALES ANOMALIES:\n${anomalyBlock}
Return ONLY valid JSON:
{"projectedRevenue":${weeklyRunRate},"projectedChange":5,"peakDay":"${peakDayEntry[0]}","slowestDay":"${slowestDayEntry[0]}","slowestDayDropPct":${slowestDropPct},"confidence":80,"summary":"<3 sentences>","stockAnomalies":[{"branch":"","anomalyType":"ghost_sales|low_stock_no_reorder|dead_stock","severity":"critical|warning|info","finding":"","action":""}],"recommendations":[{"branch":"","type":"success|warning|info","text":"","priority":"high|medium|low"}]}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 1500, temperature: 0.2 }),
    });
    const data   = await response.json();
    const raw    = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    res.json({ success: true, analysis: parsed });
  } catch (err) {
    console.error("AI dashboard analysis error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;