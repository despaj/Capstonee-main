require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const mindee = require("mindee");
const mindeeClient = new mindee.Client({ apiKey: process.env.MINDEE_API_KEY });
const { Resend } = require("resend");
const path = require("path");
const os   = require("os");

const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000",  "https://www.franchisync.xyz",   "https://franchisync.xyz", "https://franchisync.vercel.app", "http://localhost:8081", "http://192.168.1.194:8081"],
  allowedHeaders: ["Content-Type", "X-Client"],
  credentials: true
}));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

setInterval(async () => {
  await pool.query(`DELETE FROM reports WHERE expires_at < NOW() AND status = 'submitted'`);
  console.log('Cleaned up expired reports');
}, 24 * 60 * 60 * 1000);

const otpStore = {};

async function sendPushNotification(expoPushToken, title, body) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: expoPushToken, title, body, sound: 'default' }),
  });
}

function getOrCreateDeviceId(req, res) {
  let deviceId = req.cookies?.device_id;
  if (!deviceId) {
    deviceId = uuidv4();
    res.cookie("device_id", deviceId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
    console.log(`New device_id created: ${deviceId}`);
  }
  return deviceId;
}

const rowToApplication = (row) => ({
  id:               row.id,
  name:             row.name,
  email:            row.email,
  phone:            row.phone,
  franchise:        row.franchise,
  status:           row.status,
  date:             row.date,
  address:          row.address,
  dob:              row.dob,
  civilStatus:      row.civil_status,
  spouseName:       row.spouse_name,
  spouseOccupation: row.spouse_occupation,
  spouseDob:        row.spouse_dob,
  dependents:       row.dependents,
  telephone:        row.telephone,
  tin:              row.tin,
  education:        row.education ? (typeof row.education === "string" ? JSON.parse(row.education) : row.education) : [],
  // iPharma-specific
  involvement:      row.involvement,
  equity:           row.equity,
  investment:       row.investment,
  fundSource:       row.fund_source,
  otherBusiness:    row.other_business,
  location:         row.location,
  familyDepend:     row.family_depend,
  marketArea:       row.market_area,
  startDate:        row.start_date,
  dateSigned:       row.date_signed,
  // Regular application fields
  paymentMode:      row.payment_mode,
  gender:           row.gender,
  nationality:      row.nationality,
  employmentType:   row.employment_type,
  yearsEmployer:    row.years_employer,
  income:           row.income,
  employerName:     row.employer_name,
  businessAddress:  row.business_address,
  position:         row.position,
  businessNature:   row.business_nature,
  // Documents
  idType:           row.id_type,
  idImage:          row.id_image,
  letterOfIntent:   row.letter_of_intent,
});

// ─── AUTH ───────────────────────────────────────────────────

app.post("/login", async (req, res) => {
    console.log("ALL HEADERS:", JSON.stringify(req.headers));
  console.log("x-client header:", req.headers["x-client"]);
  const { email, password } = req.body;
  const deviceId = getOrCreateDeviceId(req, res);

  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    console.log("User found:", user.rows.length);
    console.log("Email received:", JSON.stringify(email));

    if (user.rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    console.log("DB password:", JSON.stringify(user.rows[0].password));
    console.log("Input password:", JSON.stringify(password));
    console.log("Match:", password === user.rows[0].password);

    const validPass = password === user.rows[0].password;
if (!validPass)
  return res.status(401).json({ message: "Invalid credentials" });

// Block Administrator accounts from mobile (no X-Client: web header)
const isWeb = req.headers["x-client"] === "web";
const mobileBlockedRoles = ["Administrator", "Staff"];
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
      `SELECT * FROM trusted_devices
       WHERE device_id = $1 AND user_id = $2 AND expires_at > NOW()`,
      [deviceId, user.rows[0].id]
    );

    if (device.rows.length > 0) {
      console.log(`Trusted device for user ${email} — skipping OTP`);
      return res.json({ success: true, skipOtp: true, user: safeUser });
    }

    console.log(`OTP required for user ${email}`);
    res.json({ success: true, skipOtp: false, user: safeUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/send-otp-after-login", async (req, res) => {
  console.log("1. Route hit");
  const { email } = req.body;
  console.log("2. Email received:", email);

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("3. OTP generated:", otp);

    otpStore[email] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };
    console.log("4. OTP stored");

    console.log("5. Attempting to send email...");
    await resend.emails.send({
      from: "Franchisync <otp@noreply.franchisync.xyz>",
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

    console.log("6. Email sent successfully to:", email);
    res.json({ success: true });
  } catch (err) {
    console.error("7. Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.post("/verify-otp-login", async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!otpStore[email])
      return res.status(401).json({ message: "N o OTP found for this email" });

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

    // No trusted device logic needed — session is managed client-side
    const safeUser = {
      id:     user.rows[0].id,
      name:   user.rows[0].name,
      email:  user.rows[0].email,
      role:   user.rows[0].role,
      branch: user.rows[0].branch,
      brand:  user.rows[0].brand,
    };

    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

app.post("/logout", async (req, res) => {
  const deviceId = req.cookies?.device_id;
  const { userId } = req.body;

  try {
    if (deviceId && userId) {
      await pool.query(
        "DELETE FROM trusted_devices WHERE device_id=$1 AND user_id=$2",
        [deviceId, userId]
      );
      console.log(`Trust revoked for user ${userId} on device ${deviceId}`);
    }

     res.clearCookie("device_id", {
      httpOnly: true,
      sameSite: "lax",
    });

    res.clearCookie("device_id", { httpOnly: true, sameSite: "lax" });
    res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

app.post("/auth/verify-password", async (req, res) => {
  try {
    const { userId, password } = req.body;
    const result = await pool.query(
      "SELECT password FROM users WHERE id=$1", [userId]
    );
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

app.post("/api/send-otp", async (req, res) => {
  const { mobile, otp } = req.body;

  let formattedMobile = mobile.replace(/\D/g, ''); 
  if (formattedMobile.startsWith('0')) {
    formattedMobile = '63' + formattedMobile.substring(1);
  }

  try {
    const response = await fetch("https://dashboard.philsms.com/api/v3/sms/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PHILSMS_TOKEN.trim()}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        recipient: formattedMobile,
        sender_id: process.env.PHILSMS_SENDER_ID,
        message: `Your franchise application OTP is ${otp}. Valid for 5 minutes.`,
      }),
    });

    const rawText = await response.text(); 

    if (response.ok) {
      console.log("✅ PhilSMS Success:", rawText);
      const data = JSON.parse(rawText);
      return res.json({ success: true, data });
    } else {
      console.error(`❌ PhilSMS Error [Status: ${response.status}]:`, rawText);
      
      let errorMessage = rawText;
      try { 
        const errorJson = JSON.parse(rawText);
        errorMessage = errorJson.message || rawText;
      } catch (e) { /* Not JSON */ }

      return res.status(response.status).json({ 
        success: false, 
        error: errorMessage 
      });
    }

    // Check if the response is actually JSON
    if (response.headers.get("content-type")?.includes("application/json")) {
      const data = JSON.parse(rawText);
      if (response.ok) {
        return res.json({ success: true, data });
      } else {
        return res.status(response.status).json({ success: false, error: data.message });
      }
    } else {
      // If we got HTML, it's likely a 401 Unauthorized or 404 Not Found
      console.error("PhilSMS returned non-JSON response:", rawText);
      return res.status(500).json({ success: false, error: "Authentication failed or invalid endpoint." });
    }

  } catch (err) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.post("/send-login-sms-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      "SELECT contact_number FROM users WHERE email=$1",
      [email.trim()]
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
        "Authorization": `Bearer ${process.env.PHILSMS_TOKEN.trim()}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        recipient: mobile,
        sender_id: process.env.PHILSMS_SENDER_ID,
        message: `Your iFranchise login OTP is: ${otp}. Valid for 3 minutes. Do not share this with anyone.`,
      }),
    });

    const rawText = await response.text();
    console.log("PhilSMS response:", rawText);

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

app.post("/get-contact-number", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.query("SELECT contact_number FROM users WHERE email = ?", [email]);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ contact_number: user.contact_number });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── USERS ──────────────────────────────────────────────────

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, brand, branch, age, address, contact_number, saved_address FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { name, email, role, branch, password } = req.body;
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, branch) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, email, password, role, branch]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("POST /users error:", err);
    if (err.code === "23505")
      return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: "Failed to add user" });
  }
});

app.patch("/users/:id/saved-address", async (req, res) => {
  try {
    const { id } = req.params;
    const { savedAddress } = req.body;
    const result = await pool.query(
      `UPDATE users SET saved_address=$1 WHERE id=$2 RETURNING *`,
      [savedAddress, id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("PATCH saved-address error:", err);
    res.status(500).json({ error: "Failed to save address" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, branch, password } = req.body;

    let query, params;
    if (password) {
      const bcrypt = require('bcrypt');
      const hashed = await bcrypt.hash(password, 10);
      query = `UPDATE users SET name=$1, email=$2, role=$3, branch=$4, password=$5 WHERE id=$6 RETURNING *`;
      params = [name, email, role, branch, hashed, id];
    } else {
      query = `UPDATE users SET name=$1, email=$2, role=$3, branch=$4 WHERE id=$5 RETURNING *`;
      params = [name, email, role, branch, id];
    }

    const result = await pool.query(query, params);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("PUT /users/:id error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("UPDATE announcements SET created_by=NULL WHERE created_by=$1", [id]);

    // Then delete the user
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("DELETE /users/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/users/:id/push-token', async (req, res) => {
  const { token } = req.body;
  await pool.query('UPDATE users SET push_token=$1 WHERE id=$2', [token, req.params.id]);
  res.json({ success: true });
});

// ─── PROFILE (api/users) ─────────────────────────────────────

app.get("/api/users/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, branch, age, address, contact_number, saved_address FROM users WHERE id=$1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const row = result.rows[0];
    const nameParts = (row.name || "").split(" ");
    res.json({
      id:            row.id,
      firstName:     nameParts[0] || "",
      lastName:      nameParts.slice(1).join(" ") || "",
      middleInitial: "",
      email:         row.email,
      role:          row.role,
      branch:        row.branch,
      contactNumber: row.contact_number || "",
      address:       row.address || "",
      savedAddress:  row.saved_address || "",   // ← ADD
      age:           row.age || "",
    });
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, age, address, contactNumber, savedAddress, newPassword } = req.body; // ← ADD savedAddress

    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    let query, params;
    if (newPassword) {
      query = `UPDATE users SET name=$1, email=$2, password=$3, age=$4, address=$5, contact_number=$6, saved_address=$7 WHERE id=$8 RETURNING *`;
      params = [fullName, email, newPassword, age || null, address || null, contactNumber || null, savedAddress || null, req.params.id];
    } else {
      query = `UPDATE users SET name=$1, email=$2, age=$3, address=$4, contact_number=$5, saved_address=$6 WHERE id=$7 RETURNING *`;
      params = [fullName, email, age || null, address || null, contactNumber || null, savedAddress || null, req.params.id];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const row = result.rows[0];
    const nameParts = (row.name || "").split(" ");
    res.json({
      user: {
        id:            row.id,
        firstName:     nameParts[0] || "",
        lastName:      nameParts.slice(1).join(" ") || "",
        middleInitial: "",
        email:         row.email,
        role:          row.role,
        branch:        row.branch,
        contactNumber: row.contact_number || "",
        address:       row.address || "",
        savedAddress:  row.saved_address || "",   // ← ADD
        age:           row.age || "",
      }
    });
  } catch (err) {
    console.error("PUT /api/users/:id error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ─── PASSWORD ───────────────────────────────────────────────

app.post("/send-otp-password-change", async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };

    await resend.emails.send({
      from: "Franchisync <otp@noreply.franchisync.xyz>",
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

    console.log(`Password change OTP sent to ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending password change OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.put("/users/:id/password", async (req, res) => {
  const deviceId = getOrCreateDeviceId(req, res);

  try {
    const { currentPassword, newPassword, email, otp } = req.body;
    const userId = req.params.id;

    if (!otpStore[email])
      return res.status(401).json({ error: "No OTP found. Please request a new one." });

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res.status(401).json({ error: "OTP has expired. Please request a new one." });
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
       ON CONFLICT (user_id, device_id)
       DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [userId, deviceId, expires]
    );

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ error: "Server error while changing password" });
  }
});

app.post("/send-forgot-password-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };

    await resend.emails.send({
      from: "Franchisync <otp@noreply.franchisync.xyz>",
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

    console.log(`Password reset OTP sent to ${email}: ${otp}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending password reset OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const deviceId = getOrCreateDeviceId(req, res);

  try {
    if (!otpStore[email])
      return res.status(401).json({ message: "No OTP found. Please request a new one." });

    const storedOtp = otpStore[email];
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res.status(401).json({ message: "OTP has expired. Please request a new one." });
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
       ON CONFLICT (user_id, device_id)
       DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [userId, deviceId, expires]
    );

    console.log(`Password reset for ${email} — device trusted for 30 days`);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// ─── EMAIL / CREDENTIALS ─────────────────────────────────────

app.post("/send-credentials", async (req, res) => {
  console.log("send-credentials body:", req.body);
  const { to, name, password } = req.body;
  console.log("to:", to, "name:", name, "password:", password);
  try {
    const result = await resend.emails.send({
      from: "Franchisync <acc@noreply.franchisync.xyz>",
      to: to,
      subject: "Your Franchisync Account Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Welcome, ${name}!</h2>
          <p>Your account has been created. Here are your login credentials:</p>
          <div style="background: #E8F5E9; padding: 15px; margin: 15px 0;">
            <p><strong>Email:</strong> ${to}</p>
            <p><strong>Temporary Password:</strong> <span style="letter-spacing: 2px;">${password}</span></p>
          </div>
          <p style="color: #e74c3c;">Please log in and change your password immediately.</p>
          <p>Log in your account at <a href="https://franchisync.xyz" style="color: #2E7D32; font-weight: bold;">franchisync.xyz</a></p>
        </div>
      `,
    });
    console.log("Resend result:", result);
    res.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send credentials email" });
  }
});

// ─── APPLICATIONS ────────────────────────────────────────────

app.post("/check-duplicate", async (req, res) => {
  const { email, mobile } = req.body;
  try {
    const result = await pool.query(
      `SELECT id FROM applications WHERE email = $1 OR phone = $2
       UNION
       SELECT id FROM ipharma_applications WHERE email = $1 OR phone = $2
       LIMIT 1`,
      [email, mobile]
    );
    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error("Duplicate check error:", err);
    res.status(500).json({ exists: false });
  }
});

app.get("/applications", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        'ip-' || id::text AS id,
        name, email, phone, 'iPharma Mart' AS franchise,
        status, date, address, dob, civil_status,
        spouse_name, spouse_occupation, spouse_dob, dependents,
        telephone, tin, education,
        involvement, equity, investment, fund_source,
        other_business, location, family_depend, market_area, start_date,
        date_signed,
        NULL AS payment_mode, NULL AS gender, NULL AS nationality,
        NULL AS employment_type, NULL AS years_employer, NULL AS income,
        NULL AS employer_name, NULL AS business_address,
        NULL AS position, NULL AS business_nature,
        id_type, id_image, letter_of_intent,
        created_at
      FROM ipharma_applications

      UNION ALL

      SELECT
        id::text AS id,
        name, email, phone, franchise,
        status, date, address, dob, civil_status,
        spouse_name, spouse_occupation, NULL AS spouse_dob, dependents,
        NULL AS telephone, NULL AS tin, NULL AS education,
        NULL AS involvement, NULL AS equity, NULL AS investment, NULL AS fund_source,
        NULL AS other_business, NULL AS location, NULL AS family_depend, NULL AS market_area, NULL AS start_date,
        date_signed,
        payment_mode, gender, nationality,
        employment_type, years_employer, income,
        employer_name, business_address,
        position, business_nature,
        id_type, id_image, letter_of_intent,
        created_at
      FROM applications

      ORDER BY created_at DESC
    `);

    const apps = result.rows.map(rowToApplication);
    res.json(apps);
  } catch (err) {
    console.error("Failed to fetch applications:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

app.get("/applications/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM applications WHERE id=$1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Application not found" });
    res.json(rowToApplication(result.rows[0]));
  } catch (err) {
    console.error("Error fetching application:", err);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

app.post("/applications", async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `INSERT INTO applications (
        name, email, phone, franchise, payment_mode, status, date,
        dob, civil_status, gender, nationality, address, dependents,
        spouse_name, spouse_occupation,
        employment_type, years_employer, income,
        employer_name, business_address, position, business_nature,
        signature, date_signed, id_type, id_image, letter_of_intent
      ) VALUES (
        $1,$2,$3,$4,$5,'pending',CURRENT_DATE,
        $6,$7,$8,$9,$10,$11,
        $12,$13,
        $14,$15,$16,
        $17,$18,$19,$20,
        $21,$22,$23,$24,$25
      ) RETURNING *`,
      [
        b.name, b.email, b.phone, b.franchise, b.paymentMode,
        b.dob || null, b.civilStatus, b.gender, b.nationality, b.address,
        b.dependents ? parseInt(b.dependents) : null,
        b.spouseName || null, b.spouseOccupation || null,
        b.employmentType, b.yearsEmployer ? parseInt(b.yearsEmployer) : null,
        b.income ? parseFloat(b.income) : null,
        b.employerName, b.businessAddress, b.position, b.businessNature,
        b.signature || null, b.dateSigned || null,
        b.idType || null, b.idImage || null, b.letterOfIntent || null,
      ]
    );
    const app = rowToApplication(result.rows[0]);
    res.json({ 
      success: true, 
      id: app.id,  // ← add this
      message: "Application submitted successfully", 
      application: app 
    });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ success: false, error: "Failed to submit application" });
  }
});

app.post("/ipharma-applications", async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `INSERT INTO ipharma_applications (
        name, email, phone, telephone, status, date,
        address, dob, civil_status, spouse_name, spouse_occupation, spouse_dob,
        dependents, tin, education, involvement, equity, investment, fund_source,
        other_business, location, family_depend, market_area, start_date,
        signature, date_signed, id_type, id_image, letter_of_intent
      ) VALUES (
        $1,$2,$3,$4,'pending',$5,
        $6,$7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,
        $24,$25,$26,$27, $28
      ) RETURNING *`,
      [
        b.name, b.email, b.phone, b.telephone || null,        // $1-$4
        b.date || new Date().toISOString().split("T")[0],     // $5
        b.address,                                            // $6
        b.dob || null, b.maritalStatus, b.spouseName || null, // $7-$9
        b.spouseOccupation || null, b.spouseDob || null,      // $10-$11
        b.dependents ? parseInt(b.dependents) : null,         // $12
        b.tin || null,                                        // $13
        b.education ? JSON.stringify(b.education) : null,     // $14
        b.involvement || null, b.equity || null,            
        b.investment ? parseFloat(b.investment) : null,  
        b.fundSource || null,                          
        b.otherBusiness || null, b.location || null,    
        b.familyDepend || null, b.marketArea || null,    
        b.startDate || null,                                
        b.signature || null, b.dateSigned || null,        
        b.idType || null,                                 
        b.idImage || null,      
        b.letterOfIntent || null,
      ]
    );

    res.json({ 
      success: true, 
      id: result.rows[0].id,
      message: "iPharma Mart application submitted successfully",
    });
  } catch (err) {
    console.error("Error submitting iPharma application:", err);
    res.status(500).json({ success: false, error: "Failed to submit application", details: err.message });
  }
});

app.put("/applications/:id/status", async (req, res) => {
  try {
    const rawId = req.params.id;
    const isIpharma = rawId.startsWith("ip-");
    const id = parseInt(isIpharma ? rawId.replace("ip-", "") : rawId);
    const sourceTable = isIpharma ? "ipharma_applications" : "applications";

    const { status } = req.body;
    const result = await pool.query(
      `UPDATE ${sourceTable} SET status=$1 WHERE id=$2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "Application not found" });

    res.json({
      success: true,
      message: "Application status updated successfully",
      application: rowToApplication(result.rows[0]),
    });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ success: false, error: "Failed to update application status" });
  }
});

app.delete("/applications/:id", async (req, res) => {
  try {
    const rawId = req.params.id;
    const isIpharma = rawId.startsWith("ip-");
    const id = isIpharma ? rawId.replace("ip-", "") : rawId;
    const sourceTable = isIpharma ? "ipharma_applications" : "applications";

    const existing = await pool.query(
      `SELECT * FROM ${sourceTable} WHERE id=$1`, [id]
    );

    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, error: "Application not found" });

    await pool.query(
      'INSERT INTO application_delete_history (application_data) VALUES ($1)',
      [JSON.stringify(existing.rows[0])]
    );

    await pool.query(`DELETE FROM ${sourceTable} WHERE id=$1`, [id]);

    res.json({ success: true, message: "Application deleted successfully" });
  } catch (err) {
    console.error("Error deleting application:", err);
    res.status(500).json({ success: false, error: "Failed to delete application" });
  }
});

// ─── RECEIPTS / OCR ──────────────────────────────────────────

app.post("/upload", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!process.env.MINDEE_API_KEY)
      return res.status(500).json({ error: "Mindee API key missing" });
 
    const { user_id } = req.body;
 
    let brand = null;
    let branch = null;
    if (user_id) {
      const userResult = await pool.query(
        "SELECT brand, branch FROM users WHERE id=$1",
        [user_id]
      );
      if (userResult.rows.length > 0) {
        brand = userResult.rows[0].brand;
        branch = userResult.rows[0].branch;
      }
    }
 
    const mindeeClient = new mindee.v2.Client({ apiKey: process.env.MINDEE_API_KEY });
    const inputSource = new mindee.PathInput({ inputPath: req.file.path });
 
    const response = await mindeeClient.enqueueAndGetResult(
      mindee.v2.product.Extraction,
      inputSource,
      { modelId: process.env.MINDEE_MODEL_ID }
    );
 
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
 
    const fields = response.rawHttp.inference.result.fields;
 
    const merchant    = fields?.supplier_name?.value            ?? null;
    const date        = fields?.date?.value                     ?? null;
    const total       = fields?.total_amount?.value             ?? null;
    const currency    = fields?.locale?.fields?.currency?.value ?? "PHP";
    const vat         = fields?.total_tax?.value
                     ?? fields?.taxes?.value
                     ?? fields?.tax?.value
                     ?? fields?.vat?.value
                     ?? fields?.taxes?.items?.[0]?.fields?.rate?.value
                     ?? null;
    const referenceNo = fields?.document_number?.value
                     ?? fields?.invoice_number?.value
                     ?? fields?.receipt_number?.value
                     ?? null;
    const lineItems   = (fields?.line_items?.items ?? []).map(item => ({
      description: item.fields?.description?.value || "Item",
      quantity:    item.fields?.quantity?.value    || 0,
      unitPrice:   item.fields?.unit_price?.value  || 0,
      totalPrice:  item.fields?.total_price?.value || 0,
    }));
 
    console.log("Extracted fields:", { merchant, date, total, currency, vat, referenceNo, brand, branch, lineItems });
 
    // Send OCR response immediately
    res.json({ merchant, date, total, currency, vat, referenceNo, brand, branch, lineItems });
 
    // Save to DB in background
    const client = await pool.connect();
    let savedReceipt;
    try {
      await client.query("BEGIN");
      const receiptResult = await client.query(
        `INSERT INTO receipts 
        (merchant, date, total_amount, currency, vat, reference_no, brand, branch, uploaded_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [merchant, date, total, currency, vat, referenceNo, brand, branch, user_id || null]
      );
      savedReceipt = receiptResult.rows[0];
      for (const item of lineItems) {
        await client.query(
          `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [savedReceipt.id, item.description, item.quantity, item.unitPrice, item.totalPrice]
        );
      }
      await client.query("COMMIT");
    } catch (dbErr) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("OCR error:", err.response?.data || err.message || err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "OCR failed", details: err.message || err });
  }
});

