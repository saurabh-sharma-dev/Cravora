// middleware/adminAuth.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
  try {
    const jwtSecret =
      process.env.JWT_SECRET ||
      (process.env.NODE_ENV !== "production" ? "dev_secret_change_me" : null);

    if (!jwtSecret) {
      console.error("❌ JWT_SECRET is not set in environment variables");
      return res
        .status(500)
        .json({ msg: "Server misconfiguration: JWT secret missing" });
    }

    const authHeader = req.get("Authorization") || req.headers["x-access-token"];
    if (!authHeader) {
      return res.status(401).json({ msg: "Authorization header missing" });
    }

    // Accept both "Bearer <token>" and raw "<token>"
    let token = String(authHeader).trim();
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }
    if (!token) {
      return res.status(401).json({ msg: "Token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (e) {
      return res.status(401).json({ msg: "Invalid or expired admin token" });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ msg: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("❌ Admin Auth Middleware Error:", err.message || err);
    return res.status(401).json({ msg: "Invalid or expired admin token" });
  }
};

module.exports = adminAuth;