const express = require("express");
const router = express.Router();
const pool = require("../db");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const otpStore = require("../utils/otpStore");
const { getOrCreateDeviceId } = require("../utils/deviceId");

const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");

const crypto = require("crypto");
const resetTokenStore = require("../utils/resetTokenStore");

const { authenticate } = require("../middleware/auth");
const {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
} = require("../utils/jwt");

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress;
}

function getDeviceLabel(req) {
  const ua = req.headers["user-agent"] || "";
  const parser = new UAParser(ua);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return `${browser.name || "Unknown browser"} on ${os.name || "Unknown OS"}`;
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "iFranchise/1.0 (contact@franchisync.business)",
        },
      },
    );
    const data = await res.json();
    if (data?.address) {
      const a = data.address;
      const city =
        a.city || a.town || a.municipality || a.village || "Unknown city";
      const province = a.state || a.region || "";
      return province ? `${city}, ${province}` : city;
    }
  } catch (err) {
    console.error("Reverse geocode failed:", err);
  }
  return null;
}

async function getLocation(ip, latitude, longitude) {
  if (latitude && longitude) {
    const preciseLocation = await reverseGeocode(latitude, longitude);
    if (preciseLocation) return preciseLocation;
  }

  const cleanIp = ip?.replace("::ffff:", "");
  if (!cleanIp) return "Unknown";

  const geo = geoip.lookup(cleanIp);
  if (geo) return `${geo.city || "Unknown city"}, ${geo.country}`;

  try {
    const res = await fetch(`https://ipwho.is/${cleanIp}`);
    const text = await res.text();
    if (!text) return "Unknown";
    const data = JSON.parse(text);
    if (data.success) return `${data.city || "Unknown city"}, ${data.country}`;
  } catch (err) {
    console.error("Fallback geolocation failed:", err);
  }

  return "Unknown";
}

