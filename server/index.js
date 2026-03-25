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
const userRoutes      = require("./src/routes/userRoutes");
const customerRoutes  = require("./src/routes/customerRoutes");
const documentRoutes  = require("./src/routes/documentRoutes");

const { protect } = require("./src/middleware/authMiddleware");
const { authorizeRoles } = require("./src/middleware/authMiddleware");
const { getCurrentTarget } = require("./src/controllers/adminEngineController");

const app  = express();
const PORT = process.env.PORT || 5000;

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
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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
app.use("/api/interactions", interactionRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/customer",  customerRoutes);
app.use("/api/documents", documentRoutes);
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
});
