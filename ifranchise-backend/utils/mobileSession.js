const crypto = require("crypto");
const pool = require("../db");
const geoip = require("geoip-lite");

const MOBILE_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

const digest = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  const rawIp = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket?.remoteAddress || null;

  return rawIp?.replace("::ffff:", "") || null;
}

function getLocation(ip) {
  if (!ip) return null;

  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return "Local network";
  }

  try {
    const geo = geoip.lookup(ip);

    if (!geo) return null;

    return [geo.city, geo.region, geo.country].filter(Boolean).join(", ");
  } catch {
    return null;
  }
}

function getDeviceName(req) {
  const platform = String(req.headers["x-device-platform"] || "").toLowerCase();

  if (platform === "ios") {
    return "iOS Mobile App";
  }

  if (platform === "android") {
    return "Android Mobile App";
  }

  return "Mobile App";
}

async function issueMobileSession(req, user) {
  const deviceId = req.headers["x-device-id"];

  if (!deviceId) {
    const error = new Error("Mobile device ID is required.");
    error.status = 400;
    throw error;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = digest(token);

  const ip = getClientIp(req);
  const location = getLocation(ip);
  const device = getDeviceName(req);

  const expiresAt = new Date(Date.now() + MOBILE_SESSION_MS);

  // Only keep one active login session for this user
  // on this specific mobile installation.
  await pool.query(
    `UPDATE mobile_auth_sessions
     SET revoked_at = NOW()
     WHERE user_id = $1
       AND device_id = $2
       AND revoked_at IS NULL`,
    [user.id, deviceId],
  );

  await pool.query(
    `INSERT INTO mobile_auth_sessions (
      token_hash,
      user_id,
      device_id,
      device,
      ip_address,
      location,
      created_at,
      last_active_at,
      expires_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW(),$7)`,
    [tokenHash, user.id, deviceId, device, ip, location, expiresAt],
  );

  return token;
}

async function loadMobileSession(req, res, next) {
  if (req.headers["x-client"] !== "mobile") {
    return next();
  }

  const token = req.headers["x-mobile-session"];

  if (!token || typeof token !== "string") {
    return next();
  }

  try {
    const tokenHash = digest(token);

    const result = await pool.query(
      `SELECT
         s.id AS session_id,
         s.token_hash,
         s.user_id,
         u.id,
         u.name,
         u.email,
         u.role,
         u.branch,
         u.brand
       FROM mobile_auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );

    if (!result.rows.length) {
      return next();
    }

    const row = result.rows[0];

    req.mobileSession = {
      id: row.session_id,
      tokenHash: row.token_hash,
    };

    req.user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      branch: row.branch,
      brand: row.brand,
    };

    pool
      .query(
        `UPDATE mobile_auth_sessions
         SET last_active_at = NOW()
         WHERE id = $1`,
        [row.session_id],
      )
      .catch(() => {});

    return next();
  } catch (err) {
    console.error("Mobile session lookup failed:", err);

    return res.status(503).json({
      message: "Unable to verify mobile session.",
    });
  }
}

async function requireMobileSession(req, res, next) {
  if (req.headers["x-client"] !== "mobile") {
    return next();
  }

  if (!req.mobileSession || !req.user) {
    return res.status(401).json({
      message: "Your mobile session has expired or was logged out.",
      sessionExpired: true,
    });
  }

  return next();
}

async function revokeMobileSession(req) {
  const token = req.headers["x-mobile-session"];

  if (!token || typeof token !== "string") {
    return;
  }

  await pool.query(
    `UPDATE mobile_auth_sessions
     SET revoked_at = NOW()
     WHERE token_hash = $1
       AND revoked_at IS NULL`,
    [digest(token)],
  );
}

module.exports = {
  issueMobileSession,
  loadMobileSession,
  requireMobileSession,
  revokeMobileSession,
};
