// utils/jwt.js
const jwt = require("jsonwebtoken");

// Get secret safely (fail in production if missing)
const getJwtSecret = () => {
  const fromEnv = process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim();
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV !== "production") {
    // Dev fallback only (never use in production)
    return "dev_secret_change_me";
  }

  throw new Error("❌ JWT_SECRET is not set in environment variables");
};

// Backward compatibility: direct export constant
const JWT_SECRET = getJwtSecret();

// Default expiry (can override per call)
const DEFAULT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Helpers
const signToken = (payload = {}, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: DEFAULT_EXPIRES_IN, ...options });
};

const verifyToken = (token, options = {}) => {
  return jwt.verify(String(token || ""), JWT_SECRET, options);
};

const decodeToken = (token, options = {}) => {
  return jwt.decode(String(token || ""), options);
};

// Extract token from req or from header string
const parseAuthHeader = (reqOrHeader) => {
  let header = null;

  if (typeof reqOrHeader === "string") {
    header = reqOrHeader;
  } else if (reqOrHeader && (reqOrHeader.get || reqOrHeader.headers)) {
    header =
      (reqOrHeader.get && reqOrHeader.get("Authorization")) ||
      reqOrHeader.headers?.authorization ||
      reqOrHeader.headers?.["x-access-token"] ||
      null;
  }

  if (!header) return null;

  let token = String(header).trim();
  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }
  return token || null;
};

// Convenience issuers
const issueUserToken = (userOrId, options = {}) => {
  const id =
    typeof userOrId === "string"
      ? userOrId
      : userOrId?._id?.toString?.() || userOrId?.id?.toString?.();
  if (!id) throw new Error("User id missing for token");
  return signToken({ id }, options);
};

const issueAdminToken = (adminOrId, options = {}) => {
  const id =
    typeof adminOrId === "string"
      ? adminOrId
      : adminOrId?._id?.toString?.() || adminOrId?.id?.toString?.();
  if (!id) throw new Error("Admin id missing for token");
  return signToken({ id }, options);
};

module.exports = {
  JWT_SECRET,
  getJwtSecret,
  signToken,
  verifyToken,
  decodeToken,
  parseAuthHeader,
  issueUserToken,
  issueAdminToken,
};