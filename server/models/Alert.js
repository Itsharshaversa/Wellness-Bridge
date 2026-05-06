import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  type: {
    type: String,
    enum: ["bed_shortage", "ambulance_low", "oxygen_critical", "inventory_low", "high_demand", "emergency"],
    required: true,
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  message: { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model("Alert", alertSchema);
