const express = require("express");
const router = express.Router();

const pool = require("../db");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const { logActivity } = require("../utils/activityLogger");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { authenticate, authorize } = require("../middleware/auth");

// ─────────────────────────────────────────────────────────────
// SELF / ADMIN ACCESS
// ─────────────────────────────────────────────────────────────

function requireSelfOrAdmin(req, res, next) {
  if (
    req.user?.role === "Super Admin" ||
    String(req.user?.id) === String(req.params.id)
  ) {
    return next();
  }

  return res.status(403).json({
    error: "You can only access your own account.",
  });
}

// ─────────────────────────────────────────────────────────────
// GET USERS
// ─────────────────────────────────────────────────────────────

router.get(
  "/users",
  authenticate,
  authorize("Super Admin", "Franchisee Operations Admin", "Franchisee"),
  async (req, res) => {
    try {
      const { branch } = req.query;

      const result = branch
        ? await pool.query(
            `
            SELECT
              id,
              name,
              first_name,
              last_name,
              middle_initial,
              suffix,
              email,
              role,
              brand,
              branch,
              age,
              address,
              contact_number,
              saved_address
            FROM users
            WHERE TRIM(LOWER(branch)) = TRIM(LOWER($1))
            ORDER BY id
            `,
            [branch],
          )
        : await pool.query(
            `
            SELECT
              id,
              name,
              first_name,
              last_name,
              middle_initial,
              suffix,
              email,
              role,
              brand,
              branch,
              age,
              address,
              contact_number,
              saved_address
            FROM users
            ORDER BY id
            `,
          );

      const mapped = result.rows.map((r) => ({
        ...r,
        firstName: r.first_name,
        lastName: r.last_name,
        middleInitial: r.middle_initial,
      }));

      res.json(mapped);
    } catch (err) {
      console.error("GET /users error:", err);

      res.status(500).json({
        error: "Failed to fetch users.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// CREATE USER
// ─────────────────────────────────────────────────────────────

router.post(
  "/users",
  authenticate,
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
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
        contactNumber,
        contact_number,
        phone,
        latitude,
        longitude,
        restored,
      } = req.body;

      let tempPasswordGenerated = false;
      let temporaryPassword = null;

      // If no password was supplied, generate one.
      if (!password) {
        temporaryPassword = crypto.randomBytes(6).toString("hex");

        password = temporaryPassword;
        tempPasswordGenerated = true;
      }

      // Never store plaintext passwords.
      const hashedPassword = await bcrypt.hash(String(password), 10);

      const finalContactNumber =
        contactNumber || contact_number || phone || null;

      const result = await pool.query(
        `
        INSERT INTO users (
          name,
          first_name,
          last_name,
          middle_initial,
          suffix,
          email,
          password,
          role,
          brand,
          branch,
          contact_number
        )
        VALUES (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,$11
        )
        RETURNING *
        `,
        [
          name,
          firstName || null,
          lastName || null,
          middleInitial || null,
          suffix || null,
          email,
          hashedPassword,
          role,
          brand,
          branch,
          finalContactNumber,
        ],
      );

      const newUser = result.rows[0];

      await logActivity({
        action: restored ? "restore" : "create",
        itemName: name,

        // Use authenticated actor instead of trusting
        // performed_by from the frontend.
        performedBy: req.user?.name || "System",

        details: {
          role,
          branch,

          ...(restored
            ? {
                note: "Restored from delete history",
              }
            : {}),

          ...(tempPasswordGenerated
            ? {
                note: "Temporary password generated on restore",
              }
            : {}),
        },

        req,
        branch,
        module: "User Management",
        latitude,
        longitude,
        role: req.user?.role || "Unknown",
      });

      res.json({
        success: true,
        user: newUser,
        tempPasswordGenerated,

        // Only return the generated temporary password
        // at creation time so the admin can send it.
        ...(tempPasswordGenerated
          ? {
              temporaryPassword,
            }
          : {}),
      });
    } catch (err) {
      console.error("POST /users error:", err);

      if (err.code === "23505") {
        return res.status(400).json({
          error: "Email already exists",
        });
      }

      res.status(500).json({
        error: "Failed to add user",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// SAVE USER DELIVERY ADDRESS
// ─────────────────────────────────────────────────────────────

router.patch(
  "/users/:id/saved-address",
  authenticate,
  requireSelfOrAdmin,
  async (req, res) => {
    try {
      const { savedAddress } = req.body;

      const result = await pool.query(
        `
        UPDATE users
        SET saved_address=$1
        WHERE id=$2
        RETURNING *
        `,
        [savedAddress, req.params.id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      res.json({
        success: true,
        user: result.rows[0],
      });
    } catch (err) {
      console.error("PATCH saved-address error:", err);

      res.status(500).json({
        error: "Failed to save address",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// UPDATE USER — ADMIN
// ─────────────────────────────────────────────────────────────

router.put(
  "/users/:id",
  authenticate,
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
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
        contactNumber,
        contact_number,
        phone,
        latitude,
        longitude,
      } = req.body;

      const before = await pool.query(
        `
        SELECT *
        FROM users
        WHERE id=$1
        `,
        [req.params.id],
      );

      if (before.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const oldUser = before.rows[0];

      const finalContactNumber =
        contactNumber ??
        contact_number ??
        phone ??
        oldUser.contact_number ??
        null;

      let query;
      let params;

      if (password) {
        const hashed = await bcrypt.hash(String(password), 10);

        query = `
          UPDATE users
          SET
            name=$1,
            first_name=$2,
            last_name=$3,
            middle_initial=$4,
            suffix=$5,
            email=$6,
            role=$7,
            brand=$8,
            branch=$9,
            contact_number=$10,
            password=$11
          WHERE id=$12
          RETURNING *
        `;

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
          finalContactNumber,
          hashed,
          req.params.id,
        ];
      } else {
        query = `
          UPDATE users
          SET
            name=$1,
            first_name=$2,
            last_name=$3,
            middle_initial=$4,
            suffix=$5,
            email=$6,
            role=$7,
            brand=$8,
            branch=$9,
            contact_number=$10
          WHERE id=$11
          RETURNING *
        `;

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
          finalContactNumber,
          req.params.id,
        ];
      }

      const result = await pool.query(query, params);

      const updatedUser = result.rows[0];

      const changes = {};

      for (const field of [
        "name",
        "email",
        "role",
        "brand",
        "branch",
        "contact_number",
      ]) {
        if (String(oldUser[field] ?? "") !== String(updatedUser[field] ?? "")) {
          changes[field] = {
            from: oldUser[field],
            to: updatedUser[field],
          };
        }
      }

      if (password) {
        changes.password = {
          from: "********",
          to: "********",
        };
      }

      await logActivity({
        action: "update",
        itemName: updatedUser.name || oldUser.name,

        performedBy: req.user?.name || "System",

        details: changes,

        req,

        branch: updatedUser.branch || oldUser.branch,

        module: "User Management",

        latitude,
        longitude,

        role: req.user?.role || "Unknown",
      });

      res.json({
        success: true,
        user: updatedUser,
      });
    } catch (err) {
      console.error("PUT /users/:id error:", err);

      if (err.code === "23505") {
        return res.status(400).json({
          error: "Email already exists",
        });
      }

      res.status(500).json({
        error: "Failed to update user",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// DELETE USER
// ─────────────────────────────────────────────────────────────

router.delete(
  "/users/:id",
  authenticate,
  authorize("Super Admin"),
  async (req, res) => {
    const client = await pool.connect();

    try {
      const { latitude, longitude } = req.body || {};

      await client.query("BEGIN");

      const before = await client.query(
        `
        SELECT *
        FROM users
        WHERE id=$1
        FOR UPDATE
        `,
        [req.params.id],
      );

      if (before.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          error: "User not found",
        });
      }

      const targetUser = before.rows[0];

      // Prevent deleting the currently authenticated
      // Super Admin account.
      if (String(targetUser.id) === String(req.user.id)) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          error: "You cannot delete your own account.",
        });
      }

      await client.query(
        `
        UPDATE announcements
        SET created_by=NULL
        WHERE created_by=$1
        `,
        [req.params.id],
      );

      // Save the full original row before deletion.
      await client.query(
        `
        INSERT INTO users_delete_history (
          user_data
        )
        VALUES ($1)
        `,
        [JSON.stringify(targetUser)],
      );

      await client.query(
        `
        DELETE FROM users
        WHERE id=$1
        `,
        [req.params.id],
      );

      await client.query("COMMIT");

      await logActivity({
        action: "delete",

        itemName: targetUser.name,

        performedBy: req.user?.name || "System",

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

        role: req.user?.role || "Unknown",
      });

      res.json({
        success: true,
        message: "User deleted",
      });
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("User delete rollback error:", rollbackErr);
      }

      console.error("DELETE /users/:id error:", err);

      res.status(500).json({
        error: err.message,
      });
    } finally {
      client.release();
    }
  },
);

// ─────────────────────────────────────────────────────────────
// GET SINGLE USER
// ─────────────────────────────────────────────────────────────

router.get("/users/:id", authenticate, requireSelfOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          name,
          first_name,
          last_name,
          middle_initial,
          suffix,
          email,
          role,
          brand,
          branch,
          age,
          address,
          contact_number,
          saved_address
        FROM users
        WHERE id = $1
        `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const row = result.rows[0];

    return res.json({
      id: row.id,
      name: row.name || "",
      firstName: row.first_name || "",
      lastName: row.last_name || "",
      middleInitial: row.middle_initial || "",
      suffix: row.suffix || "",
      email: row.email || "",
      role: row.role || "",
      brand: row.brand || "",
      branch: row.branch || "",
      age: row.age || "",
      address: row.address || "",
      contactNumber: row.contact_number || "",
      contact_number: row.contact_number || "",
      savedAddress: row.saved_address || "",
    });
  } catch (err) {
    console.error("GET /users/:id error:", err);

    return res.status(500).json({
      error: "Failed to fetch user",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// VERIFY USER PASSWORD
// ─────────────────────────────────────────────────────────────

router.post(
  "/users/:id/verify-password",
  authenticate,
  requireSelfOrAdmin,
  async (req, res) => {
    try {
      const password = String(req.body?.password || "");

      if (!password) {
        return res.status(400).json({
          valid: false,
          error: "Password is required.",
        });
      }

      const result = await pool.query(
        `
        SELECT password
        FROM users
        WHERE id=$1
        `,
        [req.params.id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          valid: false,
          error: "User not found.",
        });
      }

      const storedPassword = String(result.rows[0]?.password || "");

      if (!storedPassword) {
        return res.status(401).json({
          valid: false,
          error: "This account does not have a valid password set.",
        });
      }

      // Supports bcrypt and older plaintext passwords.
      // Successful plaintext verification upgrades the
      // password to bcrypt automatically.
      const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

      let valid = false;

      if (isBcryptHash) {
        valid = await bcrypt.compare(password, storedPassword);
      } else {
        valid = storedPassword === password;

        if (valid) {
          const hashed = await bcrypt.hash(password, 10);

          await pool.query(
            `
            UPDATE users
            SET password=$1
            WHERE id=$2
            `,
            [hashed, req.params.id],
          );
        }
      }

      if (!valid) {
        return res.status(401).json({
          valid: false,
          error: "Incorrect password.",
        });
      }

      return res.json({
        valid: true,
        success: true,
      });
    } catch (err) {
      console.error("POST /users/:id/verify-password error:", err);

      return res.status(500).json({
        valid: false,
        error: "Failed to verify password.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// SAVE PUSH TOKEN
// ─────────────────────────────────────────────────────────────

router.post(
  "/users/:id/push-token",
  authenticate,
  requireSelfOrAdmin,
  async (req, res) => {
    try {
      const { token } = req.body;

      if (typeof token !== "string" || !token.trim()) {
        return res.status(400).json({
          error: "Push token is required.",
        });
      }

      const result = await pool.query(
        `
        UPDATE users
        SET push_token=$1
        WHERE id=$2
        RETURNING id
        `,
        [token.trim(), req.params.id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      res.json({
        success: true,
      });
    } catch (err) {
      console.error("POST /users/:id/push-token error:", err);

      res.status(500).json({
        error: "Failed to save push token",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// GET USER PROFILE
// ─────────────────────────────────────────────────────────────

router.get(
  "/api/users/:id",
  authenticate,
  requireSelfOrAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          id,
          name,
          first_name,
          last_name,
          middle_initial,
          suffix,
          email,
          role,
          brand,
          branch,
          age,
          address,
          contact_number,
          saved_address
        FROM users
        WHERE id=$1
        `,
        [req.params.id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const row = result.rows[0];

      // Prefer the structured name columns.
      // Fall back to the old "name" field for legacy users.
      let firstName = row.first_name || "";

      let lastName = row.last_name || "";

      if (!firstName && !lastName) {
        const nameParts = String(row.name || "")
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        firstName = nameParts[0] || "";

        lastName = nameParts.slice(1).join(" ") || "";
      }

      res.json({
        id: row.id,
        firstName,
        lastName,
        middleInitial: row.middle_initial || "",
        suffix: row.suffix || "",
        email: row.email || "",
        role: row.role || "",
        brand: row.brand || "",
        branch: row.branch || "",
        contactNumber: row.contact_number || "",
        contact_number: row.contact_number || "",
        address: row.address || "",
        savedAddress: row.saved_address || "",
        age: row.age || "",
      });
    } catch (err) {
      console.error("GET /api/users/:id error:", err);

      res.status(500).json({
        error: "Failed to fetch user",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// UPDATE USER PROFILE
// ─────────────────────────────────────────────────────────────

router.put(
  "/api/users/:id",
  authenticate,
  requireSelfOrAdmin,
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        middleInitial,
        suffix,
        email,
        age,
        address,
        contactNumber,
        contact_number,
        savedAddress,
        newPassword,
      } = req.body;

      // Get the current account first so omitted profile
      // fields don't accidentally erase existing values.
      const before = await pool.query(
        `
        SELECT *
        FROM users
        WHERE id=$1
        `,
        [req.params.id],
      );

      if (before.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const oldUser = before.rows[0];

      const finalFirstName = firstName ?? oldUser.first_name ?? "";

      const finalLastName = lastName ?? oldUser.last_name ?? "";

      const finalMiddleInitial =
        middleInitial ?? oldUser.middle_initial ?? null;

      const finalSuffix = suffix ?? oldUser.suffix ?? null;

      const fullName = [
        finalFirstName,
        finalMiddleInitial,
        finalLastName,
        finalSuffix,
      ]
        .filter((part) => String(part || "").trim())
        .map((part) => String(part).trim())
        .join(" ");

      const finalEmail = email ?? oldUser.email;

      const finalAge = age === undefined ? oldUser.age : age || null;

      const finalAddress =
        address === undefined ? oldUser.address : address || null;

      const finalContactNumber =
        contactNumber ?? contact_number ?? oldUser.contact_number ?? null;

      const finalSavedAddress =
        savedAddress === undefined
          ? oldUser.saved_address
          : savedAddress || null;

      let query;
      let params;

      if (newPassword) {
        const hashedPassword = await bcrypt.hash(String(newPassword), 10);

        query = `
          UPDATE users
          SET
            name=$1,
            first_name=$2,
            last_name=$3,
            middle_initial=$4,
            suffix=$5,
            email=$6,
            password=$7,
            age=$8,
            address=$9,
            contact_number=$10,
            saved_address=$11
          WHERE id=$12
          RETURNING *
        `;

        params = [
          fullName,
          finalFirstName || null,
          finalLastName || null,
          finalMiddleInitial || null,
          finalSuffix || null,
          finalEmail,
          hashedPassword,
          finalAge,
          finalAddress,
          finalContactNumber,
          finalSavedAddress,
          req.params.id,
        ];
      } else {
        query = `
          UPDATE users
          SET
            name=$1,
            first_name=$2,
            last_name=$3,
            middle_initial=$4,
            suffix=$5,
            email=$6,
            age=$7,
            address=$8,
            contact_number=$9,
            saved_address=$10
          WHERE id=$11
          RETURNING *
        `;

        params = [
          fullName,
          finalFirstName || null,
          finalLastName || null,
          finalMiddleInitial || null,
          finalSuffix || null,
          finalEmail,
          finalAge,
          finalAddress,
          finalContactNumber,
          finalSavedAddress,
          req.params.id,
        ];
      }

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const row = result.rows[0];

      const responseFirstName = row.first_name || "";

      const responseLastName = row.last_name || "";

      res.json({
        success: true,

        user: {
          id: row.id,

          firstName: responseFirstName,

          lastName: responseLastName,

          middleInitial: row.middle_initial || "",

          suffix: row.suffix || "",

          email: row.email || "",

          role: row.role || "",

          brand: row.brand || "",

          branch: row.branch || "",

          contactNumber: row.contact_number || "",

          contact_number: row.contact_number || "",

          address: row.address || "",

          savedAddress: row.saved_address || "",

          age: row.age || "",
        },
      });
    } catch (err) {
      console.error("PUT /api/users/:id error:", err);

      if (err.code === "23505") {
        return res.status(400).json({
          error: "Email already exists",
        });
      }

      res.status(500).json({
        error: "Failed to update user",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// SEND ACCOUNT CREDENTIALS
// ─────────────────────────────────────────────────────────────

router.post(
  "/send-credentials",
  authenticate,
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    const { to, name, password } = req.body;

    try {
      if (!to || !name || !password) {
        return res.status(400).json({
          error: "Email, name, and temporary password are required.",
        });
      }

      await resend.emails.send({
        from: "Franchisync <noreply@franchisync.business>",

        to,

        subject: "Your Franchisync Account Credentials",

        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2E7D32;">
              Welcome, ${name}!
            </h2>

            <p>
              Your franchise application has been approved.
              Your account is now active.
            </p>

            <div
              style="
                background: #E8F5E9;
                padding: 15px;
                margin: 15px 0;
              "
            >
              <p>
                <strong>Email:</strong>
                ${to}
              </p>

              <p>
                <strong>Temporary Password:</strong>
                <span style="letter-spacing: 2px;">
                  ${password}
                </span>
              </p>
            </div>

            <p style="color: #e74c3c;">
              Please log in and change your password immediately.
            </p>

            <p>
              Log in at
              <a
                href="https://franchisync.business"
                style="color: #2E7D32;"
              >
                franchisync.business
              </a>
            </p>
          </div>
        `,
      });

      res.json({
        success: true,
      });
    } catch (err) {
      console.error("Resend credentials error:", err);

      res.status(500).json({
        error: "Failed to send credentials email",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// SEND APPLICATION OTP
//
// Public by design because franchise applicants do not have
// an account/session yet.
// ─────────────────────────────────────────────────────────────

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
                  Use the verification code below to
                  continue your franchise application.
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
                  Do not share this verification code
                  with anyone. If you did not request
                  this code, you may ignore this email.
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
    console.error("POST /api/send-application-otp error:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to send verification email.",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// SEND APPLICATION REJECTION
// ─────────────────────────────────────────────────────────────

router.post(
  "/send-rejection",
  authenticate,
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    const { to, name } = req.body;

    try {
      if (!to || !name) {
        return res.status(400).json({
          error: "Email and name are required.",
        });
      }

      await resend.emails.send({
        from: "Franchisync <noreply@franchisync.business>",

        to,

        subject: "Update on Your Franchisync Application",

        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>
              Update for ${name}
            </h2>

            <p>
              Thank you for your application.
              Unfortunately it was not approved at this time.
            </p>
          </div>
        `,
      });

      res.json({
        success: true,
      });
    } catch (err) {
      console.error("Resend rejection error:", err);

      res.status(500).json({
        error: "Failed to send rejection email",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// GET DELETE HISTORY
// ─────────────────────────────────────────────────────────────

router.get(
  "/delete-history",
  authenticate,
  authorize("Super Admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
          SELECT *
          FROM users_delete_history
          ORDER BY deleted_at DESC
          `,
      );

      res.json(
        result.rows.map((row) => ({
          id: row.id,
          data: row.user_data,
          deletedAt: row.deleted_at,
        })),
      );
    } catch (err) {
      console.error("GET /delete-history error:", err);

      res.status(500).json({
        error: "Failed to fetch delete history.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// ADD DELETE HISTORY
// ─────────────────────────────────────────────────────────────

router.post(
  "/delete-history",
  authenticate,
  authorize("Super Admin"),
  async (req, res) => {
    try {
      if (!req.body?.user_data) {
        return res.status(400).json({
          error: "User data is required.",
        });
      }

      await pool.query(
        `
        INSERT INTO users_delete_history (
          user_data
        )
        VALUES ($1)
        `,
        [JSON.stringify(req.body.user_data)],
      );

      res.json({
        success: true,
      });
    } catch (err) {
      console.error("POST /delete-history error:", err);

      res.status(500).json({
        error: "Failed to save delete history.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// DELETE HISTORY ENTRY
// ─────────────────────────────────────────────────────────────

router.delete(
  "/delete-history/:id",
  authenticate,
  authorize("Super Admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
          DELETE FROM users_delete_history
          WHERE id=$1
          RETURNING id
          `,
        [req.params.id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Delete history entry not found.",
        });
      }

      res.json({
        success: true,
      });
    } catch (err) {
      console.error("DELETE /delete-history/:id error:", err);

      res.status(500).json({
        error: "Failed to delete history entry.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// USER MANAGEMENT ACTIVITY LOG
// ─────────────────────────────────────────────────────────────

router.get(
  "/users-activity-log",
  authenticate,
  authorize("Super Admin", "Franchisee Operations Admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
          SELECT *
          FROM users_activity_log
          WHERE module=$1
          ORDER BY created_at DESC
          `,
        ["User Management"],
      );

      res.json(result.rows);
    } catch (err) {
      console.error("GET /users-activity-log error:", err);

      res.status(500).json({
        error: "Failed to fetch user activity log",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────
// VERIFY MANAGER PASSWORD
// ─────────────────────────────────────────────────────────────

router.post(
  "/verify-manager-password",
  authenticate,
  authorize("Super Admin", "Franchisee Operations Admin", "Manager"),
  async (req, res) => {
    try {
      const { branch, password } = req.body;

      if (!branch || !password) {
        return res.status(400).json({
          valid: false,

          error: "Branch and password are required",
        });
      }

      // Managers should only verify against their own
      // branch. Admin roles may specify another branch.
      if (
        req.user.role === "Manager" &&
        String(req.user.branch || "")
          .trim()
          .toLowerCase() !== String(branch).trim().toLowerCase()
      ) {
        return res.status(403).json({
          valid: false,

          error:
            "You can only verify the manager password for your own branch.",
        });
      }

      const result = await pool.query(
        `
          SELECT
            id,
            password
          FROM users
          WHERE TRIM(LOWER(branch)) =
                TRIM(LOWER($1))
            AND role=$2
          `,
        [branch, "Manager"],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          valid: false,

          error: "No manager found for this branch",
        });
      }

      for (const row of result.rows) {
        if (!row.password) {
          continue;
        }

        const storedPassword = String(row.password);

        const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

        let valid = false;

        if (isBcryptHash) {
          try {
            valid = await bcrypt.compare(String(password), storedPassword);
          } catch (bcryptError) {
            console.error("Manager bcrypt comparison error:", bcryptError);

            valid = false;
          }
        } else {
          // Legacy plaintext support.
          valid = storedPassword === String(password);

          // Upgrade the old plaintext password
          // immediately after successful verification.
          if (valid) {
            const hashed = await bcrypt.hash(String(password), 10);

            await pool.query(
              `
              UPDATE users
              SET password=$1
              WHERE id=$2
              `,
              [hashed, row.id],
            );
          }
        }

        if (valid) {
          return res.json({
            valid: true,
          });
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
  },
);

module.exports = router;
