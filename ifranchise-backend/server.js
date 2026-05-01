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
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", "https://franchisync.vercel.app", "http://localhost:8081"],
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

const otpStore = {};

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

function rowToApplication(row) {
  return {
    id:               row.id,
    name:             row.name,
    email:            row.email,
    phone:            row.phone,
    franchise:        row.franchise,
    paymentMode:      row.payment_mode,
    status:           row.status,
    date:             row.date,
    dob:              row.dob,
    civilStatus:      row.civil_status,
    gender:           row.gender,
    nationality:      row.nationality,
    address:          row.address,
    dependents:       row.dependents,
    spouseName:       row.spouse_name,
    spouseOccupation: row.spouse_occupation,
    spouseDob:        row.spouse_dob,
    employmentType:   row.employment_type,
    yearsEmployer:    row.years_employer,
    income:           row.income,
    employerName:     row.employer_name,
    businessAddress:  row.business_address,
    position:         row.position,
    businessNature:   row.business_nature,
    telephone:        row.telephone,
    tin:              row.tin,
    education:        row.education,
    involvement:      row.involvement,
    equity:           row.equity,
    investment:       row.investment,
    fundSource:       row.fund_source,
    otherBusiness:    row.other_business,
    location:         row.location,
    familyDepend:     row.family_depend,
    marketArea:       row.market_area,
    startDate:        row.start_date,
    signature:        row.signature,
    dateSigned:       row.date_signed,
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
  };
}

// ─── AUTH ───────────────────────────────────────────────────

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const deviceId = getOrCreateDeviceId(req, res);

  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const validPass = password === user.rows[0].password;
    if (!validPass)
      return res.status(401).json({ message: "Invalid credentials" });

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

    console.log(`OTP required for user ${email} on device ${deviceId}`);
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
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your iFranchise Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Password Reset Request</h2>
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
  const deviceId = getOrCreateDeviceId(req, res);

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
    console.log(`OTP verified for ${email}`);

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const userId = user.rows[0].id;
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    await pool.query(
      `INSERT INTO trusted_devices (user_id, device_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, device_id)
       DO UPDATE SET expires_at = EXCLUDED.expires_at`,
      [userId, deviceId, expires]
    );

    console.log(`Device ${deviceId} trusted for user ${userId} for 30 days`);
    res.json({ success: true, user: user.rows[0] });
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