app.post("/ocr-extract", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
 
    const { user_id } = req.body;
 
    let brand = null;
    let branch = null;
    if (user_id) {
      const userResult = await pool.query(
        "SELECT brand, branch FROM users WHERE id=$1",
        [user_id]
      );
      if (userResult.rows.length > 0) {
        brand = userResult.rows[0].brand;
        branch = userResult.rows[0].branch;
      }
    }
 
    const mindeeClient = new mindee.v2.Client({ apiKey: process.env.MINDEE_API_KEY });
    const inputSource = new mindee.PathInput({ inputPath: req.file.path });
 
    const response = await mindeeClient.enqueueAndGetResult(
      mindee.v2.product.Extraction,
      inputSource,
      { modelId: process.env.MINDEE_MODEL_ID }
    );
 
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
 
    const fields = response.rawHttp.inference.result.fields;
 
    const merchant    = fields?.supplier_name?.value            ?? null;
    const date        = fields?.date?.value                     ?? null;
    const total       = fields?.total_amount?.value             ?? null;
    const currency    = fields?.locale?.fields?.currency?.value ?? "PHP";
    const vat         = fields?.total_tax?.value
                     ?? fields?.taxes?.value
                     ?? fields?.tax?.value
                     ?? fields?.vat?.value
                     ?? fields?.taxes?.items?.[0]?.fields?.rate?.value
                     ?? null;
    const referenceNo = fields?.document_number?.value
                     ?? fields?.invoice_number?.value
                     ?? fields?.receipt_number?.value
                     ?? null;
    const lineItems   = (fields?.line_items?.items ?? []).map(item => ({
      description: item.fields?.description?.value || "Item",
      quantity:    item.fields?.quantity?.value    || 0,
      unitPrice:   item.fields?.unit_price?.value  || 0,
      totalPrice:  item.fields?.total_price?.value || 0,
    }));
 
    res.json({ merchant, date, total, currency, vat, referenceNo, brand, branch, lineItems });
  } catch (err) {
    console.error("OCR extract error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "OCR failed", details: err.message });
  }
});

