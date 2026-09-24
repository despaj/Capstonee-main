const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;

const REFRESH_TOKEN_DAYS = 30;
const REFRESH_TOKEN_MAX_AGE_MS = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

function signAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      branch: user.branch,
      brand: user.brand,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateRefreshToken() {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

  return {
    token,
    tokenHash,
    expiresAt,
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie("access_token", accessToken, {
    ...COOKIE_OPTS,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });

  res.cookie("refresh_token", refreshToken, {
    ...COOKIE_OPTS,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

function clearAuthCookies(res) {
  res.clearCookie("access_token", COOKIE_OPTS);
  res.clearCookie("refresh_token", COOKIE_OPTS);
}

module.exports = {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_TOKEN_DAYS,
};
