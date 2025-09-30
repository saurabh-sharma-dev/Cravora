// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Use a safe JWT secret (fail clearly in production if missing)
const jwtSecret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV !== "production" ? "dev_secret_change_me" : null);

function parseValidationError(err) {
  if (err?.name === "ValidationError" && err.errors) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return messages.join(", ");
  }
  return null;
}

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, msg: "Please enter all required fields" });
    }

    if (!jwtSecret) {
      console.error("❌ JWT_SECRET is not set in environment variables");
      return res.status(500).json({ success: false, msg: "Server misconfiguration: JWT secret missing" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, msg: "Email already in use" });
    }

    // Let the model pre-save hook hash the password
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : undefined,
      password,
    });

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone || "" },
    });
  } catch (err) {
    const validationMsg = parseValidationError(err);
    if (validationMsg) {
      return res.status(400).json({ success: false, msg: validationMsg });
    }
    if (err.code === 11000) {
      return res.status(400).json({ success: false, msg: "Email already in use" });
    }
    console.error("❌ Register Error:", err.stack || err.message);
    return res.status(500).json({ success: false, msg: "Server error during registration" });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, msg: "Please enter all fields" });
    }

    if (!jwtSecret) {
      console.error("❌ JWT_SECRET is not set in environment variables");
      return res.status(500).json({ success: false, msg: "Server misconfiguration: JWT secret missing" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "7d" });

    return res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone || "" },
    });
  } catch (err) {
    console.error("❌ Login Error:", err.stack || err.message);
    return res.status(500).json({ success: false, msg: "Server error during login" });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get logged-in user profile
 * @access  Private
 */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    return res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Profile Error:", err.stack || err.message);
    return res.status(500).json({ success: false, msg: "Server error while fetching profile" });
  }
});

module.exports = router;