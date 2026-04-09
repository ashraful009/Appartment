require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const publicRoutes = require("./src/routes/publicRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const sellerRoutes = require("./src/routes/sellerRoutes");
const interactionRoutes = require("./src/routes/interactionRoutes");
const unitRoutes      = require("./src/routes/unitRoutes");
const userRoutes      = require("./src/routes/userRoutes");
const customerRoutes  = require("./src/routes/customerRoutes");
const documentRoutes  = require("./src/routes/documentRoutes");
const accountantRoutes = require("./src/routes/accountantRoutes");

const { startInstallmentCron } = require("./src/cron/installmentCron");

const { protect } = require("./src/middleware/authMiddleware");
const { authorizeRoles } = require("./src/middleware/authMiddleware");
const { getCurrentTarget } = require("./src/controllers/adminEngineController");

const app  = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy — required on Render (and most cloud platforms) so that
// Express correctly sees HTTPS connections and SameSite=None;Secure cookies work.
app.set("trust proxy", 1);

// ─── Connect to MongoDB ────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(` MongoDB connected `);
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// ─── Middleware ────────────────────────────────────────────────────────────
// Allowed CORS origins: local dev + all known production frontends
// To add a new origin without touching code, set CLIENT_URL on the Render dashboard.
const allowedOrigins = [
  // ── Local development ──
  "http://localhost:5173",
  "http://localhost:4173",
  // ── Production (Vercel) ──
  "https://appartment-five.vercel.app",
  "https://nirapod-nibash.vercel.app",
  // ── Extra origin from Render env var (no trailing slash) ──
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((u) => u.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/customer",  customerRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/accountant", accountantRoutes);
app.use("/api",           publicRoutes); // Public: /api/banners/active, /api/banners, /api/properties

// GET /api/targets/current — available to all authenticated sellers + admins
app.get(
  "/api/targets/current",
  protect,
  authorizeRoles("seller", "admin"),
  getCurrentTarget
);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running." });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error." });
});

// ─── Start ─────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });

  // Start scheduled jobs AFTER DB is ready (models are registered)
  startInstallmentCron();
});
