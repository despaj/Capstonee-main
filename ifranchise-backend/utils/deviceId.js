const crypto = require("crypto");

function getOrCreateDeviceId(req, res) {
  const headerDeviceId = req.headers["x-device-id"];
  if (headerDeviceId) {
    console.log("Device ID from header:", headerDeviceId);
    return headerDeviceId;
  }

  let deviceId = req.cookies?.device_id;
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    const isLocalhost = req.headers.origin?.includes("localhost");
    res.cookie("device_id", deviceId, {
      httpOnly: true,
      sameSite: isLocalhost ? "lax" : "none",
      secure: !isLocalhost,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    console.log("New cookie device ID set:", deviceId);
  } else {
    console.log("Existing cookie found:", deviceId);
  }
  return deviceId;
}

module.exports = { getOrCreateDeviceId };