const express = require("express");
const router = express.Router();
const pool = require("../db");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const otpStore = require("../utils/otpStore");
const { getOrCreateDeviceId } = require("../utils/deviceId");

const geoip = require("geoip-lite");
console.log(geoip.lookup("8.8.8.8"));

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress;
}

async function getLocation(ip) {
  const cleanIp = ip?.replace("::ffff:", "");
  if (!cleanIp) return "Unknown";

  const geo = geoip.lookup(cleanIp);
  if (geo) return `${geo.city || "Unknown city"}, ${geo.country}`;

  // fallback: free, no API key required, generous rate limit
  try {
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,city,country`);
    const data = await res.json();
    if (data.status === "success") {
      return `${data.city || "Unknown city"}, ${data.country}`;
    }
  } catch (err) {
    console.error("Fallback geolocation failed:", err);
  }

  return "Unknown";
}

async function logLogin(user, req) {
  const ip = getClientIp(req);
  const location = await getLocation(ip); // now async
  try {
    await pool.query(
      `INSERT INTO users_activity_log (action, item_name, performed_by, changes, location, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      ["Login", user.name, user.name, null, location, ip]
    );
  } catch (err) {
    console.error("Failed to log login activity:", err);
  }
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const deviceId = getOrCreateDeviceId(req, res);
  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const validPass = password === user.rows[0].password;
    if (!validPass)
      return res.status(401).json({ message: "Invalid credentials" });

    const isWeb = req.headers["x-client"] === "web";
    const mobileBlockedRoles = ["Super Admin", "Franchisee Operations Admin", "Sales Admin", "Staff"];
    if (!isWeb && mobileBlockedRoles.includes(user.rows[0].role))
      return res.status(403).json({ message: "Invalid credentials" });

    const safeUser = {
      id:     user.rows[0].id,
      name:   user.rows[0].name,
      email:  user.rows[0].email,
      role:   user.rows[0].role,
      branch: user.rows[0].branch,
      brand:  user.rows[0].brand,
    };

    const device = await pool.query(
      `SELECT * FROM trusted_devices WHERE device_id=$1 AND user_id=$2 AND expires_at > NOW()`,
      [deviceId, user.rows[0].id]
    );

    if (device.rows.length > 0) {
      console.log(`Trusted device for ${email} — skipping OTP`);
      await logLogin(safeUser, req);
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
        </div>`
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify-otp-login", async (req, res) => {
  const { email, otp, trustDevice } = req.body;
  try {
    if (!otpStore[email])
      return res.status(401).json({ message: "No OTP found for this email" });

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res.status(401).json({ message: "OTP has expired. Please request a new one." });
    }
    if (storedOtp.code !== otp)
      return res.status(401).json({ message: "Invalid OTP" });

    delete otpStore[email];

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const safeUser = {
      id:     user.rows[0].id,
      name:   user.rows[0].name,
      email:  user.rows[0].email,
      role:   user.rows[0].role,
      branch: user.rows[0].branch,
      brand:  user.rows[0].brand,
    };

    const deviceId = getOrCreateDeviceId(req, res);

    if (trustDevice) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      try {
        await pool.query(
          `INSERT INTO trusted_devices (device_id, user_id, expires_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (device_id, user_id) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
          [deviceId, user.rows[0].id, expiresAt]
        );
      } catch (dbErr) {
        console.error("INSERT failed:", dbErr.code, dbErr.message);
      }
    }

    await logLogin(safeUser, req);
    return res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

router.post("/logout", async (req, res) => {
  try {
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
    const result = await pool.query("SELECT password FROM users WHERE id=$1", [userId]);
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

router.post("/api/send-otp", async (req, res) => {
  const { mobile, otp } = req.body;
  let formattedMobile = mobile.replace(/\D/g, "");
  if (formattedMobile.startsWith("0"))
    formattedMobile = "63" + formattedMobile.substring(1);

  try {
    const response = await fetch("https://dashboard.philsms.com/api/v3/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PHILSMS_TOKEN.trim()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipient: formattedMobile,
        sender_id: process.env.PHILSMS_SENDER_ID,
        message: `Your franchise application OTP is ${otp}. Valid for 5 minutes.`,
      }),
    });

    const rawText = await response.text();

    if (response.ok) {
      const data = JSON.parse(rawText);
      return res.json({ success: true, data });
    } else {
      let errorMessage = rawText;
      try {
        errorMessage = JSON.parse(rawText).message || rawText;
      } catch (e) {}
      return res.status(response.status).json({ success: false, error: errorMessage });
    }
  } catch (err) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/verify-sms-otp", async (req, res) => {
  const { email, otp } = req.body;
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

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const safeUser = {
      id:     user.rows[0].id,
      name:   user.rows[0].name,
      email:  user.rows[0].email,
      role:   user.rows[0].role,
      branch: user.rows[0].branch,
      brand:  user.rows[0].brand,
    };

    await logLogin(safeUser, req);
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
      "SELECT contact_number FROM users WHERE email=$1", [email.trim()]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "No account found with this email." });
    if (!result.rows[0].contact_number)
      return res.status(404).json({ message: "No phone number found for this account." });

    let mobile = result.rows[0].contact_number.toString().replace(/\D/g, "");
    if (mobile.startsWith("0")) mobile = "63" + mobile.substring(1);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email.trim()] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };

    const response = await fetch("https://dashboard.philsms.com/api/v3/sms/send", {
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
    });

    const rawText = await response.text();
    if (response.ok) {
      const masked = "*".repeat(mobile.length - 4) + mobile.slice(-4);
      return res.json({ success: true, maskedPhone: masked });
    } else {
      let errorMessage = rawText;
      try { errorMessage = JSON.parse(rawText).message || rawText; } catch {}
      return res.status(response.status).json({ success: false, message: errorMessage });
    }
  } catch (err) {
    console.error("send-login-sms-otp error:", err);
    return res.status(500).json({ message: "Failed to send SMS OTP. Please try again." });
  }
});

router.post("/get-contact-number", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query(
      "SELECT contact_number FROM users WHERE email=$1", [email.trim()]
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
        </div>`
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
      return res.status(401).json({ error: "No OTP found. Please request a new one." });

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res.status(401).json({ error: "OTP has expired." });
    }
    if (storedOtp.code !== otp)
      return res.status(401).json({ error: "Invalid OTP" });

    delete otpStore[email];

    const result = await pool.query("SELECT password FROM users WHERE id=$1", [userId]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    if (result.rows[0].password !== currentPassword)
      return res.status(400).json({ error: "Current password is incorrect" });

    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [newPassword, userId]);

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await pool.query(
      `INSERT INTO trusted_devices (user_id, device_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, device_id) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [userId, deviceId, expires]
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
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
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
        </div>`
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending password reset OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const deviceId = getOrCreateDeviceId(req, res);
  try {
    if (!otpStore[email])
      return res.status(401).json({ message: "No OTP found. Please request a new one." });

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res.status(401).json({ message: "OTP has expired." });
    }
    if (storedOtp.code !== otp)
      return res.status(401).json({ message: "Invalid OTP" });

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) {
      delete otpStore[email];
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.rows[0].id;
    await pool.query("UPDATE users SET password=$1 WHERE email=$2", [newPassword, email]);
    delete otpStore[email];

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    await pool.query(
      `INSERT INTO trusted_devices (user_id, device_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, device_id) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [userId, deviceId, expires]
    );

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

module.exports = router;