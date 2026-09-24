const jwt = require("jsonwebtoken");
const pool = require("../db");

async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : null;

  const token = bearerToken || req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  try {
    // 1. Verify that the JWT is genuine and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Get CURRENT user permissions from database
    const result = await pool.query(
      `SELECT id, name, email, role, branch, brand
       FROM users
       WHERE id = $1`,
      [decoded.id],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // 3. Use DB values instead of trusting old JWT role/branch
    req.user = result.rows[0];

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired",
        code: "TOKEN_EXPIRED",
      });
    }

    console.error("Authentication error:", err);

    return res.status(401).json({
      message: "Invalid session",
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

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
