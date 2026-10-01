const crypto = require("crypto");
const pool = require("../db");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

const SESSION_COOKIE = "franchisync_session";
const CHALLENGE_COOKIE = "franchisync_login";

const SESSION_MS = 8 * 60 * 60 * 1000;
const CHALLENGE_MS = 10 * 60 * 1000;

const digest = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const tokenFrom = (req, name) => {
  const value = req.cookies?.[name];

  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value)
    ? value
    : null;
};

function cookieOptions(req) {
  const secure = process.env.NODE_ENV === "production" || req.secure === true;

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
  };
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  const rawIp = forwarded
    ? forwarded.split(",")[0].trim()
    : req.socket?.remoteAddress || null;

  return rawIp?.replace("::ffff:", "") || null;
}

function getDeviceLabel(req) {
  const ua = req.headers["user-agent"] || "";
  const parser = new UAParser(ua);

  const browser = parser.getBrowser();
  const os = parser.getOS();

  const browserName = [browser.name, browser.version].filter(Boolean).join(" ");

  const osName = [os.name, os.version].filter(Boolean).join(" ");

  return [browserName, osName].filter(Boolean).join(" on ") || "Unknown device";
}

function getIpLocation(ip) {
  if (!ip) return null;

  // Local development IPs cannot be geolocated.
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

async function removeToken(req, name) {
  const token = tokenFrom(req, name);

  if (!token) return;

  await pool.query(
    `
      DELETE FROM website_auth_sessions
      WHERE token_hash=$1
    `,
    [digest(token)],
  );
}

async function mint(req, res, user, kind) {
  const name = kind === "login" ? CHALLENGE_COOKIE : SESSION_COOKIE;

  const duration = kind === "login" ? CHALLENGE_MS : SESSION_MS;

  const token = crypto.randomBytes(32).toString("hex");

  await removeToken(req, name);

  const ip = getClientIp(req);
  const device = getDeviceLabel(req);
  const location = getIpLocation(ip);

  await pool.query(
    `
      INSERT INTO website_auth_sessions (
        token_hash,
        user_id,
        password_fingerprint,
        kind,
        expires_at,
        device,
        ip_address,
        location,
        created_at,
        last_active_at
      )
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,NOW(),NOW()
      )
    `,
    [
      digest(token),
      String(user.id),
      digest(user.password),
      kind,
      new Date(Date.now() + duration),
      device,
      ip,
      location,
    ],
  );

  res.cookie(name, token, {
    ...cookieOptions(req),
    maxAge: duration,
  });
}

async function startLoginChallenge(req, res, user) {
  // A new login must not keep another account's authenticated
  // session in this browser.
  await revokeSession(req, res);

  await mint(req, res, user, "login");
}

async function issueSession(req, res, user) {
  await removeToken(req, CHALLENGE_COOKIE);

  res.clearCookie(CHALLENGE_COOKIE, cookieOptions(req));

  await mint(req, res, user, "session");
}

async function finishOtpSession(req, res, user) {
  const token = tokenFrom(req, CHALLENGE_COOKIE);

  const isWeb =
    req.headers["x-client"] === "web" || Boolean(req.headers.origin);

  if (!token && !isWeb) return;

  const result = token
    ? await pool.query(
        `
          DELETE FROM website_auth_sessions
          WHERE token_hash=$1
            AND user_id=$2
            AND kind='login'
            AND expires_at>NOW()
            AND password_fingerprint=$3
          RETURNING user_id
        `,
        [digest(token), String(user.id), digest(user.password)],
      )
    : { rows: [] };

  if (!result.rows.length) {
    const error = new Error(
      "Your login verification expired. Enter your email and password again.",
    );

    error.status = 401;

    throw error;
  }

  await issueSession(req, res, user);
}

async function revokeSession(req, res) {
  await removeToken(req, SESSION_COOKIE);
  await removeToken(req, CHALLENGE_COOKIE);

  res.clearCookie(SESSION_COOKIE, cookieOptions(req));

  res.clearCookie(CHALLENGE_COOKIE, cookieOptions(req));
}

function loadSession(allowedOrigins) {
  const allowed = new Set(allowedOrigins);

  return async (req, res, next) => {
    const origin = req.headers.origin;

    const unsafe = !["GET", "HEAD", "OPTIONS"].includes(req.method);

    if (unsafe && origin && !allowed.has(origin)) {
      return res.status(403).json({
        error: "This website is not allowed to send this request.",
      });
    }

    const token = tokenFrom(req, SESSION_COOKIE);

    if (!token) return next();

    try {
      const tokenHash = digest(token);

      const result = await pool.query(
        `
          SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.brand,
            u.branch,
            u.password,
            s.password_fingerprint

          FROM website_auth_sessions s

          JOIN users u
            ON u.id::text=s.user_id

          WHERE s.token_hash=$1
            AND s.kind='session'
            AND s.expires_at>NOW()
        `,
        [tokenHash],
      );

      const user = result.rows[0];

      if (!user || digest(user.password) !== user.password_fingerprint) {
        await removeToken(req, SESSION_COOKIE);

        res.clearCookie(SESSION_COOKIE, cookieOptions(req));

        return next();
      }

      const { password, password_fingerprint, ...safeUser } = user;

      req.user = safeUser;

      // Used by the Login Sessions module to identify
      // which row belongs to this browser.
      req.sessionTokenHash = tokenHash;

      // Update session activity.
      // Avoid failing authentication if this timestamp
      // update ever encounters a temporary DB problem.
      pool
        .query(
          `
            UPDATE website_auth_sessions
            SET last_active_at=NOW()
            WHERE token_hash=$1
          `,
          [tokenHash],
        )
        .catch(() => {});

      return next();
    } catch (err) {
      console.error("Session lookup failed:", err.message);

      return res.status(503).json({
        error: "Unable to verify your session. Please try again shortly.",
      });
    }
  };
}

module.exports = {
  startLoginChallenge,
  issueSession,
  finishOtpSession,
  revokeSession,
  loadSession,
};
