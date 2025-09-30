const express = require("express");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

/**
 * @route   GET /api/locations
 * @desc    Get all unique restaurant locations (clean + sorted, case-insensitive)
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const locationsRaw = await Restaurant.distinct("location");

    // Trim, remove empties, dedupe case-insensitively, then sort
    const seen = new Set();
    const locations = [];
    for (const loc of locationsRaw) {
      const value = String(loc || "").trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        locations.push(value);
      }
    }

    locations.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    return res.status(200).json({
      success: true,
      count: locations.length,
      locations,
    });
  } catch (err) {
    console.error("❌ Error fetching locations:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching locations",
    });
  }
});

module.exports = router;