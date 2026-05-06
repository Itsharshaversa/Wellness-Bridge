import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import cron from "node-cron";

import "./config/passport.js";
import authRoutes from "./routes/auth.js";
import hospitalRoutes from "./routes/hospitals.js";
import adminRoutes from "./routes/admin.js";
import inventoryRoutes from "./routes/inventory.js";
import mlRoutes from "./routes/ml.js";

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "healthcare_secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// ─── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/ml", mlRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "Healthcare API Running 🏥", version: "1.0.0" });
});

// ─── Cron: Simulate real-time bed updates (every 30s in dev) ─────────────────
// In production, this would be replaced by actual hospital system integrations
import Hospital from "./models/Hospital.js";

cron.schedule("*/30 * * * * *", async () => {
  try {
    const hospitals = await Hospital.find();
    for (const h of hospitals) {
      // Simulate minor fluctuations in bed availability
      const fluctuation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const newAvailable = Math.max(0, Math.min(h.totalBeds, h.availableBeds + fluctuation));
      await Hospital.findByIdAndUpdate(h._id, { availableBeds: newAvailable });
    }
  } catch (err) {
    // Silent fail for cron
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
