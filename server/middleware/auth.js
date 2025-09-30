const jwt = require("jsonwebtoken");

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

    // Verify & decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    // Attach user data to request object
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

module.exports = auth;