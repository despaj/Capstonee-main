const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth");
router.use(authenticate);
router.use(
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Manager",
  ),
);
const { logActivity } = require("../utils/activityLogger");
const pool = require("../db");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

const ACTIVITY_TABLE = "users_activity_log";

const LOG_MODULES = [
  { route: "menu-activity-log", module: "Menu Inventory" },
  { route: "stockInv-activity-log", module: "Stock Inventory" },
  { route: "shop-activity-log", module: "Mobile Shop" },
  { route: "orders-activity-log", module: "Orders" },
  { route: "users-activity-log", module: "User Management" },
  { route: "applications-activity-log", module: "Applications" },
  { route: "reports-activity-log", module: "Reports" },
  { route: "announcements-activity-log", module: "Announcements" },
  { route: "brands-activity-log", module: "Brands" },
];

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress;
}

function getDeviceLabel(req) {
  const ua = req.headers["user-agent"] || "";
  const parser = new UAParser(ua);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return `${browser.name || "Unknown browser"} on ${os.name || "Unknown OS"}`;
}

for (const { route, module } of LOG_MODULES) {
  router.get(`/${route}`, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${ACTIVITY_TABLE} WHERE module = $1 ORDER BY created_at DESC`,
        [module],
      );
      res.json(result.rows);
    } catch (err) {
      console.error(`GET /${route} error:`, err);
      res.status(500).json({ error: `Failed to fetch ${route}` });
    }
  });

  // POST /<route> -> insert into the shared table, tagged with this module
  router.post(`/${route}`, async (req, res) => {
    try {
      const { action, item_name, branch, performed_by, role, changes } =
        req.body;
      const ip = getClientIp(req);
      const device = getDeviceLabel(req);
      const geo = geoip.lookup(ip);

      const result = await pool.query(
        `INSERT INTO ${ACTIVITY_TABLE}
          (module, action, item_name, branch, performed_by, role, changes, ip_address, device, location, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING *`,
        [
          module,
          action,
          item_name,
          branch,
          performed_by,
          role,
          changes,
          ip,
          device,
          geo ? `${geo.city || ""}, ${geo.country || ""}` : null,
        ],
      );

      res.json({ success: true, entry: result.rows[0] });
    } catch (err) {
      console.error(`POST /${route} error:`, err);
      res.status(500).json({ error: `Failed to save ${route} entry` });
    }
  });
}

router.get("/activity-logs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ${ACTIVITY_TABLE} ORDER BY created_at DESC LIMIT 500`,
    );
    res.json({ logs: result.rows });
  } catch (err) {
    console.error("GET /activity-logs error:", err);
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

module.exports = router;
