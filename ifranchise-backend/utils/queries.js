const pool = require("../db");

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

module.exports = { fetchReportWithComments };