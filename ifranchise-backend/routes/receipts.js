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

const axios = require("axios");
const FormData = require("form-data");

const MINDEE_BASE = "https://api-v2.mindee.net/v2";

async function mindeeExtract(base64Image, modelId) {
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");

  const form = new FormData();
  form.append("model_id", modelId);
  form.append("file", buffer, { filename: "document.jpg", contentType: "image/jpeg" });

  const enqueueRes = await axios.post(`${MINDEE_BASE}/inferences/enqueue`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: process.env.MINDEE_API_KEY,
    },
  });

  const job = enqueueRes.data?.job;
  if (!job?.id) throw new Error("Mindee did not return a job id");

  const pollingUrl = job.polling_url || `${MINDEE_BASE}/jobs/${job.id}`;

  let resultUrl = null;
  for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 1500));

  const pollRes = await axios.get(pollingUrl, {
    headers: { Authorization: process.env.MINDEE_API_KEY },
    validateStatus: () => true,
  });

  // Case 1: axios followed the redirect — this IS the final result already
  if (pollRes.data?.inference) {
    return pollRes.data;
  }

  // Case 2: still wrapped in the job object, still processing
  if (pollRes.data?.job) {
    const status = pollRes.data.job.status;
    console.log("Mindee job status:", status);

    if (pollRes.data.job.error) {
      throw new Error(pollRes.data.job.error?.message || "Mindee processing failed");
    }

    if (status && status !== "Processing") {
      const resultRes = await axios.get(pollRes.data.job.result_url, {
        headers: { Authorization: process.env.MINDEE_API_KEY },
      });
      return resultRes.data;
    }
  }
}

throw new Error("Mindee processing timed out");

  const resultRes = await axios.get(resultUrl, {
    headers: { Authorization: process.env.MINDEE_API_KEY },
  });

  return resultRes.data; 
}

// ── Azure Document Intelligence config ────────────────────────────
const AZURE_DI_ENDPOINT = process.env.AZURE_DOC_INTEL_ENDPOINT;
const AZURE_DI_KEY = process.env.AZURE_DOC_INTEL_KEY;

async function analyzeIdDocument(base64Image) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const submitRes = await fetch(
    `${AZURE_DI_ENDPOINT}/documentintelligence/documentModels/prebuilt-idDocument:analyze?api-version=2024-11-30`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": AZURE_DI_KEY,
      },
      body: JSON.stringify({ base64Source: base64Data }),
    }
  );

  if (submitRes.status !== 202) {
    const err = await submitRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Failed to submit document for analysis");
  }

  const operationLocation = submitRes.headers.get("operation-location");
  if (!operationLocation) throw new Error("No operation-location returned by Azure");

  let result;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const pollRes = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": AZURE_DI_KEY },
    });
    result = await pollRes.json();
    console.log("Azure DI status:", result.status); // keep for first run
    if (result.status === "succeeded" || result.status === "failed") break;
  }

  if (!result || result.status !== "succeeded") {
    throw new Error(result?.error?.message || "Document analysis timed out or failed");
  }

  return result.analyzeResult;
}

function splitFirstAndMiddle(rawFirstName) {
  if (!rawFirstName) return { firstName: "", middleName: "" };
  const parts = rawFirstName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], middleName: "" };
  const middleName = parts.pop();
  const firstName = parts.join(" ");
  return { firstName, middleName };
}

function extractMiddleNameFromContent(content) {
  if (!content) return "";
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const idx = lines.findIndex((l) => /MIDDLE NAME/i.test(l));
  if (idx !== -1 && lines[idx + 1]) {
    return lines[idx + 1];
  }
  return "";
}

