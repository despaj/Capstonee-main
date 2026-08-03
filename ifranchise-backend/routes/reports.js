const express = require("express");
const router = express.Router();
const pool = require("../db");
const { fetchReportWithComments } = require("../utils/queries");
const { logActivity } = require("../utils/activityLogger");

router.post("/reports/submit", async (req, res) => {
  const { reportId, submittedBy, latitude, longitude } = req.body;
  if (!reportId) return res.status(400).json({ error: "reportId is required" });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  try {
    const result = await pool.query(
      `UPDATE reports SET status='submitted', submitted_at=NOW(), expires_at=$1, submitted_by=$2 WHERE id=$3 RETURNING id, brand, branch`,
      [expiresAt, submittedBy, reportId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Report not found" });

    const r = result.rows[0];
    await logActivity(
      "submit",
      `Report #${reportId}`,
      submittedBy || "System",
      { brand: r.brand, status: "submitted" },
      req, r.branch, "Reports", latitude, longitude
    );

    res.json({ success: true, expiresAt });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

router.get("/reports/history", async (req, res) => {
  const { branch } = req.query;
  try {
    const result = await pool.query(
      `SELECT id, period, content, submitted_at AS "submittedAt", submitted_at AS "generatedDate", expires_at AS "expiresAt", status, remark
       FROM reports WHERE LOWER(TRIM(branch))=LOWER(TRIM($1)) AND status IN ('submitted','approved','returned') AND expires_at IS NOT NULL AND expires_at>NOW() ORDER BY submitted_at DESC`,
      [branch]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.get("/reports/export", async (req, res) => {
  try {
    const { brand, branch, status } = req.query;
    const conditions = [], params = [];
    let idx = 1;
    if (brand)  { conditions.push(`brand=$${idx++}`); params.push(brand); }
    if (branch) { conditions.push(`LOWER(TRIM(branch))=LOWER(TRIM($${idx++}))`); params.push(branch); }
    if (status) { conditions.push(`status=$${idx++}`); params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT id, brand, branch, period, submitted_by, role, status, remark, submitted_at FROM reports ${where} ORDER BY submitted_at DESC`,
      params
    );

    const escape = val => { const s = val == null ? "" : String(val); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
    const toRow = arr => arr.map(escape).join(",");
    const headers = ["ID","Brand","Branch","Period","Submitted By","Role","Status","Remark","Submitted At"];
    const rows = result.rows.map(r => toRow([r.id, r.brand, r.branch, r.period, r.submitted_by, r.role, r.status, r.remark||"", new Date(r.submitted_at).toISOString()]));

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="reports-${Date.now()}.csv"`);
    res.send([toRow(headers), ...rows].join("\r\n"));
  } catch (err) {
    res.status(500).json({ error: "Failed to export reports" });
  }
});

router.get("/reports/deleted", async (req, res) => {
  const { branch } = req.query;
  try {
    const result = await pool.query(
      `SELECT id, period, submitted_by AS "submittedBy", deleted_at AS "deletedAt", expires_at AS "expiresAt", submitted_at AS "generatedDate", content
       FROM reports WHERE LOWER(TRIM(branch))=LOWER(TRIM($1)) AND status='deleted' AND expires_at>NOW() ORDER BY deleted_at DESC`,
      [branch]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch deleted reports" });
  }
});

router.get("/generated-reports", async (req, res) => {
  try {
    const { branch } = req.query;
    if (!branch) return res.status(400).json({ error: "Branch is required" });
    const result = await pool.query(
      `SELECT gr.id, gr.report_id AS "reportId", gr.snapshot, gr.saved_at AS "savedAt"
       FROM generated_reports gr JOIN reports r ON r.id=gr.report_id
       WHERE LOWER(TRIM(r.branch))=LOWER(TRIM($1)) ORDER BY gr.saved_at DESC`,
      [branch]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch generated reports" });
  }
});

router.get("/reports", async (req, res) => {
  try {
    const { brand, branch, status, search } = req.query;
    const conditions = [], params = [];
    let idx = 1;
    if (brand)  { conditions.push(`r.brand=$${idx++}`); params.push(brand); }
    if (branch) { conditions.push(`LOWER(TRIM(r.branch))=LOWER(TRIM($${idx++}))`); params.push(branch); }
    if (status) { conditions.push(`r.status=$${idx++}`); params.push(status); }
    if (search) { conditions.push(`(r.id::text ILIKE $${idx} OR r.submitted_by ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT r.id, r.brand, r.branch, r.period, r.content, r.submitted_by AS "submittedBy", r.role, r.status, r.remark,
       r.submitted_at AS "submittedAt", r.updated_at AS "updatedAt",
       COALESCE(json_agg(json_build_object('id',c.id,'text',c.text,'author',c.author,'postedAt',c.posted_at) ORDER BY c.posted_at) FILTER (WHERE c.id IS NOT NULL),'[]') AS comments
       FROM reports r LEFT JOIN report_comments c ON c.report_id=r.id ${where} GROUP BY r.id ORDER BY r.submitted_at DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

router.post("/reports", async (req, res) => {
  try {
    const { brand, branch, period, submittedBy, role, content, latitude, longitude } = req.body;
    if (!brand || !branch || !period || !submittedBy)
      return res.status(400).json({ error: "brand, branch, period, and submittedBy are required" });

    const existing = await pool.query(
      `SELECT id FROM reports WHERE LOWER(TRIM(branch))=LOWER(TRIM($1)) AND period=$2 AND status='pending' LIMIT 1`,
      [branch, period]
    );
    if (existing.rows.length > 0) {
      const updated = await pool.query(
        `UPDATE reports SET content=$1, submitted_by=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
        [content || "", submittedBy, existing.rows[0].id]
      );
      const report = await fetchReportWithComments(updated.rows[0].id);

      await logActivity(
        "update", `Report #${report.id}`, submittedBy || "System",
        { brand, period }, req, branch, "Reports", latitude, longitude
      );

      return res.status(200).json({ success: true, report });
    }

    const result = await pool.query(
      `INSERT INTO reports (brand, branch, period, submitted_by, role, content) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [brand, branch, period, submittedBy, role || "Branch Manager", content || ""]
    );
    const report = await fetchReportWithComments(result.rows[0].id);

    await logActivity(
      "create", `Report #${report.id}`, submittedBy || "System",
      { brand, period, role: role || "Branch Manager" }, req, branch, "Reports", latitude, longitude
    );

    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

router.get("/reports/:id", async (req, res) => {
  try {
    const report = await fetchReportWithComments(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

router.patch("/reports/:id/approve", async (req, res) => {
  try {
    const { performedBy, latitude, longitude } = req.body;
    const result = await pool.query(`UPDATE reports SET status='approved', remark=NULL, updated_at=NOW() WHERE id=$1 RETURNING id, brand, branch`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Report not found" });

    const r = result.rows[0];
    await logActivity(
      "approve", `Report #${req.params.id}`, performedBy || "System",
      { brand: r.brand, status: "approved" }, req, r.branch, "Reports", latitude, longitude
    );

    res.json(await fetchReportWithComments(req.params.id));
  } catch (err) {
    res.status(500).json({ error: "Failed to approve report" });
  }
});

router.patch("/reports/:id/return", async (req, res) => {
  try {
    const { remark, performedBy, latitude, longitude } = req.body;
    if (!remark?.trim()) return res.status(400).json({ error: "Return remark is required" });
    const result = await pool.query(`UPDATE reports SET status='returned', remark=$1, updated_at=NOW() WHERE id=$2 RETURNING id, brand, branch`, [remark.trim(), req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Report not found" });

    const r = result.rows[0];
    await logActivity(
      "return", `Report #${req.params.id}`, performedBy || "System",
      { brand: r.brand, remark: remark.trim() }, req, r.branch, "Reports", latitude, longitude
    );

    res.json(await fetchReportWithComments(req.params.id));
  } catch (err) {
    res.status(500).json({ error: "Failed to return report" });
  }
});

router.post("/reports/:id/comments", async (req, res) => {
  try {
    const { text, author = "Admin" } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Comment text is required" });
    const check = await pool.query("SELECT id FROM reports WHERE id=$1", [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Report not found" });
    const result = await pool.query(
      `INSERT INTO report_comments (report_id, text, author) VALUES ($1,$2,$3) RETURNING id, text, author, posted_at AS "postedAt"`,
      [req.params.id, text.trim(), author]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.post("/reports/:id/soft-delete", async (req, res) => {
  try {
    const { performedBy, latitude, longitude } = req.body;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const result = await pool.query(
      `UPDATE reports SET status='deleted', deleted_at=NOW(), expires_at=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [expiresAt, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Report not found" });
    await pool.query(`DELETE FROM generated_reports WHERE report_id=$1`, [req.params.id]);

    const r = result.rows[0];
    await logActivity(
      "delete", `Report #${req.params.id}`, performedBy || "System",
      { brand: r.brand, status: "deleted" }, req, r.branch, "Reports", latitude, longitude
    );

    res.json({ success: true, expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reports/:id/retrieve", async (req, res) => {
  try {
    const { performedBy, latitude, longitude } = req.body;
    const result = await pool.query(
      `UPDATE reports SET status='pending', deleted_at=NULL, expires_at=NULL, updated_at=NOW() WHERE id=$1 AND status='deleted' RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Report not found or not deleted" });

    const r = result.rows[0];
    await logActivity(
      "restore", `Report #${req.params.id}`, performedBy || "System",
      { brand: r.brand, note: "Restored from delete" }, req, r.branch, "Reports", latitude, longitude
    );

    res.json({ success: true, report: await fetchReportWithComments(req.params.id) });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve report" });
  }
});

router.post("/reports/:id/save", async (req, res) => {
  try {
    const report = await fetchReportWithComments(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    const existing = await pool.query(`SELECT id FROM generated_reports WHERE report_id=$1`, [req.params.id]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "Report already saved" });
    const result = await pool.query(
      `INSERT INTO generated_reports (report_id, snapshot, saved_at) VALUES ($1,$2,NOW()) RETURNING id, report_id AS "reportId", saved_at AS "savedAt"`,
      [req.params.id, JSON.stringify({ ...report, content: report.content || "" })]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to save report" });
  }
});

router.delete("/reports/:id/comments/:commentId", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM report_comments WHERE id=$1 AND report_id=$2 RETURNING id`,
      [req.params.commentId, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Comment not found" });
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

router.delete("/reports/:id", async (req, res) => {
  try {
    const { performedBy, latitude, longitude } = req.body || {};
    const existing = await pool.query(`SELECT brand, branch FROM reports WHERE id=$1`, [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Report not found" });
    const r = existing.rows[0];

    await pool.query(`DELETE FROM report_comments WHERE report_id=$1`, [req.params.id]);
    await pool.query(`DELETE FROM generated_reports WHERE report_id=$1`, [req.params.id]);
    await pool.query(`DELETE FROM reports WHERE id=$1`, [req.params.id]);

    await logActivity(
      "delete", `Report #${req.params.id}`, performedBy || "System",
      { brand: r.brand, note: "Permanently deleted" }, req, r.branch, "Reports", latitude, longitude
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete report" });
  }
});

router.get("/reports-activity-log", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users_activity_log WHERE module = $1 ORDER BY created_at DESC",
      ["Reports"]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports activity log" });
  }
});

module.exports = router;