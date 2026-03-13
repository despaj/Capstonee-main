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
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:8081"],
  credentials: true
}));
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

const otpStore = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function getOrCreateDeviceId(req, res) {
  let deviceId = req.cookies?.device_id;
  if (!deviceId) {
    deviceId = uuidv4();
    res.cookie("device_id", deviceId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
    console.log(`🆕 New device_id created: ${deviceId}`);
  }
  return deviceId;
}

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

    const device = await pool.query(
      `SELECT * FROM trusted_devices
       WHERE device_id = $1 AND user_id = $2 AND expires_at > NOW()`,
      [deviceId, user.rows[0].id]
    );

    if (device.rows.length > 0) {
      console.log(`Trusted device for user ${email} — skipping OTP`);
      return res.json({ success: true, skipOtp: true, user: user.rows[0] });
    }

    console.log(`OTP required for user ${email} on device ${deviceId}`);
    res.json({ success: true, skipOtp: false, user: user.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/send-otp-after-login", async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };

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
        </div>`,
    });

    console.log(` OTP sent to ${email}: ${otp}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending OTP:", err);
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

    console.log(`🔒 Device ${deviceId} trusted for user ${userId} for 30 days`);
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
      console.log(`🗑️ Trust revoked for user ${userId} on device ${deviceId}`);
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

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

app.delete("/users/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
    res.json({ success: true, message: "User deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.post("/send-otp-password-change", async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { code: otp, expires: Date.now() + 3 * 60 * 1000 };

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
        </div>`,
    });

    console.log(`📧 Password change OTP sent to ${email}`);
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
        </div>`,
    });

    console.log(`📧 Password reset OTP sent to ${email}: ${otp}`);
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

let applications = [];

app.get("/applications", (req, res) => {
  res.json(applications);
});

app.post("/applications", (req, res) => {
  try {
    const newApplication = {
      id: applications.length + 1,
      ...req.body,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    };
    applications.push(newApplication);
    res.json({ success: true, message: "Application submitted successfully", application: newApplication });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to submit application" });
  }
});

app.post("/ipharma-applications", (req, res) => {
  try {
    const newApplication = {
      id: applications.length + 1,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.mobile,
      franchise: "iPharma Mart",
      status: "pending",
      date: req.body.date || new Date().toISOString().split("T")[0],
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
      involvement: req.body.involvement,
      equity: req.body.equity,
      investment: req.body.investment,
      fundSource: req.body.fundSource,
      otherBusiness: req.body.otherBusiness,
      location: req.body.location,
      familyDepend: req.body.familyDepend,
      marketArea: req.body.marketArea,
      startDate: req.body.startDate,
      signature: req.body.signature,
      dateSigned: req.body.dateSigned,
      paymentMode: "To be determined",
      gender: "Not specified",
      nationality: "Filipino",
      employmentType: "Business Owner",
      yearsEmployer: "0",
      income: req.body.investment || "0",
      employerName: req.body.otherBusiness || "Self-employed",
      businessAddress: req.body.location,
      position: "Franchise Owner",
      businessNature: "Pharmaceutical Retail",
    };
    applications.push(newApplication);
    res.json({ success: true, message: "iPharma Mart application submitted successfully", application: newApplication });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to submit application", details: error.message });
  }
});

app.delete("/applications/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = applications.findIndex((app) => app.id === id);
    if (index === -1)
      return res.status(404).json({ success: false, error: "Application not found" });
    applications.splice(index, 1);
    res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete application" });
  }
});

app.put("/applications/:id/status", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const application = applications.find((app) => app.id === id);
    if (!application)
      return res.status(404).json({ success: false, error: "Application not found" });
    application.status = status;
    res.json({ success: true, message: "Application status updated successfully", application });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update application status" });
  }
});

app.get("/", (req, res) => {
  res.send("Franchise Backend with Per-Device Per-User Trust is Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});