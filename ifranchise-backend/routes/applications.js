const express = require("express");
const router = express.Router();
const pool = require("../db");
const { rowToApplication } = require("../utils/formatters");
const { logActivity } = require("../utils/activityLogger");
const crypto = require("crypto");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const { buildICS } = require("../utils/ics");

router.post("/check-duplicate", async (req, res) => {
  const { email, mobile } = req.body;
  try {
    const result = await pool.query(
      `SELECT id FROM applications WHERE email=$1 OR phone=$2
       UNION
       SELECT id FROM ipharma_applications WHERE email=$1 OR phone=$2
       LIMIT 1`,
      [email, mobile]
    );
    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error("Duplicate check error:", err);
    res.status(500).json({ exists: false });
  }
});

router.get("/applications", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        'ip-' || id::text AS id,
        name, NULL AS first_name, NULL AS last_name, NULL AS middle_initial, NULL AS suffix,
        email, phone, 'iPharma Mart' AS franchise,
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
        id_type, created_at,
        appointment_date, appointment_location, appointment_notes,
        appointment_status, appointment_token
      FROM ipharma_applications

      UNION ALL

      SELECT
        id::text AS id,
        name, first_name, last_name, middle_initial, suffix,
        email, phone, franchise,
        status, date, address, dob, civil_status,
        spouse_name, spouse_occupation, NULL AS spouse_dob, dependents,
        NULL AS telephone, NULL AS tin, NULL AS education,
        NULL AS involvement, NULL AS equity, NULL AS investment, NULL AS fund_source,
        NULL AS other_business, NULL AS location, NULL AS family_depend, NULL AS market_area, NULL AS start_date,
        date_signed,
        payment_mode, gender, nationality,
        employment_type, years_employer, income,
        employer_name, business_address, position, business_nature,
        id_type, created_at,
        appointment_date, appointment_location, appointment_notes,
        appointment_status, appointment_token
      FROM applications

      ORDER BY created_at DESC
    `);
    res.json(result.rows.map(rowToApplication));
  } catch (err) {
    console.error("Failed to fetch applications:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.get("/applications/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM applications WHERE id=$1", [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Application not found" });
    res.json(rowToApplication(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

router.post("/applications", async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(
      `INSERT INTO applications (
        name, first_name, last_name, middle_initial, suffix, email, phone, franchise, payment_mode, status, date,
        dob, civil_status, gender, nationality, address, dependents,
        spouse_name, spouse_occupation,
        employment_type, years_employer, income,
        employer_name, business_address, position, business_nature,
        signature, date_signed, id_type, id_image, letter_of_intent
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', CURRENT_DATE,
        $10, $11, $12, $13, $14, $15,
        $16, $17,
        $18, $19, $20,
        $21, $22, $23, $24,
        $25, $26, $27, $28, $29
      ) RETURNING *`,
      [
        b.name, b.firstName, b.lastName, b.middleInitial || null, b.suffix || null,
        b.email, b.phone, b.franchise, b.paymentMode,
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

    await logActivity(
      b.restored ? "restore" : "create",
      app.name,
      b.performed_by || "System",
      { franchise: app.franchise, status: app.status, email: app.email, phone: app.phone,
        ...(b.restored ? { note: "Restored from delete history" } : {}) },
      req, app.franchise, "Applications", b.latitude, b.longitude, b.role || "Unknown"
    );

    res.json({ success: true, id: app.id, message: "Application submitted successfully", application: app });
  } catch (err) {
    console.error("Error submitting application:", err);
    res.status(500).json({ success: false, error: "Failed to submit application" });
  }
});

router.post("/ipharma-applications", async (req, res) => {
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
        $24,$25,$26,$27,$28
      ) RETURNING *`,
      [
        b.name, b.email, b.phone, b.telephone || null,
        b.date || new Date().toISOString().split("T")[0],
        b.address,
        b.dob || null, b.maritalStatus, b.spouseName || null,
        b.spouseOccupation || null, b.spouseDob || null,
        b.dependents ? parseInt(b.dependents) : null,
        b.tin || null,
        b.education ? JSON.stringify(b.education) : null,
        b.involvement || null, b.equity || null,
        b.investment ? parseFloat(b.investment) : null,
        b.fundSource || null,
        b.otherBusiness || null, b.location || null,
        b.familyDepend || null, b.marketArea || null,
        b.startDate || null,
        b.signature || null, b.dateSigned || null,
        b.idType || null, b.idImage || null, b.letterOfIntent || null,
      ]
    );

    await logActivity(
      "create",
      b.name,
      b.performed_by || "System",
      { franchise: "iPharma Mart", status: "pending", email: b.email, phone: b.phone },
      req, b.location || "iPharma Mart", "Applications", b.latitude, b.longitude
    );

    res.json({ success: true, id: result.rows[0].id, message: "iPharma application submitted successfully" });
  } catch (err) {
    console.error("Error submitting iPharma application:", err);
    res.status(500).json({ success: false, error: "Failed to submit application", details: err.message });
  }
});