// ─── USERS ──────────────────────────────────────────────────

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, branch, age, address, contact_number FROM users ORDER BY id"
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

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, branch, password, age, address, contact_number } = req.body;
    let query, params;
    if (password) {
      query = `UPDATE users SET name=$1, email=$2, role=$3, branch=$4, password=$5, age=$6, address=$7, contact_number=$8 WHERE id=$9 RETURNING *`;
      params = [name, email, role, branch, password, age || null, address || null, contact_number || null, id];
    } else {
      query = `UPDATE users SET name=$1, email=$2, role=$3, branch=$4, age=$5, address=$6, contact_number=$7 WHERE id=$8 RETURNING *`;
      params = [name, email, role, branch, age || null, address || null, contact_number || null, id];
    }
    const result = await pool.query(query, params);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    res.json({ success: true, message: "User deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ─── PROFILE (api/users) ─────────────────────────────────────

app.get("/api/users/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, branch, age, address, contact_number FROM users WHERE id=$1",
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
      age:           row.age || "",
    });
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, age, address, contactNumber, newPassword } = req.body;
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    let query, params;
    if (newPassword) {
      query = `UPDATE users SET name=$1, email=$2, password=$3, age=$4, address=$5, contact_number=$6 WHERE id=$7 RETURNING *`;
      params = [fullName, email, newPassword, age || null, address || null, contactNumber || null, req.params.id];
    } else {
      query = `UPDATE users SET name=$1, email=$2, age=$3, address=$4, contact_number=$5 WHERE id=$6 RETURNING *`;
      params = [fullName, email, age || null, address || null, contactNumber || null, req.params.id];
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
      from: "onboarding@resend.dev",
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
      from: "onboarding@resend.dev",
      to: email,
      subject: "Password Reset OTP - iFranchise",
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

app.post("/api/send-credentials", async (req, res) => {
  console.log("send-credentials body:", req.body);
  const { to, name, password } = req.body;
  console.log("to:", to, "name:", name, "password:", password);
  try {
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "despajanelle@gmail.com",
      subject: "Your Account Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Welcome, ${name}!</h2>
          <p>Your account has been created. Here are your login credentials:</p>
          <div style="background: #E8F5E9; padding: 15px; margin: 15px 0;">
            <p><strong>Email:</strong> ${to}</p>
            <p><strong>Temporary Password:</strong> <span style="letter-spacing: 2px;">${password}</span></p>
          </div>
          <p style="color: #e74c3c;">Please log in and change your password immediately.</p>
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

app.get("/applications", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM applications ORDER BY created_at DESC"
    );
    res.json(result.rows.map(rowToApplication));
  } catch (err) {
    console.error("Error fetching applications:", err);
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
        signature, date_signed
      ) VALUES (
        $1,$2,$3,$4,$5,'pending',CURRENT_DATE,
        $6,$7,$8,$9,$10,$11,
        $12,$13,
        $14,$15,$16,
        $17,$18,$19,$20,
        $21,$22
      ) RETURNING *`,
      [
        b.name, b.email, b.phone, b.franchise, b.paymentMode,
        b.dob || null, b.civilStatus, b.gender, b.nationality, b.address,
        b.dependents ? parseInt(b.dependents) : null,
        b.spouseName || null, b.spouseOccupation || null,
        b.employmentType, b.yearsEmployer ? parseInt(b.yearsEmployer) : null,
        b.income ? parseFloat(b.income) : null,
        b.employerName, b.businessAddress, b.position, b.businessNature,
        b.signature, b.dateSigned || null,
      ]
    );
    const app = rowToApplication(result.rows[0]);
    res.json({ success: true, message: "Application submitted successfully", application: app });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ success: false, error: "Failed to submit application" });
  }
});

app.post("/ipharma-applications", async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `INSERT INTO applications (
        name, email, phone, franchise, payment_mode, status, date,
        address, telephone,
        dob, civil_status, spouse_name, spouse_occupation, spouse_dob, dependents,
        tin, education, involvement, equity, investment, fund_source,
        other_business, location, family_depend, market_area, start_date,
        signature, date_signed,
        gender, nationality,
        employment_type, years_employer, income,
        employer_name, business_address, position, business_nature
      ) VALUES (
        $1,$2,$3,'iPharma Mart','To be determined','pending',$4,
        $5,$6,
        $7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,
        $24,$25,
        'Not specified','Filipino',
        'Business Owner',0,$17,
        $19,$20,'Franchise Owner','Pharmaceutical Retail'
      ) RETURNING *`,
      [
        b.name, b.email, b.mobile,
        b.date || new Date().toISOString().split("T")[0],
        b.address, b.telephone || null,
        b.dob || null, b.maritalStatus, b.spouseName || null,
        b.spouseOccupation || null, b.spouseDob || null,
        b.dependents ? parseInt(b.dependents) : null,
        b.tin || null, b.education || null, b.involvement || null,
        b.equity || null,
        b.investment ? parseFloat(b.investment) : null,
        b.fundSource || null,
        b.otherBusiness || null, b.location || null,
        b.familyDepend || null, b.marketArea || null,
        b.startDate || null,
        b.signature || null, b.dateSigned || null,
      ]
    );
    const app = rowToApplication(result.rows[0]);
    res.json({ success: true, message: "iPharma Mart application submitted successfully", application: app });
  } catch (err) {
    console.error("Error submitting iPharma application:", err);
    res.status(500).json({ success: false, error: "Failed to submit application", details: err.message });
  }
});

app.put("/applications/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      "UPDATE applications SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
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
    const result = await pool.query(
      "DELETE FROM applications WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "Application not found" });
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

    const mindeeClient = new mindee.v2.Client({ apiKey: process.env.MINDEE_API_KEY });
    const inputSource = new mindee.PathInput({ inputPath: req.file.path });

    const response = await mindeeClient.enqueueAndGetResult(
      mindee.v2.product.Extraction,
      inputSource,
      { modelId: process.env.MINDEE_MODEL_ID }
    );

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const fields = response.rawHttp.inference.result.fields;

    const merchant = fields?.supplier_name?.value            ?? null;
    const date     = fields?.date?.value                     ?? null;
    const total    = fields?.total_amount?.value             ?? null;
    const currency = fields?.locale?.fields?.currency?.value ?? "PHP";

    const lineItems = (fields?.line_items?.items ?? []).map(item => ({
      description: item.fields?.description?.value || "Item",
      quantity:    item.fields?.quantity?.value    || 0,
      unitPrice:   item.fields?.unit_price?.value  || 0,
      totalPrice:  item.fields?.total_price?.value || 0,
    }));

    console.log("Extracted fields:", { merchant, date, total, currency, lineItems });

    const client = await pool.connect();
    let savedReceipt;
    try {
      await client.query("BEGIN");
      const receiptResult = await client.query(
        `INSERT INTO receipts (merchant, date, total_amount, currency)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [merchant, date, total, currency]
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

    res.json({ id: savedReceipt.id, merchant, date, total, currency, lineItems });
  } catch (err) {
    console.error("OCR error:", err.response?.data || err.message || err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "OCR failed", details: err.message || err });
  }
});

