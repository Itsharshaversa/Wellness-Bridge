import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["medicine", "equipment", "oxygen", "ppe", "consumables"],
    required: true,
  },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, default: "units" },
  minThreshold: { type: Number, default: 10 }, // alert if below this
  maxCapacity: { type: Number, default: 1000 },
  lastRestocked: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: null },
});

const inventorySchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
    unique: true,
  },
  oxygenLevel: { type: Number, default: 100, min: 0, max: 100 }, // percentage
  ventilators: { type: Number, default: 0 },
  ventilatorsAvailable: { type: Number, default: 0 },
  bloodUnits: {
    A_pos: { type: Number, default: 0 },
    A_neg: { type: Number, default: 0 },
    B_pos: { type: Number, default: 0 },
    B_neg: { type: Number, default: 0 },
    O_pos: { type: Number, default: 0 },
    O_neg: { type: Number, default: 0 },
    AB_pos: { type: Number, default: 0 },
    AB_neg: { type: Number, default: 0 },
  },
  items: [inventoryItemSchema],
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

export default mongoose.model("Inventory", inventorySchema);
