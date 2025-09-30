const express = require("express");
const auth = require("../middleware/auth"); // User JWT middleware
const adminAuth = require("../middleware/adminAuth"); // Admin JWT middleware
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

// Helper: emit "new order" to all admins (compact summary)
function emitAdminNewOrder(io, order) {
  if (!io || !order) return;
  const itemsCount =
    order.items?.reduce((c, it) => c + (Number(it.quantity) || 0), 0) || 0;
  const summary = {
    id: order._id,
    total: order.total || 0,
    itemsCount,
    user: order.user, // { name, email, _id } if populated
    restaurant: order.restaurant, // { name, location, _id } if populated
    createdAt: order.createdAt,
  };
  io.to("admins").emit("order:new", summary);
}

// Helper: emit an order status update to the user (and optionally admins)
function emitStatusUpdate(io, order) {
  if (!io || !order) return;
  const userId = order.user?._id || order.user;
  if (userId) {
    io.to(`user:${userId}`).emit("order:status", {
      id: order._id,
      status: order.status,
      updatedAt: order.updatedAt || new Date(),
    });
  }
  // If you also want admins to see status changes, uncomment:
  // io.to("admins").emit("order:status", {
  //   id: order._id,
  //   status: order.status,
  //   user: order.user,
  //   restaurant: order.restaurant,
  //   updatedAt: order.updatedAt || new Date(),
  // });
}

/**
 * @route   POST /api/orders
 * @desc    Place a new order
 * @access  Private (User)
 */
router.post("/", auth, async (req, res) => {
  try {
    const { items, address, paymentMethod, restaurant } = req.body;

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, msg: "Order must contain items" });
    }

    // Validate address
    if (!address || typeof address !== "string" || !address.trim()) {
      return res.status(400).json({ success: false, msg: "Delivery address is required" });
    }

    // Validate payment method
    const allowedPaymentMethods = ["cod", "cash", "card", "upi", "online"];
    const payment = String(paymentMethod || "").toLowerCase();
    if (!allowedPaymentMethods.includes(payment)) {
      return res.status(400).json({ success: false, msg: "Invalid or missing payment method" });
    }

    // Validate restaurant
    if (!restaurant) {
      return res.status(400).json({ success: false, msg: "Restaurant is required" });
    }
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res.status(404).json({ success: false, msg: "Restaurant not found" });
    }

    // Normalize items
    const normalizedItems = items.map((item) => ({
      menuItem: item.menuItem || item._id,
      name: String(item.name || "Unnamed Item"),
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      price: Number(item.price) > 0 ? Number(item.price) : 1, // schema min guard
    }));

    // Create order (total will be auto-calculated by pre('validate') hook)
    const order = new Order({
      user: req.user.id,
      restaurant: restaurantDoc._id,
      items: normalizedItems,
      address: address.trim(),
      paymentMethod: payment,
    });

    await order.save();

    // Populate for response + emitting
    const populatedOrder = await Order.findById(order._id)
      .populate("items.menuItem", "name price image")
      .populate("user", "name email")
      .populate("restaurant", "name location");

    // SOCKET NOTIFICATIONS
    const io = req.app.get("io");
    if (io) {
      emitAdminNewOrder(io, populatedOrder); // admins get "New Order"
      io.to(`user:${req.user.id}`).emit("order:placed", populatedOrder); // user gets "Order Placed"
    }

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (err) {
    console.error("❌ Error placing order:", err.message);
    res.status(500).json({
      success: false,
      msg: "An error occurred while placing order",
      error: err.message,
    });
  }
});

/**
 * @route   GET /api/orders/my
 * @desc    Get logged-in user's orders
 * @access  Private (User)
 */
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.menuItem", "name price image")
      .populate("restaurant", "name location");

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error("❌ Error fetching user orders:", err.message);
    res.status(500).json({
      success: false,
      msg: "An error occurred while fetching your orders",
      error: err.message,
    });
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders
 * @access  Private (Admin only)
 */
router.get("/", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("restaurant", "name location")
      .populate("items.menuItem", "name price image");

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error("❌ Error fetching all orders (admin):", err.message);
    res.status(500).json({
      success: false,
      msg: "An error occurred while fetching orders",
      error: err.message,
    });
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (Admin)
 * @access  Private (Admin only)
 */
router.put("/:id/status", adminAuth, async (req, res) => {
  const allowedStatuses = ["placed", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"];
  const newStatus = String(req.body.status || "").toLowerCase();

  if (!allowedStatuses.includes(newStatus)) {
    return res.status(400).json({ success: false, msg: "Invalid or missing order status" });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    )
      .populate("user", "name email")
      .populate("restaurant", "name location")
      .populate("items.menuItem", "name price image");

    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // SOCKET NOTIFICATIONS: status update to user (and optionally admin)
    const io = req.app.get("io");
    if (io) {
      emitStatusUpdate(io, order);
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("❌ Error updating order status:", err.message);
    res.status(500).json({
      success: false,
      msg: "An error occurred while updating order status",
      error: err.message,
    });
  }
});

module.exports = router;