function extractIdFields(analyzeResult) {
  const doc = analyzeResult?.documents?.[0];
  const fields = doc?.fields || {};
  const get = (name) => fields[name]?.valueString ?? fields[name]?.content ?? "";
  const getDate = (name) => fields[name]?.valueDate ?? fields[name]?.content ?? "";

  const addressField = fields.Address;
  const address = addressField?.valueAddress
    ? [
        addressField.valueAddress.streetAddress,
        addressField.valueAddress.city,
        addressField.valueAddress.state,
        addressField.valueAddress.postalCode,
      ].filter(Boolean).join(", ")
    : addressField?.content || "";

  const { firstName, middleName: middleFromFirstName } = splitFirstAndMiddle(get("FirstName"));
  const middleName = middleFromFirstName || extractMiddleNameFromContent(analyzeResult?.content);

  return {
    firstName,
    lastName: get("LastName"),
    middleName,
    dob: getDate("DateOfBirth"),
    idNumber: get("DocumentNumber"),
    expiryDate: getDate("DateOfExpiration"),
    address,
  };
}

router.post("/api/verify-id", async (req, res) => {
  const { frontImage, idType } = req.body;
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
    const analyzeResult = await analyzeIdDocument(frontImage);

    const ocrText = (analyzeResult?.content || "").toUpperCase();
    console.log("Azure OCR text:", ocrText); // keep for first run

    const expectedKeywords = ID_TYPE_MAP[idType] || [];
    const isCorrectIdType = expectedKeywords.some((k) => ocrText.includes(k.toUpperCase()));

    if (!isCorrectIdType) {
      return res.json({
        success: true,
        data: {
          firstName: "", lastName: "", middleName: "", dob: "", address: "",
          idNumber: "", expiryDate: null, isValid: false, confidence: 0,
          reason: `Wrong ID type. Please upload a "${idType}".`,
        },
      });
    }

    const data = extractIdFields(analyzeResult);

    return res.json({
      success: true,
      data: {
        ...data,
        isValid: true,
        confidence: 1,
        reason: "ID verified successfully",
      },
    });
  } catch (err) {
    console.error("verify-id error:", err);
    res.status(500).json({ success: false, error: "Failed to verify ID" });
  }
});

const AZURE_FACE_ENDPOINT = process.env.AZURE_FACE_API_ENDPOINT;
const AZURE_FACE_KEY = process.env.AZURE_FACE_API_KEY;

async function detectFace(base64Image) {
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");

  const response = await fetch(
    `${AZURE_FACE_ENDPOINT}/face/v1.0/detect?returnFaceId=true&recognitionModel=recognition_04&detectionModel=detection_03`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Ocp-Apim-Subscription-Key": AZURE_FACE_KEY,
      },
      body: buffer,
    }
  );

  const data = await response.json();
  console.log("Azure Face detect status:", response.status);
  console.log("Azure Face detect response:", JSON.stringify(data)); // ADD THIS

  if (!response.ok) {
    throw new Error(data?.error?.message || "Azure face detection failed");
  }
  return data;
}

const { RekognitionClient, CompareFacesCommand } = require("@aws-sdk/client-rekognition");

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION, // e.g. "ap-southeast-1"
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post("/api/face-match", async (req, res) => {
  const { faceImage, idImage } = req.body;
  if (!faceImage || !idImage)
    return res.status(400).json({ success: false, error: "Both face and ID images are required." });

  try {
    const sourceBuffer = Buffer.from(faceImage.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const targetBuffer = Buffer.from(idImage.replace(/^data:image\/\w+;base64,/, ""), "base64");

    const command = new CompareFacesCommand({
      SourceImage: { Bytes: sourceBuffer },
      TargetImage: { Bytes: targetBuffer },
      SimilarityThreshold: 70, // Rekognition only returns matches above this threshold
    });

    const result = await rekognitionClient.send(command);

    if (!result.FaceMatches || result.FaceMatches.length === 0) {
      return res.json({
        success: true,
        matched: false,
        score: 0,
        reason: "Face does not match the ID photo. Please retake your selfie.",
      });
    }

    const bestMatch = result.FaceMatches[0];
    const score = bestMatch.Similarity / 100; // Rekognition gives 0-100, normalize to 0-1

    return res.json({
      success: true,
      matched: true,
      score,
      reason: "Face matched successfully.",
    });
  } catch (err) {
    console.error("Rekognition face match error:", err);

    if (err.name === "InvalidParameterException") {
      return res.json({ success: true, matched: false, score: 0, reason: "No face detected in one of the images. Please retake your photo." });
    }

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