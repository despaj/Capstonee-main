const express = require("express");
const router = express.Router();
const pool = require("../db");
const { sendPushNotification } = require("../utils/pushNotif");

router.get("/notifications/low-stock-items", async (req, res) => {
  const { userId } = req.query;
  try {
    const userResult = await pool.query("SELECT branch FROM users WHERE id=$1", [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const { branch } = userResult.rows[0];

    const result = await pool.query(
      `SELECT name, branch, unit, stock, min_stock FROM ingredients
       WHERE branch=$1 AND min_stock>0 AND stock<min_stock
       ORDER BY (stock::float / NULLIF(min_stock::float,0)) ASC`,
      [branch]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch low stock items" });
  }
});

router.get("/notifications", async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query("SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC", [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read=true WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark read" });
  }
});

router.patch("/notifications/read-all", async (req, res) => {
  const { userId } = req.body;
  try {
    await pool.query("UPDATE notifications SET is_read=true WHERE user_id=$1", [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

router.post("/notifications/check-low-stock", async (req, res) => {
  const { userId } = req.body;
  try {
    const userResult = await pool.query("SELECT branch FROM users WHERE id=$1", [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const { branch } = userResult.rows[0];
    if (!branch) return res.json({ success: true, created: 0 });

    const lowStock = await pool.query(
      `SELECT name, stock, min_stock FROM ingredients
       WHERE branch=$1 AND min_stock>0 AND stock<=min_stock AND stock>0
       ORDER BY (stock::float/min_stock::float) ASC`,
      [branch]
    );
    const items = lowStock.rows;
    if (items.length === 0) return res.json({ success: true, created: 0 });

    let title, body;
    if (items.length <= 3) {
      const names = items.map(i => i.name).join(", ");
      title = "Low Stock Alert";
      body  = `${names} ${items.length === 1 ? "is" : "are"} low on stock. Reorder now?`;
    } else {
      title = "Multiple Items Low on Stock";
      body  = `${items.length} ingredients in your branch are running low. Reorder now.`;
    }

    const existing = await pool.query(
      `SELECT id FROM notifications WHERE user_id=$1 AND type='low_stock' AND created_at>NOW()-INTERVAL '24 hours' LIMIT 1`,
      [userId]
    );
    if (existing.rows.length > 0) return res.json({ success: true, created: 0, skipped: true });

    await pool.query(`INSERT INTO notifications (user_id, type, title, body) VALUES ($1,'low_stock',$2,$3)`, [userId, title, body]);

    const tokenRow = await pool.query("SELECT push_token FROM users WHERE id=$1", [userId]);
    const token = tokenRow.rows[0]?.push_token;
    if (token) await sendPushNotification(token, title, body);

    res.json({ success: true, created: 1, itemCount: items.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to check low stock" });
  }
});

module.exports = router;