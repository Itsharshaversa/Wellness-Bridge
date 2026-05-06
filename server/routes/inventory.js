import express from "express";
import Inventory from "../models/Inventory.js";
import Alert from "../models/Alert.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── GET inventory for a hospital ──────────────────────────────────────────────
router.get("/:hospitalId", protect, async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ hospital: req.params.hospitalId })
      .populate("hospital", "name address");
    if (!inventory) return res.status(404).json({ message: "Inventory not found" });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── UPDATE inventory (admin only) ─────────────────────────────────────────────
router.put("/:hospitalId", protect, requireAdmin, async (req, res) => {
  try {
    const inventory = await Inventory.findOneAndUpdate(
      { hospital: req.params.hospitalId },
      { ...req.body, updatedBy: req.user._id },
      { new: true, upsert: true }
    );

    // Check for critical oxygen levels
    if (inventory.oxygenLevel < 20) {
      await Alert.create({
        hospital: req.params.hospitalId,
        type: "oxygen_critical",
        severity: "critical",
        message: `Oxygen level critically low at ${inventory.oxygenLevel}%. Immediate resupply needed.`,
      });
    }

    res.json(inventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Update single inventory item ──────────────────────────────────────────────
router.patch("/:hospitalId/item/:itemId", protect, requireAdmin, async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ hospital: req.params.hospitalId });
    if (!inventory) return res.status(404).json({ message: "Inventory not found" });

    const item = inventory.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    Object.assign(item, req.body);

    // Alert if below threshold
    if (item.quantity <= item.minThreshold) {
      await Alert.create({
        hospital: req.params.hospitalId,
        type: "inventory_low",
        severity: item.quantity === 0 ? "critical" : "high",
        message: `${item.name} is critically low: ${item.quantity} ${item.unit} remaining.`,
        metadata: { itemName: item.name, quantity: item.quantity },
      });
    }

    await inventory.save();
    res.json(inventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Add new item ──────────────────────────────────────────────────────────────
router.post("/:hospitalId/item", protect, requireAdmin, async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ hospital: req.params.hospitalId });
    if (!inventory) return res.status(404).json({ message: "Inventory not found" });
    inventory.items.push(req.body);
    await inventory.save();
    res.status(201).json(inventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
