// config/db.js
const mongoose = require("mongoose");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Single shared promise to avoid duplicate connections
let connectionPromise = null;

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("❌ Mongo URI is missing. Please set it in environment variables.");
  }

  // Safe defaults
  try {
    mongoose.set("strictQuery", true);
  } catch (_) {
    // ignore if not supported
  }

  // Optional: enable debug logs in dev
  if (process.env.MONGOOSE_DEBUG === "true" || process.env.NODE_ENV === "development") {
    mongoose.set("debug", true);
  }

  // Driver options tuned for production
  const options = {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 0,
    retryWrites: true,
    // Avoid building indexes on every prod boot. Use mongoose.model().syncIndexes() if needed.
    autoIndex: process.env.NODE_ENV !== "production",
  };

  if (connectionPromise) return connectionPromise;

  let attempt = 0;
  const maxDelay = 30000; // cap backoff at 30s

  const connectWithRetry = async () => {
    try {
      attempt += 1;
      await mongoose.connect(mongoUri, options);

      console.log("✅ MongoDB Connected Successfully:", mongoose.connection.host);

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err.message);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB disconnected");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔁 MongoDB reconnected");
      });

      return mongoose.connection;
    } catch (err) {
      const backoff = Math.min(5000 * Math.pow(2, attempt - 1), maxDelay);
      console.error(`❌ MongoDB Connection Failed (attempt ${attempt}): ${err.message}`);
      console.log(`🔄 Retrying MongoDB connection in ${Math.round(backoff / 1000)} seconds...`);
      await delay(backoff);
      return connectWithRetry();
    }
  };

  connectionPromise = connectWithRetry();
  return connectionPromise;
};

module.exports = connectDB;