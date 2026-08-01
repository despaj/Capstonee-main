const pool = require("../db");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket.remoteAddress;
}

function getDeviceLabel(req) {
  const ua = req.headers["user-agent"] || "";
  const parser = new UAParser(ua);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return `${browser.name || "Unknown browser"} on ${os.name || "Unknown OS"}`;
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "User-Agent": "iFranchise/1.0 (contact@franchisync.business)" } }
    );
    const data = await res.json();
    if (data?.address) {
      const a = data.address;
      const city = a.city || a.town || a.municipality || a.village || "Unknown city";
      const province = a.state || a.region || "";
      return province ? `${city}, ${province}` : city;
    }
  } catch (err) {
    console.error("Reverse geocode failed:", err);
  }
  return null;
}

async function getLocation(ip, latitude, longitude) {
  if (latitude && longitude) {
    const precise = await reverseGeocode(latitude, longitude);
    if (precise) return precise;
  }
  const cleanIp = ip?.replace("::ffff:", "");
  if (!cleanIp) return "Unknown";
  const geo = geoip.lookup(cleanIp);
  if (geo) return `${geo.city || "Unknown city"}, ${geo.country}`;
  try {
    const res = await fetch(`https://ipwho.is/${cleanIp}`);
    const text = await res.text();
    if (!text) return "Unknown";
    const data = JSON.parse(text);
    if (data.success) return `${data.city || "Unknown city"}, ${data.country}`;
  } catch (err) {
    console.error("Fallback geolocation failed:", err);
  }
  return "Unknown";
}

async function logActivity(action, itemName, performedBy = "system", details = {}, req = null, branch = null, module = "General", latitude = null, longitude = null) {
  try {
    let ip = null, device = null, location = null;
    if (req) {
      ip = getClientIp(req);
      device = getDeviceLabel(req);
      location = await getLocation(ip, latitude, longitude);
    }

    await pool.query(
      `INSERT INTO users_activity_log (action, item_name, branch, performed_by, changes, location, ip_address, device, module, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      [action, itemName, branch, performedBy, JSON.stringify(details), location, ip, device, module]
    );
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

module.exports = { logActivity };