const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/jwt");

const auth = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(401).json({ msg: "Authorization header is missing" });
    }

    // Accept both "Bearer <token>" and plain "<token>"
    let token = authHeader.trim();
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }
    if (!token) {
      return res.status(401).json({ msg: "Token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

module.exports = auth;