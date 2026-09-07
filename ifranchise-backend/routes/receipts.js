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
    let brand = null,
      branch = null;
    if (user_id) {
      const userResult = await pool.query(
        "SELECT brand, branch FROM users WHERE id=$1",
        [user_id],
      );
      if (userResult.rows.length > 0) {
        brand = userResult.rows[0].brand;
        branch = userResult.rows[0].branch;
      }
    }

    const mindeeClient = new mindee.v2.Client({
      apiKey: process.env.MINDEE_API_KEY,
    });
    const inputSource = new mindee.PathInput({ inputPath: req.file.path });
    const response = await mindeeClient.enqueueAndGetResult(
      mindee.v2.product.Extraction,
      inputSource,
      { modelId: process.env.MINDEE_MODEL_ID },
    );
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const fields = response.rawHttp.inference.result.fields;
    const merchant = fields?.supplier_name?.value ?? null;
    const date = fields?.date?.value ?? null;
    const total = fields?.total_amount?.value ?? null;
    const currency = fields?.locale?.fields?.currency?.value ?? "PHP";
    const vat =
      fields?.total_tax?.value ??
      fields?.taxes?.value ??
      fields?.tax?.value ??
      null;
    const referenceNo =
      fields?.document_number?.value ??
      fields?.invoice_number?.value ??
      fields?.receipt_number?.value ??
      null;
    const lineItems = (fields?.line_items?.items ?? []).map((item) => ({
      description: item.fields?.description?.value || "Item",
      quantity: item.fields?.quantity?.value || 0,
      unitPrice: item.fields?.unit_price?.value || 0,
      totalPrice: item.fields?.total_price?.value || 0,
    }));

    res.json({
      merchant,
      date,
      total,
      currency,
      vat,
      referenceNo,
      brand,
      branch,
      lineItems,
    });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const receiptResult = await client.query(
        `INSERT INTO receipts (merchant, date, total_amount, currency, vat, reference_no, brand, branch, uploaded_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [
          merchant,
          date,
          total,
          currency,
          vat,
          referenceNo,
          brand,
          branch,
          user_id || null,
        ],
      );
      for (const item of lineItems) {
        await client.query(
          `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5)`,
          [
            receiptResult.rows[0].id,
            item.description,
            item.quantity,
            item.unitPrice,
            item.totalPrice,
          ],
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
    let brand = null,
      branch = null;
    if (user_id) {
      const userResult = await pool.query(
        "SELECT brand, branch FROM users WHERE id=$1",
        [user_id],
      );
      if (userResult.rows.length > 0) {
        brand = userResult.rows[0].brand;
        branch = userResult.rows[0].branch;
      }
    }

    const mindeeClient = new mindee.v2.Client({
      apiKey: process.env.MINDEE_API_KEY,
    });
    const inputSource = new mindee.PathInput({ inputPath: req.file.path });
    const response = await mindeeClient.enqueueAndGetResult(
      mindee.v2.product.Extraction,
      inputSource,
      { modelId: process.env.MINDEE_MODEL_ID },
    );
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const fields = response.rawHttp.inference.result.fields;
    const merchant = fields?.supplier_name?.value ?? null;
    const date = fields?.date?.value ?? null;
    const total = fields?.total_amount?.value ?? null;
    const currency = fields?.locale?.fields?.currency?.value ?? "PHP";
    const vat = fields?.total_tax?.value ?? null;
    const referenceNo =
      fields?.document_number?.value ?? fields?.invoice_number?.value ?? null;
    const lineItems = (fields?.line_items?.items ?? []).map((item) => ({
      description: item.fields?.description?.value || "Item",
      quantity: item.fields?.quantity?.value || 0,
      unitPrice: item.fields?.unit_price?.value || 0,
      totalPrice: item.fields?.total_price?.value || 0,
    }));

    res.json({
      merchant,
      date,
      total,
      currency,
      vat,
      referenceNo,
      brand,
      branch,
      lineItems,
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "OCR failed", details: err.message });
  }
});

const axios = require("axios");
const FormData = require("form-data");

// ── AWS Textract config ────────────────────────────
const {
  TextractClient,
  DetectDocumentTextCommand,
} = require("@aws-sdk/client-textract");

const textractClient = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function analyzeIdDocument(base64Image) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const command = new DetectDocumentTextCommand({
    Document: { Bytes: buffer },
  });

  const result = await textractClient.send(command);

  const text = (result.Blocks || [])
    .filter((block) => block.BlockType === "LINE")
    .map((block) => block.Text)
    .join("\n");

  if (!text) throw new Error("No text detected on document");

  return { content: text };
}

function extractDate(text) {
  const match = text.match(
    /\b(\d{1,2}[\/\-. ]\d{1,2}[\/\-. ]\d{2,4}|\d{4}[\/\-. ]\d{1,2}[\/\-. ]\d{1,2}|[A-Z]{3,9}\.?\s+\d{1,2},?\s+\d{4})\b/,
  );
  return match ? match[0] : "";
}

function getValueAfterLabel(lines, labelRegex, allLabelRegexes = []) {
  const idx = lines.findIndex((l) => labelRegex.test(l));
  if (idx === -1) return "";

  // Try same line first (e.g. "Last Name: DELA CRUZ")
  const sameLine = lines[idx]
    .replace(labelRegex, "")
    .replace(/^[:\-]\s*/, "")
    .trim();
  const isSameLineAnotherLabel = allLabelRegexes.some((re) =>
    re.test(sameLine),
  );
  if (sameLine && !isSameLineAnotherLabel) return sameLine;

  // Otherwise scan forward, skipping any line that's itself a label
  for (let i = idx + 1; i < Math.min(idx + 5, lines.length); i++) {
    const candidate = lines[i];
    const isLabel = allLabelRegexes.some((re) => re.test(candidate));
    if (candidate && !isLabel) return candidate;
  }
  return "";
}

const ID_FIELD_LABELS = {
  "Philippine Passport": {
    lastName: /SURNAME/i,
    firstName: /GIVEN NAMES?/i,
    idNumber: /PASSPORT NO/i,
    dob: /DATE OF BIRTH/i,
    expiryDate: /DATE OF EXPIRY/i,
  },
  "Driver's License": {
    lastName: /LAST NAME/i,
    firstName: /FIRST NAME/i,
    middleName: /MIDDLE NAME/i,
    idNumber: /LICENSE NO/i,
    dob: /DATE OF BIRTH/i,
    expiryDate: /EXPIRATION DATE/i,
    address: /ADDRESS/i,
  },
  UMID: {
    lastName: /SURNAME/i,
    firstName: /GIVEN NAME/i,
    middleName: /MIDDLE NAME/i,
    idNumber: /CRN/i,
    dob: /DATE OF BIRTH/i,
  },
  "National ID (PhilSys)": {
    lastName: /APELYIDO|LAST NAME/i,
    firstName: /MGA PANGALAN|GIVEN NAME/i,
    middleName: /GITNANG APELYIDO|MIDDLE NAME/i,
    idNumber: /PCN/i,
    dob: /PETSA NG KAPANGANAKAN|DATE OF BIRTH/i,
    address: /TIRAHAN|ADDRESS/i,
  },
};

const GENERIC_FIELD_LABELS = {
  lastName: /LAST NAME|SURNAME/i,
  firstName: /FIRST NAME|GIVEN NAMES?/i,
  middleName: /MIDDLE NAME/i,
  idNumber: /ID NO|ID NUMBER|DOCUMENT NUMBER/i,
  dob: /DATE OF BIRTH|BIRTH DATE/i,
  expiryDate: /DATE OF EXPIRY|EXPIRATION DATE|VALID UNTIL/i,
  address: /ADDRESS/i,
};

function extractIdFields(content, idType) {
  const lines = (content || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const labels = ID_FIELD_LABELS[idType] || GENERIC_FIELD_LABELS;
  const allLabelRegexes = Object.values({ ...GENERIC_FIELD_LABELS, ...labels });

  const lastName = getValueAfterLabel(
    lines,
    labels.lastName || GENERIC_FIELD_LABELS.lastName,
    allLabelRegexes,
  );
  const firstName = getValueAfterLabel(
    lines,
    labels.firstName || GENERIC_FIELD_LABELS.firstName,
    allLabelRegexes,
  );
  const middleName = labels.middleName
    ? getValueAfterLabel(lines, labels.middleName, allLabelRegexes)
    : "";

  const idNumber =
    idType === "National ID (PhilSys)"
      ? extractPhilSysIdNumber(content)
      : getValueAfterLabel(
          lines,
          labels.idNumber || GENERIC_FIELD_LABELS.idNumber,
          allLabelRegexes,
        );

  const address = getValueAfterLabel(
    lines,
    labels.address || GENERIC_FIELD_LABELS.address,
    allLabelRegexes,
  );

  const dobLabel = labels.dob || GENERIC_FIELD_LABELS.dob;
  const dobLine = lines.find((l) => dobLabel.test(l));
  const dob = dobLine
    ? extractDate(dobLine) ||
      extractDate(lines[lines.indexOf(dobLine) + 1] || "")
    : "";

  const expiryLabel = labels.expiryDate || GENERIC_FIELD_LABELS.expiryDate;
  const expiryLine = lines.find((l) => expiryLabel.test(l));
  const expiryDate = expiryLine
    ? extractDate(expiryLine) ||
      extractDate(lines[lines.indexOf(expiryLine) + 1] || "")
    : "";

  return {
    firstName,
    lastName,
    middleName,
    dob,
    idNumber,
    expiryDate,
    address,
  };
}

function extractPhilSysIdNumber(content) {
  const match = content.match(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/);
  return match ? match[0] : "";
}

router.post("/api/verify-id", async (req, res) => {
  const { frontImage, idType } = req.body;
  const ID_TYPE_MAP = {
    "Philippine Passport": [
      "PASSPORT",
      "REPUBLIKA NG PILIPINAS",
      "REPUBLIC OF THE PHILIPPINES",
    ],
    "Driver's License": [
      "DRIVER'S LICENSE",
      "LAND TRANSPORTATION OFFICE",
      "LTO",
    ],
    "SSS ID": ["SOCIAL SECURITY SYSTEM", "SSS"],
    "GSIS ID": ["GOVERNMENT SERVICE INSURANCE", "GSIS"],
    "PhilHealth ID": ["PHILHEALTH", "PHILIPPINE HEALTH INSURANCE"],
    "Pag-IBIG ID": ["PAG-IBIG", "HOME DEVELOPMENT MUTUAL FUND", "HDMF"],
    "PRC ID": ["PROFESSIONAL REGULATION COMMISSION", "PRC"],
    "Voter's ID": ["COMMISSION ON ELECTIONS", "COMELEC", "VOTER"],
    "National ID (PhilSys)": [
      "PHILSYS",
      "PHILIPPINE IDENTIFICATION SYSTEM",
      "NATIONAL ID",
    ],
    "Senior Citizen ID": ["SENIOR CITIZEN"],
    "PWD ID": ["PERSON WITH DISABILITY", "PWD"],
    UMID: ["UMID", "UNIFIED MULTI-PURPOSE ID"],
  };

  try {
    const analyzeResult = await analyzeIdDocument(frontImage);

    const ocrText = (analyzeResult?.content || "").toUpperCase();

    const expectedKeywords = ID_TYPE_MAP[idType] || [];
    const isCorrectIdType = expectedKeywords.some((k) =>
      ocrText.includes(k.toUpperCase()),
    );

    if (!isCorrectIdType) {
      return res.json({
        success: true,
        data: {
          firstName: "",
          lastName: "",
          middleName: "",
          dob: "",
          address: "",
          idNumber: "",
          expiryDate: null,
          isValid: false,
          confidence: 0,
          reason: `Wrong ID type. Please upload a "${idType}".`,
        },
      });
    }

    const data = extractIdFields(analyzeResult.content, idType);

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
    console.error("error:", err.response?.data?.error || err.message);
    res.status(500).json({ success: false, error: "Failed to verify ID" });
  }
});

const {
  RekognitionClient,
  CompareFacesCommand,
} = require("@aws-sdk/client-rekognition");

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
    return res
      .status(400)
      .json({ success: false, error: "Both face and ID images are required." });

  try {
    const sourceBuffer = Buffer.from(
      faceImage.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );
    const targetBuffer = Buffer.from(
      idImage.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );

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
      return res.json({
        success: true,
        matched: false,
        score: 0,
        reason:
          "No face detected in one of the images. Please retake your photo.",
      });
    }

    res
      .status(500)
      .json({ success: false, error: "Face match service failed." });
  }
});

router.get("/receipts", async (req, res) => {
  try {
    const { user_id, brand, branch } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const userResult = await pool.query("SELECT role FROM users WHERE id=$1", [
      user_id,
    ]);
    if (userResult.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const isAdmin = userResult.rows[0].role === "Super Admin";
    const conditions = [],
      values = [];
    if (!isAdmin) {
      values.push(user_id);
      conditions.push(`uploaded_by=$${values.length}`);
    }
    if (brand) {
      values.push(brand);
      conditions.push(`brand=$${values.length}`);
    }
    if (branch) {
      values.push(branch);
      conditions.push(`branch=$${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `SELECT * FROM receipts ${where} ORDER BY created_at DESC`,
      values,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});

