const mongoose = require("mongoose");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("❌ Mongo URI is missing. Please set it in environment variables.");
  }

  // Recommended Mongoose setting
  mongoose.set("strictQuery", true);

  const connect = async () => {
    try {
      await mongoose.connect(mongoUri);
      console.log("✅ MongoDB Connected Successfully:", mongoose.connection.host);
      return mongoose.connection;
    } catch (err) {
      console.error("❌ MongoDB Connection Failed:", err.message);
      console.log("🔄 Retrying MongoDB connection in 5 seconds...");
      await delay(5000);
      return connect();
    }
  };

  return connect();
};

module.exports = connectDB;