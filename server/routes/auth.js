import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── Google OAuth Flow ─────────────────────────────────────────────────────────
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    // Redirect to frontend with token (frontend stores it)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&role=${req.user.role}`);
  }
);

// ── Get current user ──────────────────────────────────────────────────────────
router.get("/me", protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    role: req.user.role,
    location: req.user.location,
  });
});

// ── Update user location ──────────────────────────────────────────────────────
router.put("/location", protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { location: { lat, lng } },
      { new: true }
    );
    res.json({ message: "Location updated", location: user.location });
  } catch (err) {
    res.status(500).json({ message: "Error updating location" });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