async function logLogin(user, req, latitude, longitude) {
  const ip = getClientIp(req);
  const location = await getLocation(ip, latitude, longitude);
  const device = getDeviceLabel(req);
  console.log("[DEBUG] device label:", device);
  try {
    await pool.query(
      `INSERT INTO users_activity_log (action, item_name, branch, performed_by, role, changes, location, ip_address, device, module)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        "Login",
        user.name,
        user.branch || null,
        user.name,
        user.role || null,
        null,
        location,
        ip,
        device,
        "User Management",
      ],
    );
    console.log("[DEBUG] login activity insert succeeded");
  } catch (err) {
    console.error("Failed to log login activity:", err);
  }
}

async function issueSession(res, user, deviceId) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, device_id, expires_at) VALUES ($1,$2,$3,$4)`,
    [user.id, tokenHash, deviceId, expiresAt],
  );

  setAuthCookies(res, accessToken, refreshToken);
}

router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      branch: req.user.branch,
      brand: req.user.brand,
    });
  } catch (error) {
    console.error("GET /me error:", error);

    res.status(500).json({
      message: "Failed to load current user",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, latitude, longitude } = req.body;
  const deviceId = getOrCreateDeviceId(req, res);
  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const validPass = password === user.rows[0].password;
    if (!validPass)
      return res.status(401).json({ message: "Invalid credentials" });

    const isWeb = req.headers["x-client"] === "web";
    const mobileBlockedRoles = [
      "Super Admin",
      "Franchisee Operations Admin",
      "Sales Admin",
      "Staff",
    ];
    if (!isWeb && mobileBlockedRoles.includes(user.rows[0].role))
      return res.status(403).json({ message: "Invalid credentials" });

    const safeUser = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      role: user.rows[0].role,
      branch: user.rows[0].branch,
      brand: user.rows[0].brand,
    };

    const device = await pool.query(
      `SELECT * FROM trusted_devices WHERE device_id=$1 AND user_id=$2 AND expires_at > NOW()`,
      [deviceId, user.rows[0].id],
    );
    // temp accs skip otp
    if (device.rows.length > 0 || user.rows[0].skip_otp) {
      console.log(
        `Trusted device or OTP-exempt account for ${email} — skipping OTP`,
      );
      await logLogin(safeUser, req, latitude, longitude);
      await issueSession(res, safeUser, deviceId);
      return res.json({ success: true, skipOtp: true, user: safeUser });
    }

    return res.json({ success: true, skipOtp: false, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/send-otp-after-login", async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[DEBUG] OTP for ${email} (login):`, otp);
    otpStore[email] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };

    await resend.emails.send({
      from: "Franchisync <noreply@franchisync.business>",
      to: email,
      subject: "Your FranchiSync Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Login Verification</h2>
          <p>Your one-time password is:</p>
          <h1 style="background: #E8F5E9; padding: 15px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666;">This code will expire in 3 minutes.</p>
        </div>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify-otp-login", async (req, res) => {
  const { email, otp, trustDevice, latitude, longitude, purpose } = req.body;
  try {
    if (!otpStore[email])
      return res.status(401).json({ message: "No OTP found for this email" });

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res
        .status(401)
        .json({ message: "OTP has expired. Please request a new one." });
    }
    if (storedOtp.code !== otp)
      return res.status(401).json({ message: "Invalid OTP" });

    delete otpStore[email];

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const safeUser = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      role: user.rows[0].role,
      branch: user.rows[0].branch,
      brand: user.rows[0].brand,
    };

    // ── Password reset flow: issue a short-lived reset token instead of logging in ──
    if (purpose === "reset") {
      const token = crypto.randomBytes(32).toString("hex");
      resetTokenStore[email] = { token, expires: Date.now() + 10 * 60 * 1000 }; // 10 min
      return res.json({ success: true, resetToken: token });
    }

    // ── Normal login flow (unchanged) ──
    const deviceId = getOrCreateDeviceId(req, res);

    if (trustDevice) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      try {
        await pool.query(
          `INSERT INTO trusted_devices (device_id, user_id, expires_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (device_id, user_id) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
          [deviceId, user.rows[0].id, expiresAt],
        );
      } catch (dbErr) {
        console.error("INSERT failed:", dbErr.code, dbErr.message);
      }
    }

    await logLogin(safeUser, req, latitude, longitude);
    await issueSession(res, safeUser, deviceId);
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

router.get("/session", authenticate, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, name, email, role, branch, brand FROM users WHERE id=$1",
      [req.user.id],
    );
    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user: user.rows[0] });
  } catch (err) {
    console.error("GET /session error:", err);
    res.status(500).json({ message: "Failed to load session" });
  }
});

router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  try {
    const tokenHash = hashToken(refreshToken);
    const stored = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token_hash=$1 AND revoked_at IS NULL AND expires_at > NOW()`,
      [tokenHash],
    );
    if (stored.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid or expired session",
      });
    }

    const row = stored.rows[0];
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [
      row.user_id,
    ]);
    if (user.rows.length === 0) {
      clearAuthCookies(res);
      return res.status(404).json({ message: "User not found" });
    }

    await pool.query("UPDATE refresh_tokens SET revoked_at=NOW() WHERE id=$1", [
      row.id,
    ]);

    const safeUser = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      role: user.rows[0].role,
      branch: user.rows[0].branch,
      brand: user.rows[0].brand,
    };
    await issueSession(res, safeUser, row.device_id);

    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Failed to refresh session" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await pool.query(
        "UPDATE refresh_tokens SET revoked_at=NOW() WHERE token_hash=$1",
        [hashToken(refreshToken)],
      );
    }
    clearAuthCookies(res);
    res.clearCookie("device_id", { httpOnly: true, sameSite: "lax" });
    res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