app.post("/ocr-extract", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const mindeeClient = new mindee.v2.Client({ apiKey: process.env.MINDEE_API_KEY });
    const inputSource = new mindee.PathInput({ inputPath: req.file.path });

    const response = await mindeeClient.enqueueAndGetResult(
      mindee.v2.product.Extraction,
      inputSource,
      { modelId: process.env.MINDEE_MODEL_ID }
    );

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const fields = response.rawHttp.inference.result.fields;

    const merchant = fields?.supplier_name?.value            ?? null;
    const date     = fields?.date?.value                     ?? null;
    const total    = fields?.total_amount?.value             ?? null;
    const currency = fields?.locale?.fields?.currency?.value ?? "PHP";

    const lineItems = (fields?.line_items?.items ?? []).map(item => ({
      description: item.fields?.description?.value || "Item",
      quantity:    item.fields?.quantity?.value    || 0,
      unitPrice:   item.fields?.unit_price?.value  || 0,
      totalPrice:  item.fields?.total_price?.value || 0,
    }));

    res.json({ merchant, date, total, currency, lineItems });
  } catch (err) {
    console.error("OCR extract error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "OCR failed", details: err.message });
  }
});

app.get("/receipts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM receipts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});

app.get("/receipts/:id", async (req, res) => {
  try {
    const receipt = await pool.query("SELECT * FROM receipts WHERE id=$1", [req.params.id]);
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
  const { merchant, date, total, currency, lineItems } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const receiptResult = await client.query(
      `INSERT INTO receipts (merchant, date, total_amount, currency)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [merchant, date, total, currency || "PHP"]
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
  const { merchant, date, total_amount, currency, lineItems } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE receipts SET merchant=$1, date=$2, total_amount=$3, currency=$4 WHERE id=$5`,
      [merchant, date, total_amount, currency, req.params.id]
    );

    await client.query("DELETE FROM receipt_items WHERE receipt_id=$1", [req.params.id]);

    for (const item of lineItems) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.params.id, item.description, item.quantity, item.unit_price, item.total_price]
      );
    }

    await client.query("COMMIT");

    const receipt = await pool.query("SELECT * FROM receipts WHERE id=$1", [req.params.id]);
    const items   = await pool.query("SELECT * FROM receipt_items WHERE receipt_id=$1 ORDER BY id", [req.params.id]);
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

// ─── INVENTORY ───────────────────────────────────────────────

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

app.post("/inventory", async (req, res) => {
  try {
    const { name, category, branch, brand, stock, min_stock, minStock, cost, price } = req.body;

    if (!branch)
      return res.status(400).json({ error: "Branch is required" });

    const result = await pool.query(
      `INSERT INTO inventory (name, category, branch, brand, stock, min_stock, cost, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        name, category, branch, brand || null,
        parseInt(stock) || 0,
        parseInt(min_stock ?? minStock) || 0,
        parseFloat(cost) || 0,
        parseFloat(price) || 0,
      ]
    );
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("POST /inventory error:", err);
    res.status(500).json({ error: "Failed to add inventory item" });
  }
});

app.put("/inventory/:id", async (req, res) => {
  try {
    const { name, category, branch, brand, stock, min_stock, minStock, cost, price } = req.body;

    const result = await pool.query(
      `UPDATE inventory
       SET name=$1, category=$2, branch=$3, brand=$4, stock=$5, min_stock=$6, cost=$7, price=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [
        name, category, branch, brand || null,
        parseInt(stock) || 0,
        parseInt(min_stock ?? minStock) || 0,
        parseFloat(cost) || 0,
        parseFloat(price) || 0,
        req.params.id,
      ]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("PUT /inventory/:id error:", err);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

app.delete("/inventory/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM inventory WHERE id=$1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Item not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /inventory/:id error:", err);
    res.status(500).json({ error: "Failed to delete inventory item" });
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
    const { name, branch, brand, unit, stock, min_stock, cost_per_unit } = req.body;
    if (!name || !unit)
      return res.status(400).json({ error: "Name and unit are required" });
    const result = await pool.query(
      `INSERT INTO ingredients (name, branch, brand, unit, stock, min_stock, cost_per_unit)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, branch || null, brand || null, unit,
       parseFloat(stock) || 0, parseFloat(min_stock) || 0, parseFloat(cost_per_unit) || 0]
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
    const { name, branch, brand, unit, stock, min_stock, cost_per_unit } = req.body;

    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE ingredients
       SET name=$1, branch=$2, brand=$3, unit=$4, stock=$5, min_stock=$6, cost_per_unit=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [
        name, branch || null, brand || null, unit,
        parseFloat(stock) || 0, parseFloat(min_stock) || 0,
        parseFloat(cost_per_unit) || 0,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Ingredient not found" });
    }

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

    res.json({
      success: true,
      item: result.rows[0],
      updatedProducts: affectedProducts.rows.length
    });
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
    console.log('Update result:', result.rows); // <-- add
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
    const result = await pool.query(`
      SELECT id, name, price, unit, image_url, is_visible, shop, brand, stock
      FROM shop_items
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shop items" });
  }
});

app.post("/shop-items", async (req, res) => {
  try {
    const { name, price, unit, image_url, shop, brand, stock, is_visible } = req.body;
    const result = await pool.query(
      `INSERT INTO shop_items (name, price, unit, image_url, shop, brand, stock, is_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, parseFloat(price), unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true]
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
    const { name, price, unit, image_url, shop, brand, stock, is_visible } = req.body;
    const result = await pool.query(
      `UPDATE shop_items
       SET name=$1, price=$2, unit=$3, image_url=$4, shop=$5, brand=$6, stock=$7, is_visible=$8
       WHERE id=$9 RETURNING *`,
      [name, parseFloat(price), unit || null, image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true, req.params.id]
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

    const userResult = await pool.query(
      "SELECT role FROM users WHERE id=$1", [userId]
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    if (userResult.rows[0].role !== "Administrator")
      return res.status(403).json({ error: "Unauthorized" });

    await pool.query("DELETE FROM announcements WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Update error:", err);
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
  console.log("address value being inserted:", address);

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

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Order not found" });

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
          "SELECT * FROM transactions WHERE branch=$1 ORDER BY created_at DESC", [branch]
        )
      : await pool.query("SELECT * FROM transactions ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /transactions error:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
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
// GET /reports/:id
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
 
// POST /reports  — submit a new report
app.post("/reports", async (req, res) => {
  try {
    const { brand, branch, period, submittedBy, role } = req.body;
    if (!brand || !branch || !period || !submittedBy)
      return res.status(400).json({ error: "brand, branch, period, and submittedBy are required" });
 
    const result = await pool.query(
      `INSERT INTO reports (brand, branch, period, submitted_by, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [brand, branch, period, submittedBy, role || "Branch Manager"]
    );
    const report = await fetchReportWithComments(result.rows[0].id);
    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error("POST /reports error:", err);
    res.status(500).json({ error: "Failed to submit report" });
  }
});
 
// PATCH /reports/:id/approve
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
 
// PATCH /reports/:id/return  — body: { remark }
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
 
// POST /reports/:id/comments  — body: { text, author? }
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

// ─── ROOT ─────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send("Franchise Backend with Per-Device Per-User Trust is Running");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});