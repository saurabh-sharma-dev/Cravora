// routes/admin.js
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Resolve JWT secret safely
const jwtSecret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV !== "production" ? "dev_secret_change_me" : null);

function toBool(val, def = true) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const v = val.trim().toLowerCase();
    if (["true", "1", "yes"].includes(v)) return true;
    if (["false", "0", "no"].includes(v)) return false;
  }
  return def;
}

/**
 * @route   POST /api/admin/login
 * @desc    Admin login & get token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const rawEmail = req.body.email;
    const password = req.body.password;

    const email = String(rawEmail || "").trim().toLowerCase();
    if (!email || !password) {
      return res.status(400).json({ success: false, msg: "All fields are required" });
    }

    if (!jwtSecret) {
      console.error("❌ JWT_SECRET is not set in environment variables");
      return res
        .status(500)
        .json({ success: false, msg: "Server misconfiguration: JWT secret missing" });
    }

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, jwtSecret, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("❌ Admin login error:", err.message);
    return res.status(500).json({ success: false, msg: "Server error during login" });
  }
});

/**
 * @route   GET /api/admin/restaurants
 * @desc    Get all restaurants
 * @access  Private (Admin only)
 */
router.get("/restaurants", adminAuth, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate("menu").lean();
    return res
      .status(200)
      .json({ success: true, count: restaurants.length, restaurants });
  } catch (err) {
    console.error("❌ Fetch restaurants error:", err.message);
    return res.status(500).json({ success: false, msg: "Failed to fetch restaurants" });
  }
});

/**
 * @route   POST /api/admin/restaurants
 * @desc    Add a new restaurant
 * @access  Private (Admin only)
 */
router.post("/restaurants", adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      location,
      image,
      deliveryTime,
      tags,
      cuisines,
      isPromoted,
      averageCost,
    } = req.body;

    if (!name || !location || !address) {
      return res
        .status(400)
        .json({ success: false, msg: "Name, address & location are required" });
    }

    // Normalize arrays
    const normArray = (val) =>
      Array.isArray(val)
        ? val.map((x) => String(x).trim()).filter(Boolean)
        : typeof val === "string"
        ? String(val)
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [];

    const restaurant = new Restaurant({
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      address: String(address).trim(),
      location: String(location).trim(),
      image: image || undefined,
      deliveryTime: Number.isFinite(Number(deliveryTime)) ? Number(deliveryTime) : undefined,
      tags: normArray(tags),
      cuisines: normArray(cuisines),
      isPromoted: toBool(isPromoted, false),
      averageCost: Number.isFinite(Number(averageCost)) ? Number(averageCost) : undefined,
      owner: req.admin._id,
    });

    await restaurant.save();
    return res.status(201).json({ success: true, restaurant });
  } catch (err) {
    console.error("❌ Add restaurant error:", err.message);
    return res.status(500).json({ success: false, msg: "Failed to add restaurant" });
  }
});

/**
 * @route   POST /api/admin/restaurants/:id/menu
 * @desc    Add menu item to a restaurant
 * @access  Private (Admin only)
 */
router.post("/restaurants/:id/menu", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid restaurant id" });
    }

    const { name, description, price, image, isVeg, category, available, spicyLevel } = req.body;

    if (!name || price === undefined) {
      return res
        .status(400)
        .json({ success: false, msg: "Menu name & price are required" });
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 1) {
      return res.status(400).json({ success: false, msg: "Price must be a positive number" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, msg: "Restaurant not found" });
    }

    const menuItem = new MenuItem({
      restaurant: restaurant._id,
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      price: priceNum,
      image: image || undefined,
      isVeg: toBool(isVeg, true),
      available: toBool(available, true),
      category: category || undefined,
      spicyLevel: spicyLevel || undefined,
    });

    await menuItem.save();

    restaurant.menu.push(menuItem._id);
    await restaurant.save();

    return res.status(201).json({ success: true, menuItem });
  } catch (err) {
    console.error("❌ Add menu item error:", err.message);
    return res.status(500).json({ success: false, msg: "Failed to add menu item" });
  }
});

/**
 * @route   DELETE /api/admin/restaurants/:id
 * @desc    Delete restaurant + its menu items
 * @access  Private (Admin only)
 */
router.delete("/restaurants/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, msg: "Restaurant not found" });
    }

    await MenuItem.deleteMany({ restaurant: restaurant._id }); // delete linked menu items
    await Restaurant.findByIdAndDelete(restaurant._id);

    return res
      .status(200)
      .json({ success: true, msg: "Restaurant and its menu deleted" });
  } catch (err) {
    console.error("❌ Delete restaurant error:", err.message);
    return res.status(500).json({ success: false, msg: "Failed to delete restaurant" });
  }
});

/**
 * @route   DELETE /api/admin/menu/:id
 * @desc    Delete a menu item
 * @access  Private (Admin only)
 */
router.delete("/menu/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid menu item id" });
    }

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ success: false, msg: "Menu item not found" });
    }

    await MenuItem.findByIdAndDelete(menuItem._id);
    await Restaurant.findByIdAndUpdate(menuItem.restaurant, {
      $pull: { menu: menuItem._id },
    });

    return res.status(200).json({ success: true, msg: "Menu item deleted" });
  } catch (err) {
    console.error("❌ Delete menu item error:", err.message);
    return res.status(500).json({ success: false, msg: "Failed to delete menu item" });
  }
});

module.exports = router;