require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Admin = require("./models/Admin");
const User = require("./models/User");

const app = express();

// Core middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => res.status(200).send("API is running 🚀"));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/restaurants", require("./routes/restaurants"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/locations", require("./routes/location")); // ✅ plural
app.use("/api/admin", require("./routes/admin"));
app.use("/api/reviews", require("./routes/reviews"));

// 404
app.use((req, res) => res.status(404).json({ success: false, msg: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    msg: err.message || "Server error",
  });
});

// Start server with Socket.IO after DB connects
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Create HTTP server and attach Socket.IO
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
      transports: ["websocket", "polling"],
    });

    // Make io available in routes via req.app.get('io')
    app.set("io", io);

    // Socket authentication (JWT)
    io.use(async (socket, next) => {
      try {
        const { token, role } = socket.handshake.auth || {};
        if (!token) return next(new Error("unauthorized"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id) return next(new Error("unauthorized"));

        if (role === "admin") {
          const admin = await Admin.findById(decoded.id).select("_id name");
          if (!admin) return next(new Error("unauthorized"));
          socket.data.role = "admin";
          socket.data.adminId = String(admin._id);
          socket.join("admins"); // all admins in one room
        } else {
          const user = await User.findById(decoded.id).select("_id name");
          if (!user) return next(new Error("unauthorized"));
          socket.data.role = "user";
          socket.data.userId = String(user._id);
          socket.join(`user:${user._id}`); // user-specific room
        }
        next();
      } catch (e) {
        next(e);
      }
    });

    io.on("connection", (socket) => {
      console.log(`🔌 Socket connected (${socket.data.role || "unknown"}):`, socket.id);

      socket.on("disconnect", (reason) => {
        console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
      });
    });

    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    // Graceful shutdown
    const shutdown = async (signal) => {
      try {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        server.close(() => console.log("HTTP server closed"));
        io.close(() => console.log("Socket.IO closed"));
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        process.exit(0);
      } catch (e) {
        console.error("Error during shutdown:", e);
        process.exit(1);
      }
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
})();