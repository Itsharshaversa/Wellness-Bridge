import express from "express";
import axios from "axios";
import Hospital from "../models/Hospital.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ── Predict demand for a hospital ─────────────────────────────────────────────
router.get("/predict/:hospitalId", protect, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId).lean();
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const payload = {
      hospital_id: hospital._id.toString(),
      available_beds: hospital.availableBeds,
      total_beds: hospital.totalBeds,
      ambulances_available: hospital.ambulancesAvailable,
      hour_of_day: new Date().getHours(),
      day_of_week: new Date().getDay(),
    };

    const { data } = await axios.post(`${ML_URL}/predict`, payload, { timeout: 5000 });
    res.json(data);
  } catch (err) {
    // Graceful fallback if ML service is down
    res.json({
      predicted_demand: "medium",
      confidence: 0.65,
      alert: null,
      message: "ML service unavailable — showing default prediction",
      fallback: true,
    });
  }
});

// ── System-wide demand forecast ───────────────────────────────────────────────
router.get("/forecast", protect, async (req, res) => {
  try {
    const { data } = await axios.get(`${ML_URL}/forecast`, { timeout: 5000 });
    res.json(data);
  } catch (err) {
    res.json({
      forecast: [],
      message: "ML service unavailable",
      fallback: true,
    });
  }
});

export default router;
