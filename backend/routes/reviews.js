// routes/reviews.js
const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /api/reviews/:restaurantId
 * @desc    Add a review for a restaurant
 * @access  Private (User)
 */
router.post("/:restaurantId", auth, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, msg: "Invalid restaurant id" });
    }

    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, msg: "Rating must be between 1 and 5" });
    }

    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) {
      return res.status(404).json({ success: false, msg: "Restaurant not found" });
    }

    // Prevent duplicate review by same user (optimistic check; unique index also enforces)
    const existingReview = await Review.findOne({
      user: req.user.id,
      restaurant: restaurantId,
    }).lean();
    if (existingReview) {
      return res
        .status(409)
        .json({ success: false, msg: "You have already reviewed this restaurant" });
    }

    const sanitizedComment =
      typeof comment === "string" && comment.trim().length > 0 ? comment.trim() : undefined;

    const review = new Review({
      user: req.user.id,
      restaurant: restaurantId,
      rating: ratingNum,
      comment: sanitizedComment,
    });

    await review.save();
    await review.populate("user", "name email avatar");

    return res.status(201).json({ success: true, review });
  } catch (err) {
    // Handle unique index race condition
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ success: false, msg: "You have already reviewed this restaurant" });
    }
    console.error("❌ Error adding review:", err.message || err);
    return res
      .status(500)
      .json({ success: false, msg: "Server error while adding review" });
  }
});

/**
 * @route   GET /api/reviews/:restaurantId
 * @desc    Get all reviews for a restaurant
 * @access  Public
 */
router.get("/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ success: false, msg: "Invalid restaurant id" });
    }

    const reviews = await Review.find({ restaurant: restaurantId })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    console.error("❌ Error fetching reviews:", err.message || err);
    return res
      .status(500)
      .json({ success: false, msg: "Server error while fetching reviews" });
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review (only by owner)
 * @access  Private (User)
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid review id" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, msg: "Review not found" });
    }

    // Ensure the logged-in user is the review owner
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, msg: "Not authorized to delete this review" });
    }

    // Trigger post('findOneAndDelete') hook to update Restaurant stats
    await Review.findByIdAndDelete(id);

    return res.status(200).json({ success: true, msg: "Review deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting review:", err.message || err);
    return res
      .status(500)
      .json({ success: false, msg: "Server error while deleting review" });
  }
});

module.exports = router;