router.get("/receipts/:id", async (req, res) => {
  try {
    const receipt = await pool.query("SELECT * FROM receipts WHERE id=$1", [
      req.params.id,
    ]);
    if (receipt.rows.length === 0)
      return res.status(404).json({ error: "Receipt not found" });
    const items = await pool.query(
      "SELECT * FROM receipt_items WHERE receipt_id=$1 ORDER BY id",
      [req.params.id],
    );
    res.json({ ...receipt.rows[0], lineItems: items.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});

router.post("/receipts/save", async (req, res) => {
  const {
    merchant,
    date,
    total,
    currency,
    vat,
    referenceNo,
    lineItems,
    user_id,
  } = req.body;
  let brand = null,
    branch = null;
  if (user_id) {
    const userResult = await pool.query(
      "SELECT brand, branch FROM users WHERE id=$1",
      [user_id],
    );
    if (userResult.rows.length > 0) {
      brand = userResult.rows[0].brand;
      branch = userResult.rows[0].branch;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const receiptResult = await client.query(
      `INSERT INTO receipts (merchant, date, total_amount, currency, vat, reference_no, brand, branch, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        merchant,
        date,
        total,
        currency,
        vat,
        referenceNo,
        brand,
        branch,
        user_id || null,
      ],
    );
    for (const item of lineItems || []) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5)`,
        [
          receiptResult.rows[0].id,
          item.description,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
        ],
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
  const {
    merchant,
    date,
    total_amount,
    currency,
    lineItems,
    vat,
    reference_no,
  } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE receipts SET merchant=$1, date=$2, total_amount=$3, currency=$4, vat=$5, reference_no=$6 WHERE id=$7`,
      [
        merchant,
        date,
        total_amount,
        currency,
        vat,
        reference_no,
        req.params.id,
      ],
    );
    await client.query("DELETE FROM receipt_items WHERE receipt_id=$1", [
      req.params.id,
    ]);
    for (const item of lineItems) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, description, quantity, unit_price, total_price) VALUES ($1,$2,$3,$4,$5)`,
        [
          req.params.id,
          item.description,
          item.quantity,
          item.unit_price,
          item.total_price,
        ],
      );
    }
    await client.query("COMMIT");
    const receipt = await pool.query("SELECT * FROM receipts WHERE id=$1", [
      req.params.id,
    ]);
    const items = await pool.query(
      "SELECT * FROM receipt_items WHERE receipt_id=$1 ORDER BY id",
      [req.params.id],
    );
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
