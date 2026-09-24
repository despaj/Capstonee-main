require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const pool = require("./db");
const { loadSession } = require("./utils/authSession");

const app = express();

const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  "http://localhost:3000",
  "https://www.franchisync.business",
  "https://franchisync.business",
  "https://franchisync.vercel.app",
  "http://localhost:8081",
  "http://192.168.1.194:8081",
];

app.set("trust proxy", 1);

app.use(
  cors({
    origin: allowedOrigins,

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Client",
      "X-Device-ID",
    ],

    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "20mb",
  }),
);

app.use(
  express.urlencoded({
    limit: "20mb",
    extended: true,
  }),
);

app.use(cookieParser());

app.use(loadSession(allowedOrigins));

const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;

async function cleanupExpiredData() {
  try {
    const reportsResult = await pool.query(
      `
      DELETE FROM reports
      WHERE expires_at < NOW()
        AND status = 'submitted'
      `,
    );

    const sessionsResult = await pool.query(
      `
      DELETE FROM website_auth_sessions
      WHERE expires_at < NOW()
      `,
    );

    console.log(
      `Cleanup complete: ${reportsResult.rowCount} expired report(s), ${sessionsResult.rowCount} expired session(s) removed.`,
    );
  } catch (err) {
    console.error("Scheduled cleanup failed:", err.message);
  }
}

// Run every 24 hours.
setInterval(cleanupExpiredData, CLEANUP_INTERVAL);

app.use("/", require("./routes/auth"));

app.use("/", require("./routes/users"));

app.use("/", require("./routes/applications"));

app.use("/", require("./routes/inventory"));

app.use("/", require("./routes/ingredients"));

app.use("/", require("./routes/receipts"));

app.use("/", require("./routes/orders"));

app.use("/", require("./routes/transactions"));

app.use("/", require("./routes/brands"));

app.use("/", require("./routes/shop"));

app.use("/", require("./routes/announcements"));

app.use("/", require("./routes/notifications"));

app.use("/", require("./routes/reports"));

app.use("/", require("./routes/dashboard"));

app.use("/", require("./routes/b2bDashboard"));

app.use("/", require("./routes/activityLogs"));

app.use("/", require("./routes/paymongo"));

app.use("/", require("./routes/psgc"));

app.use("/", require("./routes/uploads"));

app.get("/", (req, res) => {
  res.send("Franchise Backend is Running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
