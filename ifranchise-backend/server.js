require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 5001;

app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:19006",   // Expo web default
  "http://127.0.0.1:3000",
  "http://127.0.0.1:19006",
];

// ===== DB =====
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ===== OTP STORE =====
const otpStore = {};
// { email: { code: "123456", expires: timestamp } }

// ===== EMAIL =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------- STEP 1: CHECK EMAIL + PASSWORD ----------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const deviceToken = req.cookies?.device_token;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const validPass = password === user.rows[0].password; // replace with bcrypt compare
    if (!validPass) return res.status(401).json({ message: "Invalid credentials" });

    // 🔎 Check trusted device
    if (deviceToken) {
      const device = await pool.query(
        "SELECT * FROM trusted_devices WHERE token=$1 AND user_id=$2 AND expires_at > NOW()",
        [deviceToken, user.rows[0].id]
      );

      if (device.rows.length > 0) {
        console.log(`✅ Trusted device found for user ${email}`);
        return res.json({
          success: true,
          skipOtp: true,
          user: user.rows[0],
        });
      } else {
        console.log(`❌ No valid trusted device for user ${email}`);
      }
    } else {
      console.log(`❌ No device token cookie found for user ${email}`);
    }

    // No trusted device → require OTP
    console.log(`📧 OTP required for user ${email}`);
    res.json({ success: true, skipOtp: false, user: user.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- STEP 2: SEND OTP ----------
app.post("/send-otp-after-login", async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (3 minutes)
    otpStore[email] = {
      code: otp,
      expires: Date.now() + 3 * 60 * 1000
    };

    await transporter.sendMail({
      from: `"iFranchise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your iFranchise Login OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Your iFranchise Login OTP</h2>
          <p>Your one-time password is:</p>
          <h1 style="background: #E8F5E9; padding: 15px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666;">This code will expire in 3 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`📧 OTP sent to ${email}: ${otp}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ---------- STEP 3: VERIFY OTP & LOGIN ----------
app.post("/verify-otp-login", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // 🔐 Check OTP exists and not expired
    if (!otpStore[email]) {
      return res.status(401).json({ message: "No OTP found for this email" });
    }

    const storedOtp = otpStore[email];

    // Check expiration
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res.status(401).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check OTP match
    if (storedOtp.code !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // OTP valid → remove it
    delete otpStore[email];
    console.log(`✅ OTP verified for ${email}`);

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.rows[0].id;

    // Create trusted device token
    const deviceToken = uuidv4();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days from now

    // Check if there's already a device token for this user, update it
    const existingDevice = await pool.query(
      "SELECT * FROM trusted_devices WHERE user_id=$1",
      [userId]
    );

    if (existingDevice.rows.length > 0) {
      // Update existing token
      await pool.query(
        "UPDATE trusted_devices SET token=$1, expires_at=$2 WHERE user_id=$3",
        [deviceToken, expires, userId]
      );
      console.log(`🔄 Updated existing device token for user ${userId}`);
    } else {
      // Insert new token
      await pool.query(
        "INSERT INTO trusted_devices (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [userId, deviceToken, expires]
      );
      console.log(`🆕 Created new device token for user ${userId}`);
    }

    // 🍪 Save cookie (30 days)
    res.cookie("device_token", deviceToken, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    console.log(`🍪 Device cookie set for user ${email}`);

    res.json({ success: true, user: user.rows[0] });

  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

// ---------- LOGOUT (Clear device token) ----------
app.post("/logout", async (req, res) => {
  const deviceToken = req.cookies?.device_token;

  try {
    if (deviceToken) {
      // Delete trusted device from database
      await pool.query("DELETE FROM trusted_devices WHERE token=$1", [deviceToken]);
      console.log(`🗑️ Device token removed: ${deviceToken}`);
    }

    // Clear cookie
    res.clearCookie("device_token");
    res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

// ========== USER MANAGEMENT ENDPOINTS ==========

// Get all users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, branch FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Add user
app.post("/users", async (req, res) => {
  try {
    const { name, email, role, branch, password } = req.body;

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, branch) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, email, password, role, branch]
    );

    res.json({ success: true, user: result.rows[0] });

  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Email already exists" });

    res.status(500).json({ error: "Failed to add user" });
  }
});

// Update user
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, branch, password } = req.body;

    let query, params;

    if (password) {
      query = `UPDATE users SET name=$1,email=$2,role=$3,branch=$4,password=$5 WHERE id=$6 RETURNING *`;
      params = [name, email, role, branch, password, id];
    } else {
      query = `UPDATE users SET name=$1,email=$2,role=$3,branch=$4 WHERE id=$5 RETURNING *`;
      params = [name, email, role, branch, id];
    }

    const result = await pool.query(query, params);
    res.json({ success: true, user: result.rows[0] });

  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    res.json({ success: true, message: "User deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ========== PASSWORD CHANGE ENDPOINTS ==========

// Send OTP for password change
app.post("/send-otp-password-change", async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      code: otp,
      expires: Date.now() + 3 * 60 * 1000
    };

    await transporter.sendMail({
      from: `"iFranchise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP for Password Change",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Password Change Request</h2>
          <p>Your one-time password is:</p>
          <h1 style="background: #E8F5E9; padding: 15px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666;">This code will expire in 3 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`📧 Password change OTP sent to ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending password change OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Change password with OTP verification
app.put("/users/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword, email, otp } = req.body;
    const userId = req.params.id;

    console.log("---- PASSWORD CHANGE REQUEST ----");
    console.log("User ID:", userId);
    console.log("Email:", email);

    // 1️⃣ Check OTP
    if (!otpStore[email]) {
      console.log("❌ No OTP found");
      return res.status(401).json({ error: "No OTP found. Please request a new one." });
    }

    const storedOtp = otpStore[email];

    // Check expiration
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      console.log("❌ OTP expired");
      return res.status(401).json({ error: "OTP has expired. Please request a new one." });
    }

    // Check OTP match
    if (storedOtp.code !== otp) {
      console.log("❌ OTP mismatch");
      return res.status(401).json({ error: "Invalid OTP" });
    }

    delete otpStore[email];
    console.log("✅ OTP PASSED");

    // 2️⃣ Check current password
    const result = await pool.query(
      "SELECT password FROM users WHERE id=$1",
      [userId]
    );

    if (result.rows.length === 0) {
      console.log("❌ USER NOT FOUND");
      return res.status(404).json({ error: "User not found" });
    }

    const storedPassword = result.rows[0].password;

    if (storedPassword !== currentPassword) {
      console.log("❌ CURRENT PASSWORD WRONG");
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    console.log("✅ CURRENT PASSWORD CORRECT");

    // 3️⃣ Update password
    await pool.query(
      "UPDATE users SET password=$1 WHERE id=$2",
      [newPassword, userId]
    );

    console.log("✅ PASSWORD UPDATED");

    // 4️⃣ Issue a new trusted device token after password change
    const deviceToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const existingDevice = await pool.query(
      "SELECT * FROM trusted_devices WHERE user_id=$1",
      [userId]
    );

    if (existingDevice.rows.length > 0) {
      await pool.query(
        "UPDATE trusted_devices SET token=$1, expires_at=$2 WHERE user_id=$3",
        [deviceToken, expires, userId]
      );
    } else {
      await pool.query(
        "INSERT INTO trusted_devices (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [userId, deviceToken, expires]
      );
    }

    res.cookie("device_token", deviceToken, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Password changed successfully" });

  } catch (err) {
    console.error("🔥 Password change error:", err);
    res.status(500).json({ error: "Server error while changing password" });
  }
});

// ---------- FORGOT PASSWORD: Send OTP ----------
app.post("/send-forgot-password-otp", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (3 minutes)
    otpStore[email] = {
      code: otp,
      expires: Date.now() + 3 * 60 * 1000
    };

    // Send email
    await transporter.sendMail({
      from: `"iFranchise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - iFranchise",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Password Reset Request</h2>
          <p>You requested to reset your password. Your one-time password is:</p>
          <h1 style="background: #E8F5E9; padding: 15px; text-align: center; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666;">This code will expire in 3 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`📧 Password reset OTP sent to ${email}: ${otp}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending password reset OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ---------- FORGOT PASSWORD: Reset Password ----------
// In your server.js, REPLACE your existing /reset-password endpoint with this one

app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // 1️⃣ Check if OTP exists
    if (!otpStore[email]) {
      return res.status(401).json({ message: "No OTP found. Please request a new one." });
    }

    const storedOtp = otpStore[email];

    // 2️⃣ Check if OTP expired
    if (Date.now() > storedOtp.expires) {
      delete otpStore[email];
      return res.status(401).json({ message: "OTP has expired. Please request a new one." });
    }

    // 3️⃣ Check if OTP matches
    if (storedOtp.code !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // 4️⃣ Verify user exists
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    
    if (user.rows.length === 0) {
      delete otpStore[email];
      return res.status(404).json({ message: "User not found" });
    }

    const userId = user.rows[0].id;

    // 5️⃣ Update password
    await pool.query(
      "UPDATE users SET password=$1 WHERE email=$2",
      [newPassword, email]
    );

    // 6️⃣ Clear OTP
    delete otpStore[email];

    // 7️⃣ Create trusted device token (same logic as verify-otp-login)
    const deviceToken = uuidv4();
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days

    const existingDevice = await pool.query(
      "SELECT * FROM trusted_devices WHERE user_id=$1",
      [userId]
    );

    if (existingDevice.rows.length > 0) {
      await pool.query(
        "UPDATE trusted_devices SET token=$1, expires_at=$2 WHERE user_id=$3",
        [deviceToken, expires, userId]
      );
    } else {
      await pool.query(
        "INSERT INTO trusted_devices (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [userId, deviceToken, expires]
      );
    }

    // 8️⃣ Set device_token cookie
    res.cookie("device_token", deviceToken, {
      httpOnly: true,
      secure: false, // set true in production with HTTPS
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    console.log(`✅ Password reset successful for ${email} — device trusted for 30 days`);
    res.json({ success: true, message: "Password reset successfully" });

  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

// ========== APPLICATIONS ==========
let applications = [];

app.get('/applications', (req, res) => {
  try {
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

// Submit regular franchise application
app.post('/applications', (req, res) => {
  try {
    console.log('Received application:', req.body);

    const fullName = [
      req.body.firstName,
      req.body.middleInitial ? req.body.middleInitial + '.' : '',
      req.body.lastName
    ].filter(Boolean).join(' ').trim();

    const newApplication = {
      id: applications.length + 1,
      ...req.body,
      name: fullName,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };

    applications.push(newApplication);

    console.log('Application saved:', newApplication);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    });
  }
});

// Submit iPharma Mart application
app.post('/ipharma-applications', (req, res) => {
  try {
    console.log('Received iPharma application:', req.body);

    const newApplication = {
      id: applications.length + 1,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.mobile,
      franchise: 'iPharma Mart',
      status: 'pending',
      date: req.body.date || new Date().toISOString().split('T')[0],

      // iPharma specific fields
      address: req.body.address,
      telephone: req.body.telephone,
      dob: req.body.dob,
      civilStatus: req.body.maritalStatus,
      spouseName: req.body.spouseName,
      spouseOccupation: req.body.spouseOccupation,
      spouseDob: req.body.spouseDob,
      dependents: req.body.dependents,
      tin: req.body.tin,
      education: req.body.education,

      // Business Interest
      involvement: req.body.involvement,
      equity: req.body.equity,
      investment: req.body.investment,
      fundSource: req.body.fundSource,
      otherBusiness: req.body.otherBusiness,
      location: req.body.location,

      // Declaration
      familyDepend: req.body.familyDepend,
      marketArea: req.body.marketArea,
      startDate: req.body.startDate,
      signature: req.body.signature,
      dateSigned: req.body.dateSigned,

      // For compatibility with standard fields
      paymentMode: 'To be determined',
      gender: 'Not specified',
      nationality: 'Filipino',
      employmentType: 'Business Owner',
      yearsEmployer: '0',
      income: req.body.investment || '0',
      employerName: req.body.otherBusiness || 'Self-employed',
      businessAddress: req.body.location,
      position: 'Franchise Owner',
      businessNature: 'Pharmaceutical Retail'
    };

    applications.push(newApplication);

    console.log('iPharma application saved:', newApplication);

    res.json({
      success: true,
      message: 'iPharma Mart application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Error submitting iPharma application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
      details: error.message
    });
  }
});

// Delete application
app.delete('/applications/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = applications.findIndex(app => app.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    applications.splice(index, 1);

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete application'
    });
  }
});

// Update application status
app.put('/applications/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const application = applications.find(app => app.id === id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    application.status = status;

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status'
    });
  }
});

app.get("/", (req, res) => {
  res.send("Franchise Backend with 30-Day Device Trust is Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});