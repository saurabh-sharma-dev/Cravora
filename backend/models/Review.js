// models/Review.js
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

// Compound unique index: one review per user per restaurant
ReviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });
// Helpful query indexes
ReviewSchema.index({ restaurant: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });

// Hide internal fields
const hideInternal = (_doc, ret) => {
  delete ret.__v;
  return ret;
};
ReviewSchema.set("toJSON", { transform: hideInternal });
ReviewSchema.set("toObject", { transform: hideInternal });

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
      const avg = Math.round(stats[0].avgRating * 10) / 10; // round to 1 decimal
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: avg,
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

// After creating or updating via save()
ReviewSchema.post("save", function () {
  if (this?.restaurant) updateRestaurantStats(this.restaurant);
});

// After findOneAndDelete/findByIdAndDelete
ReviewSchema.post("findOneAndDelete", function (doc) {
  if (doc?.restaurant) updateRestaurantStats(doc.restaurant);
});

// After findOneAndUpdate/findByIdAndUpdate (e.g., rating/comment edited)
ReviewSchema.post("findOneAndUpdate", function (doc) {
  if (doc?.restaurant) updateRestaurantStats(doc.restaurant);
});

// Avoid OverwriteModelError during dev/hot-reload
module.exports = mongoose.models.Review || mongoose.model("Review", ReviewSchema);