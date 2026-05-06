import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["patient", "admin", "staff"], // extensible for staff later
    default: "patient",
  },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  assignedHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
