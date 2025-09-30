const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(401).json({ msg: "Authorization header missing" });
    }

    // Accept both "Bearer <token>" and raw "<token>"
    let token = authHeader.trim();
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }

    if (!token) {
      return res.status(401).json({ msg: "Token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    // Find Admin in DB
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ msg: "Admin not found" });
    }

    // Attach admin data to request
    req.admin = admin;

    next();
  } catch (err) {
    console.error("❌ Admin Auth Middleware Error:", err.message);
    return res.status(401).json({ msg: "Invalid or expired admin token" });
  }
};

module.exports = adminAuth;