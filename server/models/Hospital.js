import mongoose from "mongoose";

const bedSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ["general", "icu", "emergency", "pediatric", "maternity"],
    default: "general",
  },
  status: {
    type: String,
    enum: ["available", "occupied", "reserved", "maintenance"],
    default: "available",
  },
  ward: String,
});

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  contact: {
    phone: { type: String, required: true },
    emergency: { type: String },
    email: { type: String },
  },
  type: {
    type: String,
    enum: ["government", "private", "clinic", "trauma_center"],
    default: "government",
  },
  totalBeds: { type: Number, required: true, default: 0 },
  availableBeds: { type: Number, required: true, default: 0 },
  icuTotal: { type: Number, default: 0 },
  icuAvailable: { type: Number, default: 0 },
  ambulancesTotal: { type: Number, default: 0 },
  ambulancesAvailable: { type: Number, default: 0 },
  beds: [bedSchema],
  services: [{
    type: String,
    enum: ["emergency", "icu", "surgery", "maternity", "pediatrics", "cardiology", "orthopedics", "neurology"],
  }],
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  isActive: { type: Boolean, default: true },
  image: { type: String, default: "" },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for geospatial queries
hospitalSchema.index({ "location.lat": 1, "location.lng": 1 });

export default mongoose.model("Hospital", hospitalSchema);
