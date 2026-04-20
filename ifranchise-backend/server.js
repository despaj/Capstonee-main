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
    origin: ["http://localhost:3000","https://franchisync.vercel.app", "http://localhost:8081"],
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
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
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
          -- default values for shared fields
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

    const merchant  = fields?.supplier_name?.value            ?? null;
    const date      = fields?.date?.value                     ?? null;
    const total     = fields?.total_amount?.value             ?? null;
    const currency  = fields?.locale?.fields?.currency?.value ?? "PHP";

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

app.get("/receipts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM receipts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});

app.get("/receipts/:id", async (req, res) => {
  try {
    const receipt = await pool.query(
      "SELECT * FROM receipts WHERE id=$1", [req.params.id]
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

// OCR extract only — does NOT save to DB
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

    const merchant = fields?.supplier_name?.value                ?? null;
    const date     = fields?.date?.value                         ?? null;
    const total    = fields?.total_amount?.value                 ?? null;
    const currency = fields?.locale?.fields?.currency?.value     ?? "PHP";

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

    app.delete("/receipts/:id", async (req, res) => {
      try {
        await pool.query("DELETE FROM receipts WHERE id=$1", [req.params.id]);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Failed to delete receipt" });
      }
    });

    // GET all inventory
    app.get("/inventory", async (req, res) => {
      try {
        const { branch } = req.query;
        const result = branch
          ? await pool.query("SELECT * FROM inventory WHERE branch=$1 ORDER BY name", [branch])
          : await pool.query("SELECT * FROM inventory ORDER BY name");
        res.json(result.rows);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch inventory" });
      }
    });

// POST add item
app.post("/inventory", async (req, res) => {
  try {
    const { name, category, branch, stock, minStock, price } = req.body;

    if (!branch) 
      return res.status(400).json({ error: "Branch is required" });

    const result = await pool.query(
      `INSERT INTO inventory (name, category, branch, stock, min_stock, price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, category, branch, parseInt(stock), parseInt(minStock), parseFloat(price)]
    );
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to add inventory item" });
  }
});

// PUT update item
app.put("/inventory/:id", async (req, res) => {
  try {
    const { name, category, branch, stock, minStock, price } = req.body;
    const result = await pool.query(
      `UPDATE inventory
       SET name=$1, category=$2, branch=$3, stock=$4, min_stock=$5, price=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, category, branch, parseInt(stock), parseInt(minStock), parseFloat(price), req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

// DELETE item
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
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
});

app.get("/branches", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM branches ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

app.put("/branches/:id", async (req, res) => {
  const { name, brand_id, region, manager, contact, address, status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE branches SET name=$1, brand_id=$2, region=$3, manager=$4, contact=$5, address=$6, status=$7 WHERE id=$8 RETURNING *",
      [name, brand_id, region, manager, contact, address, status, req.params.id]
    );
    res.json({ success: true, branch: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update branch" });
  }
});

app.post("/branches", async (req, res) => {
  try {
    const { name, brand_id, region, manager, contact, address, status } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Branch name is required" });
    const result = await pool.query(
      "INSERT INTO branches (name, brand_id, region, manager, contact, address, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [name.trim(), brand_id, region, manager, contact, address, status || 'Active']
    );
    res.json({ success: true, branch: result.rows[0] });
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ error: "Branch already exists" });
    res.status(500).json({ error: "Failed to add branch" });
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

  app.get("/", (req, res) => {
    res.send("Franchise Backend with Per-Device Per-User Trust is Running");
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  //brands
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

// POST /brands
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

// PUT /brands/:id
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

  // GET all shop items
app.get("/shop-items", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        price,
        image_url,
        is_visible,
        shop,
        brand,
        stock
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
    const { name, price, image_url, shop, brand, stock, is_visible } = req.body;
    const result = await pool.query(
      `INSERT INTO shop_items (name, price, image_url, shop, brand, stock, is_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, parseFloat(price), image_url, shop, brand || null, parseInt(stock) || 0, is_visible ?? true]
    );
    res.json({ success: true, item: result.rows[0] });
  } catch (err) {
    console.error("Error adding shop item:", err);
    res.status(500).json({ error: "Failed to add shop item" });
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
// TOGGLE visibility
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