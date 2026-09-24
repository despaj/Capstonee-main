const pool = require("../db");

async function authenticate(req, res, next) {
  try {
    // loadSession() in server.js already validated the
    // franchisync_session cookie and populated req.user.
    if (!req.user?.id) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    // Re-read the user from the database so role/branch/brand
    // always use the latest server-side values.
    const result = await pool.query(
      `SELECT id, name, email, role, branch, brand
       FROM users
       WHERE id = $1`,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = result.rows[0];

    return next();
  } catch (err) {
    console.error("Authentication error:", err);

    return res.status(500).json({
      message: "Unable to verify authentication",
    });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
