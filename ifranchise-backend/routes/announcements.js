// INSTALL: Run Announcements_MultiPhoto_Migration.sql before using this route.
// In your server entry file, BEFORE app.use(express.json()) or any routes,
// replace the existing JSON parser with app.use(express.json({ limit: "2mb" })).
// Do not leave an earlier JSON parser with the default smaller limit.
// Replace the contents of your existing announcements route with this file.
// Existing role checks, notifications and activity logging are retained.

const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
router.use(express.json({ limit: "2mb" }));
router.use(authenticate);
const pool = require("../db");
const { sendPushNotification } = require("../utils/pushNotif");
const { logActivity } = require("../utils/activityLogger");
async function logAnnouncementActivity(...args) {
  try {
    await logActivity(...args);
  } catch (err) {
    console.error("Announcement activity log failed (non-fatal):", err.message);
  }
}
function parsePhoto(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "string")
    throw new Error("Photo must be an image link or image data URL.");
  const photo = value.trim();
  if (!photo) return null;
  if (Buffer.byteLength(photo, "utf8") > 900000)
    throw new Error("Photo is too large. Please choose a smaller image.");
  if (
    /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i.test(photo)
  )
    return photo;
  if (/^https?:\/\//i.test(photo)) {
    try {
      new URL(photo);
      return photo;
    } catch {
      /* rejected below */
    }
  }
  if (photo.startsWith("/") && !photo.startsWith("//")) return photo;
  throw new Error(
    "Choose a JPG, PNG, WebP, or GIF photo, or use a valid image link.",
  );
}
// The array is authoritative when provided, including [] to remove every photo.
function parsePhotos(body = {}) {
  if (!Object.prototype.hasOwnProperty.call(body, "image_urls")) {
    const photo = parsePhoto(body.image_url);
    return photo ? [photo] : [];
  }
  if (!Array.isArray(body.image_urls))
    throw new Error("image_urls must be an array of photo URLs.");
  if (body.image_urls.length > 10)
    throw new Error("Attach up to 10 photos per announcement.");
  const photos = body.image_urls.map((value) => {
    const photo = parsePhoto(value);
    if (!photo) throw new Error("Each photo must contain a valid image URL.");
    return photo;
  });
  if (Buffer.byteLength(JSON.stringify(photos), "utf8") > 900000)
    throw new Error("The selected photos are too large. Please use smaller images.");
  return [...new Set(photos)];
}

function announcementWithPhotos(row) {
  if (!row) return row;
  const photos = Array.isArray(row.image_urls)
    ? row.image_urls
    : row.image_url ? [row.image_url] : [];
  return { ...row, image_urls: photos, image_url: photos[0] || null };
}

