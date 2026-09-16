const express = require("express");
const router = express.Router();
const pool = require("../db");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const { logActivity } = require("../utils/activityLogger");
const bcrypt = require("bcrypt");

router.get("/users", async (req, res) => {
  try {
    const { branch } = req.query;
    const result = branch
      ? await pool.query(
          "SELECT id, name, first_name, last_name, middle_initial, suffix, email, role, brand, branch, age, address, contact_number, saved_address FROM users WHERE TRIM(LOWER(branch)) = TRIM(LOWER($1)) ORDER BY id",
          [branch],
        )
      : await pool.query(
          "SELECT id, name, first_name, last_name, middle_initial, suffix, email, role, brand, branch, age, address, contact_number, saved_address FROM users ORDER BY id",
        );
    const mapped = result.rows.map((r) => ({
      ...r,
      firstName: r.first_name,
      lastName: r.last_name,
      middleInitial: r.middle_initial,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

router.post("/users", async (req, res) => {
  try {
    let {
      name,
      firstName,
      lastName,
      middleInitial,
      suffix,
      email,
      role,
      brand,
      branch,
      password,
      performed_by,
      performed_by_role,
      latitude,
      longitude,
      restored,
    } = req.body;
    let tempPasswordGenerated = false;
    if (!password) {
      const bcrypt = require("bcrypt");
      const crypto = require("crypto");
      const tempPassword = crypto.randomBytes(6).toString("hex");
      password = await bcrypt.hash(tempPassword, 10);
      tempPasswordGenerated = true;
      // TODO: email tempPassword to the user, or return it in the response so an admin can share it
    }

    const result = await pool.query(
      "INSERT INTO users (name, first_name, last_name, middle_initial, suffix, email, password, role, brand, branch) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
      [
        name,
        firstName || null,
        lastName || null,
        middleInitial || null,
        suffix || null,
        email,
        password,
        role,
        brand,
        branch,
      ],
    );
    const newUser = result.rows[0];

    await logActivity({
      action: restored ? "restore" : "create",
      itemName: name,
      performedBy: performed_by || "System",
      details: {
        role,
        branch,
        ...(restored ? { note: "Restored from delete history" } : {}),
        ...(tempPasswordGenerated
          ? { note: "Temporary password generated on restore" }
          : {}),
      },
      req,
      branch,
      module: "User Management",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, user: newUser, tempPasswordGenerated });
  } catch (err) {
    console.error("POST /users error:", err);
    if (err.code === "23505")
      return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: "Failed to add user" });
  }
});

router.patch("/users/:id/saved-address", async (req, res) => {
  try {
    const { savedAddress } = req.body;
    const result = await pool.query(
      `UPDATE users SET saved_address=$1 WHERE id=$2 RETURNING *`,
      [savedAddress, req.params.id],
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("PATCH saved-address error:", err);
    res.status(500).json({ error: "Failed to save address" });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const {
      name,
      firstName,
      lastName,
      middleInitial,
      suffix,
      email,
      role,
      brand,
      branch,
      password,
      performed_by,
      performed_by_role,
      latitude,
      longitude,
    } = req.body;

    const before = await pool.query("SELECT * FROM users WHERE id=$1", [
      req.params.id,
    ]);
    if (before.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    const oldUser = before.rows[0];

    let query, params;
    if (password) {
      const bcrypt = require("bcrypt");
      const hashed = await bcrypt.hash(password, 10);
      query = `UPDATE users SET name=$1, first_name=$2, last_name=$3, middle_initial=$4, suffix=$5, email=$6, role=$7, brand=$8, branch=$9, password=$10 WHERE id=$11 RETURNING *`;
      params = [
        name,
        firstName || null,
        lastName || null,
        middleInitial || null,
        suffix || null,
        email,
        role,
        brand,
        branch,
        hashed,
        req.params.id,
      ];
    } else {
      query = `UPDATE users SET name=$1, first_name=$2, last_name=$3, middle_initial=$4, suffix=$5, email=$6, role=$7, brand=$8, branch=$9 WHERE id=$10 RETURNING *`;
      params = [
        name,
        firstName || null,
        lastName || null,
        middleInitial || null,
        suffix || null,
        email,
        role,
        brand,
        branch,
        req.params.id,
      ];
    }
    const result = await pool.query(query, params);
    const updatedUser = result.rows[0];

    const changes = {};
    for (const field of ["name", "email", "role", "brand", "branch"]) {
      if (String(oldUser[field] ?? "") !== String(updatedUser[field] ?? ""))
        changes[field] = { from: oldUser[field], to: updatedUser[field] };
    }

    await logActivity({
      action: "update",
      itemName: name,
      performedBy: performed_by || "System",
      details: changes,
      req,
      branch,
      module: "User Management",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("PUT /users/:id error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const { deleted_by, performed_by_role, latitude, longitude } =
      req.body || {};

    const before = await pool.query("SELECT * FROM users WHERE id=$1", [
      req.params.id,
    ]);
    const targetUser = before.rows[0];
    if (before.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    await pool.query(
      "UPDATE announcements SET created_by=NULL WHERE created_by=$1",
      [req.params.id],
    );
    await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);

    // Save full row (including password hash) to history server-side
    await pool.query(
      "INSERT INTO users_delete_history (user_data) VALUES ($1)",
      [JSON.stringify(targetUser)],
    );

    await logActivity({
      action: "delete",
      itemName: targetUser.name,
      performedBy: deleted_by || "System",
      details: {
        role: targetUser.role,
        brand: targetUser.brand,
        branch: targetUser.branch,
      },
      req,
      branch: targetUser.branch,
      module: "User Management",
      latitude,
      longitude,
      role: performed_by_role || "Unknown",
    });

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("DELETE /users/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/users/:id/push-token", async (req, res) => {
  const { token } = req.body;
  await pool.query("UPDATE users SET push_token=$1 WHERE id=$2", [
    token,
    req.params.id,
  ]);
  res.json({ success: true });
});

router.get("/api/users/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, branch, age, address, contact_number, saved_address FROM users WHERE id=$1",
      [req.params.id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const row = result.rows[0];
    const nameParts = (row.name || "").split(" ");
    res.json({
      id: row.id,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      middleInitial: "",
      email: row.email,
      role: row.role,
      branch: row.branch,
      contactNumber: row.contact_number || "",
      address: row.address || "",
      savedAddress: row.saved_address || "",
      age: row.age || "",
    });
  } catch (err) {
    console.error("GET /api/users/:id error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.put("/api/users/:id", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      age,
      address,
      contactNumber,
      savedAddress,
      newPassword,
    } = req.body;
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    let query, params;
    if (newPassword) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      query = `UPDATE users SET name=$1, email=$2, password=$3, age=$4, address=$5, contact_number=$6, saved_address=$7 WHERE id=$8 RETURNING *`;
      params = [
        fullName,
        email,
        hashedNewPassword,
        age || null,
        address || null,
        contactNumber || null,
        savedAddress || null,
        req.params.id,
      ];
    } else {
      query = `UPDATE users SET name=$1, email=$2, age=$3, address=$4, contact_number=$5, saved_address=$6 WHERE id=$7 RETURNING *`;
      params = [
        fullName,
        email,
        age || null,
        address || null,
        contactNumber || null,
        savedAddress || null,
        req.params.id,
      ];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const row = result.rows[0];
    const nameParts = (row.name || "").split(" ");
    res.json({
      user: {
        id: row.id,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        middleInitial: "",
        email: row.email,
        role: row.role,
        branch: row.branch,
        contactNumber: row.contact_number || "",
        address: row.address || "",
        savedAddress: row.saved_address || "",
        age: row.age || "",
      },
    });
  } catch (err) {
    console.error("PUT /api/users/:id error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.post("/send-credentials", async (req, res) => {
  const { to, name, password } = req.body;
  try {
    await resend.emails.send({
      from: "Franchisync <noreply@franchisync.business>",
      to,
      subject: "Your Franchisync Account Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Welcome, ${name}!</h2>
          <p>Your franchise application has been approved. Your account is now active.</p>
          <div style="background: #E8F5E9; padding: 15px; margin: 15px 0;">
            <p><strong>Email:</strong> ${to}</p>
            <p><strong>Temporary Password:</strong> <span style="letter-spacing: 2px;">${password}</span></p>
          </div>
          <p style="color: #e74c3c;">Please log in and change your password immediately.</p>
          <p>Log in at <a href="https://franchisync.business" style="color: #2E7D32;">franchisync.business</a></p>
        </div>`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send credentials email" });
  }
});

router.post("/api/send-application-otp", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    const otp = String(req.body?.otp || "").trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: "OTP must be a 6-digit code.",
      });
    }

    const { data, error } = await resend.emails.send({
      from: "FranchiSync <noreply@franchisync.business>",
      to: [email],
      subject: "Your FranchiSync Verification Code",
      html: `
        <div
          style="
            background:#F6F7F1;
            padding:32px 16px;
            font-family:Arial,sans-serif;
            color:#24310C;
          "
        >
          <div
            style="
              max-width:520px;
              margin:0 auto;
              background:#ffffff;
              border:1px solid #E1E6D8;
              border-radius:16px;
              padding:28px;
            "
          >
            <h2
              style="
                margin:0 0 12px;
                color:#3b791e;
              "
            >
              FranchiSync Email Verification
            </h2>

            <p
              style="
                font-size:14px;
                line-height:1.7;
                margin-bottom:18px;
              "
            >
              Use the verification code below to continue your
              franchise application.
            </p>

            <div
              style="
                background:#f0f5e8;
                border:1px solid #c9dba0;
                border-radius:12px;
                padding:18px;
                text-align:center;
                margin:18px 0;
              "
            >
              <div
                style="
                  font-size:12px;
                  color:#5C6B60;
                  margin-bottom:8px;
                  text-transform:uppercase;
                  letter-spacing:.08em;
                "
              >
                Verification Code
              </div>

              <div
                style="
                  font-size:34px;
                  font-weight:800;
                  letter-spacing:8px;
                  color:#2c5c16;
                "
              >
                ${otp}
              </div>
            </div>

            <p
              style="
                font-size:13px;
                line-height:1.7;
                color:#5C6B60;
                margin:0;
              "
            >
              Do not share this verification code with anyone.
              If you did not request this code, you may ignore
              this email.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend OTP error:", error);

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to send verification email.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent successfully.",
      emailId: data?.id || null,
    });
  } catch (err) {
    console.error("POST /api/send-otp error:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to send verification email.",
    });
  }
});

router.post("/send-rejection", async (req, res) => {
  const { to, name } = req.body;
  try {
    await resend.emails.send({
      from: "Franchisync <noreply@franchisync.business>",
      to,
      subject: "Update on Your Franchisync Application",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Update for ${name}</h2>
          <p>Thank you for your application. Unfortunately it was not approved at this time.</p>
        </div>`,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send rejection email" });
  }
});

router.get("/delete-history", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users_delete_history ORDER BY deleted_at DESC",
    );
    res.json(
      result.rows.map((row) => ({
        id: row.id,
        data: row.user_data,
        deletedAt: row.deleted_at,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch delete history." });
  }
});

router.post("/delete-history", async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO users_delete_history (user_data) VALUES ($1)",
      [JSON.stringify(req.body.user_data)],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save delete history." });
  }
});

router.delete("/delete-history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users_delete_history WHERE id=$1", [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete history entry." });
  }
});

router.get("/users-activity-log", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM users_activity_log
       WHERE module = $1
       ORDER BY created_at DESC`,
      ["User Management"],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /users-activity-log error:", err);

    res.status(500).json({
      error: "Failed to fetch user activity log",
    });
  }
});

router.post("/verify-manager-password", async (req, res) => {
  try {
    const { branch, password } = req.body;

    if (!branch || !password) {
      return res.status(400).json({
        valid: false,
        error: "Branch and password are required",
      });
    }

    const result = await pool.query(
      `SELECT password
       FROM users
       WHERE TRIM(LOWER(branch)) = TRIM(LOWER($1))
       AND role = $2`,
      [branch, "Manager"],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        valid: false,
        error: "No manager found for this branch",
      });
    }

    for (const row of result.rows) {
      if (!row.password) continue;

      if (await bcrypt.compare(password, row.password)) {
        return res.json({ valid: true });
      }
    }

    return res.json({
      valid: false,
      error: "Incorrect manager password",
    });
  } catch (err) {
    console.error("POST /verify-manager-password error:", err);
    res.status(500).json({
      valid: false,
      error: "Failed to verify password",
    });
  }
});

module.exports = router;