router.put("/applications/:id/status", async (req, res) => {
  try {
    const rawId = req.params.id;
    const isIpharma = rawId.startsWith("ip-");
    const id = parseInt(isIpharma ? rawId.replace("ip-", "") : rawId);
    const sourceTable = isIpharma ? "ipharma_applications" : "applications";
    const { status, performed_by, role, latitude, longitude } = req.body;

    const before = await pool.query(`SELECT * FROM ${sourceTable} WHERE id=$1`, [id]);
    if (before.rows.length === 0)
      return res.status(404).json({ success: false, error: "Application not found" });
    const oldApp = before.rows[0];

    const result = await pool.query(
      `UPDATE ${sourceTable} SET status=$1 WHERE id=$2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: "Application not found" });

    const updatedApp = rowToApplication(result.rows[0]);

    const action =
      status === "approved" ? "approve" :
      status === "rejected" ? "reject"  :
      "update";

    await logActivity(
      action,
      updatedApp.name,
      performed_by || "System",
      { status: { from: oldApp.status, to: status } },
      req, updatedApp.franchise || (isIpharma ? "iPharma Mart" : null), "Applications", latitude, longitude, role || "Unknown"
    );

    res.json({ success: true, message: "Status updated", application: updatedApp });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
});

router.post("/send-appointment", async (req, res) => {
  const { to, name, appointmentDate, appointmentLocation, appointmentNotes, rescheduleToken, isReschedule } = req.body;
  try {
    const fmtDate = new Date(appointmentDate).toLocaleString("en-PH", {
      dateStyle: "long", timeStyle: "short", timeZone: "Asia/Manila",
    });
    const rescheduleLink = `${process.env.FRONTEND_URL}/reschedule/${rescheduleToken}`;

    await resend.emails.send({
      from: "Franchisync <noreply@franchisync.business>",
      to,
      subject: isReschedule
        ? "Your Franchisync Interview Has Been Rescheduled"
        : "Your Franchisync Interview is Scheduled!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Your Franchise Interview is Scheduled!</h2>
          <p>Hi ${name},</p>
          <div style="background: #E8F5E9; padding: 15px; margin: 15px 0;">
            <p><strong>Date:</strong> ${fmtDate}</p>
            ${appointmentLocation ? `<p><strong>Location:</strong> ${appointmentLocation}</p>` : ""}
            ${appointmentNotes ? `<p><strong>Notes:</strong> ${appointmentNotes}</p>` : ""}
          </div>
          <p>Need to change or cancel this schedule?</p>
          <p><a href="${rescheduleLink}" style="display:inline-block;padding:10px 20px;background:#2E7D32;color:#fff;text-decoration:none;border-radius:8px;">Cancel / Request Reschedule</a></p>
        </div>`
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send appointment email" });
  }
});

router.put("/applications/:id/appointment", async (req, res) => {
  try {
    const rawId = req.params.id;
    const isIpharma = rawId.startsWith("ip-");
    const id = parseInt(isIpharma ? rawId.replace("ip-", "") : rawId);
    const sourceTable = isIpharma ? "ipharma_applications" : "applications";
    const {
      appointmentDate, appointmentLocation, appointmentNotes,
      performed_by, role, latitude, longitude,
    } = req.body;

    if (!appointmentDate) {
      return res.status(400).json({ success: false, error: "appointmentDate is required" });
    }

    const before = await pool.query(`SELECT * FROM ${sourceTable} WHERE id=$1`, [id]);
    if (before.rows.length === 0)
      return res.status(404).json({ success: false, error: "Application not found" });
    const oldApp = before.rows[0];
    const isReschedule = !!oldApp.appointment_date;

    const token = crypto.randomBytes(24).toString("hex");

    const result = await pool.query(
      `UPDATE ${sourceTable}
      SET appointment_date=$1, appointment_location=$2, appointment_notes=$3,
          appointment_status='scheduled', appointment_token=$4, status='scheduled'
      WHERE id=$5 RETURNING *`,
      [appointmentDate, appointmentLocation || null, appointmentNotes || null, token, id]
    );

    const updatedApp = rowToApplication(result.rows[0]);

    await logActivity(
      isReschedule ? "reschedule_appointment" : "schedule_appointment",
      updatedApp.name,
      performed_by || "System",
      { appointment: { from: oldApp.appointment_date, to: appointmentDate, location: appointmentLocation || null } },
      req, updatedApp.franchise || (isIpharma ? "iPharma Mart" : null), "Applications",
      latitude, longitude, role || "Unknown"
    );

    res.json({ success: true, message: "Appointment scheduled", application: updatedApp, appointmentToken: token, isReschedule });
  } catch (err) {
    console.error("Error scheduling appointment:", err);
    res.status(500).json({ success: false, error: "Failed to schedule appointment" });
  }
});

router.put("/applications/:id/reschedule-options", async (req, res) => {
  try {
    const rawId = req.params.id;
    const isIpharma = rawId.startsWith("ip-");
    const id = parseInt(isIpharma ? rawId.replace("ip-", "") : rawId);
    const sourceTable = isIpharma ? "ipharma_applications" : "applications";
    const { optionADate, optionBDate, performed_by, role, latitude, longitude } = req.body;

    if (!optionADate || !optionBDate) {
      return res.status(400).json({ success: false, error: "Both optionADate and optionBDate are required" });
    }

    const before = await pool.query(`SELECT * FROM ${sourceTable} WHERE id=$1`, [id]);
    if (before.rows.length === 0)
      return res.status(404).json({ success: false, error: "Application not found" });
    const oldApp = before.rows[0];

    const token = oldApp.appointment_token || crypto.randomBytes(24).toString("hex");

    const result = await pool.query(
      `UPDATE ${sourceTable}
       SET reschedule_option_a=$1, reschedule_option_b=$2,
           appointment_status='options_sent', appointment_token=$3
       WHERE id=$4 RETURNING *`,
      [optionADate, optionBDate, token, id]
    );

    const updatedApp = rowToApplication(result.rows[0]);

    await logActivity(
      "send_reschedule_options",
      updatedApp.name,
      performed_by || "System",
      { optionA: optionADate, optionB: optionBDate },
      req, updatedApp.franchise || (isIpharma ? "iPharma Mart" : null), "Applications",
      latitude, longitude, role || "Unknown"
    );

    res.json({ success: true, application: updatedApp, appointmentToken: token });
  } catch (err) {
    console.error("Error sending reschedule options:", err);
    res.status(500).json({ success: false, error: "Failed to send reschedule options" });
  }
});

// ── Public: look up an appointment by token (for the reschedule landing page) ──
router.get("/public/appointments/:token", async (req, res) => {
  try {
    const { token } = req.params;
    let result = await pool.query(
      `SELECT name, appointment_date, appointment_location, appointment_status
       FROM applications WHERE appointment_token=$1`,
      [token]
    );
    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT name, appointment_date, appointment_location, appointment_status
         FROM ipharma_applications WHERE appointment_token=$1`,
        [token]
      );
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invalid or expired link" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

// ── Public: client clicks "Cancel / Request Reschedule" in the email ──
router.post("/public/appointments/:token/reschedule-request", async (req, res) => {
  try {
    const { token } = req.params;

    let sourceTable = "applications";
    let existing = await pool.query(`SELECT * FROM applications WHERE appointment_token=$1`, [token]);
    if (existing.rows.length === 0) {
      sourceTable = "ipharma_applications";
      existing = await pool.query(`SELECT * FROM ipharma_applications WHERE appointment_token=$1`, [token]);
    }
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Invalid or expired link" });
    }
    const app = existing.rows[0];

    if (app.appointment_status === "reschedule_requested") {
      return res.json({ success: true, alreadyRequested: true, name: app.name });
    }

    await pool.query(
      `UPDATE ${sourceTable} SET appointment_status='reschedule_requested' WHERE appointment_token=$1`,
      [token]
    );

    await logActivity(
      "reschedule_requested",
      app.name,
      "Applicant (self-service)",
      { appointment_date: app.appointment_date },
      req, app.franchise || (sourceTable === "ipharma_applications" ? "iPharma Mart" : null), "Applications"
    );

    res.json({ success: true, name: app.name });
  } catch (err) {
    console.error("Error requesting reschedule:", err);
    res.status(500).json({ success: false, error: "Failed to submit reschedule request" });
  }
});

router.post("/send-reschedule-options", async (req, res) => {
  const { to, name, optionADate, optionBDate, token } = req.body;
  try {
    const fmt = (d) => new Date(d).toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Manila" });
    const link = (opt) => `${process.env.FRONTEND_URL}/reschedule/${token}?option=${opt}`;

    await resend.emails.send({
      from: "Franchisync <noreply@franchisync.business>",
      to,
      subject: "Please Choose a New Interview Time",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">Choose Your New Interview Time</h2>
          <p>Hi ${name},</p>
          <p>Please pick one of the following available times:</p>
          <div style="margin: 15px 0;">
            <a href="${link("a")}" style="display:block;padding:12px 20px;background:#E8F5E9;color:#1b5e20;text-decoration:none;border-radius:8px;margin-bottom:10px;border:1px solid #a5d6a7;">
              Option A: ${fmt(optionADate)}
            </a>
            <a href="${link("b")}" style="display:block;padding:12px 20px;background:#E8F5E9;color:#1b5e20;text-decoration:none;border-radius:8px;border:1px solid #a5d6a7;">
              Option B: ${fmt(optionBDate)}
            </a>
          </div>
          <p style="font-size:12px;color:#666;">Clicking a time takes you to a confirmation page — nothing is booked until you confirm there.</p>
        </div>`
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send reschedule options email" });
  }
});

router.get("/public/appointments/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const cols = `name, appointment_date, appointment_location, appointment_status, reschedule_option_a, reschedule_option_b`;
    let result = await pool.query(`SELECT ${cols} FROM applications WHERE appointment_token=$1`, [token]);
    if (result.rows.length === 0) {
      result = await pool.query(`SELECT ${cols} FROM ipharma_applications WHERE appointment_token=$1`, [token]);
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invalid or expired link" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

router.post("/public/appointments/:token/select-option", async (req, res) => {
  try {
    const { token } = req.params;
    const { option } = req.body; // "a" | "b"
    if (!["a", "b"].includes(option)) {
      return res.status(400).json({ success: false, error: "Invalid option" });
    }

    let sourceTable = "applications";
    let existing = await pool.query(`SELECT * FROM applications WHERE appointment_token=$1`, [token]);
    if (existing.rows.length === 0) {
      sourceTable = "ipharma_applications";
      existing = await pool.query(`SELECT * FROM ipharma_applications WHERE appointment_token=$1`, [token]);
    }
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Invalid or expired link" });
    }
    const app = existing.rows[0];

    if (app.appointment_status !== "options_sent") {
      return res.status(400).json({ success: false, error: "No pending reschedule options for this appointment" });
    }

    const chosenDate = option === "a" ? app.reschedule_option_a : app.reschedule_option_b;
    if (!chosenDate) {
      return res.status(400).json({ success: false, error: "Selected option is unavailable" });
    }

    const result = await pool.query(
      `UPDATE ${sourceTable}
       SET appointment_date=$1, appointment_status='scheduled',
           reschedule_option_a=NULL, reschedule_option_b=NULL, status='scheduled'
       WHERE appointment_token=$2 RETURNING *`,
      [chosenDate, token]
    );
    const updatedApp = result.rows[0];

    await logActivity(
      "reschedule_confirmed",
      updatedApp.name,
      "Applicant (self-service)",
      { chosenOption: option, appointment_date: chosenDate },
      req, updatedApp.franchise || (sourceTable === "ipharma_applications" ? "iPharma Mart" : null), "Applications"
    );

    const fmtDate = new Date(chosenDate).toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Manila" });
    const ics = buildICS({
      title: `Franchise Interview — ${updatedApp.name}`,
      start: new Date(chosenDate),
      durationMinutes: 60,
      location: updatedApp.appointment_location || "",
      description: "Your franchise interview appointment.",
    });

    await resend.emails.send({
      from: "Franchisync <noreply@franchisync.business>",
      to: updatedApp.email,
      subject: "Your Interview is Confirmed!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2E7D32;">You're All Set!</h2>
          <p>Hi ${updatedApp.name},</p>
          <p>Your interview is confirmed for:</p>
          <div style="background:#E8F5E9;padding:15px;margin:15px 0;">
            <p><strong>Date:</strong> ${fmtDate}</p>
          </div>
          <p>A calendar invite is attached.</p>
        </div>`,
      attachments: [{ filename: "interview.ics", content: Buffer.from(ics).toString("base64") }],
    });

    res.json({ success: true, appointmentDate: chosenDate, name: updatedApp.name });
  } catch (err) {
    console.error("Error selecting reschedule option:", err);
    res.status(500).json({ success: false, error: "Failed to confirm selection" });
  }
});

router.delete("/applications/:id", async (req, res) => {
  try {
    const rawId = req.params.id;
    const isIpharma = rawId.startsWith("ip-");
    const id = isIpharma ? rawId.replace("ip-", "") : rawId;
    const sourceTable = isIpharma ? "ipharma_applications" : "applications";
    const { deleted_by, role, latitude, longitude } = req.body || {}; // ← add role here

    const existing = await pool.query(`SELECT * FROM ${sourceTable} WHERE id=$1`, [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, error: "Application not found" });
    const app = existing.rows[0];

    await pool.query("INSERT INTO application_delete_history (application_data) VALUES ($1)", [JSON.stringify(app)]);
    await pool.query(`DELETE FROM ${sourceTable} WHERE id=$1`, [id]);

    await logActivity(
      "delete",
      app.name,
      deleted_by || "System",
      { franchise: app.franchise || (isIpharma ? "iPharma Mart" : null), status: app.status },
      req, app.franchise || (isIpharma ? "iPharma Mart" : null), "Applications",
      latitude, longitude,
      role || "Unknown"          // ← add as final arg
    );

    res.json({ success: true, message: "Application deleted successfully" });
  } catch (err) {
    console.error("Error deleting application:", err);
    res.status(500).json({ success: false, error: "Failed to delete application" });
  }
});

router.get("/application-delete-history", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM application_delete_history ORDER BY deleted_at DESC");
    res.json(result.rows.map(row => ({ id: row.id, data: row.application_data, deletedAt: row.deleted_at })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch application delete history." });
  }
});

router.post("/application-delete-history", async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO application_delete_history (application_data) VALUES ($1)",
      [JSON.stringify(req.body.application_data)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save application delete history." });
  }
});

router.delete("/application-delete-history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM application_delete_history WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete application history entry." });
  }
});

router.get("/applications-activity-log", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users_activity_log WHERE module = $1 ORDER BY created_at DESC",
      ["Applications"]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch applications activity log:", err);
    res.status(500).json({ error: "Failed to fetch applications activity log" });
  }
});

module.exports = router;