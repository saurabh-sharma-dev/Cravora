const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/**
 * @route   POST /api/admin/login
 * @desc    Admin login & get token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, msg: "All fields are required" });

  try {
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) return res.status(400).json({ success: false, msg: "Invalid credentials" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(400).json({ success: false, msg: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("❌ Admin login error:", err.message);
    res.status(500).json({ success: false, msg: "Server error during login" });
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
    res.status(200).json({ success: true, count: restaurants.length, restaurants });
  } catch (err) {
    console.error("❌ Fetch restaurants error:", err.message);
    res.status(500).json({ success: false, msg: "Failed to fetch restaurants" });
  }
});

/**
 * @route   POST /api/admin/restaurants
 * @desc    Add a new restaurant
 * @access  Private (Admin only)
 */
router.post("/restaurants", adminAuth, async (req, res) => {
  const { name, description, address, location, image, deliveryTime, tags } = req.body;

  if (!name || !location || !address) {
    return res
      .status(400)
      .json({ success: false, msg: "Name, address & location are required" });
  }

  try {
    const restaurant = new Restaurant({
      name,
      description,
      address,
      location,
      image,
      deliveryTime,
      tags,
      owner: req.admin._id,
    });

    await restaurant.save();
    res.status(201).json({ success: true, restaurant });
  } catch (err) {
    console.error("❌ Add restaurant error:", err.message);
    res.status(500).json({ success: false, msg: "Failed to add restaurant" });
  }
});

/**
 * @route   POST /api/admin/restaurants/:id/menu
 * @desc    Add menu item to a restaurant
 * @access  Private (Admin only)
 */
router.post("/restaurants/:id/menu", adminAuth, async (req, res) => {
  const { name, description, price, image, isVeg } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ success: false, msg: "Menu name & price are required" });
  }

  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, msg: "Restaurant not found" });

    const menuItem = new MenuItem({
      restaurant: restaurant._id,
      name,
      description,
      price,
      image,
      isVeg,
    });

    await menuItem.save();

    restaurant.menu.push(menuItem._id);
    await restaurant.save();

    res.status(201).json({ success: true, menuItem });
  } catch (err) {
    console.error("❌ Add menu item error:", err.message);
    res.status(500).json({ success: false, msg: "Failed to add menu item" });
  }
});

/**
 * @route   DELETE /api/admin/restaurants/:id
 * @desc    Delete restaurant + its menu items
 * @access  Private (Admin only)
 */
router.delete("/restaurants/:id", adminAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, msg: "Restaurant not found" });

    await MenuItem.deleteMany({ restaurant: restaurant._id }); // delete linked menu items
    await Restaurant.findByIdAndDelete(restaurant._id);

    res.status(200).json({ success: true, msg: "Restaurant and its menu deleted" });
  } catch (err) {
    console.error("❌ Delete restaurant error:", err.message);
    res.status(500).json({ success: false, msg: "Failed to delete restaurant" });
  }
});

/**
 * @route   DELETE /api/admin/menu/:id
 * @desc    Delete a menu item
 * @access  Private (Admin only)
 */
router.delete("/menu/:id", adminAuth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ success: false, msg: "Menu item not found" });

    await MenuItem.findByIdAndDelete(menuItem._id);
    await Restaurant.findByIdAndUpdate(menuItem.restaurant, {
      $pull: { menu: menuItem._id },
    });

    res.status(200).json({ success: true, msg: "Menu item deleted" });
  } catch (err) {
    console.error("❌ Delete menu item error:", err.message);
    res.status(500).json({ success: false, msg: "Failed to delete menu item" });
  }
});

module.exports = router;