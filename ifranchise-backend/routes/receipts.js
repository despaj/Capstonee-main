const express = require("express");
const router = express.Router();
const pool = require("../db");
const fs = require("fs");
const path = require("path");
const os = require("os");
const mindee = require("mindee");
const upload = require("../utils/upload");

router.post("/upload", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { user_id } = req.body;
    let brand = null, branch = null;
    if (user_id) {
      const userResult = await pool.query("SELECT brand, branch FROM users WHERE id=$1", [user_id]);
      if (userResult.rows.length > 0) { brand = userResult.rows[0].brand; branch = userResult.rows[0].branch; }
    }

    const mindeeClient = new mindee.v2.Client({ apiKey: process.env.MINDEE_API_KEY });
    const inputSource = new mindee.PathInput({ inputPath: req.file.path });
    const response = await mindeeClient.enqueueAndGetResult(mindee.v2.product.Extraction, inputSource, { modelId: process.env.MINDEE_MODEL_ID });
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const fields = response.rawHttp.inference.result.fields;
    const merchant    = fields?.supplier_name?.value ?? null;
    const date        = fields?.date?.value ?? null;
    const total       = fields?.total_amount?.value ?? null;
    const currency    = fields?.locale?.fields?.currency?.value ?? "PHP";
    const vat         = fields?.total_tax?.value ?? fields?.taxes?.value ?? fields?.tax?.value ?? null;
    const referenceNo = fields?.document_number?.value ?? fields?.invoice_number?.value ?? fields?.receipt_number?.value ?? null;
    const lineItems   = (fields?.line_items?.items ?? []).map(item => ({
      description: item.fields?.description?.value || "Item",
      quantity:    item.fields?.quantity?.value || 0,
      unitPrice:   item.fields?.unit_price?.value || 0,
      totalPrice:  item.fields?.total_price?.value || 0,
    }));

    res.json({ merchant, date, total, currency, vat, referenceNo, brand, branch, lineItems });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const receiptResult = await client.query(
        `INSERT INTO receipts (merchant, date, total_amount, currency, vat, reference_no, brand, branch, uploaded_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [merchant, date, total, currency, vat, referenceNo, brand, branch, user_id || null]
      );
      for (const item of lineItems) {
        await client.query(
          `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5)`,
          [receiptResult.rows[0].id, item.description, item.quantity, item.unitPrice, item.totalPrice]
        );
      }
      await client.query("COMMIT");
    } catch (dbErr) {
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "OCR failed", details: err.message });
  }
});

router.post("/ocr-extract", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { user_id } = req.body;
    let brand = null, branch = null;
    if (user_id) {
      const userResult = await pool.query("SELECT brand, branch FROM users WHERE id=$1", [user_id]);
      if (userResult.rows.length > 0) { brand = userResult.rows[0].brand; branch = userResult.rows[0].branch; }
    }

    const mindeeClient = new mindee.v2.Client({ apiKey: process.env.MINDEE_API_KEY });
    const inputSource = new mindee.PathInput({ inputPath: req.file.path });
    const response = await mindeeClient.enqueueAndGetResult(mindee.v2.product.Extraction, inputSource, { modelId: process.env.MINDEE_MODEL_ID });
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const fields = response.rawHttp.inference.result.fields;
    const merchant    = fields?.supplier_name?.value ?? null;
    const date        = fields?.date?.value ?? null;
    const total       = fields?.total_amount?.value ?? null;
    const currency    = fields?.locale?.fields?.currency?.value ?? "PHP";
    const vat         = fields?.total_tax?.value ?? null;
    const referenceNo = fields?.document_number?.value ?? fields?.invoice_number?.value ?? null;
    const lineItems   = (fields?.line_items?.items ?? []).map(item => ({
      description: item.fields?.description?.value || "Item",
      quantity:    item.fields?.quantity?.value || 0,
      unitPrice:   item.fields?.unit_price?.value || 0,
      totalPrice:  item.fields?.total_price?.value || 0,
    }));

    res.json({ merchant, date, total, currency, vat, referenceNo, brand, branch, lineItems });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "OCR failed", details: err.message });
  }
});

router.post("/api/extract-id", async (req, res) => {
  const { frontImage } = req.body;
  const base64Data = frontImage.replace(/^data:image\/\w+;base64,/, "");
  const tempPath = path.join(os.tmpdir(), `id_${Date.now()}.jpg`);
  fs.writeFileSync(tempPath, Buffer.from(base64Data, "base64"));

  try {
    const mindeeClient = new mindee.v2.Client({ apiKey: process.env.MINDEE_API_KEY });
    const inputSource = new mindee.PathInput({ inputPath: tempPath });
    const response = await mindeeClient.enqueueAndGetResult(mindee.v2.product.Extraction, inputSource, { modelId: process.env.MINDEE_ID_MODEL_ID });
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    const fields = response.rawHttp.inference.result.fields;
    const addrStreet = fields?.address?.fields?.street?.value || "";
    const addrCity   = fields?.address?.fields?.city?.value   || "";
    const addrState  = fields?.address?.fields?.state?.value  || "";
    const addrPostal = fields?.address?.fields?.postal_code?.value || "";

    res.json({
      success: true,
      data: {
        firstName:  fields?.given_names?.value  || fields?.first_name?.value || "",
        lastName:   fields?.surnames?.value     || "",
        middleName: fields?.middle_name?.value  || "",
        dob:        fields?.birth_date?.value   || fields?.date_of_birth?.value || "",
        idNumber:   fields?.document_number?.value || fields?.id_number?.value || "",
        expiryDate: fields?.date_of_expiry?.value || "",
        address:    [addrStreet, addrCity, addrState, addrPostal].filter(Boolean).join(", "),
      },
    });
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(500).json({ success: false, error: "Failed to extract ID data" });
  }
});

router.post("/api/verify-id", async (req, res) => {
  const { frontImage, backImage, idType } = req.body;
  const ID_TYPE_MAP = {
    "Philippine Passport":   ["PASSPORT", "REPUBLIKA NG PILIPINAS", "REPUBLIC OF THE PHILIPPINES"],
    "Driver's License":      ["DRIVER'S LICENSE", "LAND TRANSPORTATION OFFICE", "LTO"],
    "SSS ID":                ["SOCIAL SECURITY SYSTEM", "SSS"],
    "GSIS ID":               ["GOVERNMENT SERVICE INSURANCE", "GSIS"],
    "PhilHealth ID":         ["PHILHEALTH", "PHILIPPINE HEALTH INSURANCE"],
    "Pag-IBIG ID":           ["PAG-IBIG", "HOME DEVELOPMENT MUTUAL FUND", "HDMF"],
    "PRC ID":                ["PROFESSIONAL REGULATION COMMISSION", "PRC"],
    "Voter's ID":            ["COMMISSION ON ELECTIONS", "COMELEC", "VOTER"],
    "National ID (PhilSys)": ["PHILSYS", "PHILIPPINE IDENTIFICATION SYSTEM", "NATIONAL ID"],
    "Senior Citizen ID":     ["SENIOR CITIZEN"],
    "PWD ID":                ["PERSON WITH DISABILITY", "PWD"],
    "UMID":                  ["UMID", "UNIFIED MULTI-PURPOSE ID"],
  };

  try {
    const payload = { document: frontImage.replace(/^data:image\/\w+;base64,/, ""), authenticate: true };
    if (backImage) payload.document_back = backImage.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch("https://api2.idanalyzer.com/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": process.env.ID_ANALYZER_API_KEY },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!result.success)
      return res.status(400).json({ success: false, error: result.error?.message || "ID verification failed" });

    const data = result.data || {};
    const authScore = result.authentication?.score ?? 1;
    const ocrText = [result.data?.ocrResult, result.data?.ocrText, result.fullText, result.rawText, ...Object.values(data).map(v => Array.isArray(v) ? v.map(i => i?.value || "").join(" ") : v?.value || "")]
      .filter(Boolean).join(" ").toUpperCase();

    const expectedKeywords = ID_TYPE_MAP[idType] || [];
    const isCorrectIdType = expectedKeywords.some(k => ocrText.includes(k.toUpperCase()));

    if (!isCorrectIdType)
      return res.json({ success: true, data: { firstName: "", lastName: "", middleName: "", dob: "", address: "", idNumber: "", expiryDate: null, isValid: false, confidence: 0, reason: `Wrong ID type. Please upload a "${idType}".` } });

    if (authScore < 0.5)
      return res.json({ success: true, data: { firstName: "", lastName: "", middleName: "", dob: "", address: "", idNumber: "", expiryDate: null, isValid: false, confidence: authScore, reason: "ID failed authenticity check." } });

    const tempPath = path.join(os.tmpdir(), `id_${Date.now()}.jpg`);
    fs.writeFileSync(tempPath, Buffer.from(frontImage.replace(/^data:image\/\w+;base64,/, ""), "base64"));

    const mindeeClient = new mindee.v2.Client({ apiKey: process.env.MINDEE_API_KEY });
    const mindeeRes = await mindeeClient.enqueueAndGetResult(mindee.v2.product.Extraction, new mindee.PathInput({ inputPath: tempPath }), { modelId: process.env.MINDEE_ID_MODEL_ID });
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    const fields = mindeeRes.rawHttp.inference.result.fields;
    const addrStreet = fields?.address?.fields?.street?.value || "";
    const addrCity   = fields?.address?.fields?.city?.value   || "";
    const addrState  = fields?.address?.fields?.state?.value  || "";
    const addrPostal = fields?.address?.fields?.postal_code?.value || "";

    return res.json({
      success: true,
      data: {
        firstName:  fields?.given_names?.value  || "",
        lastName:   fields?.surnames?.value     || "",
        middleName: fields?.middle_name?.value  || "",
        dob:        fields?.birth_date?.value   || "",
        idNumber:   fields?.document_number?.value || "",
        expiryDate: fields?.date_of_expiry?.value || "",
        address:    [addrStreet, addrCity, addrState, addrPostal].filter(Boolean).join(", "),
        isValid: true, confidence: authScore, reason: "ID verified successfully",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to verify ID" });
  }
});

router.post("/api/face-match", async (req, res) => {
  const { faceImage, idImage } = req.body;
  if (!faceImage || !idImage)
    return res.status(400).json({ success: false, error: "Both face and ID images are required." });

  try {
    const response = await fetch("https://api2.idanalyzer.com/face", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": process.env.ID_ANALYZER_API_KEY },
      body: JSON.stringify({ face: faceImage.replace(/^data:image\/\w+;base64,/, ""), reference: idImage.replace(/^data:image\/\w+;base64,/, "") }),
    });
    const result = await response.json();

    if (!result.success)
      return res.json({ success: true, matched: false, score: 0, reason: result.error?.message || "Face match failed." });

    const score = result.scores?.faceCompare ?? result.confidence ?? result.score ?? 0;
    const matched = score >= 0.5;
    return res.json({ success: true, matched, score, reason: matched ? "Face matched successfully." : "Face does not match. Please retake your selfie." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Face match service failed." });
  }
});

router.get("/receipts", async (req, res) => {
  try {
    const { user_id, brand, branch } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const userResult = await pool.query("SELECT role FROM users WHERE id=$1", [user_id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const isAdmin = userResult.rows[0].role === "Super Admin";
    const conditions = [], values = [];
    if (!isAdmin) { values.push(user_id); conditions.push(`uploaded_by=$${values.length}`); }
    if (brand)  { values.push(brand);  conditions.push(`brand=$${values.length}`); }
    if (branch) { values.push(branch); conditions.push(`branch=$${values.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(`SELECT * FROM receipts ${where} ORDER BY created_at DESC`, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});

router.get("/receipts/:id", async (req, res) => {
  try {
    const receipt = await pool.query("SELECT * FROM receipts WHERE id=$1", [req.params.id]);
    if (receipt.rows.length === 0) return res.status(404).json({ error: "Receipt not found" });
    const items = await pool.query("SELECT * FROM receipt_items WHERE receipt_id=$1 ORDER BY id", [req.params.id]);
    res.json({ ...receipt.rows[0], lineItems: items.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});

router.post("/receipts/save", async (req, res) => {
  const { merchant, date, total, currency, vat, referenceNo, lineItems, user_id } = req.body;
  let brand = null, branch = null;
  if (user_id) {
    const userResult = await pool.query("SELECT brand, branch FROM users WHERE id=$1", [user_id]);
    if (userResult.rows.length > 0) { brand = userResult.rows[0].brand; branch = userResult.rows[0].branch; }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const receiptResult = await client.query(
      `INSERT INTO receipts (merchant, date, total_amount, currency, vat, reference_no, brand, branch, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [merchant, date, total, currency, vat, referenceNo, brand, branch, user_id || null]
    );
    for (const item of (lineItems || [])) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5)`,
        [receiptResult.rows[0].id, item.description, item.quantity, item.unitPrice, item.totalPrice]
      );
    }
    await client.query("COMMIT");
    res.json({ id: receiptResult.rows[0].id, success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to save receipt" });
  } finally {
    client.release();
  }
});

router.put("/receipts/:id", async (req, res) => {
  const { merchant, date, total_amount, currency, lineItems, vat, reference_no } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE receipts SET merchant=$1, date=$2, total_amount=$3, currency=$4, vat=$5, reference_no=$6 WHERE id=$7`,
      [merchant, date, total_amount, currency, vat, reference_no, req.params.id]
    );
    await client.query("DELETE FROM receipt_items WHERE receipt_id=$1", [req.params.id]);
    for (const item of lineItems) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5)`,
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

router.delete("/receipts/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM receipts WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete receipt" });
  }
});

module.exports = router;