router.get(
  "/announcements/delete-history",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT *
     FROM announcement_delete_history
     WHERE deleted_at >= NOW() - INTERVAL '30 days'
     ORDER BY deleted_at DESC`,
      );
      res.json(result.rows.map(announcementWithPhotos));
    } catch (err) {
      console.error("Fetch announcement delete history failed:", err.message);
      res.status(500).json({ error: "Failed to fetch delete history" });
    }
  },
);
router.delete(
  "/announcements/delete-history/:id",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      await pool.query("DELETE FROM announcement_delete_history WHERE id=$1", [
        req.params.id,
      ]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to remove from history" });
    }
  },
);
router.get(
  "/announcements",
  authorize(
    "Super Admin",
    "Franchisee Operations Admin",
    "Sales Admin",
    "Manager",
    "Staff",
    "Franchisee",
  ),
  async (req, res) => {
    try {
      // a.* includes both image_url and image_urls, persisted in PostgreSQL.
      const result = await pool.query(
        `SELECT a.*, u.name AS author FROM announcements a LEFT JOIN users u ON a.created_by=u.id ORDER BY a.created_at DESC`,
      );
      res.json(result.rows.map(announcementWithPhotos));
    } catch (err) {
      console.error("Fetch announcements failed:", err.message);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  },
);
router.post(
  "/announcements",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      const {
        title,
        content,
        userId,
        performed_by,
        role,
        latitude,
        longitude,
        restored,
      } = req.body || {};
      const userResult = await pool.query(
        "SELECT role, branch FROM users WHERE id=$1",
        [userId],
      );
      if (userResult.rows.length === 0)
        return res.status(404).json({ error: "User not found" });
      if (
        userResult.rows[0].role !== "Super Admin" &&
        userResult.rows[0].role !== "Franchisee Operations Admin"
      )
        return res
          .status(403)
          .json({ error: "Only admin can post announcements" });
      if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof content !== "string" ||
        !content.trim()
      )
        return res
          .status(400)
          .json({ error: "Please fill in the title and content fields." });
      let photos;
      try {
        photos = parsePhotos(req.body || {});
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
      const result = await pool.query(
        `INSERT INTO announcements (title, content, image_url, image_urls, created_by) VALUES ($1,$2,$3,$4::jsonb,$5) RETURNING *`,
        [title.trim(), content.trim(), photos[0] || null, JSON.stringify(photos), userId],
      );
      await logAnnouncementActivity(
        restored ? "restore" : "create",
        title.trim(),
        performed_by || "System",
        { note: restored ? "Restored from delete history" : undefined },
        req,
        userResult.rows[0].branch || null,
        "Announcements",
        latitude,
        longitude,
        role || "Unknown",
      );
      try {
        const announcementId = result.rows[0].id;
        const allUsers = await pool.query("SELECT id FROM users");
        await Promise.all(
          allUsers.rows.map((u) =>
            pool.query(
              `INSERT INTO notifications (user_id, type, title, body, reference_id) VALUES ($1,'announcement',$2,$3,$4) ON CONFLICT DO NOTHING`,
              [
                u.id,
                title.trim(),
                content.length > 80 ? content.slice(0, 80) + "…" : content,
                announcementId,
              ],
            ),
          ),
        );
        const tokens = await pool.query(
          "SELECT push_token FROM users WHERE push_token IS NOT NULL",
        );
        await Promise.all(
          tokens.rows.map((r) =>
            sendPushNotification(
              r.push_token,
              "New Announcement",
              title.trim(),
            ),
          ),
        );
      } catch (notifErr) {
        console.error(
          "Notification insert failed (non-fatal):",
          notifErr.message,
        );
      }
      // Preserves the response shape expected by FACommunicationContent.
      res.json({ success: true, announcement: announcementWithPhotos(result.rows[0]) });
    } catch (err) {
      console.error("Create announcement failed:", err.message);
      res.status(500).json({ error: "Failed to create announcement" });
    }
  },
);
router.put(
  "/announcements/:id",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      const {
        title,
        content,
        userId,
        performed_by,
        role,
        latitude,
        longitude,
      } = req.body || {};
      const userResult = await pool.query(
        "SELECT role, branch FROM users WHERE id=$1",
        [userId],
      );
      if (userResult.rows.length === 0)
        return res.status(404).json({ error: "User not found" });
      if (
        userResult.rows[0].role !== "Super Admin" &&
        userResult.rows[0].role !== "Franchisee Operations Admin"
      )
        return res.status(403).json({ error: "Unauthorized" });
      if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof content !== "string" ||
        !content.trim()
      )
        return res
          .status(400)
          .json({ error: "Please fill in the title and content fields." });
      const body = req.body || {};
      const hasPhotos = Object.prototype.hasOwnProperty.call(body, "image_urls") ||
        Object.prototype.hasOwnProperty.call(body, "image_url");
      let photos = [];
      try {
        if (hasPhotos) photos = parsePhotos(body);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
      // Omitted photo fields retain all photos. An explicit [] removes all photos.
      // Legacy clients supplying only image_url replace the collection with one photo.
      const result = await pool.query(
        `UPDATE announcements SET title=$1, content=$2,
         image_url=CASE WHEN $3::boolean THEN $4::text ELSE image_url END,
         image_urls=CASE WHEN $3::boolean THEN $5::jsonb ELSE image_urls END
         WHERE id=$6 RETURNING *`,
        [title.trim(), content.trim(), hasPhotos, photos[0] || null,
          JSON.stringify(photos), req.params.id],
      );
      if (!result.rows.length)
        return res.status(404).json({ error: "Announcement not found" });
      await logAnnouncementActivity(
        "update",
        title.trim(),
        performed_by || "System",
        {},
        req,
        userResult.rows[0].branch || null,
        "Announcements",
        latitude,
        longitude,
        role || "Unknown",
      );
      res.json(announcementWithPhotos(result.rows[0]));
    } catch (err) {
      console.error("Update announcement failed:", err.message);
      res.status(500).json({ error: "Failed to update announcement" });
    }
  },
);
router.delete(
  "/announcements/:id",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      const { userId, performed_by, role, latitude, longitude } =
        req.body || {};
      const userResult = await pool.query(
        "SELECT role, branch FROM users WHERE id=$1",
        [userId],
      );
      if (userResult.rows.length === 0)
        return res.status(404).json({ error: "User not found" });
      if (
        userResult.rows[0].role !== "Super Admin" &&
        userResult.rows[0].role !== "Franchisee Operations Admin"
      )
        return res.status(403).json({ error: "Unauthorized" });
      // Archive and delete in one atomic statement, retaining every photo for Restore.
      const result = await pool.query(
        `WITH removed AS (
         DELETE FROM announcements WHERE id=$1 RETURNING *
       )
       INSERT INTO announcement_delete_history
         (announcement_id, title, content, image_url, image_urls, created_by, original_created_at, deleted_by)
       SELECT id, title, content, image_url, image_urls, created_by, created_at, $2 FROM removed
       RETURNING title`,
        [req.params.id, userId],
      );
      if (!result.rows.length)
        return res.status(404).json({ error: "Announcement not found" });
      await logAnnouncementActivity(
        "delete",
        result.rows[0].title,
        performed_by || "System",
        {},
        req,
        userResult.rows[0].branch || null,
        "Announcements",
        latitude,
        longitude,
        role || "Unknown",
      );
      res.json({ success: true });
    } catch (err) {
      console.error("Delete announcement failed:", err.message);
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  },
);
router.get(
  "/announcements-activity-log",
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM users_activity_log WHERE module = $1 ORDER BY created_at DESC",
        ["Announcements"],
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Failed to fetch announcements activity log:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch announcements activity log" });
    }
  },
);
module.exports = router;

