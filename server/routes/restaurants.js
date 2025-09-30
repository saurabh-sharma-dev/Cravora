const express = require("express");
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/**
 * @route   GET /api/restaurants
 * @desc    Get all restaurants with optional filters (location, search, rating, tags, deliveryTime)
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { location, search, minRating, tags, maxDeliveryTime } = req.query;
    const filter = {};

    // Location filter
    if (location && String(location).toLowerCase() !== "all") {
      filter.location = new RegExp(String(location).trim(), "i");
    }

    // Rating filter
    const minRatingNum = Number(minRating);
    if (Number.isFinite(minRatingNum)) {
      filter.rating = { $gte: minRatingNum };
    }

    // Delivery time filter
    const maxDeliveryTimeNum = Number(maxDeliveryTime);
    if (Number.isFinite(maxDeliveryTimeNum)) {
      filter.deliveryTime = { $lte: maxDeliveryTimeNum };
    }

    // Tags filter
    if (tags) {
      const tagsArray = String(tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagsArray.length) {
        filter.tags = { $in: tagsArray };
      }
    }

    // Fetch restaurants
    let restaurants = await Restaurant.find(filter).lean();

    // Attach menu items to each restaurant
    restaurants = await Promise.all(
      restaurants.map(async (rest) => {
        const menu = await MenuItem.find({ restaurant: rest._id }).lean();
        return { ...rest, menu };
      })
    );

    // Search by restaurant name or menu item name (case-insensitive)
    if (search) {
      const searchLower = String(search).toLowerCase();
      restaurants = restaurants.filter(
        (rest) =>
          rest.name.toLowerCase().includes(searchLower) ||
          (Array.isArray(rest.menu) &&
            rest.menu.some((item) => item.name.toLowerCase().includes(searchLower)))
      );
    }

    res.status(200).json({ success: true, count: restaurants.length, restaurants });
  } catch (err) {
    console.error("❌ Error fetching restaurants:", err.message);
    res.status(500).json({ success: false, msg: "Server error while fetching restaurants" });
  }
});

/**
 * @route   GET /api/restaurants/:id
 * @desc    Get single restaurant with menu
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(id).lean();
    if (!restaurant) {
      return res.status(404).json({ success: false, msg: "Restaurant not found" });
    }

    const menu = await MenuItem.find({ restaurant: id }).lean();
    res.status(200).json({ success: true, restaurant, menu });
  } catch (err) {
    console.error("❌ Error fetching restaurant:", err.message);
    res.status(500).json({ success: false, msg: "Server error while fetching restaurant" });
  }
});

/**
 * @route   POST /api/restaurants
 * @desc    Add a new restaurant
 * @access  Private (Admin only)
 */
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, description, image, address, location, rating, deliveryTime, tags } = req.body;

    if (!name || !location || !address) {
      return res.status(400).json({ success: false, msg: "Name, address & location are required" });
    }

    const restaurant = new Restaurant({
      name: String(name).trim(),
      description: description ? String(description).trim() : "",
      image: image || "https://via.placeholder.com/400x200",
      address: String(address).trim(),
      location: String(location).trim(),
      rating: Number.isFinite(Number(rating)) ? Number(rating) : 0,
      deliveryTime: Number.isFinite(Number(deliveryTime)) ? Number(deliveryTime) : 30,
      tags: Array.isArray(tags) ? tags : [],
      owner: req.admin._id,
    });

    await restaurant.save();
    res.status(201).json({ success: true, restaurant });
  } catch (err) {
    console.error("❌ Error adding restaurant:", err.message);
    res.status(500).json({ success: false, msg: "Server error while adding restaurant" });
  }
});

/**
 * @route   POST /api/restaurants/:id/menu
 * @desc    Add a menu item to a restaurant
 * @access  Private (Admin only)
 */
router.post("/:id/menu", adminAuth, async (req, res) => {
  try {
    const { name, description, price, image, isVeg } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, msg: "Menu item name and price are required" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid restaurant id" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, msg: "Restaurant not found" });
    }

    const menuItem = new MenuItem({
      restaurant: restaurant._id,
      name: String(name).trim(),
      description: description ? String(description).trim() : "No description available",
      price: Number(price),
      image: image || "https://via.placeholder.com/200",
      isVeg: typeof isVeg === "boolean" ? isVeg : true,
    });

    await menuItem.save();

    // Keep restaurant's menu reference updated
    restaurant.menu.push(menuItem._id);
    await restaurant.save();

    res.status(201).json({ success: true, menuItem });
  } catch (err) {
    console.error("❌ Error adding menu item:", err.message);
    res.status(500).json({ success: false, msg: "Server error while adding menu item" });
  }
});

module.exports = router;