app.get("/receipts", async (req, res) => {
  try {
    const { user_id, brand, branch } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const userResult = await pool.query(
      "SELECT role, brand, branch FROM users WHERE id=$1", [user_id]
    );
    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const { role } = userResult.rows[0];
    const isAdmin  = role === "Administrator";

    // Build dynamic WHERE clauses
    const conditions = [];
    const values     = [];

    if (!isAdmin) {
      // Non-admins only see their own receipts
      values.push(user_id);
      conditions.push(`uploaded_by = $${values.length}`);
    }

    // Optional brand/branch filters (for admin filtering in UI)
    if (brand) {
      values.push(brand);
      conditions.push(`brand = $${values.length}`);
    }
    if (branch) {
      values.push(branch);
      conditions.push(`branch = $${values.length}`);
    }

    const where  = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT * FROM receipts ${where} ORDER BY created_at DESC`,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch receipts:", err);
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});

app.get("/receipts/:id", async (req, res) => {
  try {
    const receipt = await pool.query(
      "SELECT * FROM receipts WHERE id=$1",
      [req.params.id]
    );
    if (receipt.rows.length === 0)
      return res.status(404).json({ error: "Receipt not found" });
 
    const items = await pool.query(
      "SELECT * FROM receipt_items WHERE receipt_id=$1 ORDER BY id",
      [req.params.id]
    );
 
    res.json({ ...receipt.rows[0], lineItems: items.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});

app.post("/receipts/save", async (req, res) => {
  const { merchant, date, total, currency, vat, referenceNo, lineItems, user_id } = req.body;
 
  let brand = null, branch = null;
  if (user_id) {
    const userResult = await pool.query(
      "SELECT brand, branch FROM users WHERE id=$1", [user_id]
    );
    if (userResult.rows.length > 0) {
      brand  = userResult.rows[0].brand;
      branch = userResult.rows[0].branch;
    }
  }
  
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const receiptResult = await client.query(
      `INSERT INTO receipts
      (merchant, date, total_amount, currency, vat, reference_no, brand, branch, uploaded_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [merchant, date, total, currency, vat, referenceNo, brand, branch, user_id || null]
    );
    const savedReceipt = receiptResult.rows[0];
    for (const item of (lineItems || [])) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [savedReceipt.id, item.description, item.quantity, item.unitPrice, item.totalPrice]
      );
    }
    await client.query("COMMIT");
    res.json({ id: savedReceipt.id, success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Save receipt error:", err.message);
    res.status(500).json({ error: "Failed to save receipt" });
  } finally {
    client.release();
  }
});

app.put("/receipts/:id", async (req, res) => {
  const { merchant, date, total_amount, currency, lineItems, vat, reference_no } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE receipts
       SET merchant=$1, date=$2, total_amount=$3, currency=$4, vat=$5, reference_no=$6
       WHERE id=$7`,
      [merchant, date, total_amount, currency, vat, reference_no, req.params.id]
    );
    await client.query(
      "DELETE FROM receipt_items WHERE receipt_id=$1",
      [req.params.id]
    );
    for (const item of lineItems) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.params.id, item.description, item.quantity, item.unit_price, item.total_price]
      );
    }
    await client.query("COMMIT");
    const receipt = await pool.query("SELECT * FROM receipts WHERE id=$1", [req.params.id]);
    const items   = await pool.query(
      "SELECT * FROM receipt_items WHERE receipt_id=$1 ORDER BY id",
      [req.params.id]
    );
    res.json({ ...receipt.rows[0], lineItems: items.rows });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to update receipt" });
  } finally {
    client.release();
  }
});
 
app.delete("/receipts/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM receipts WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete receipt" });
  }
});

app.post("/api/extract-id", async (req, res) => {
  const { frontImage, idType } = req.body;

  const base64Data = frontImage.replace(/^data:image\/\w+;base64,/, "");
  const tempPath   = path.join(os.tmpdir(), `id_${Date.now()}.jpg`);
  fs.writeFileSync(tempPath, Buffer.from(base64Data, "base64"));

  try {
    const mindeeClient = new mindee.v2.Client({ apiKey: process.env.MINDEE_API_KEY });
    const inputSource  = new mindee.PathInput({ inputPath: tempPath });

    const response = await mindeeClient.enqueueAndGetResult(
      mindee.v2.product.Extraction,
      inputSource,
      { modelId: process.env.MINDEE_ID_MODEL_ID }
    );

    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    const fields = response.rawHttp.inference.result.fields;

    const firstName  = fields?.given_names?.value   || fields?.first_name?.value    || "";
    const lastName   = fields?.surnames?.value      || "";
    const middleName = fields?.middle_name?.value   || "";
    const dob        = fields?.birth_date?.value    || fields?.date_of_birth?.value  || "";
    const idNumber   = fields?.document_number?.value || fields?.id_number?.value    || "";
    const expiryDate =  fields?.date_of_expiry?.value  || "";
    
    const addrStreet  = fields?.address?.fields?.street?.value      || "";
    const addrCity    = fields?.address?.fields?.city?.value        || "";
    const addrState   = fields?.address?.fields?.state?.value       || "";
    const addrPostal  = fields?.address?.fields?.postal_code?.value || "";
    const address     = [addrStreet, addrCity, addrState, addrPostal].filter(Boolean).join(", ");

    res.json({
      success: true,
      data: { firstName, lastName, middleName, dob, idNumber, expiryDate, address},
    });

  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error("Mindee OCR error:", err.message);
    res.status(500).json({ success: false, error: "Failed to extract ID data" });
  }
});

// ─── INVENTORY ───────────────────────────────────────────────

// ── helper ──────────────────────────────────────────────────────────────────
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

// ── GET /inventory ───────────────────────────────────────────────────────────
app.get("/inventory", async (req, res) => {
  try {
    const { branch } = req.query;
    const result = branch
      ? await pool.query("SELECT * FROM inventory WHERE branch=$1 ORDER BY name", [branch])
      : await pool.query("SELECT * FROM inventory ORDER BY name");

    const items = await Promise.all(result.rows.map(async item => {
      const ings = await pool.query(
        `SELECT pi.quantity AS qty_required, pi.unit, i.id, i.name, i.stock
         FROM product_ingredients pi
         JOIN ingredients i ON i.id = pi.ingredient_id
         WHERE pi.inventory_id = $1`,
        [item.id]
      );
      return { ...item, ingredients: ings.rows };
    }));

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

app.get("/inventory-delete-history", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM inventory_delete_history ORDER BY deleted_at DESC`
    );
    const rows = result.rows.map(row => ({
      id:         row.id,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
      inventory_data: (() => {
        try { return typeof row.inventory_data === "string"
          ? JSON.parse(row.inventory_data)
          : row.inventory_data; }
        catch { return {}; }
      })(),
      ingredients_data: (() => {
        try { return typeof row.ingredients_data === "string"
          ? JSON.parse(row.ingredients_data)
          : row.ingredients_data; }
        catch { return []; }
      })(),
    }));
    res.json(rows);
  } catch (err) {
    console.error("GET /inventory-delete-history error:", err);
    res.status(500).json({ error: "Failed to fetch delete history" });
  }
});

app.post("/inventory", async (req, res) => {
  try {
    const { name, category, branch, brand, stock, min_stock, minStock, cost, price, image_url } = req.body;

    if (!branch)
      return res.status(400).json({ error: "Branch is required" });

    const result = await pool.query(
      `INSERT INTO inventory (name, category, branch, brand, stock, min_stock, cost, price, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        name, category, branch, brand || null,
        parseInt(stock) || 0,
        parseInt(min_stock ?? minStock) || 0,
        parseFloat(cost) || 0,
        parseFloat(price) || 0,
        image_url || null,
      ]
    );

    const newItem = result.rows[0];

    // ✅ Log the addition
    await logActivity("ADDED", newItem.id, newItem.name, {
      category, branch, brand, stock: newItem.stock,
      min_stock: newItem.min_stock, cost: newItem.cost,
      price: newItem.price,
    });

    res.json({ success: true, item: newItem });
  } catch (err) {
    console.error("POST /inventory error:", err);
    res.status(500).json({ error: "Failed to add inventory item" });
  }
});

app.put("/inventory/:id", async (req, res) => {
  try {
    const { name, category, branch, brand, stock, min_stock, minStock, cost, price, image_url } = req.body;

    // Fetch old values for the diff
    const before = await pool.query("SELECT * FROM inventory WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0)
      return res.status(404).json({ error: "Item not found" });
    const oldItem = before.rows[0];

    const result = await pool.query(
      `UPDATE inventory
       SET name=$1, category=$2, branch=$3, brand=$4, stock=$5, min_stock=$6, cost=$7, price=$8, image_url=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [
        name, category, branch, brand || null,
        parseInt(stock) || 0,
        parseInt(min_stock ?? minStock) || 0,
        parseFloat(cost) || 0,
        parseFloat(price) || 0,
        image_url || null,
        req.params.id,
      ]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Item not found" });

    const updatedItem = result.rows[0];

    const changes = {};
    const fields = ["name", "category", "branch", "brand", "stock", "min_stock", "cost", "price", "image_url"];
    for (const field of fields) {
      const oldVal = String(oldItem[field] ?? "");
      const newVal = String(updatedItem[field] ?? "");
      if (oldVal !== newVal) changes[field] = { from: oldItem[field], to: updatedItem[field] };
    }

    await logActivity("EDITED", updatedItem.id, updatedItem.name, { changes });

    res.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error("PUT /inventory/:id error:", err);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

app.get("/inventory-delete-history", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory_delete_history ORDER BY deleted_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /inventory-delete-history error:", err);
    res.status(500).json({ error: "Failed to fetch inventory delete history" });
  }
});

app.post("/inventory-delete-history", async (req, res) => {
  try {
    const { inventory_data, ingredients_data, deleted_by } = req.body;
    await pool.query(
      `INSERT INTO inventory_delete_history (inventory_data, ingredients_data, deleted_at, deleted_by)
         VALUES ($1, $2, $3, NOW())`,
  [
    JSON.stringify({
      name:      item.name,
      category:  item.category,
      branch:    item.branch,
      brand:     item.brand,
      stock:     item.stock,
      min_stock: item.min_stock,
      cost:      item.cost,
      price:     item.price,
      image_url: item.image_url,
    }),
    JSON.stringify(ings.rows),
    req.body.deleted_by || "Unknown",
  ]
);
    res.json({ success: true });
  } catch (err) {
    console.error("POST /inventory-delete-history error:", err);
    res.status(500).json({ error: "Failed to save inventory delete history" });
  }
});

app.delete("/inventory/:id", async (req, res) => {
  try {
    const before = await pool.query("SELECT * FROM inventory WHERE id=$1", [req.params.id]);
    if (before.rows.length === 0)
      return res.status(404).json({ error: "Item not found" });
    const item = before.rows[0];

    const ings = await pool.query(
      `SELECT pi.quantity AS qty_required, pi.unit, i.id, i.name
       FROM product_ingredients pi
       JOIN ingredients i ON i.id = pi.ingredient_id
       WHERE pi.inventory_id = $1`,
      [item.id]
    );

    await pool.query(
      `INSERT INTO inventory_delete_history
         (inventory_data, ingredients_data, deleted_by, deleted_at)
       VALUES ($1, $2, $3, NOW())`,
      [
        JSON.stringify({
          name:      item.name,
          category:  item.category,
          branch:    item.branch,
          brand:     item.brand,
          stock:     item.stock,
          min_stock: item.min_stock,
          cost:      item.cost,
          price:     item.price,
          image_url: item.image_url,
        }),
        JSON.stringify(ings.rows),
        req.body?.deleted_by || "Unknown",  // ✅ safe optional chaining
      ]
    );

    await logActivity("DELETED", item.id, item.name, {
      category: item.category, branch: item.branch,
      stock: item.stock, cost: item.cost, price: item.price,
    });

    await pool.query("DELETE FROM inventory WHERE id=$1", [item.id]);

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /inventory/:id error:", err);
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
});

app.delete("/inventory-delete-history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM inventory_delete_history WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /inventory-delete-history/:id error:", err);
    res.status(500).json({ error: "Failed to remove history entry" });
  }
});

