const express = require("express");
const router = express.Router();
const pool = require("../db");
const { sendPushNotification } = require("../utils/pushNotif");

router.get("/announcements/delete-history", async (req, res) => {
  try {
    await pool.query(`DELETE FROM announcement_delete_history WHERE deleted_at < NOW() - INTERVAL '30 days'`);
    const result = await pool.query(`SELECT * FROM announcement_delete_history WHERE deleted_at >= NOW() - INTERVAL '30 days' ORDER BY deleted_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch delete history" });
  }
});

router.delete("/announcements/delete-history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM announcement_delete_history WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from history" });
  }
});

router.get("/announcements", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS author FROM announcements a LEFT JOIN users u ON a.created_by=u.id ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

router.post("/announcements", async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const userResult = await pool.query("SELECT role FROM users WHERE id=$1", [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    if (userResult.rows[0].role !== "Super Admin" && "Franchisee Operations Admin")
      return res.status(403).json({ error: "Only admin can post announcements" });

    const result = await pool.query(
      `INSERT INTO announcements (title, content, created_by) VALUES ($1,$2,$3) RETURNING *`,
      [title, content, userId]
    );

    try {
      const announcementId = result.rows[0].id;
      const allUsers = await pool.query("SELECT id FROM users");
      await Promise.all(allUsers.rows.map(u =>
        pool.query(
          `INSERT INTO notifications (user_id, type, title, body, reference_id) VALUES ($1,'announcement',$2,$3,$4) ON CONFLICT DO NOTHING`,
          [u.id, title, content.length > 80 ? content.slice(0, 80) + "…" : content, announcementId]
        )
      ));
      const tokens = await pool.query("SELECT push_token FROM users WHERE push_token IS NOT NULL");
      await Promise.all(tokens.rows.map(r => sendPushNotification(r.push_token, "New Announcement", title)));
    } catch (notifErr) {
      console.error("Notification insert failed (non-fatal):", notifErr.message);
    }

    res.json({ success: true, announcement: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

router.put("/announcements/:id", async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const userResult = await pool.query("SELECT role FROM users WHERE id=$1", [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    if (userResult.rows[0].role !== "Super Admin" && "Franchisee Operations Admin")
      return res.status(403).json({ error: "Unauthorized" });

    const result = await pool.query(
      "UPDATE announcements SET title=$1, content=$2 WHERE id=$3 RETURNING *",
      [title, content, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

router.delete("/announcements/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    const userResult = await pool.query("SELECT role FROM users WHERE id=$1", [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    if (userResult.rows[0].role !== "Super Admin" && "Franchisee Operations Admin")
      return res.status(403).json({ error: "Unauthorized" });

    const ann = await pool.query("SELECT * FROM announcements WHERE id=$1", [req.params.id]);
    if (ann.rows.length > 0) {
      const a = ann.rows[0];
      await pool.query(
        `INSERT INTO announcement_delete_history (announcement_id, title, content, image_url, created_by, original_created_at, deleted_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [a.id, a.title, a.content, a.image_url || null, a.created_by, a.created_at, userId]
      );
    }

    await pool.query("DELETE FROM announcements WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

module.exports = router;