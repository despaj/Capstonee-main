const express = require("express");
const router = express.Router();
const { logActivity } = require("../utils/activityLogger");
const pool = require("../db");

const LOG_TABLES = [
  { route: "inventory-activity-log",     table: "inventory_activity_log" },
  { route: "shop-activity-log",          table: "shop_activity_log" },
  { route: "orders-activity-log",        table: "orders_activity_log" },
  { route: "users-activity-log",         table: "users_activity_log" },
  { route: "applications-activity-log",  table: "applications_activity_log" },
  { route: "reports-activity-log",       table: "reports_activity_log" },
  { route: "announcements-activity-log", table: "announcements_activity_log" },
  { route: "brands-activity-log",        table: "brands_activity_log" },
  { route: "ingredient-activity-log",    table: "ingredient_activity_log" },
];

for (const { route, table } of LOG_TABLES) {
  router.get(`/${route}`, async (req, res) => {
    try {
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
      res.json(result.rows);
    } catch (err) {
      console.error(`GET /${route} error:`, err);
      res.status(500).json({ error: `Failed to fetch ${route}` });
    }
  });

  router.post(`/${route}`, async (req, res) => {
    try {
      const { action, item_name, branch, performed_by, changes } = req.body;
      await pool.query(
        `INSERT INTO ${table} (action, item_name, branch, performed_by, changes) VALUES ($1,$2,$3,$4,$5)`,
        [action, item_name, branch || null, performed_by || "System", changes || null]
      );
      res.json({ success: true });
    } catch (err) {
      console.error(`POST /${route} error:`, err);
      res.status(500).json({ error: `Failed to save ${route} entry` });
    }
  });
}

router.get("/activity-logs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, 'Inventory'     AS module FROM inventory_activity_log     UNION ALL
      SELECT *, 'Mobile Shop'   AS module FROM shop_activity_log          UNION ALL
      SELECT *, 'Orders'        AS module FROM orders_activity_log        UNION ALL
      SELECT *, 'Users'         AS module FROM users_activity_log         UNION ALL
      SELECT *, 'Applications'  AS module FROM applications_activity_log  UNION ALL
      SELECT *, 'Reports'       AS module FROM reports_activity_log       UNION ALL
      SELECT *, 'Announcements' AS module FROM announcements_activity_log UNION ALL
      SELECT *, 'Brands'        AS module FROM brands_activity_log
      ORDER BY created_at DESC LIMIT 500
    `);
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

module.exports = router;