import express from "express";
import Hospital from "../models/Hospital.js";
import Inventory from "../models/Inventory.js";
import Alert from "../models/Alert.js";
import User from "../models/User.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, requireAdmin);

// ── Dashboard Stats ───────────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true }).lean();
    const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
    const availableBeds = hospitals.reduce((s, h) => s + h.availableBeds, 0);
    const totalAmbulances = hospitals.reduce((s, h) => s + h.ambulancesTotal, 0);
    const availableAmbulances = hospitals.reduce((s, h) => s + h.ambulancesAvailable, 0);
    const totalPatients = await User.countDocuments({ role: "patient" });
    const activeAlerts = await Alert.countDocuments({ isResolved: false });

    res.json({
      totalHospitals: hospitals.length,
      totalBeds,
      availableBeds,
      occupiedBeds: totalBeds - availableBeds,
      occupancyRate: totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0,
      totalAmbulances,
      availableAmbulances,
      totalPatients,
      activeAlerts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Hospital CRUD ─────────────────────────────────────────────────────────────
router.get("/hospitals", async (req, res) => {
  try {
    const hospitals = await Hospital.find().lean();
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/hospitals", async (req, res) => {
  try {
    const hospital = await Hospital.create({ ...req.body, lastUpdated: new Date() });
    // Auto-create inventory record
    await Inventory.create({ hospital: hospital._id });
    res.status(201).json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/hospitals/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/hospitals/:id", async (req, res) => {
  try {
    await Hospital.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Hospital deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update Bed Counts ─────────────────────────────────────────────────────────
router.patch("/hospitals/:id/beds", async (req, res) => {
  try {
    const { availableBeds, totalBeds, icuAvailable, icuTotal, ambulancesAvailable, ambulancesTotal } = req.body;
    const update = { lastUpdated: new Date() };
    if (availableBeds !== undefined) update.availableBeds = availableBeds;
    if (totalBeds !== undefined) update.totalBeds = totalBeds;
    if (icuAvailable !== undefined) update.icuAvailable = icuAvailable;
    if (icuTotal !== undefined) update.icuTotal = icuTotal;
    if (ambulancesAvailable !== undefined) update.ambulancesAvailable = ambulancesAvailable;
    if (ambulancesTotal !== undefined) update.ambulancesTotal = ambulancesTotal;

    const hospital = await Hospital.findByIdAndUpdate(req.params.id, update, { new: true });

    // Auto-generate alerts
    const occupancyRate = ((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) * 100;
    if (occupancyRate >= 90) {
      await Alert.create({
        hospital: hospital._id,
        type: "bed_shortage",
        severity: occupancyRate >= 95 ? "critical" : "high",
        message: `${hospital.name} is at ${Math.round(occupancyRate)}% bed occupancy. Only ${hospital.availableBeds} beds remaining.`,
      });
    }

    res.json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Alerts ────────────────────────────────────────────────────────────────────
router.get("/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate("hospital", "name address")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/alerts/:id/resolve", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, resolvedAt: new Date(), resolvedBy: req.user._id },
      { new: true }
    );
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Users ─────────────────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-__v").lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
