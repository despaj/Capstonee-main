require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;

app.set("trust proxy", true);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://franchisync.business",
          "https://www.franchisync.business",
        ],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // needed if your API serves images/files to other origins
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://www.franchisync.business",
      "https://franchisync.business",
      "https://franchisync.vercel.app",
      "http://localhost:8081",
      "http://192.168.1.194:8081",
    ],
    allowedHeaders: ["Content-Type", "X-Client", "X-Device-ID"],
    credentials: true,
  }),
);

setInterval(
  async () => {
    await pool.query(
      `DELETE FROM reports WHERE expires_at < NOW() AND status = 'submitted'`,
    );
    console.log("Cleaned up expired reports");
  },
  24 * 60 * 60 * 1000,
);

// Routes
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

app.get("/", (req, res) => res.send("Franchise Backend is Running"));

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running at http://0.0.0.0:${PORT}`),
);
