import express from "express";
import Hospital from "../models/Hospital.js";
import Inventory from "../models/Inventory.js";
import Alert from "../models/Alert.js";
import { calculateDistance, rankHospitals, estimateETA } from "../utils/distance.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── GET all hospitals (with optional distance sorting) ────────────────────────
router.get("/", async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    const hospitals = await Hospital.find({ isActive: true }).lean();

    if (lat && lng) {
      const withDistance = hospitals.map(h => ({
        ...h,
        distance: calculateDistance(parseFloat(lat), parseFloat(lng), h.location.lat, h.location.lng),
        eta: estimateETA(calculateDistance(parseFloat(lat), parseFloat(lng), h.location.lat, h.location.lng)),
      }));
      const filtered = withDistance.filter(h => h.distance <= parseFloat(radius));
      return res.json(rankHospitals(filtered));
    }

    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET single hospital details ───────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).lean();
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET bed matrix for a hospital ────────────────────────────────────────────
router.get("/:id/beds", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select("beds totalBeds availableBeds icuTotal icuAvailable name").lean();
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    const summary = {
      total: hospital.totalBeds,
      available: hospital.availableBeds,
      occupied: hospital.totalBeds - hospital.availableBeds,
      occupancyRate: Math.round(((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) * 100),
      icu: {
        total: hospital.icuTotal,
        available: hospital.icuAvailable,
      },
    };

    res.json({ hospital: hospital.name, summary, beds: hospital.beds });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET emergency data (full details for emergency mode) ─────────────────────
router.get("/emergency/nearest", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "Location required" });

    const hospitals = await Hospital.find({ isActive: true }).lean();

    const enriched = await Promise.all(
      hospitals.map(async (h) => {
        const dist = calculateDistance(parseFloat(lat), parseFloat(lng), h.location.lat, h.location.lng);
        const inventory = await Inventory.findOne({ hospital: h._id }).lean();
        const activeAlerts = await Alert.find({ hospital: h._id, isResolved: false }).lean();

        return {
          ...h,
          distance: dist,
          eta: estimateETA(dist),
          oxygenLevel: inventory?.oxygenLevel || 0,
          ventilatorsAvailable: inventory?.ventilatorsAvailable || 0,
          activeAlerts: activeAlerts.length,
        };
      })
    );

    const sorted = rankHospitals(enriched);
    res.json(sorted.slice(0, 10)); // Return top 10 nearest
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET analytics overview (public stats) ─────────────────────────────────────
router.get("/stats/overview", async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true }).lean();
    const totalBeds = hospitals.reduce((sum, h) => sum + h.totalBeds, 0);
    const availableBeds = hospitals.reduce((sum, h) => sum + h.availableBeds, 0);
    const totalAmbulances = hospitals.reduce((sum, h) => sum + h.ambulancesTotal, 0);
    const availableAmbulances = hospitals.reduce((sum, h) => sum + h.ambulancesAvailable, 0);

    res.json({
      totalHospitals: hospitals.length,
      totalBeds,
      availableBeds,
      occupancyRate: Math.round(((totalBeds - availableBeds) / totalBeds) * 100),
      totalAmbulances,
      availableAmbulances,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
