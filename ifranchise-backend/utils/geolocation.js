// utils/geolocation.js
export function getBrowserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation denied or failed:", err.message);
        resolve(null); // user denied, or timed out — fall back gracefully
      },
      { timeout: 5000, maximumAge: 60000 }
    );
  });
}