// ─── INVENTORY ACTIVITY LOG ───────────────────────────────────

app.get("/inventory-activity-log", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM inventory_activity_log ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /inventory-activity-log error:", err);
    res.status(500).json({ error: "Failed to fetch inventory activity log" });
  }
});

app.post("/inventory-activity-log", async (req, res) => {
  try {
    const { action, item_name, branch, performed_by, changes } = req.body;
    await pool.query(
      `INSERT INTO inventory_activity_log (action, item_name, branch, performed_by, changes)
       VALUES ($1, $2, $3, $4, $5)`,
      [action, item_name, branch || null, performed_by || "System", changes || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("POST /inventory-activity-log error:", err);
    res.status(500).json({ error: "Failed to save activity log entry" });
  }
});

// ─── INGREDIENTS ─────────────────────────────────────────────

app.get("/ingredients", async (req, res) => {
  try {
    const { branch } = req.query;
    const result = branch
      ? await pool.query("SELECT * FROM ingredients WHERE branch=$1 ORDER BY name", [branch])
      : await pool.query("SELECT * FROM ingredients ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /ingredients error:", err);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
});

app.post("/ingredients", async (req, res) => {
  try {
    const { name, branch, brand, unit, stock, min_stock, cost_per_unit, extra_fields } = req.body;
    if (!name || !unit)
      return res.status(400).json({ error: "Name and unit are required" });
    const result = await pool.query(
      `INSERT INTO ingredients (name, branch, brand, unit, stock, min_stock, cost_per_unit, extra_fields)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        name, branch || null, brand || null, unit,
        parseFloat(stock) || 0, parseFloat(min_stock) || 0,
        parseFloat(cost_per_unit) || 0,
        JSON.stringify(extra_fields || {}),
      ]
    );
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("POST /ingredients error:", err);
    res.status(500).json({ error: "Failed to add ingredient" });
  }
});
app.put("/ingredients/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, branch, brand, unit, stock, min_stock, cost_per_unit, extra_fields } = req.body;

    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE ingredients
       SET name=$1, branch=$2, brand=$3, unit=$4, stock=$5, min_stock=$6,
           cost_per_unit=$7, extra_fields=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [
        name, branch || null, brand || null, unit,
        parseFloat(stock) || 0, parseFloat(min_stock) || 0,
        parseFloat(cost_per_unit) || 0,
        JSON.stringify(extra_fields || {}),
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Ingredient not found" });
    }

    // your existing product cost recalculation logic below stays the same...
    const ingredientId = req.params.id;
    const affectedProducts = await client.query(
      `SELECT DISTINCT inventory_id FROM product_ingredients WHERE ingredient_id = $1`,
      [ingredientId]
    );
    for (const row of affectedProducts.rows) {
      const inventoryId = row.inventory_id;
      const costResult = await client.query(
        `SELECT SUM(pi.quantity * i.cost_per_unit) AS total_cost
         FROM product_ingredients pi
         JOIN ingredients i ON i.id = pi.ingredient_id
         WHERE pi.inventory_id = $1`,
        [inventoryId]
      );
      const totalCost = parseFloat(costResult.rows[0].total_cost) || 0;
      await client.query(
        `UPDATE inventory SET cost = $1, updated_at = NOW() WHERE id = $2`,
        [totalCost, inventoryId]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, item: result.rows[0], updatedProducts: affectedProducts.rows.length });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT /ingredients/:id error:", err);
    res.status(500).json({ error: "Failed to update ingredient" });
  } finally {
    client.release();
  }
});

app.delete("/ingredients/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM ingredients WHERE id=$1 RETURNING id", [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Ingredient not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /ingredients/:id error:", err);
    res.status(500).json({ error: "Failed to delete ingredient" });
  }
});

// ─── PRODUCT INGREDIENTS (recipe) ────────────────────────────

app.get("/inventory/:id/ingredients", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pi.*, i.name AS ingredient_name, i.unit AS ingredient_unit,
              i.stock AS ingredient_stock, i.cost_per_unit
       FROM product_ingredients pi
       JOIN ingredients i ON i.id = pi.ingredient_id
       WHERE pi.inventory_id = $1
       ORDER BY i.name`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /inventory/:id/ingredients error:", err);
    res.status(500).json({ error: "Failed to fetch product ingredients" });
  }
});

app.post("/inventory/:id/ingredients", async (req, res) => {
  const client = await pool.connect();
  try {
    const { ingredients } = req.body;

    await client.query("BEGIN");

    await client.query(
      "DELETE FROM product_ingredients WHERE inventory_id=$1",
      [req.params.id]
    );

    for (const ing of ingredients) {
      await client.query(
        `INSERT INTO product_ingredients (inventory_id, ingredient_id, quantity, unit)
         VALUES ($1,$2,$3,$4)`,
        [req.params.id, ing.ingredient_id, parseFloat(ing.quantity), ing.unit]
      );
    }

    const costResult = await client.query(
      `SELECT SUM(pi.quantity * i.cost_per_unit) AS total_cost
       FROM product_ingredients pi
       JOIN ingredients i ON i.id = pi.ingredient_id
       WHERE pi.inventory_id = $1`,
      [req.params.id]
    );

    const totalCost = parseFloat(costResult.rows[0].total_cost) || 0;

    await client.query(
      `UPDATE inventory SET cost = $1, updated_at = NOW() WHERE id = $2`,
      [totalCost, req.params.id]
    );

    await client.query("COMMIT");
    res.json({ success: true, cost: totalCost });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to save recipe" });
  } finally {
    client.release();
  }
});

app.post("/inventory/:id/sell", async (req, res) => {
  const client = await pool.connect();
  try {
    const { quantity = 1 } = req.body;
    await client.query("BEGIN");

    const productResult = await client.query(
      `UPDATE inventory SET stock = stock - $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [parseInt(quantity), req.params.id]
    );
    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }
    if (productResult.rows[0].stock < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient product stock" });
    }

    const recipe = await client.query(
      `SELECT pi.ingredient_id, pi.quantity, i.stock AS current_stock, i.name
       FROM product_ingredients pi
       JOIN ingredients i ON i.id = pi.ingredient_id
       WHERE pi.inventory_id = $1`,
      [req.params.id]
    );

    for (const row of recipe.rows) {
      const needed = parseFloat(row.quantity) * parseInt(quantity);
      if (parseFloat(row.current_stock) < needed) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: `Insufficient stock for ingredient: ${row.name}` });
      }
    }

    for (const row of recipe.rows) {
      const deduct = parseFloat(row.quantity) * parseInt(quantity);
      await client.query(
        `UPDATE ingredients SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
        [deduct, row.ingredient_id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, product: productResult.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /inventory/:id/sell error:", err);
    res.status(500).json({ error: "Failed to process sale" });
  } finally {
    client.release();
  }
});

// ─── INGREDIENT DELETE HISTORY ────────────────────────────────

app.get("/ingredient-delete-history", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ingredient_delete_history ORDER BY deleted_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /ingredient-delete-history error:", err);
    res.status(500).json({ error: "Failed to fetch ingredient delete history" });
  }
});

app.post("/ingredient-delete-history", async (req, res) => {
  try {
    const { ingredient_data, deleted_by } = req.body;
    await pool.query(
      "INSERT INTO ingredient_delete_history (ingredient_data, deleted_by) VALUES ($1, $2)",
      [JSON.stringify(ingredient_data), deleted_by || "Unknown"]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("POST /ingredient-delete-history error:", err);
    res.status(500).json({ error: "Failed to save ingredient delete history" });
  }
});

app.delete("/ingredient-delete-history/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM ingredient_delete_history WHERE id = $1",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /ingredient-delete-history/:id error:", err);
    res.status(500).json({ error: "Failed to delete history entry" });
  }
});

// ─── INGREDIENT ACTIVITY LOG ──────────────────────────────────

app.get("/ingredient-activity-log", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ingredient_activity_log ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /ingredient-activity-log error:", err);
    res.status(500).json({ error: "Failed to fetch ingredient activity log" });
  }
});

app.post("/ingredient-activity-log", async (req, res) => {
  try {
    const { action, ingredient_name, branch, performed_by, changes } = req.body;
    await pool.query(
      `INSERT INTO ingredient_activity_log 
         (action, ingredient_name, branch, performed_by, changes)
       VALUES ($1, $2, $3, $4, $5)`,
      [action, ingredient_name, branch || null, performed_by || "System", changes || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("POST /ingredient-activity-log error:", err);
    res.status(500).json({ error: "Failed to save activity log entry" });
  }
});

// ─── BRANCHES ────────────────────────────────────────────────

app.get("/branches", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM branches ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

app.post("/branches", async (req, res) => {
  try {
    const { name, brand_id, region, manager, contact, address, concept } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Branch name is required" });
    const result = await pool.query(
      "INSERT INTO branches (name, brand_id, region, manager, contact, address, concept) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [name.trim(), brand_id, region, manager, contact, address, concept || null]
    );
    res.json({ success: true, branch: result.rows[0] });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Branch already exists" });
    res.status(500).json({ error: "Failed to add branch" });
  }
});

app.put("/branches/:id", async (req, res) => {
  const { name, brand_id, region, manager, contact, address, concept } = req.body;
  console.log('PUT /branches/:id called', req.params.id, req.body); // <-- add
  try {
    const result = await pool.query(
      "UPDATE branches SET name=$1, brand_id=$2, region=$3, manager=$4, contact=$5, address=$6, concept=$7 WHERE id=$8 RETURNING *",
      [name, brand_id, region, manager, contact, address, concept || null, req.params.id]
    );
    res.json({ success: true, branch: result.rows[0] });
  } catch (err) {
    console.error('Update branch error FULL:', err.message, err.code, err.detail); // <-- expanded
    res.status(500).json({ error: err.message, code: err.code, detail: err.detail });
  }
});

app.delete("/branches/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM branches WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete branch" });
  }
});

// ─── BRANDS ──────────────────────────────────────────────────

app.get("/brands", async (req, res) => {
  try {
    const brandsResult   = await pool.query("SELECT * FROM brands ORDER BY name");
    const branchesResult = await pool.query("SELECT * FROM branches ORDER BY name");

    const brands = brandsResult.rows.map(brand => ({
      ...brand,
      branches: branchesResult.rows.filter(br => br.brand_id === brand.id)
    }));

    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

app.post("/brands", async (req, res) => {
  try {
    const { name, region, contact_email, contact_phone, description, categories } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Brand name is required" });
    const result = await pool.query(
      "INSERT INTO brands (name, region, contact_email, contact_phone, description, categories) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [name.trim(), region, contact_email, contact_phone, description, categories || []]
    );
    res.json({ success: true, brand: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Brand already exists" });
    res.status(500).json({ error: "Failed to add brand" });
  }
});

app.put("/brands/:id", async (req, res) => {
  const { name, region, contact_email, contact_phone, description, categories } = req.body;
  try {
    const result = await pool.query(
      "UPDATE brands SET name=$1, region=$2, contact_email=$3, contact_phone=$4, description=$5, categories=$6 WHERE id=$7 RETURNING *",
      [name, region, contact_email, contact_phone, description, categories || [], req.params.id]
    );
    res.json({ success: true, brand: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update brand" });
  }
});

app.delete("/brands/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM brands WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete brands" });
  }
});

// ─── SHOP ITEMS ───────────────────────────────────────────────
app.get("/shop-items", async (req, res) => {
  try {
   const { brand } = req.query;
const result = brand
  ? await pool.query(
      `SELECT id, name, price, unit, image_url, is_visible, shop, brand, stock, branches
       FROM shop_items
       WHERE brand = $1
       ORDER BY created_at DESC`,
      [brand]
    )
  : await pool.query(
      `SELECT id, name, price, unit, image_url, is_visible, shop, brand, stock, branches
       FROM shop_items ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shop items" });
  }
});

app.post("/shop-items", async (req, res) => {
  try {
    const { name, price, unit, image_url, shop, brand, stock, is_visible,branches } = req.body;
    const result = await pool.query(
      `INSERT INTO shop_items (name, price, unit, image_url, shop, brand, stock, is_visible, branches)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, parseFloat(price), unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true, branches]
    );
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("Error adding shop item:", err);
    res.status(500).json({ error: "Failed to add shop item" });
  }
});

// NEW — full edit endpoint
app.put("/shop-items/:id", async (req, res) => {
  try {
    const { name, price, unit, image_url, shop, brand, stock, is_visible, branches } = req.body;
    const result = await pool.query(
      `UPDATE shop_items
       SET name=$1, price=$2, unit=$3, image_url=$4, shop=$5, brand=$6, stock=$7, is_visible=$8, branches=$9
       WHERE id=$10 RETURNING *`,
      [name, parseFloat(price), unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true, branches || [], req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("Error updating shop item:", err);
    res.status(500).json({ error: "Failed to update shop item" });
  }
});

app.put("/shop-items/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const current = await pool.query("SELECT is_visible FROM shop_items WHERE id = $1", [id]);
    if (current.rows.length === 0)
      return res.status(404).json({ error: "Item not found" });
    const newValue = !current.rows[0].is_visible;
    const result = await pool.query(
      "UPDATE shop_items SET is_visible = $1 WHERE id = $2 RETURNING *",
      [newValue, id]
    );
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("Error toggling visibility:", err);
    res.status(500).json({ error: "Failed to toggle visibility" });
  }
});

app.delete("/shop-items/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM shop_items WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting shop item:", err);
    res.status(500).json({ error: "Failed to delete shop item" });
  }
});

