const pool = require("../db");

async function logActivity(action, itemId, itemName, details = {}, performedBy = "system") {
  try {
    await pool.query(
      `INSERT INTO activity_log (action, item_id, item_name, details, performed_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [action, itemId, itemName, JSON.stringify(details), performedBy]
    );
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

module.exports = { logActivity };