const express = require("express");
const router = express.Router();

const PSGC_BASE = "https://psgc.gitlab.io/api";

router.get("/api/psgc/regions", async (req, res) => {
  try {
    const response = await fetch(`${PSGC_BASE}/regions/`);
    res.json(await response.json());
  } catch { res.status(500).json({ error: "Failed to load PSGC regions" }); }
});

router.get("/api/psgc/regions/:code/provinces", async (req, res) => {
  try {
    const response = await fetch(`${PSGC_BASE}/regions/${req.params.code}/provinces/`);
    res.json(await response.json());
  } catch { res.status(500).json({ error: "Failed to load provinces" }); }
});

router.get("/api/psgc/regions/:code/cities-municipalities", async (req, res) => {
  try {
    const response = await fetch(`${PSGC_BASE}/regions/${req.params.code}/cities-municipalities/`);
    res.json(await response.json());
  } catch { res.status(500).json({ error: "Failed to load cities" }); }
});

router.get("/api/psgc/provinces/:code/cities-municipalities", async (req, res) => {
  try {
    const response = await fetch(`${PSGC_BASE}/provinces/${req.params.code}/cities-municipalities/`);
    res.json(await response.json());
  } catch { res.status(500).json({ error: "Failed to load cities" }); }
});

router.get("/api/psgc/cities-municipalities/:code/barangays", async (req, res) => {
  try {
    const response = await fetch(`${PSGC_BASE}/cities-municipalities/${req.params.code}/barangays/`);
    res.json(await response.json());
  } catch { res.status(500).json({ error: "Failed to load barangays" }); }
});

module.exports = router;