// ─── ANNOUNCEMENTS ────────────────────────────────────────────

app.get("/announcements/delete-history", async (req, res) => {
  try {
     await pool.query(
      `DELETE FROM announcement_delete_history
       WHERE deleted_at < NOW() - INTERVAL '30 days'`
    );

    const result = await pool.query(
      `SELECT * FROM announcement_delete_history
        WHERE deleted_at >= NOW() - INTERVAL '30 days'
       ORDER BY deleted_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch delete history" });
  }
});

app.delete("/announcements/delete-history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM announcement_delete_history WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from history" });
  }
});

app.get("/announcements", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS author
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch announcements error:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

app.post("/announcements", async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    const userResult = await pool.query(
      "SELECT role FROM users WHERE id=$1", [userId]
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    if (userResult.rows[0].role !== "Administrator")
      return res.status(403).json({ error: "Only admin can post announcements" });

    const result = await pool.query(
      `INSERT INTO announcements (title, content, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [title, content, userId]
    );
 
try {
  const announcementId = result.rows[0].id;
  const allUsers = await pool.query("SELECT id FROM users");

  await Promise.all(allUsers.rows.map(u =>
    pool.query(
      `INSERT INTO notifications (user_id, type, title, body, reference_id)
      VALUES ($1, 'announcement', $2, $3, $4)
      ON CONFLICT DO NOTHING`,
      [u.id, title, content.length > 80 ? content.slice(0, 80) + "…" : content, announcementId]
    )
  ));
  const tokens = await pool.query('SELECT push_token FROM users WHERE push_token IS NOT NULL');
  await Promise.all(tokens.rows.map(r =>
    sendPushNotification(r.push_token, 'New Announcement', title)
  ));
} catch (notifErr) {
  console.error("Notification insert failed (non-fatal):", notifErr.message);
}
    res.json({ success: true, announcement: result.rows[0] });
  } catch (err) {
    console.error("Create announcement error:", err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

app.put("/announcements/:id", async (req, res) => {
  try {
    const { title, content, userId } = req.body;

    const userResult = await pool.query(
      "SELECT role FROM users WHERE id=$1", [userId]
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    if (userResult.rows[0].role !== "Administrator")
      return res.status(403).json({ error: "Unauthorized" });

    const result = await pool.query(
      "UPDATE announcements SET title=$1, content=$2 WHERE id=$3 RETURNING *",
      [title, content, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

app.delete("/announcements/:id", async (req, res) => {
  try {
    const { userId } = req.body;

    const userResult = await pool.query("SELECT role FROM users WHERE id=$1", [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    if (userResult.rows[0].role !== "Administrator") return res.status(403).json({ error: "Unauthorized" });

    // Save to history before deleting
    const ann = await pool.query("SELECT * FROM announcements WHERE id=$1", [req.params.id]);
    if (ann.rows.length > 0) {
      const a = ann.rows[0];
      await pool.query(
        `INSERT INTO announcement_delete_history
         (announcement_id, title, content, image_url, created_by, original_created_at, deleted_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [a.id, a.title, a.content, a.image_url||null, a.created_by, a.created_at, userId]
      );
    }

    await pool.query("DELETE FROM announcements WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

// ─── ORDERS ───────────────────────────────────────────────────

app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        o.phone,
        o.brand,
        o.branch,
        o.address, 
        u.name AS user_name, 

        COALESCE(
          json_agg(
            json_build_object(
              'name',  si.name,
              'qty',   oi.quantity,
              'price', oi.price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items

      FROM orders o
      LEFT JOIN users u       ON u.id  = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN shop_items si  ON si.id = oi.shop_item_id

      GROUP BY o.id, u.name, o.address
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post("/orders", async (req, res) => {
  const client = await pool.connect();
  
  const { user_id, phone, brand, branch, items, total_amount, address } = req.body;

   if (!items || !Array.isArray(items) || items.length === 0) {
    client.release();
    return res.status(400).json({ error: "Order must contain at least one item" });
  }
  
  try {
    await client.query("BEGIN");

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, phone, brand, branch, total_amount, status, address)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6) RETURNING *`,
      [user_id, phone, brand, branch, total_amount, address]
    );
    const order = orderRes.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, shop_item_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.shop_item_id, item.quantity, item.price]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, order });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    client.release();
  }
});

app.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "shipping", "received", "cancelled"];

    if (!validStatuses.includes(status))
      return res.status(400).json({ error: "Invalid status value" });

    const result = await pool.query(
  "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",
  [status, req.params.id]
);

// ← check FIRST before using result
if (result.rows.length === 0)
  return res.status(404).json({ error: "Order not found" });

const order = result.rows[0];
if (order?.user_id) {
  const statusLabels = {
    pending:   "Order Placed",
    shipping:  "Order Shipped",
    received:  "Order Delivered",
    cancelled: "Order Cancelled",
  };
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body) VALUES ($1, $2, $3, $4)`,
    [order.user_id, `order_${status}`, statusLabels[status] || "Order Update",
     `Your order #${order.id} is now ${status}.`]
  );
}

const userRow = await pool.query(
  'SELECT push_token FROM users WHERE id=$1', [order.user_id]
);
const token = userRow.rows[0]?.push_token;
if (token) {
  await sendPushNotification(token, 'Order Update',
    `Your order #${req.params.id} is now ${status}.`);
}

res.json({ success: true, order: result.rows[0] });
 } catch (err) {
    console.error("PUT /orders/:id error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

app.get("/api/orders/counts", async (req, res) => {
  const { userId } = req.query;
  try {
    const toShip   = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status='pending'", [userId]
    );
    const shipping = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status='shipping'", [userId]
    );
    const received = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE user_id=$1 AND status='received'", [userId]
    );
    res.json({
      toShip:   parseInt(toShip.rows[0].count),
      shipping: parseInt(shipping.rows[0].count),
      received: parseInt(received.rows[0].count),
    });
  } catch (err) {
    console.error("GET /api/orders/counts error:", err);
    res.status(500).json({ error: "Failed to fetch order counts" });
  }
});

// ─── TRANSACTIONS ─────────────────────────────────────────────

app.get("/transactions", async (req, res) => {
  try {
    const { branch } = req.query;
    const result = branch
      ? await pool.query(
          "SELECT * FROM transactions WHERE branch=$1 AND (is_voided = false OR is_voided IS NULL) ORDER BY created_at DESC", [branch]
        )
      : await pool.query(
          "SELECT * FROM transactions WHERE (is_voided = false OR is_voided IS NULL) ORDER BY created_at DESC"
        );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /transactions error:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.get("/transactions/voided", async (req, res) => {
  try {
    const { branch } = req.query;
    const result = branch
      ? await pool.query(
          "SELECT * FROM transactions WHERE branch=$1 AND is_voided = true ORDER BY voided_at DESC", [branch]
        )
      : await pool.query(
          "SELECT * FROM transactions WHERE is_voided = true ORDER BY voided_at DESC"
        );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /transactions/voided error:", err);
    res.status(500).json({ error: "Failed to fetch voided transactions" });
  }
});

app.post("/transactions", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      branch, cashier, shop, payment_method, cash_received,
      discount_pct, subtotal, discount_amt, vat_enabled, vat_amt,
      total, change_due, note, items,
    } = req.body;

    await client.query("BEGIN");

    let cogs = 0;
    for (const item of (items || [])) {
      const qty = parseInt(item.qty || 0);
      const product = await client.query(
        "SELECT cost FROM inventory WHERE id = $1", [item.id]
      );
      const costPerItem = parseFloat(product.rows[0]?.cost || 0);
      cogs += costPerItem * qty;
    }

    const result = await client.query(
      `INSERT INTO transactions
        (branch, cashier, shop, payment_method, cash_received,
         discount_pct, subtotal, discount_amt, vat_enabled, vat_amt,
         total, change_due, note, items, cogs)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        branch, cashier, shop, payment_method,
        parseFloat(cash_received) || 0,
        parseFloat(discount_pct) || 0,
        parseFloat(subtotal) || 0,
        parseFloat(discount_amt) || 0,
        vat_enabled || false,
        parseFloat(vat_amt) || 0,
        parseFloat(total) || 0,
        parseFloat(change_due) || 0,
        note || null,
        JSON.stringify(items || []),
        cogs,
      ]
    );

    for (const item of (items || [])) {
      const recipe = await client.query(
        `SELECT pi.ingredient_id, pi.quantity, i.name, i.stock
         FROM product_ingredients pi
         JOIN ingredients i ON i.id = pi.ingredient_id
         WHERE pi.inventory_id = $1`,
        [item.id]
      );

      for (const ing of recipe.rows) {
        const deductAmount = parseFloat(ing.quantity) * parseInt(item.qty);

        if (parseFloat(ing.stock) < deductAmount) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error: `Insufficient stock for ingredient: ${ing.name}. Available: ${ing.stock}, needed: ${deductAmount}`
          });
        }

        await client.query(
          `UPDATE ingredients SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
          [deductAmount, ing.ingredient_id]
        );
      }

      await client.query(
        `UPDATE inventory SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
        [parseInt(item.qty), item.id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /transactions error:", err);
    res.status(500).json({ error: "Failed to save transaction" });
  } finally {
    client.release();
  }
});

app.post("/transactions/:id/void", async (req, res) => {
  try {
    const { id } = req.params;
    const { voided_by, reason } = req.body;

    const result = await pool.query(
      `UPDATE transactions 
       SET is_voided = true, 
           voided_at = NOW(), 
           voided_by = $1,
           void_reason = $2
       WHERE id = $3 
       AND (is_voided = false OR is_voided IS NULL)
       RETURNING *`,
      [voided_by || "Manager", reason || "Manual void", id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found or already voided" });
    }

    res.json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    console.error("POST /transactions/:id/void error:", err);
    res.status(500).json({ error: "Failed to void transaction" });
  }
});

app.post("/transactions/:id/retrieve", async (req, res) => {
  try {
    const { id } = req.params;
    const { retrieved_by } = req.body;

    const result = await pool.query(
      `UPDATE transactions 
       SET is_voided = false, 
           voided_at = NULL, 
           voided_by = NULL,
           void_reason = NULL
       WHERE id = $1 
       AND is_voided = true
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found or not voided" });
    }

    res.json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    console.error("POST /transactions/:id/retrieve error:", err);
    res.status(500).json({ error: "Failed to retrieve transaction" });
  }
});

// ─── DASHBOARD ────────────────────────────────────────────────

app.get("/dashboard/stats", async (req, res) => {
  try {
    const { preset, from, to, branch, branches } = req.query;

    const params = [];
    const conditions = [];
    let paramIdx = 1;

    if (from && to) {
      conditions.push(
        `created_at >= $${paramIdx} AND created_at <= $${paramIdx + 1}::date + interval '1 day'`
      );
      params.push(from, to);
      paramIdx += 2;
    } else {
      const presetMap = {
        day:   `created_at >= CURRENT_DATE`,
        week:  `created_at >= date_trunc('week', CURRENT_DATE)`,
        month: `created_at >= date_trunc('month', CURRENT_DATE)`,
        year:  `created_at >= date_trunc('year', CURRENT_DATE)`,
      };
      conditions.push(presetMap[preset] || presetMap["month"]);
    }

    if (branch) {
      conditions.push(`branch = $${paramIdx}`);
      params.push(branch);
      paramIdx++;
    } else if (branches) {
      const list = branches.split(",").map(b => b.trim()).filter(Boolean);
      if (list.length > 0) {
        const placeholders = list.map((_, i) => `$${paramIdx + i}`).join(", ");
        conditions.push(`branch IN (${placeholders})`);
        params.push(...list);
        paramIdx += list.length;
      }
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(total), 0)               AS "salesRevenue",
         COALESCE(SUM(total), 0)               AS "totalSales",
         COALESCE(SUM(cogs),  0)               AS "cogs",
         COALESCE(SUM(total) - SUM(cogs), 0)   AS "salesProfit",
         COUNT(*)                              AS "txCount",
         CASE WHEN COUNT(*) > 0
              THEN COALESCE(AVG(total), 0)
              ELSE 0 END                       AS "avgOrder"
       FROM transactions ${whereClause}`,
      params
    );

    const row = result.rows[0];
    res.json({
      salesRevenue: parseFloat(row.salesRevenue),
      totalSales:   parseFloat(row.totalSales),
      cogs:         parseFloat(row.cogs),
      salesProfit:  parseFloat(row.salesProfit),
      txCount:      parseInt(row.txCount),
      avgOrder:     parseFloat(row.avgOrder),
    });
  } catch (err) {
    console.error("GET /dashboard/stats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Reports
async function fetchReportWithComments(id) {
  const rRes = await pool.query(
    `SELECT
       r.id, r.brand, r.branch, r.period,
        r.content,
       r.submitted_by  AS "submittedBy",
       r.role, r.status, r.remark,
       r.submitted_at  AS "submittedAt",
       r.updated_at    AS "updatedAt"
     FROM reports r WHERE r.id = $1`,
    [id]
  );
  if (rRes.rows.length === 0) return null;
 
  const cRes = await pool.query(
    `SELECT id, text, author, posted_at AS "postedAt"
     FROM report_comments
     WHERE report_id = $1 ORDER BY posted_at ASC`,
    [id]
  );
  return { ...rRes.rows[0], comments: cRes.rows };
}

app.post('/reports/submit', async (req, res) => {
  const { reportId, submittedBy } = req.body;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  try {
    await pool.query(
      `UPDATE reports 
       SET status = 'submitted', submitted_at = NOW(), expires_at = $1, submitted_by = $2
       WHERE id = $3`,
      [expiresAt, submittedBy, reportId]
    );
    res.json({ success: true, expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

app.get('/reports/history', async (req, res) => {
  const { branch } = req.query;
  try {
    const result = await pool.query(
      `SELECT id, period, content, submitted_at as "submittedAt", 
              submitted_at AS "generatedDate", expires_at as "expiresAt",
              status, remark
       FROM reports
       WHERE branch = $1 AND status = 'submitted' AND expires_at > NOW()
       ORDER BY submitted_at DESC`,
      [branch]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});
 
app.get("/reports/export", async (req, res) => {
  try {
    const { brand, branch, status } = req.query;
    const conditions = [];
    const params     = [];
    let   idx        = 1;

    if (brand)  { conditions.push(`brand  = $${idx++}`); params.push(brand);  }
    if (branch) { conditions.push(`branch = $${idx++}`); params.push(branch); }
    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }

    const where  = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT id, brand, branch, period, submitted_by, role, status, remark, submitted_at
       FROM reports ${where} ORDER BY submitted_at DESC`,
      params
    );

    // Proper RFC-4180 CSV escaping
    const escape = (val) => {
      const s = val == null ? "" : String(val);
      // Wrap in quotes if the value contains comma, quote, or newline
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const toRow = (arr) => arr.map(escape).join(",");

    const headers = ["ID","Brand","Branch","Period","Submitted By","Role","Status","Remark","Submitted At"];
    const rows    = result.rows.map(r => toRow([
      r.id,
      r.brand,
      r.branch,
      r.period,
      r.submitted_by,
      r.role,
      r.status,
      r.remark || "",
      new Date(r.submitted_at).toISOString(),
    ]));

    const csv = [toRow(headers), ...rows].join("\r\n");  // \r\n per RFC-4180

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="reports-${Date.now()}.csv"`);
    res.send(csv);

  } catch (err) {
    console.error("GET /reports/export error:", err);
    res.status(500).json({ error: "Failed to export reports" });
  }
});

app.get("/reports", async (req, res) => {
  try {
    const { brand, branch, status, search } = req.query;
    const conditions = [];
    const params     = [];
    let   idx        = 1;
 
    if (brand)  { conditions.push(`r.brand  = $${idx++}`); params.push(brand);  }
    if (branch) { conditions.push(`r.branch = $${idx++}`); params.push(branch); }
    if (status) { conditions.push(`r.status = $${idx++}`); params.push(status); }
    if (search) {
      conditions.push(`(r.id::text ILIKE $${idx} OR r.submitted_by ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
 
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
 
    const result = await pool.query(
      `SELECT
         r.id, r.brand, r.branch, r.period,
          r.content,  
         r.submitted_by AS "submittedBy",
         r.role, r.status, r.remark,
         r.submitted_at AS "submittedAt",
         r.updated_at   AS "updatedAt",
         COALESCE(
           json_agg(
             json_build_object(
               'id',       c.id,
               'text',     c.text,
               'author',   c.author,
               'postedAt', c.posted_at
             ) ORDER BY c.posted_at
           ) FILTER (WHERE c.id IS NOT NULL),
           '[]'
         ) AS comments
       FROM reports r
       LEFT JOIN report_comments c ON c.report_id = r.id
       ${where}
       GROUP BY r.id
       ORDER BY r.submitted_at DESC`,
      params
    );
 
    res.json(result.rows);
  } catch (err) {
    console.error("GET /reports error:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

app.get("/generated-reports", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, report_id AS "reportId", snapshot, saved_at AS "savedAt"
       FROM generated_reports ORDER BY saved_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch generated reports" });
  }
});

app.get("/reports/deleted", async (req, res) => {
  const { branch } = req.query;
  try {
    const result = await pool.query(
      `SELECT id, period, submitted_by AS "submittedBy", 
              deleted_at AS "deletedAt", expires_at AS "expiresAt",
              submitted_at AS "generatedDate", content
       FROM reports
       WHERE branch = $1 AND status = 'deleted' AND expires_at > NOW()
       ORDER BY deleted_at DESC`,
      [branch]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deleted reports" });
  }
});

app.post("/reports/:id/soft-delete", async (req, res) => {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await pool.query(
      `UPDATE reports 
       SET status = 'deleted', deleted_at = NOW(), expires_at = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [expiresAt, req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Report not found" });

    res.json({ success: true, expiresAt });
  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ error: err.message, detail: err.detail, code: err.code });
  }
});

app.post("/reports/:id/retrieve", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE reports
       SET status = 'pending', deleted_at = NULL, expires_at = NULL, updated_at = NOW()
       WHERE id = $1 AND status = 'deleted' RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Report not found or not deleted" });

    const report = await fetchReportWithComments(req.params.id);
    res.json({ success: true, report });
  } catch (err) {
    console.error("POST /reports/:id/retrieve error:", err);
    res.status(500).json({ error: "Failed to retrieve report" });
  }
});

app.post('/ai/report', async (req, res) => {
  try {
    const prompt = req.body.messages?.[0]?.content || '';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data, null, 2));
    const text = data.choices?.[0]?.message?.content || 'Failed to generate report.';
    res.json({ content: [{ text }] });

  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard/product-analytics', async (req, res) => {
  try {
    const { preset, from, to, branch, branches } = req.query;

    const params = [];
    const conditions = [];
    let paramIdx = 1;

    if (from && to) {
      conditions.push(`created_at >= $${paramIdx} AND created_at <= $${paramIdx + 1}::date + interval '1 day'`);
      params.push(from, to);
      paramIdx += 2;
    } else {
      const presetMap = {
        day:   `created_at >= CURRENT_DATE`,
        week:  `created_at >= date_trunc('week', CURRENT_DATE)`,
        month: `created_at >= date_trunc('month', CURRENT_DATE)`,
        year:  `created_at >= date_trunc('year', CURRENT_DATE)`,
      };
      conditions.push(presetMap[preset] || presetMap['month']);
    }

    if (branch) {
      conditions.push(`branch = $${paramIdx}`);
      params.push(branch);
      paramIdx++;
    } else if (branches) {
      const list = branches.split(',').map(b => b.trim()).filter(Boolean);
      if (list.length > 0) {
        const placeholders = list.map((_, i) => `$${paramIdx + i}`).join(', ');
        conditions.push(`branch IN (${placeholders})`);
        params.push(...list);
        paramIdx += list.length;
      }
    }

    conditions.push(`(is_voided = false OR is_voided IS NULL)`);
    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const result = await pool.query(
      `SELECT branch, items, cashier FROM transactions ${whereClause}`,
      params
    );

    // Region mapping
    const REGION_MAP = {
      NCR: 'Luzon', 'Region 1': 'Luzon', 'Region 2': 'Luzon', 'Region 3': 'Luzon',
      'Region 4A': 'Luzon', 'Region 4B': 'Luzon', 'Region 5': 'Luzon',
      'Region 6': 'Visayas', 'Region 7': 'Visayas', 'Region 8': 'Visayas',
      'Region 9': 'Mindanao', 'Region 10': 'Mindanao', 'Region 11': 'Mindanao',
      'Region 12': 'Mindanao', 'BARMM': 'Mindanao', 'CAR': 'Luzon', 'CARAGA': 'Mindanao',
    };

    // Branch-to-region lookup from DB
    const branchRows = await pool.query(`SELECT b.name AS branch_name, br.region FROM branches b LEFT JOIN brands br ON br.id = b.brand_id`);
    // Actually branches table has region column directly
    const branchRegionRows = await pool.query(`SELECT name, region FROM branches`);
    const branchToRegion = {};
    branchRegionRows.rows.forEach(r => {
      const region = REGION_MAP[r.region] || r.region || 'Other';
      branchToRegion[r.name] = region;
    });

    // Aggregate
    const productMap = {};     // name -> { totalQty, totalRevenue, branchBreakdown, regionBreakdown, buyerCount }
    const buyerProductMap = {}; // cashier -> { productName -> qty }

    for (const tx of result.rows) {
      const items = typeof tx.items === 'string' ? JSON.parse(tx.items) : (tx.items || []);
      const region = branchToRegion[tx.branch] || 'Other';
      const cashier = tx.cashier || 'Unknown';

      for (const item of items) {
        const name = item.name || 'Unknown';
        const qty  = parseInt(item.qty || 0);
        const rev  = parseFloat(item.price || 0) * qty;

        if (!productMap[name]) {
          productMap[name] = { name, totalQty: 0, totalRevenue: 0, branchBreakdown: {}, regionBreakdown: { Luzon: 0, Visayas: 0, Mindanao: 0, Other: 0 } };
        }
        productMap[name].totalQty      += qty;
        productMap[name].totalRevenue  += rev;
        productMap[name].branchBreakdown[tx.branch] = (productMap[name].branchBreakdown[tx.branch] || 0) + qty;
        productMap[name].regionBreakdown[region]    = (productMap[name].regionBreakdown[region]    || 0) + qty;

        // Track per-cashier purchases
        if (!buyerProductMap[cashier]) buyerProductMap[cashier] = {};
        buyerProductMap[cashier][name] = (buyerProductMap[cashier][name] || 0) + qty;
      }
    }

    const allProducts = Object.values(productMap).sort((a, b) => b.totalQty - a.totalQty);
    const totalQtyAll = allProducts.reduce((s, p) => s + p.totalQty, 0);
    const avgQty      = totalQtyAll / Math.max(allProducts.length, 1);

    const top10       = allProducts.slice(0, 10);
    const fastMoving  = allProducts.filter(p => p.totalQty >= avgQty * 1.5).slice(0, 10);
    const slowMoving  = allProducts.filter(p => p.totalQty <= avgQty * 0.5 && p.totalQty > 0).slice(0, 10);

    // Top buyers (cashiers/staff as proxy — replace with user_name if available)
    const topBuyers = Object.entries(buyerProductMap)
      .map(([name, products]) => ({
        name,
        totalItems: Object.values(products).reduce((s, v) => s + v, 0),
        topProduct: Object.entries(products).sort((a, b) => b[1] - a[1])[0]?.[0] || '—',
      }))
      .sort((a, b) => b.totalItems - a.totalItems)
      .slice(0, 10);

    // Regional summary
    const regionSummary = { Luzon: {}, Visayas: {}, Mindanao: {}, Other: {} };
    for (const p of allProducts) {
      for (const [region, qty] of Object.entries(p.regionBreakdown)) {
        if (qty > 0) {
          regionSummary[region][p.name] = (regionSummary[region][p.name] || 0) + qty;
        }
      }
    }
    const regionTop5 = {};
    for (const [region, products] of Object.entries(regionSummary)) {
      regionTop5[region] = Object.entries(products)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty }));
    }

    res.json({
      top10,
      fastMoving,
      slowMoving,
      topBuyers,
      regionTop5,
      totalProducts: allProducts.length,
      avgQty: Math.round(avgQty),
    });

  } catch (err) {
    console.error('GET /dashboard/product-analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
});

app.post('/ai/dashboard-analysis', async (req, res) => {
  try {
  
    const { transactions, brands, preset, filterLabel } = req.body;

      const branchTotals = {};
    const dayTotals    = { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 };
    const dayNames     = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let totalRevenue   = 0;
    let totalCogs      = 0;

    (transactions || []).forEach(tx => {
      const branch = tx.branch || 'Unknown';
      const total  = parseFloat(tx.total  || 0);
      const cogs   = parseFloat(tx.cogs   || 0);
      const day    = dayNames[new Date(tx.created_at).getDay()];

      branchTotals[branch] = (branchTotals[branch] || 0) + total;
      dayTotals[day]       = (dayTotals[day]       || 0) + total;
      totalRevenue        += total;
      totalCogs           += cogs;
    });

    const txCount   = transactions?.length || 0;
    const avgOrder  = txCount > 0 ? totalRevenue / txCount : 0;
    const profit    = totalRevenue - totalCogs;
    const profitPct = totalRevenue > 0
      ? ((profit / totalRevenue) * 100).toFixed(1)
      : '0';

    // ── 2. Fetch inventory / stock data per branch ────────────────────────────
    //    Pull all inventory items so we can detect stock anomalies
    let inventoryRows = [];
    try {
      const invResult = await pool.query(
        `SELECT name, branch, stock, min_stock, price, cost
         FROM inventory
         ORDER BY branch, name`
      );
      inventoryRows = invResult.rows;
    } catch (invErr) {
      console.error('Failed to fetch inventory for AI analysis:', invErr.message);
      // Non-fatal — continue without stock data
    }

    // Group inventory by branch
    const stockByBranch = {};
    for (const item of inventoryRows) {
      const br = item.branch || 'Unknown';
      if (!stockByBranch[br]) stockByBranch[br] = { lowStock: [], zeroStock: [], totalItems: 0 };
      stockByBranch[br].totalItems++;

      const stock    = parseFloat(item.stock    || 0);
      const minStock = parseFloat(item.min_stock || 0);

      if (stock === 0) {
        stockByBranch[br].zeroStock.push(item.name);
      } else if (minStock > 0 && stock <= minStock) {
        stockByBranch[br].lowStock.push({ name: item.name, stock, minStock });
      }
    }

    // ── 3. Identify stock-vs-sales anomalies ──────────────────────────────────
    //    Anomaly A: branch has zero/low stock but is still generating sales
    //    Anomaly B: branch has no recent sales but its stock is not depleting (not ordering)
    const anomalies = [];

    for (const [branch, stockInfo] of Object.entries(stockByBranch)) {
      const hasRevenue      = (branchTotals[branch] || 0) > 0;
      const zeroCount       = stockInfo.zeroStock.length;
      const lowCount        = stockInfo.lowStock.length;
      const totalItems      = stockInfo.totalItems;
      const criticalPct     = totalItems > 0 ? ((zeroCount + lowCount) / totalItems * 100).toFixed(0) : 0;

      // Ghost sales: selling with zero/critically low stock (possible data issue or offline sales)
      if (hasRevenue && zeroCount > 0) {
        anomalies.push({
          branch,
          type:    'ghost_sales',
          revenue: branchTotals[branch],
          zeroStockItems:  stockInfo.zeroStock.slice(0, 5),
          zeroCount,
          lowCount,
          criticalPct,
        });
      }

      // Low stock but no reorder signal: low stock + has sales = should be ordering but isn't
      if (hasRevenue && lowCount >= 3 && zeroCount === 0) {
        anomalies.push({
          branch,
          type:    'low_stock_no_reorder',
          revenue: branchTotals[branch],
          lowStockItems: stockInfo.lowStock.slice(0, 5).map(i => `${i.name} (${i.stock}/${i.minStock})`),
          lowCount,
          criticalPct,
        });
      }

      // Dead stock: branch has full inventory but zero sales — hoarding without selling
      if (!hasRevenue && totalItems > 0 && zeroCount === 0 && lowCount === 0) {
        anomalies.push({
          branch,
          type:       'dead_stock',
          totalItems,
          revenue:    0,
        });
      }
    }

    // ── 4. Build prompt context strings ──────────────────────────────────────
    const sortedBranches = Object.entries(branchTotals).sort((a, b) => b[1] - a[1]);
    const branchCount    = sortedBranches.length;
    const avgBranchRev   = branchCount > 0
      ? sortedBranches.reduce((s, [, v]) => s + v, 0) / branchCount
      : 0;

    const topBranchesDetailed = sortedBranches
      .slice(0, 8)
      .map(([name, rev]) => {
        const pctOfAvg = avgBranchRev > 0
          ? (((rev - avgBranchRev) / avgBranchRev) * 100).toFixed(1)
          : '0';
        const flag = rev > avgBranchRev ? '▲ above avg' : '▼ below avg';
        const stockNote = (() => {
          const s = stockByBranch[name];
          if (!s) return '';
          if (s.zeroStock.length > 0) return ` | ⚠ ${s.zeroStock.length} items at ZERO stock`;
          if (s.lowStock.length > 0)  return ` | ⚠ ${s.lowStock.length} items low stock`;
          return '';
        })();
        return `  • ${name}: ₱${rev.toLocaleString('en-PH', { maximumFractionDigits: 0 })} (${flag} by ${Math.abs(pctOfAvg)}%)${stockNote}`;
      })
      .join('\n');

    const dayEntries  = Object.entries(dayTotals);
    const totalDayRev = dayEntries.reduce((s, [, v]) => s + v, 0);
    const avgDayRev   = totalDayRev / 7;

    const dayBreakdownDetailed = dayEntries
      .map(([d, v]) => {
        const pct = avgDayRev > 0
          ? (((v - avgDayRev) / avgDayRev) * 100).toFixed(0)
          : '0';
        return `${d}: ₱${v.toLocaleString('en-PH', { maximumFractionDigits: 0 })} (${Number(pct) >= 0 ? '+' : ''}${pct}%)`;
      })
      .join(', ');

    const peakDayEntry    = dayEntries.reduce((a, b) => b[1] > a[1] ? b : a, ['—', 0]);
    const slowestDayEntry = dayEntries.reduce((a, b) => b[1] < a[1] ? b : a, ['—', Infinity]);
    const slowestDropPct  = avgDayRev > 0
      ? Math.round(((avgDayRev - slowestDayEntry[1]) / avgDayRev) * 100)
      : 0;
    const weeklyRunRate   = txCount > 0
      ? Math.round((totalRevenue / txCount) * (txCount / 7) * 7)
      : 0;

    // Format anomalies for prompt
    const anomalyBlock = anomalies.length === 0
      ? '  None detected.'
      : anomalies.map(a => {
          if (a.type === 'ghost_sales') {
            return `  • [GHOST SALES] ${a.branch}: ₱${a.revenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })} in sales but ${a.zeroCount} items at ZERO stock. Selling: ${a.zeroStockItems.join(', ')}. This branch may be selling items it cannot fulfill, or stock records are not being updated. ${a.lowCount} additional items below minimum.`;
          }
          if (a.type === 'low_stock_no_reorder') {
            return `  • [LOW STOCK / NOT REORDERING] ${a.branch}: Has ₱${a.revenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })} in active sales but ${a.lowCount} items below minimum stock threshold and not at zero — suggesting the branch is not placing supply orders. Items: ${a.lowStockItems.join(', ')}.`;
          }
          if (a.type === 'dead_stock') {
            return `  • [DEAD STOCK] ${a.branch}: Has ${a.totalItems} inventory items with adequate stock levels but generated ₱0 in sales this period. Possible causes: branch inactivity, menu mismatch, or staff not using the POS.`;
          }
          return '';
        }).join('\n');

    // ── 5. Build Groq prompt ─────────────────────────────────────────────────
    const prompt = `
You are a prescriptive business analyst for iFranchise — a Filipino franchise management system (brands: Coffee Spot quick-service restaurants and iPharma Mart pharmacies).

Your job is NOT to describe what happened. You must tell franchise managers WHAT SPECIFIC ACTIONS TO TAKE RIGHT NOW to improve revenue, cut costs, and fix underperforming branches. Pay special attention to the STOCK VS SALES ANOMALIES section — these are high-priority operational issues.

Period: ${preset || 'this month'} | Scope: ${filterLabel || 'All Brands & Branches'}

═══ PERFORMANCE DATA ═══
Revenue:      ₱${totalRevenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
Profit:       ₱${profit.toLocaleString('en-PH', { maximumFractionDigits: 0 })} (${profitPct}% margin)
COGS:         ₱${totalCogs.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
Transactions: ${txCount} | Avg order: ₱${avgOrder.toFixed(0)}
Avg branch revenue: ₱${avgBranchRev.toLocaleString('en-PH', { maximumFractionDigits: 0 })}

Branch performance vs average (with stock warnings):
${topBranchesDetailed || '  No branch data'}

Day-of-week vs daily average:
${dayBreakdownDetailed}
Peak: ${peakDayEntry[0]} | Slowest: ${slowestDayEntry[0]} (${slowestDropPct}% below avg)

═══ STOCK VS SALES ANOMALIES (HIGH PRIORITY) ═══
${anomalyBlock}

Anomaly types to act on:
- GHOST SALES: Branch is recording sales for items with zero stock → risk of unfulfilled orders, customer complaints, possible data integrity issue
- LOW STOCK / NOT REORDERING: Branch is actively selling but not restocking → stockout imminent, lost sales risk
- DEAD STOCK: Branch has full inventory but no sales → waste risk, possible POS non-compliance or branch inactivity

═══ PRESCRIPTIVE RULES — FOLLOW STRICTLY ═══
1. UNDERPERFORMING branches (below avg): prescribe specific fixes — staffing, promos, menu, or hours changes.
2. OVERPERFORMING branches: prescribe how to replicate their success in weaker ones.
3. SLOWEST day(s): prescribe a concrete promo (e.g. "Run a ₱99 bundle every Tuesday 2–5pm").
4. THIN margins (below 20%): prescribe COGS reduction — supplier renegotiation, waste audit, portion control.
5. LOW avg order (below ₱150 Coffee Spot / ₱200 iPharma): prescribe upselling scripts or bundle mechanics.
6. STOCK ANOMALIES: For each anomaly, prescribe an immediate operational fix with a deadline (e.g. "Place supply order within 48 hours", "Audit POS records vs physical stock by end of week").
7. Always include PESO ESTIMATES where data allows.
8. Every recommendation must be IMMEDIATELY ACTIONABLE — no vague advice.

Return ONLY valid JSON, no markdown, no extra text:
{
  "projectedRevenue": <7-day projection PHP based on run rate ₱${weeklyRunRate}>,
  "projectedChange": <estimated % uplift if recommendations followed, positive number>,
  "peakDay": "${peakDayEntry[0]}",
  "slowestDay": "${slowestDayEntry[0]}",
  "slowestDayDropPct": ${slowestDropPct},
  "confidence": <0-100>,
  "summary": "<3 sentences: (1) performance verdict with key numbers, (2) biggest stock/sales anomaly if any or biggest revenue opportunity, (3) single highest-impact action to take this week>",
  "stockAnomalies": [
    {
      "branch": "<branch name>",
      "anomalyType": "ghost_sales|low_stock_no_reorder|dead_stock",
      "severity": "critical|warning|info",
      "finding": "<1 sentence describing exactly what the data shows>",
      "action": "<immediate corrective action with who, what, when, and expected peso impact>"
    }
  ],
  "recommendations": [
    {
      "branch": "<specific branch or 'All Branches'>",
      "type": "success|warning|info",
      "text": "<WHO does WHAT by WHEN with expected peso impact>",
      "priority": "high|medium|low"
    },
    {
      "branch": "<specific branch or 'All Branches'>",
      "type": "success|warning|info",
      "text": "<concrete action with peso estimate>",
      "priority": "high|medium|low"
    },
    {
      "branch": "<specific branch or 'All Branches'>",
      "type": "success|warning|info",
      "text": "<concrete action with peso estimate>",
      "priority": "high|medium|low"
    },
    {
      "branch": "<specific branch or 'All Branches'>",
      "type": "success|warning|info",
      "text": "<concrete action with peso estimate>",
      "priority": "high|medium|low"
    }
  ]
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.2,
      }),
    });

    const data   = await response.json();
    const raw    = data.choices?.[0]?.message?.content || '{}';
    const clean  = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({ success: true, analysis: parsed });
  } catch (err) {
    console.error('AI dashboard analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/reports/:id", async (req, res) => {
  try {
    const report = await fetchReportWithComments(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    console.error("GET /reports/:id error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

app.patch("/reports/:id/approve", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE reports
       SET status = 'approved', remark = NULL, updated_at = NOW()
       WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Report not found" });
 
    const report = await fetchReportWithComments(req.params.id);
    res.json(report);
  } catch (err) {
    console.error("PATCH /reports/:id/approve error:", err);
    res.status(500).json({ error: "Failed to approve report" });
  }
});
 
app.patch("/reports/:id/return", async (req, res) => {
  try {
    const { remark } = req.body;
    if (!remark?.trim())
      return res.status(400).json({ error: "Return remark is required" });
 
    const result = await pool.query(
      `UPDATE reports
       SET status = 'returned', remark = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id`,
      [remark.trim(), req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Report not found" });
 
    const report = await fetchReportWithComments(req.params.id);
    res.json(report);
  } catch (err) {
    console.error("PATCH /reports/:id/return error:", err);
    res.status(500).json({ error: "Failed to return report" });
  }
});
 
app.post("/reports/:id/comments", async (req, res) => {
  try {
    const { text, author = "Admin" } = req.body;
    if (!text?.trim())
      return res.status(400).json({ error: "Comment text is required" });
 
    const check = await pool.query("SELECT id FROM reports WHERE id=$1", [req.params.id]);
    if (check.rows.length === 0)
      return res.status(404).json({ error: "Report not found" });
 
    const result = await pool.query(
      `INSERT INTO report_comments (report_id, text, author)
       VALUES ($1, $2, $3)
       RETURNING id, text, author, posted_at AS "postedAt"`,
      [req.params.id, text.trim(), author]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /reports/:id/comments error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.post("/reports", async (req, res) => {
  try {
    const { brand, branch, period, submittedBy, role, content } = req.body;
    if (!brand || !branch || !period || !submittedBy)
      return res.status(400).json({ error: "brand, branch, period, and submittedBy are required" });

    const result = await pool.query(
      `INSERT INTO reports (brand, branch, period, submitted_by, role, content)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [brand, branch, period, submittedBy, role || "Branch Manager", content || ""]
    );
    const report = await fetchReportWithComments(result.rows[0].id);
    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error("POST /reports error:", err);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

app.delete("/generated-reports/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM generated_reports WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

app.post("/reports/:id/save", async (req, res) => { 
  try {
    const report = await fetchReportWithComments(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const existing = await pool.query(
      `SELECT id FROM generated_reports WHERE report_id = $1`, [req.params.id]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Report already saved" });

    const snapshot = { ...report, content: req.body.content || '' };

    const result = await pool.query(
      `INSERT INTO generated_reports (report_id, snapshot, saved_at)
       VALUES ($1, $2, NOW())
       RETURNING id, report_id AS "reportId", saved_at AS "savedAt"`,
      [req.params.id, JSON.stringify(report)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /reports/:id/save error:", err);
    res.status(500).json({ error: "Failed to save report" });
  }
});

// DELETE /reports/:id/comments/:commentId
app.delete("/reports/:id/comments/:commentId", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM report_comments
       WHERE id = $1 AND report_id = $2 RETURNING id`,
      [req.params.commentId, req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Comment not found" });
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("DELETE /reports/:id/comments/:commentId error:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

app.delete("/reports/:id", async (req, res) => {
  try {
    // Delete comments first (foreign key constraint)
    await pool.query(`DELETE FROM report_comments WHERE report_id = $1`, [req.params.id]);
    // Delete from generated_reports if saved
    await pool.query(`DELETE FROM generated_reports WHERE report_id = $1`, [req.params.id]);
    // Delete the report itself
    const result = await pool.query(
      `DELETE FROM reports WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Report not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /reports/:id error:", err);
    res.status(500).json({ error: "Failed to delete report" });
  }
});


// ─── NOTIFICATIONS ────────────────────────────────────────────

app.get("/notifications", async (req, res) => {
  const { userId } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.patch("/notifications/:id/read", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read=true WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark read" });
  }
});

app.patch("/notifications/read-all", async (req, res) => {
  const { userId } = req.body;
  try {
    await pool.query("UPDATE notifications SET is_read=true WHERE user_id=$1", [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

// GET
app.get('/brand-delete-history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM brand_delete_history ORDER BY deleted_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch brand delete history' });
  }
});

// POST
app.post('/brand-delete-history', async (req, res) => {
  try {
    const { type, name, brand_name, data } = req.body;
    await pool.query(
      'INSERT INTO brand_delete_history (type, name, brand_name, data) VALUES ($1, $2, $3, $4)',
      [type, name, brand_name || null, JSON.stringify(data)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save brand delete history' });
  }
});

app.delete('/brand-delete-history/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM brand_delete_history WHERE id = $1',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete from brand delete history' });
  }
});

app.get('/delete-history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users_delete_history ORDER BY deleted_at DESC'
    );
    const mapped = result.rows.map(row => ({
      id: row.id,
      data: row.user_data,
      deletedAt: row.deleted_at,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch delete history.' });
  }
});

app.post('/delete-history', async (req, res) => {
  try {
    const { user_data } = req.body;
    await pool.query(
      'INSERT INTO users_delete_history (user_data) VALUES ($1)',
      [JSON.stringify(user_data)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save delete history.' });
  }
});

app.delete('/delete-history/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM users_delete_history WHERE id = $1',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete history entry.' });
  }
});

app.get('/application-delete-history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM application_delete_history ORDER BY deleted_at DESC'
    );
    const mapped = result.rows.map(row => ({
      id: row.id,
      data: row.application_data,
      deletedAt: row.deleted_at,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch application delete history.' });
  }
});

app.post('/application-delete-history', async (req, res) => {
  try {
    const { application_data } = req.body;
    await pool.query(
      'INSERT INTO application_delete_history (application_data) VALUES ($1)',
      [JSON.stringify(application_data)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save application delete history.' });
  }
});

app.delete('/application-delete-history/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM application_delete_history WHERE id = $1',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete application history entry.' });
  }
});

// ─── PAYMONGO — Create GCash payment link ────────────────────────────────────
app.post('/paymongo/create-gcash', async (req, res) => {
  try {
    const { amount, description, orderId } = req.body;

    // PayMongo expects amount in centavos (multiply by 100)
    const amountCentavos = Math.round(parseFloat(amount) * 100);

    if (amountCentavos < 10000) // minimum ₱100
      return res.status(400).json({ error: 'Minimum GCash payment via PayMongo is ₱100.' });

    const auth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64');

    const response = await fetch('https://api.paymongo.com/v1/links', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount:      amountCentavos,
            description: description || `POS Order #${orderId}`,
            remarks:     `Order #${orderId}`,
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayMongo error:', data);
      return res.status(400).json({ error: data.errors?.[0]?.detail || 'PayMongo error' });
    }

    const link       = data.data;
    const checkoutUrl = link.attributes.checkout_url;
    const referenceNo = link.attributes.reference_number;
    const linkId      = link.id;

    res.json({ success: true, checkoutUrl, referenceNo, linkId });
  } catch (err) {
    console.error('PayMongo create-gcash error:', err);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});

// ─── PAYMONGO — Poll payment link status ─────────────────────────────────────
app.get('/paymongo/link-status/:linkId', async (req, res) => {
  try {
    const auth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64');

    const response = await fetch(`https://api.paymongo.com/v1/links/${req.params.linkId}`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });

    const data = await response.json();
    if (!response.ok)
      return res.status(400).json({ error: 'Failed to fetch link status' });

    const attrs  = data.data.attributes;
    const status = attrs.status;

    const payments   = attrs.payments || [];
    const lastPayment = payments[payments.length - 1];
    const gcashRef    = lastPayment?.attributes?.external_reference_number
                     || lastPayment?.id
                     || null;

    res.json({ success: true, status, gcashRef, amount: attrs.amount / 100 });
  } catch (err) {
    console.error('PayMongo link-status error:', err);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

app.post("/api/verify-id", async (req, res) => {
  const { frontImage, backImage, idType } = req.body;

  const ID_TYPE_MAP = {
    "Philippine Passport":   ["PASSPORT", "REPUBLIKA NG PILIPINAS", "REPUBLIC OF THE PHILIPPINES", "PASAPORTE"],
    "Driver's License":      ["DRIVER'S LICENSE", "DRIVING LICENSE", "LAND TRANSPORTATION OFFICE", "LTO"],
    "SSS ID":                ["SOCIAL SECURITY SYSTEM", "SOCIAL SECURITY CARD", "SSS"],
    "GSIS ID":               ["GOVERNMENT SERVICE INSURANCE", "GSIS"],
    "PhilHealth ID":         ["PHILHEALTH", "PHILIPPINE HEALTH INSURANCE"],
    "Pag-IBIG ID":           ["PAG-IBIG", "PAGIBIG", "HOME DEVELOPMENT MUTUAL FUND", "HDMF"],
    "PRC ID":                ["PROFESSIONAL REGULATION COMMISSION", "PRC"],
    "Voter's ID":            ["COMMISSION ON ELECTIONS", "COMELEC", "VOTER"],
    "National ID (PhilSys)": ["PHILSYS", "PHILIPPINE IDENTIFICATION SYSTEM", "NATIONAL ID"],
    "Senior Citizen ID":     ["SENIOR CITIZEN", "OFFICE FOR SENIOR CITIZENS"],
    "PWD ID":                ["PERSON WITH DISABILITY", "PWD"],
    "UMID":                  ["UMID", "UNIFIED MULTI-PURPOSE ID"],
  };

  try {
    const payload = {
      document: frontImage.replace(/^data:image\/\w+;base64,/, ""),
      authenticate: true,
    };

    if (backImage) {
      payload.document_back = backImage.replace(/^data:image\/\w+;base64,/, "");
    }

    const response = await fetch("https://api2.idanalyzer.com/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.ID_ANALYZER_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error?.message || "ID verification failed",
      });
    }

    const data = result.data || {};
    const authScore = result.authentication?.score ?? 1;

    // ── Extract all raw OCR text from the response ───────────────────
    const ocrText = [
      result.data?.ocrResult,
      result.data?.ocrText,
      result.fullText,
      result.rawText,
      // also pull every string value from data fields as fallback
      ...Object.values(data).map(v =>
        Array.isArray(v) ? v.map(i => i?.value || "").join(" ") : v?.value || ""
      ),
    ]
      .filter(Boolean)
      .join(" ")
      .toUpperCase();

    console.log("OCR Text extracted:", ocrText);

    // ── Match OCR text against selected ID type keywords ─────────────
    const expectedKeywords = ID_TYPE_MAP[idType] || [];
    const isCorrectIdType = expectedKeywords.some(keyword =>
      ocrText.includes(keyword.toUpperCase())
    );

    console.log("ID type match:", isCorrectIdType, "| Selected:", idType);

    if (!isCorrectIdType) {
      return res.json({
        success: true,
        data: {
          firstName: "", lastName: "", middleName: "",
          dob: "", address: "", idNumber: "", expiryDate: null,
          isValid: false, confidence: 0,
          reason: `Wrong ID type. You selected "${idType}" but the scanned document does not match. Please upload the correct ID.`,
        },
      });
    }

    // ── Auth score check ─────────────────────────────────────────────
    if (authScore < 0.5) {
      return res.json({
        success: true,
        data: {
          firstName:  data.firstName?.value      || "",
          lastName:   data.lastName?.value       || "",
          middleName: data.middleName?.value     || "",
          dob:        data.dob?.value            || "",
          address:    data.address1?.value       || "",
          idNumber:   data.documentNumber?.value || "",
          expiryDate: data.expiry?.value         || null,
          isValid:    false,
          confidence: authScore,
          reason:     "ID failed authenticity check. Please upload a clear, valid government-issued ID.",
        },
      });
    }

    // ── All checks passed ────────────────────────────────────────────
    res.json({
      success: true,
      data: {
        firstName:  data.firstName?.value      || "",
        lastName:   data.lastName?.value       || "",
        middleName: data.middleName?.value     || "",
        dob:        data.dob?.value            || "",
        address:    data.address1?.value       || "",
        idNumber:   data.documentNumber?.value || "",
        expiryDate: data.expiry?.value         || null,
        isValid:    true,
        confidence: authScore,
        reason:     "ID verified successfully",
      },
    });

  } catch (err) {
    console.error("ID Analyzer error:", err);
    res.status(500).json({ success: false, error: "Failed to verify ID" });
  }
});

// ─── ROOT ─────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Franchise Backend with Per-Device Per-User Trust is Running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});