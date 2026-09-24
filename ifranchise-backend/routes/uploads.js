const express = require("express");
const multer = require("multer");
const supabaseAdmin = require("../supabaseAdmin");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

router.post("/api/upload-loi", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });
  if (req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ error: "Only PDF files are allowed" });
  }

  const path = `loi/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;
  const { error } = await supabaseAdmin.storage
    .from("application-documents")
    .upload(path, req.file.buffer, { contentType: "application/pdf" });

  if (error) return res.status(400).json({ error: error.message });

  const { data } = supabaseAdmin.storage
    .from("application-documents")
    .getPublicUrl(path);
  res.json({ url: data.publicUrl });
});

router.post("/api/upload-id-image", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const path = `id-images/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error } = await supabaseAdmin.storage
    .from("application-documents")
    .upload(path, req.file.buffer, { contentType: "image/jpeg" });

  if (error) return res.status(400).json({ error: error.message });

  const { data } = supabaseAdmin.storage
    .from("application-documents")
    .getPublicUrl(path);
  res.json({ url: data.publicUrl });
});

module.exports = router;
