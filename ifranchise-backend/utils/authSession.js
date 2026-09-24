// Save as backend/utils/authSession.js. Run AuthSession_Migration.txt first.
const crypto = require("crypto");
const pool = require("../db");
const SESSION_COOKIE = "franchisync_session";
const CHALLENGE_COOKIE = "franchisync_login";
const SESSION_MS = 8 * 60 * 60 * 1000;
const CHALLENGE_MS = 10 * 60 * 1000;
const digest = value => crypto.createHash("sha256").update(String(value)).digest("hex");
const tokenFrom = (req, name) => {
  const value = req.cookies?.[name];
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value) ? value : null;
};
function cookieOptions(req) {
  const secure = process.env.NODE_ENV === "production" || req.secure === true;
  return { httpOnly: true, secure, sameSite: secure ? "none" : "lax", path: "/" };
}
async function removeToken(req, name) {
  const token = tokenFrom(req, name);
  if (token) await pool.query("DELETE FROM website_auth_sessions WHERE token_hash=$1", [digest(token)]);
}
async function mint(req, res, user, kind) {
  const name = kind === "login" ? CHALLENGE_COOKIE : SESSION_COOKIE;
  const duration = kind === "login" ? CHALLENGE_MS : SESSION_MS;
  const token = crypto.randomBytes(32).toString("hex");
  await removeToken(req, name);
  await pool.query(
    `INSERT INTO website_auth_sessions(token_hash,user_id,password_fingerprint,kind,expires_at)
     VALUES($1,$2,$3,$4,$5)`,
    [digest(token), String(user.id), digest(user.password), kind, new Date(Date.now() + duration)],
  );
  res.cookie(name, token, { ...cookieOptions(req), maxAge: duration });
}
async function startLoginChallenge(req, res, user) {
  // A new login must not keep another account's authenticated session.
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
  // Existing mobile clients without cookie support retain their existing response.
  // They do not obtain a website session from an OTP-only request.
  const isWeb = req.headers["x-client"] === "web" || Boolean(req.headers.origin);
  if (!token && !isWeb) return;
  const result = token ? await pool.query(
    `DELETE FROM website_auth_sessions WHERE token_hash=$1 AND user_id=$2
     AND kind='login' AND expires_at>NOW() AND password_fingerprint=$3 RETURNING user_id`,
    [digest(token), String(user.id), digest(user.password)],
  ) : { rows: [] };
  if (!result.rows.length) {
    const error = new Error("Your login verification expired. Enter your email and password again.");
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
    // CORS alone does not prevent a cross-origin form from sending cookie requests.
    const origin = req.headers.origin;
    const unsafe = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    if (unsafe && origin && !allowed.has(origin)) {
      return res.status(403).json({ error: "This website is not allowed to send this request." });
    }
    const token = tokenFrom(req, SESSION_COOKIE);
    if (!token) return next();
    try {
      const result = await pool.query(
        `SELECT u.id,u.name,u.email,u.role,u.brand,u.branch,u.password,s.password_fingerprint
         FROM website_auth_sessions s JOIN users u ON u.id::text=s.user_id
         WHERE s.token_hash=$1 AND s.kind='session' AND s.expires_at>NOW()`,
        [digest(token)],
      );
      const user = result.rows[0];
      if (!user || digest(user.password) !== user.password_fingerprint) {
        await removeToken(req, SESSION_COOKIE);
        res.clearCookie(SESSION_COOKIE, cookieOptions(req));
        return next();
      }
      // Role/branch are read from the database on every authenticated request.
      const { password, password_fingerprint, ...safeUser } = user;
      req.user = safeUser;
      return next();
    } catch (err) {
      console.error("Session lookup failed:", err.message);
      return res.status(503).json({ error: "Unable to verify your session. Please try again shortly." });
    }
  };
}
module.exports = { startLoginChallenge, issueSession, finishOtpSession, revokeSession, loadSession };
