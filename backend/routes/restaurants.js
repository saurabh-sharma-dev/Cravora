// routes/restaurants.js
const express = require("express");
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

// Safe escape (no regex literals, so copy-paste safe)
const escapeRegExp = (str) => {
  const s = String(str || "");
  const specials = ['\\', '^', '$', '.', '|', '?', '*', '+', '(', ')', '[', ']', '{', '}'];
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    out += specials.includes(ch) ? "\\" + ch : ch;
  }
  return out;
};

/**
 * @route   GET /api/restaurants
 * @desc    Get all restaurants with optional filters (location, search, rating, tags, deliveryTime)
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const { location, search, minRating, tags, maxDeliveryTime } = req.query;

    const filter = {};

    // Location filter (case-insensitive, partial)
    if (location && String(location).toLowerCase() !== "all") {
      filter.location = new RegExp(escapeRegExp(String(location).trim()), "i");
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

    // Tags filter (supports string "a,b" or array)
    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (tagsArray.length) {
      filter.tags = { $in: tagsArray };
    }

    // Search by restaurant name OR menu item name (case-insensitive)
    if (search && String(search).trim()) {
      const rx = new RegExp(escapeRegExp(String(search).trim()), "i");
      const menuMatchRestaurantIds = await MenuItem.distinct("restaurant", { name: rx });
      filter.$or = [{ name: rx }, { _id: { $in: menuMatchRestaurantIds } }];
    }

    // Fetch restaurants
    const restaurants = await Restaurant.find(filter).lean();

    // Attach menu items to each restaurant with a single query (avoid N+1)
    const restIds = restaurants.map((r) => r._id);
    const allMenuItems = restIds.length
      ? await MenuItem.find({ restaurant: { $in: restIds } }).lean()
      : [];
    const menuByRestaurant = allMenuItems.reduce((acc, item) => {
      const key = String(item.restaurant);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const restaurantsWithMenu = restaurants.map((rest) => ({
      ...rest,
      menu: menuByRestaurant[String(rest._id)] || [],
    }));

    return res.status(200).json({
      success: true,
      count: restaurantsWithMenu.length,
      restaurants: restaurantsWithMenu,
    });
  } catch (err) {
    console.error("❌ Error fetching restaurants:", err.message || err);
    return res
      .status(500)
      .json({ success: false, msg: "Server error while fetching restaurants" });
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
    return res.status(200).json({ success: true, restaurant, menu });
  } catch (err) {
    console.error("❌ Error fetching restaurant:", err.message || err);
    return res
      .status(500)
      .json({ success: false, msg: "Server error while fetching restaurant" });
  }
});

/**
 * @route   POST /api/restaurants
 * @desc    Add a new restaurant
 * @access  Private (Admin only)
 */
router.post("/", adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      address,
      location,
      rating,
      deliveryTime,
      tags,
      cuisines,
      averageCost,
      isPromoted,
    } = req.body;

    if (!name || !location || !address) {
      return res
        .status(400)
        .json({ success: false, msg: "Name, address & location are required" });
    }

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
      image: image || undefined,
      address: String(address).trim(),
      location: String(location).trim(),
      rating: Number.isFinite(Number(rating)) ? Number(rating) : undefined,
      deliveryTime: Number.isFinite(Number(deliveryTime)) ? Number(deliveryTime) : undefined,
      tags: normArray(tags),
      cuisines: normArray(cuisines),
      averageCost: Number.isFinite(Number(averageCost)) ? Number(averageCost) : undefined,
      isPromoted: typeof isPromoted === "boolean" ? isPromoted : undefined,
      owner: req.admin._id,
    });

    await restaurant.save();
    return res.status(201).json({ success: true, restaurant });
  } catch (err) {
    console.error("❌ Error adding restaurant:", err.message || err);
    if (err?.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Duplicate value detected",
        key: err.keyValue,
      });
    }
    return res
      .status(500)
      .json({ success: false, msg: "Server error while adding restaurant" });
  }
});

/**
 * @route   POST /api/restaurants/:id/menu
 * @desc    Add a menu item to a restaurant
 * @access  Private (Admin only)
 */
router.post("/:id/menu", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid restaurant id" });
    }

    const { name, description, price, image, isVeg, category, available, spicyLevel } = req.body;

    if (!name || price === undefined) {
      return res
        .status(400)
        .json({ success: false, msg: "Menu item name and price are required" });
    }

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 1) {
      return res
        .status(400)
        .json({ success: false, msg: "Price must be a positive number" });
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
      isVeg: typeof isVeg === "boolean" ? isVeg : undefined,
      category: category || undefined,
      available: typeof available === "boolean" ? available : undefined,
      spicyLevel: spicyLevel || undefined,
    });

    await menuItem.save();

    restaurant.menu.push(menuItem._id);
    await restaurant.save();

    return res.status(201).json({ success: true, menuItem });
  } catch (err) {
    console.error("❌ Error adding menu item:", err.message || err);
    return res
      .status(500)
      .json({ success: false, msg: "Server error while adding menu item" });
  }
});

module.exports = router;