router.post("/auth/verify-password", async (req, res) => {
  try {
    const { userId, password } = req.body;
    const result = await pool.query("SELECT password FROM users WHERE id=$1", [
      userId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    if (result.rows[0].password !== password)
      return res.status(401).json({ error: "Incorrect password" });
    res.json({ success: true });
  } catch (err) {
    console.error("POST /auth/verify-password error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/verify-sms-otp", async (req, res) => {
  const { email, otp, latitude, longitude, purpose } = req.body;
  try {
    if (!otpStore[email])
      return res.status(401).json({ message: "No OTP found for this email" });

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res.status(401).json({ message: "OTP has expired." });
    }
    if (storedOtp.code !== otp)
      return res.status(401).json({ message: "Invalid OTP" });

    delete otpStore[email];

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const safeUser = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      role: user.rows[0].role,
      branch: user.rows[0].branch,
      brand: user.rows[0].brand,
    };

    if (purpose === "reset") {
      const token = crypto.randomBytes(32).toString("hex");
      resetTokenStore[email] = { token, expires: Date.now() + 10 * 60 * 1000 };
      return res.json({ success: true, resetToken: token });
    }

    const deviceId = getOrCreateDeviceId(req, res);
    await logLogin(safeUser, req, latitude, longitude);
    await issueSession(res, safeUser, deviceId);
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("SMS OTP verification error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

router.post("/send-login-sms-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query(
      "SELECT contact_number FROM users WHERE email=$1",
      [email.trim()],
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    if (!result.rows[0].contact_number)
      return res
        .status(404)
        .json({ message: "No phone number found for this account." });

    let mobile = result.rows[0].contact_number.toString().replace(/\D/g, "");
    if (mobile.startsWith("0")) mobile = "63" + mobile.substring(1);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.trim()] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };

    const response = await fetch(
      "https://dashboard.philsms.com/api/v3/sms/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PHILSMS_TOKEN.trim()}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          recipient: mobile,
          sender_id: process.env.PHILSMS_SENDER_ID,
          message: `Your iFranchise login OTP is: ${otp}. Valid for 3 minutes. Do not share this with anyone.`,
        }),
      },
    );

    const rawText = await response.text();
    if (response.ok) {
      const masked = "*".repeat(mobile.length - 4) + mobile.slice(-4);
      return res.json({ success: true, maskedPhone: masked });
    } else {
      let errorMessage = rawText;
      try {
        errorMessage = JSON.parse(rawText).message || rawText;
      } catch {}
      return res
        .status(response.status)
        .json({ success: false, message: errorMessage });
    }
  } catch (err) {
    console.error("send-login-sms-otp error:", err);
    return res
      .status(500)
      .json({ message: "Failed to send SMS OTP. Please try again." });
  }
});

router.post("/get-contact-number", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query(
      "SELECT contact_number FROM users WHERE email=$1",
      [email.trim()],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ contact_number: result.rows[0].contact_number });
  } catch (err) {
    console.error("get-contact-number error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/send-otp-password-change", async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };

    await resend.emails.send({
      from: "Franchisync <noreply@franchisync.business>",
      to: email,
      subject: "OTP for Password Change",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Password Change Request</h2>
          <p>Your one-time password is:</p>
          <h1 style="background: #E8F5E9; padding: 15px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666;">This code will expire in 3 minutes.</p>
        </div>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending password change OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.put("/users/:id/password", async (req, res) => {
  const deviceId = getOrCreateDeviceId(req, res);
  try {
    const { currentPassword, newPassword, email, otp } = req.body;
    const userId = req.params.id;

    if (!otpStore[email])
      return res
        .status(401)
        .json({ error: "No OTP found. Please request a new one." });

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res.status(401).json({ error: "OTP has expired." });
    }
    if (storedOtp.code !== otp)
      return res.status(401).json({ error: "Invalid OTP" });

    delete otpStore[email];

    const result = await pool.query("SELECT password FROM users WHERE id=$1", [
      userId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    if (result.rows[0].password !== currentPassword)
      return res.status(400).json({ error: "Current password is incorrect" });

    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [
      newPassword,
      userId,
    ]);

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await pool.query(
      `INSERT INTO trusted_devices (user_id, device_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, device_id) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [userId, deviceId, expires],
    );

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Server error while changing password" });
  }
});

router.post("/send-forgot-password-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };

    await resend.emails.send({
      from: "Franchisync <noreply@franchisync.business>",
      to: email,
      subject: "Password Reset OTP - FranchiSync",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Password Reset Request</h2>
          <p>Your one-time password is:</p>
          <h1 style="background: #E8F5E9; padding: 15px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666;">This code will expire in 3 minutes.</p>
        </div>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending password reset OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, newPassword, resetToken } = req.body;
  const deviceId = getOrCreateDeviceId(req, res);
  try {
    const stored = resetTokenStore[email];
    if (!stored)
      return res
        .status(401)
        .json({ message: "No reset request found. Please verify OTP again." });

    if (Date.now() > stored.expires) {
      delete resetTokenStore[email];
      return res
        .status(401)
        .json({ message: "Reset session expired. Please verify OTP again." });
    }

    if (stored.token !== resetToken)
      return res
        .status(401)
        .json({ message: "Invalid reset session. Please verify OTP again." });

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user.rows.length === 0) {
      delete resetTokenStore[email];
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword === user.rows[0].password) {
      return res.status(400).json({
        message: "New password must be different from your current password",
      });
    }

    delete resetTokenStore[email];

    const userId = user.rows[0].id;
    await pool.query("UPDATE users SET password=$1 WHERE email=$2", [
      newPassword,
      email,
    ]);

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await pool.query(
      `INSERT INTO trusted_devices (user_id, device_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, device_id) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [userId, deviceId, expires],
    );

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;
