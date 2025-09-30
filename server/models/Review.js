const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant reference is required"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      required: [true, "Rating is required"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// Helper to update Restaurant stats
async function updateRestaurantStats(restaurantId) {
  try {
    const Review = mongoose.model("Review");
    const Restaurant = mongoose.model("Restaurant");

    const stats = await Review.aggregate([
      { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
      {
        $group: {
          _id: "$restaurant",
          avgRating: { $avg: "$rating" },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: stats[0].avgRating,
        numReviews: stats[0].numReviews,
      });
    } else {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: 0,
        numReviews: 0,
      });
    }
  } catch (err) {
    console.error("❌ Error updating restaurant stats:", err.message);
  }
}

// After saving a review
ReviewSchema.post("save", function () {
  updateRestaurantStats(this.restaurant);
});

// After deleting a review via findByIdAndDelete/findOneAndDelete
ReviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) updateRestaurantStats(doc.restaurant);
});

// Prevent duplicate reviews from same user for the same restaurant
ReviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);