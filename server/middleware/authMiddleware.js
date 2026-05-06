import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. No token." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-__v");
    if (!req.user) {
      return res.status(401).json({ message: "User not found." });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired." });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};

export const requireAdminOrStaff = (req, res, next) => {
  if (!["admin", "staff"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Staff or Admin access required." });
  }
  next();
};
