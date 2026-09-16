const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/dashboard/stats", async (req, res) => {
  try {
    const { preset, from, to, branch, branches } = req.query;
    const params = [],
      conditions = [];
    let paramIdx = 1;

    let fromDate, toDate;
    if (from && to) {
      fromDate = from;
      toDate = to;
      conditions.push(
        `created_at>=($${paramIdx}::date AT TIME ZONE 'Asia/Manila') AND created_at<(($${paramIdx + 1}::date + interval '1 day') AT TIME ZONE 'Asia/Manila')`,
      );
      params.push(from, to);
      paramIdx += 2;
    } else {
      const presetMap = {
        day: `created_at>=CURRENT_DATE`,
        week: `created_at>=date_trunc('week',CURRENT_DATE)`,
        month: `created_at>=date_trunc('month',CURRENT_DATE)`,
        year: `created_at>=date_trunc('year',CURRENT_DATE)`,
      };
      conditions.push(presetMap[preset] || presetMap["month"]);
    }

    if (branch) {
      conditions.push(`branch=$${paramIdx}`);
      params.push(branch);
      paramIdx++;
    } else if (branches) {
      const list = branches
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      if (list.length > 0) {
        conditions.push(
          `branch IN (${list.map((_, i) => `$${paramIdx + i}`).join(",")})`,
        );
        params.push(...list);
        paramIdx += list.length;
      }
    }
    conditions.push(`(is_voided=false OR is_voided IS NULL)`);

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // ── Core KPIs ──
    const statsResult = await pool.query(
      `SELECT COALESCE(SUM(total),0) AS "salesRevenue", COALESCE(SUM(total),0) AS "totalSales",
       COALESCE(SUM(cogs),0) AS "cogs", COALESCE(SUM(total)-SUM(cogs),0) AS "salesProfit",
       COUNT(*) AS "txCount",
       CASE WHEN COUNT(*)>0 THEN COALESCE(AVG(total),0) ELSE 0 END AS "avgOrder"
       FROM transactions ${whereClause}`,
      params,
    );
    const row = statsResult.rows[0];

    const branchResult = await pool.query(
      `SELECT
      t.branch AS label,

      CASE
        WHEN LOWER(TRIM(t.shop)) IN ('ipharma', 'ipharma mart')
          THEN 'iPharma Mart'
        WHEN LOWER(TRIM(t.shop)) = 'coffee spot'
          THEN 'Coffee Spot'
        WHEN LOWER(TRIM(t.shop)) = 'ifuel'
          THEN 'iFuel'
        ELSE COALESCE(NULLIF(TRIM(t.shop), ''), 'Unassigned Brand')
      END AS brand,

      COALESCE(SUM(t.total), 0) AS value

   FROM transactions t

   ${whereClause
     .replace(/created_at/g, "t.created_at")
     .replace(/branch=/g, "t.branch=")
     .replace(/branch IN/g, "t.branch IN")
     .replace(/is_voided/g, "t.is_voided")}

   GROUP BY
      t.branch,
      CASE
        WHEN LOWER(TRIM(t.shop)) IN ('ipharma', 'ipharma mart')
          THEN 'iPharma Mart'
        WHEN LOWER(TRIM(t.shop)) = 'coffee spot'
          THEN 'Coffee Spot'
        WHEN LOWER(TRIM(t.shop)) = 'ifuel'
          THEN 'iFuel'
        ELSE COALESCE(NULLIF(TRIM(t.shop), ''), 'Unassigned Brand')
      END

   ORDER BY value DESC
   LIMIT 10`,
      params,
    );

    const branchBreakdown = branchResult.rows.map((r) => ({
      label: r.label,
      brand: r.brand,
      value: parseFloat(r.value),
    }));
    // ── Category breakdown — unnest items jsonb, join to inventory.category ──
    const categoryResult = await pool.query(
      `SELECT inv.category AS label,
              COALESCE(SUM((elem->>'price')::numeric * (elem->>'qty')::numeric),0) AS value
       FROM transactions t,
            jsonb_array_elements(t.items) AS elem
       JOIN inventory inv ON inv.id = (elem->>'id')::integer
       ${whereClause
         .replace(/created_at/g, "t.created_at")
         .replace(/branch=/g, "t.branch=")
         .replace(/branch IN/g, "t.branch IN")
         .replace(/is_voided/g, "t.is_voided")}
       GROUP BY inv.category
       ORDER BY value DESC`,
      params,
    );
    const categoryBreakdown = categoryResult.rows
      .filter((r) => r.label)
      .map((r) => ({ label: r.label, value: parseFloat(r.value) }));

    const brandResult = await pool.query(
      `SELECT
      CASE
        WHEN LOWER(TRIM(t.shop)) IN ('ipharma', 'ipharma mart')
          THEN 'iPharma Mart'
        WHEN LOWER(TRIM(t.shop)) = 'coffee spot'
          THEN 'Coffee Spot'
        WHEN LOWER(TRIM(t.shop)) = 'ifuel'
          THEN 'iFuel'
        ELSE COALESCE(NULLIF(TRIM(t.shop), ''), 'Unassigned Brand')
      END AS label,

      COALESCE(SUM(t.total), 0) AS value

   FROM transactions t

   ${whereClause
     .replace(/created_at/g, "t.created_at")
     .replace(/branch=/g, "t.branch=")
     .replace(/branch IN/g, "t.branch IN")
     .replace(/is_voided/g, "t.is_voided")}

   GROUP BY
      CASE
        WHEN LOWER(TRIM(t.shop)) IN ('ipharma', 'ipharma mart')
          THEN 'iPharma Mart'
        WHEN LOWER(TRIM(t.shop)) = 'coffee spot'
          THEN 'Coffee Spot'
        WHEN LOWER(TRIM(t.shop)) = 'ifuel'
          THEN 'iFuel'
        ELSE COALESCE(NULLIF(TRIM(t.shop), ''), 'Unassigned Brand')
      END

   ORDER BY value DESC`,
      params,
    );

    const brandBreakdown = brandResult.rows.map((r) => ({
      label: r.label,
      value: parseFloat(r.value),
    }));
    let bucketExpr, orderExpr;
    // ── Bucket expression matching frontend's chartData grouping ──
    if (from && to) {
      // custom range: week-of-range buckets, matching frontend's `W1, W2...` logic
      bucketExpr = `'W' || (FLOOR(EXTRACT(EPOCH FROM (created_at - $${paramIdx})) / (7*86400)) + 1)::int`;
      params.push(from);
      paramIdx++;
      orderExpr = `MIN(created_at)`;
    } else if (preset === "day") {
      bucketExpr = `EXTRACT(HOUR FROM created_at)::text || ':00'`;
      orderExpr = `MIN(EXTRACT(HOUR FROM created_at))`;
    } else if (preset === "week") {
      bucketExpr = `TO_CHAR(created_at, 'Dy')`;
      orderExpr = `MIN(EXTRACT(DOW FROM created_at))`;
    } else if (preset === "year") {
      bucketExpr = `TO_CHAR(created_at, 'Mon')`;
      orderExpr = `MIN(EXTRACT(MONTH FROM created_at))`;
    } else {
      // month (default)
      bucketExpr = `'D' || EXTRACT(DAY FROM created_at)::int`;
      orderExpr = `MIN(EXTRACT(DAY FROM created_at))`;
    }

    const revenueResult = await pool.query(
      `SELECT ${bucketExpr} AS label, COALESCE(SUM(total),0) AS value, ${orderExpr} AS ord
      FROM transactions ${whereClause}
      GROUP BY label
      ORDER BY ord`,
      params,
    );
    const revenueLabels = revenueResult.rows.map((r) => r.label);
    const revenueSeries = revenueResult.rows.map((r) => parseFloat(r.value));

    // ── GP% series for the current period, bucketed the same way as the frontend chart ──
    const gpResult = await pool.query(
      `SELECT ${bucketExpr} AS label,
              CASE WHEN SUM(total)>0 THEN ROUND((SUM(total-cogs)/SUM(total))*100, 1) ELSE 0 END AS gp,
              ${orderExpr} AS ord
       FROM transactions ${whereClause}
       GROUP BY label
       ORDER BY ord`,
      params,
    );
    const gpSeries = gpResult.rows.map((r) => parseFloat(r.gp));

    // ── Prior-year values — same bucket logic, dates shifted back 1 year ──
    let pyConditions = [...conditions];
    let pyParams = [...params];
    // Rebuild date condition shifted by 1 year (keep branch/voided conditions as-is)
    let pyFromExpr, pyToExpr;
    if (from && to) {
      pyFromExpr = `($1::date - interval '1 year')`;
      pyToExpr = `($2::date - interval '1 year' + interval '1 day')`;
    }
    const pyWhereClause =
      from && to
        ? `WHERE created_at>=${pyFromExpr} AND created_at<${pyToExpr}` +
          (conditions.length > 1
            ? ` AND ${conditions.slice(1).join(" AND ")}`
            : "")
        : whereClause.replace(
            /CURRENT_DATE|date_trunc\('(\w+)',CURRENT_DATE\)/g,
            (m, unit) =>
              unit
                ? `date_trunc('${unit}', CURRENT_DATE - interval '1 year')`
                : `(CURRENT_DATE - interval '1 year')`,
          );

    let priorYearValues = [];
    try {
      const pyResult = await pool.query(
        `SELECT ${bucketExpr} AS label, COALESCE(SUM(total),0) AS value, ${orderExpr} AS ord
         FROM transactions ${pyWhereClause}
         GROUP BY label
         ORDER BY ord`,
        params, // date params unchanged since we shift inline in SQL, not via bound params
      );
      priorYearValues = pyResult.rows.map((r) => parseFloat(r.value));
    } catch (pyErr) {
      console.error(
        "Prior year query failed, falling back to empty:",
        pyErr.message,
      );
      priorYearValues = [];
    }

    res.json({
      salesRevenue: parseFloat(row.salesRevenue),
      totalSales: parseFloat(row.totalSales),
      cogs: parseFloat(row.cogs),
      salesProfit: parseFloat(row.salesProfit),
      txCount: parseInt(row.txCount),
      avgOrder: parseFloat(row.avgOrder),
      branchBreakdown,
      categoryBreakdown,
      brandBreakdown,
      revenueResult,
      revenueLabels,
      revenueSeries,
      gpSeries,
      priorYearValues,
    });
  } catch (err) {
    console.error("GET /dashboard/stats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/dashboard/product-analytics", async (req, res) => {
  try {
    const { preset, from, to, branch, branches } = req.query;
    const params = [],
      conditions = [];
    let paramIdx = 1;

    if (from && to) {
      conditions.push(
        `created_at>=($${paramIdx}::date AT TIME ZONE 'Asia/Manila') AND created_at<(($${paramIdx + 1}::date + interval '1 day') AT TIME ZONE 'Asia/Manila')`,
      );
      params.push(from, to);
      paramIdx += 2;
    } else {
      const presetMap = {
        day: `created_at>=CURRENT_DATE`,
        week: `created_at>=date_trunc('week',CURRENT_DATE)`,
        month: `created_at>=date_trunc('month',CURRENT_DATE)`,
        year: `created_at>=date_trunc('year',CURRENT_DATE)`,
      };
      conditions.push(presetMap[preset] || presetMap["month"]);
    }

    if (branch) {
      conditions.push(`branch=$${paramIdx}`);
      params.push(branch);
      paramIdx++;
    } else if (branches) {
      const list = branches
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      if (list.length > 0) {
        conditions.push(
          `branch IN (${list.map((_, i) => `$${paramIdx + i}`).join(",")})`,
        );
        params.push(...list);
        paramIdx += list.length;
      }
    }
    conditions.push(`(is_voided=false OR is_voided IS NULL)`);

    const result = await pool.query(
      `SELECT branch, items, cashier FROM transactions WHERE ${conditions.join(" AND ")}`,
      params,
    );
    const REGION_MAP = {
      NCR: "Luzon",
      "Region 1": "Luzon",
      "Region 2": "Luzon",
      "Region 3": "Luzon",
      "Region 4A": "Luzon",
      "Region 4B": "Luzon",
      "Region 5": "Luzon",
      "Region 6": "Visayas",
      "Region 7": "Visayas",
      "Region 8": "Visayas",
      "Region 9": "Mindanao",
      "Region 10": "Mindanao",
      "Region 11": "Mindanao",
      "Region 12": "Mindanao",
      BARMM: "Mindanao",
      CAR: "Luzon",
      CARAGA: "Mindanao",
    };

    const branchRegionRows = await pool.query(
      `SELECT name, region FROM branches`,
    );
    const branchToRegion = {};
    branchRegionRows.rows.forEach((r) => {
      branchToRegion[r.name] = REGION_MAP[r.region] || r.region || "Other";
    });

    const productMap = {},
      buyerProductMap = {};
    for (const tx of result.rows) {
      const items =
        typeof tx.items === "string" ? JSON.parse(tx.items) : tx.items || [];
      const region = branchToRegion[tx.branch] || "Other";
      const cashier = tx.cashier || "Unknown";
      for (const item of items) {
        const name = item.name || "Unknown";
        const qty = parseInt(item.qty || 0);
        const rev = parseFloat(item.price || 0) * qty;
        if (!productMap[name])
          productMap[name] = {
            name,
            totalQty: 0,
            totalRevenue: 0,
            branchBreakdown: {},
            regionBreakdown: { Luzon: 0, Visayas: 0, Mindanao: 0, Other: 0 },
          };
        productMap[name].totalQty += qty;
        productMap[name].totalRevenue += rev;
        productMap[name].branchBreakdown[tx.branch] =
          (productMap[name].branchBreakdown[tx.branch] || 0) + qty;
        productMap[name].regionBreakdown[region] =
          (productMap[name].regionBreakdown[region] || 0) + qty;
        if (!buyerProductMap[cashier]) buyerProductMap[cashier] = {};
        buyerProductMap[cashier][name] =
          (buyerProductMap[cashier][name] || 0) + qty;
      }
    }

    const allProducts = Object.values(productMap).sort(
      (a, b) => b.totalQty - a.totalQty,
    );
    const avgQty =
      allProducts.reduce((s, p) => s + p.totalQty, 0) /
      Math.max(allProducts.length, 1);

    const regionSummary = { Luzon: {}, Visayas: {}, Mindanao: {}, Other: {} };
    for (const p of allProducts) {
      for (const [region, qty] of Object.entries(p.regionBreakdown)) {
        if (qty > 0)
          regionSummary[region][p.name] =
            (regionSummary[region][p.name] || 0) + qty;
      }
    }
    const regionTop5 = {};
    for (const [region, products] of Object.entries(regionSummary)) {
      regionTop5[region] = Object.entries(products)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty }));
    }

    res.json({
      top10: allProducts.slice(0, 10),
      fastMoving: allProducts
        .filter((p) => p.totalQty >= avgQty * 1.5)
        .slice(0, 10),
      slowMoving: allProducts
        .filter((p) => p.totalQty <= avgQty * 0.5 && p.totalQty > 0)
        .slice(0, 10),
      topBuyers: Object.entries(buyerProductMap)
        .map(([name, products]) => ({
          name,
          totalItems: Object.values(products).reduce((s, v) => s + v, 0),
          topProduct:
            Object.entries(products).sort((a, b) => b[1] - a[1])[0]?.[0] || "—",
        }))
        .sort((a, b) => b.totalItems - a.totalItems)
        .slice(0, 10),
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
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
        }),
      },
    );
    const data = await response.json();
    const text =
      data.choices?.[0]?.message?.content || "Failed to generate report.";
    res.json({ content: [{ text }] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/ai/dashboard-analysis", async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const { transactions, preset, filterLabel } = req.body || {};
    if (!Array.isArray(transactions) || !transactions.length ||
        transactions.some((tx) => !tx || typeof tx !== "object" || Array.isArray(tx))) {
      return res.status(400).json({ success: false, error: "Select a period with valid transaction records before running AI analysis." });
    }
    if (!process.env.GROQ_API_KEY?.trim()) {
      return res.status(503).json({ success: false, error: "GROQ_API_KEY is missing from the backend environment. Set it on the backend host and restart the server." });
    }
    const branchTotals = {},
      dayTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let totalRevenue = 0,
      totalCogs = 0;

    (transactions || []).forEach((tx) => {
      const branch = tx.branch || "Unknown";
      const total = parseFloat(tx.total || 0);
      const cogs = parseFloat(tx.cogs || 0);
      const day = dayNames[new Date(tx.created_at).getDay()];
      branchTotals[branch] = (branchTotals[branch] || 0) + total;
      dayTotals[day] = (dayTotals[day] || 0) + total;
      totalRevenue += total;
      totalCogs += cogs;
    });

    const txCount = transactions?.length || 0;
    const avgOrder = txCount > 0 ? totalRevenue / txCount : 0;
    const profit = totalRevenue - totalCogs;
    const profitPct =
      totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : "0";

    let inventoryRows = [];
    try {
      const invResult = await pool.query(
        `SELECT name, branch, stock, min_stock, price, cost FROM inventory ORDER BY branch, name`,
      );
      inventoryRows = invResult.rows;
    } catch {}

    const stockByBranch = {};
    for (const item of inventoryRows) {
      const br = item.branch || "Unknown";
      if (!stockByBranch[br])
        stockByBranch[br] = { lowStock: [], zeroStock: [], totalItems: 0 };
      stockByBranch[br].totalItems++;
      const stock = parseFloat(item.stock || 0),
        minStock = parseFloat(item.min_stock || 0);
      if (stock === 0) stockByBranch[br].zeroStock.push(item.name);
      else if (minStock > 0 && stock <= minStock)
        stockByBranch[br].lowStock.push({ name: item.name, stock, minStock });
    }

    const anomalies = [];
    for (const [branch, s] of Object.entries(stockByBranch)) {
      const hasRevenue = (branchTotals[branch] || 0) > 0;
      if (hasRevenue && s.zeroStock.length > 0)
        anomalies.push({
          branch,
          type: "ghost_sales",
          revenue: branchTotals[branch],
          zeroStockItems: s.zeroStock.slice(0, 5),
          zeroCount: s.zeroStock.length,
          lowCount: s.lowStock.length,
        });
      if (hasRevenue && s.lowStock.length >= 3 && s.zeroStock.length === 0)
        anomalies.push({
          branch,
          type: "low_stock_no_reorder",
          revenue: branchTotals[branch],
          lowStockItems: s.lowStock
            .slice(0, 5)
            .map((i) => `${i.name} (${i.stock}/${i.minStock})`),
          lowCount: s.lowStock.length,
        });
      if (
        !hasRevenue &&
        s.totalItems > 0 &&
        s.zeroStock.length === 0 &&
        s.lowStock.length === 0
      )
        anomalies.push({
          branch,
          type: "dead_stock",
          totalItems: s.totalItems,
          revenue: 0,
        });
    }

    const sortedBranches = Object.entries(branchTotals).sort(
      (a, b) => b[1] - a[1],
    );
    const avgBranchRev =
      sortedBranches.length > 0
        ? sortedBranches.reduce((s, [, v]) => s + v, 0) / sortedBranches.length
        : 0;
    const dayEntries = Object.entries(dayTotals);
    const avgDayRev = dayEntries.reduce((s, [, v]) => s + v, 0) / 7;
    const peakDayEntry = dayEntries.reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ["—", 0],
    );
    const slowestDayEntry = dayEntries.reduce(
      (a, b) => (b[1] < a[1] ? b : a),
      ["—", Infinity],
    );
    const slowestDropPct =
      avgDayRev > 0
        ? Math.round(((avgDayRev - slowestDayEntry[1]) / avgDayRev) * 100)
        : 0;
    const weeklyRunRate =
      txCount > 0
        ? Math.round((totalRevenue / txCount) * (txCount / 7) * 7)
        : 0;

    const topBranchesDetailed = sortedBranches
      .slice(0, 8)
      .map(([name, rev]) => {
        const pctOfAvg =
          avgBranchRev > 0
            ? (((rev - avgBranchRev) / avgBranchRev) * 100).toFixed(1)
            : "0";
        const flag = rev > avgBranchRev ? "▲ above avg" : "▼ below avg";
        const s = stockByBranch[name];
        const stockNote = !s
          ? ""
          : s.zeroStock.length > 0
            ? ` | ⚠ ${s.zeroStock.length} items at ZERO stock`
            : s.lowStock.length > 0
              ? ` | ⚠ ${s.lowStock.length} items low stock`
              : "";
        return `  • ${name}: ₱${rev.toLocaleString("en-PH", { maximumFractionDigits: 0 })} (${flag} by ${Math.abs(pctOfAvg)}%)${stockNote}`;
      })
      .join("\n");

    const dayBreakdownDetailed = dayEntries
      .map(([d, v]) => {
        const pct =
          avgDayRev > 0
            ? (((v - avgDayRev) / avgDayRev) * 100).toFixed(0)
            : "0";
        return `${d}: ₱${v.toLocaleString("en-PH", { maximumFractionDigits: 0 })} (${Number(pct) >= 0 ? "+" : ""}${pct}%)`;
      })
      .join(", ");

    const anomalyBlock =
      anomalies.length === 0
        ? "  None detected."
        : anomalies
            .map((a) => {
              if (a.type === "ghost_sales")
                return `  • [GHOST SALES] ${a.branch}: ₱${a.revenue.toLocaleString("en-PH", { maximumFractionDigits: 0 })} in sales but ${a.zeroCount} items at ZERO stock. Selling: ${a.zeroStockItems.join(", ")}.`;
              if (a.type === "low_stock_no_reorder")
                return `  • [LOW STOCK / NOT REORDERING] ${a.branch}: Has ₱${a.revenue.toLocaleString("en-PH", { maximumFractionDigits: 0 })} in sales but ${a.lowCount} items below minimum. Items: ${a.lowStockItems.join(", ")}.`;
              if (a.type === "dead_stock")
                return `  • [DEAD STOCK] ${a.branch}: Has ${a.totalItems} inventory items but ₱0 in sales.`;
              return "";
            })
            .join("\n");

    const prompt = `You are a prescriptive business analyst for iFranchise (Filipino franchise management system).
Period: ${preset || "this month"} | Scope: ${filterLabel || "All Brands & Branches"}
Revenue: ₱${totalRevenue.toLocaleString("en-PH", { maximumFractionDigits: 0 })} | Profit: ₱${profit.toLocaleString("en-PH", { maximumFractionDigits: 0 })} (${profitPct}%) | COGS: ₱${totalCogs.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
Transactions: ${txCount} | Avg order: ₱${avgOrder.toFixed(0)} | Avg branch revenue: ₱${avgBranchRev.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
Branch performance:\n${topBranchesDetailed || "  No branch data"}
Day-of-week breakdown: ${dayBreakdownDetailed}
Peak: ${peakDayEntry[0]} | Slowest: ${slowestDayEntry[0]} (${slowestDropPct}% below avg)
STOCK VS SALES ANOMALIES:\n${anomalyBlock}
Return ONLY valid JSON:
{"projectedRevenue":${weeklyRunRate},"projectedChange":5,"peakDay":"${peakDayEntry[0]}","slowestDay":"${slowestDayEntry[0]}","slowestDayDropPct":${slowestDropPct},"confidence":80,"summary":"<3 sentences>","stockAnomalies":[{"branch":"","anomalyType":"ghost_sales|low_stock_no_reorder|dead_stock","severity":"critical|warning|info","finding":"","action":""}],"recommendations":[{"branch":"","type":"success|warning|info","text":"","priority":"high|medium|low"}]}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: prompt }],
          max_completion_tokens: 4096,
          reasoning_effort: "low",
          response_format: {
  "type": "json_schema",
  "json_schema": {
    "name": "dashboard_analysis",
    "strict": true,
    "schema": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "projectedRevenue": {
          "type": [
            "number",
            "null"
          ]
        },
        "projectedChange": {
          "type": [
            "number",
            "null"
          ]
        },
        "slowestDayDropPct": {
          "type": [
            "number",
            "null"
          ]
        },
        "confidence": {
          "type": [
            "number",
            "null"
          ]
        },
        "peakDay": {
          "type": "string"
        },
        "slowestDay": {
          "type": "string"
        },
        "summary": {
          "type": "string"
        },
        "stockAnomalies": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "branch": {
                "type": "string"
              },
              "anomalyType": {
                "type": "string",
                "enum": [
                  "ghost_sales",
                  "low_stock_no_reorder",
                  "dead_stock"
                ]
              },
              "severity": {
                "type": "string",
                "enum": [
                  "critical",
                  "warning",
                  "info"
                ]
              },
              "finding": {
                "type": "string"
              },
              "action": {
                "type": "string"
              }
            },
            "required": [
              "branch",
              "anomalyType",
              "severity",
              "finding",
              "action"
            ]
          }
        },
        "recommendations": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "branch": {
                "type": "string"
              },
              "type": {
                "type": "string",
                "enum": [
                  "success",
                  "warning",
                  "info"
                ]
              },
              "text": {
                "type": "string"
              },
              "priority": {
                "type": "string",
                "enum": [
                  "high",
                  "medium",
                  "low"
                ]
              }
            },
            "required": [
              "branch",
              "type",
              "text",
              "priority"
            ]
          }
        }
      },
      "required": [
        "projectedRevenue",
        "projectedChange",
        "slowestDayDropPct",
        "confidence",
        "peakDay",
        "slowestDay",
        "summary",
        "stockAnomalies",
        "recommendations"
      ]
    }
  }
},
          temperature: 0.2,
        }),
      },
    );
    let data;
    try {
      data = await response.json();
    } catch (err) {
      if (controller.signal.aborted) throw err;
      return res.status(502).json({ success: false, error: `Groq returned an unreadable response (HTTP ${response.status}). Please retry.` });
    }
    if (!response.ok || data?.error) {
      const status = response.status === 429 ? 429 : 502;
      const detail = String(data?.error?.message || "No provider error message returned")
        .split(process.env.GROQ_API_KEY).join("[redacted]");
      return res.status(status).json({
        success: false,
        error: `Groq request failed (HTTP ${response.status}): ${detail}`,
      });
    }
    const choice = data?.choices?.[0];
    if (choice?.finish_reason === "length") {
      return res.status(502).json({ success: false, error: "The AI report exceeded its output limit. Try a smaller selection of branches or dates." });
    }
    const raw = choice?.message?.content;
    if (typeof raw !== "string" || !raw.trim()) {
      return res.status(502).json({ success: false, error: "Groq returned no report content. Please retry or check the provider configuration." });
    }
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim());
    } catch {
      return res.status(502).json({ success: false, error: "Groq returned invalid report JSON. Please retry." });
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) ||
        typeof parsed.summary !== "string" || !parsed.summary.trim() ||
        !Array.isArray(parsed.recommendations) || !Array.isArray(parsed.stockAnomalies)) {
      return res.status(502).json({ success: false, error: "Groq returned an incomplete report. A summary, recommendations, and stockAnomalies are required." });
    }
    return res.json({ success: true, analysis: parsed });
  } catch (err) {
    const timedOut = controller.signal.aborted;
    console.error("AI dashboard analysis failed:", timedOut ? "timeout" : err?.name || "Error");
    return res.status(timedOut ? 504 : 502).json({
      success: false,
      error: timedOut
        ? "Groq did not respond within 45 seconds. Please retry with a shorter period."
        : "The backend could not complete the AI request. Check backend connectivity and server logs.",
    });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;

