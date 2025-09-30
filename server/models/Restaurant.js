const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "No description available",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters"],
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    location: {
      type: String,
      required: [true, "Location (city/area) is required"],
      trim: true,
      minlength: [2, "Location must be at least 2 characters"],
    },
    coords: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/400x200",
      validate: {
        validator: (v) =>
          /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg|bmp)$/i.test(v),
        message: "Image must be a valid URL",
      },
    },
    cuisines: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((c) => typeof c === "string" && c.length > 0),
        message: "Cuisines must be non-empty strings",
      },
    },
    averageCost: {
      type: Number,
      default: 200,
      min: [50, "Average cost must be realistic"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: Number,
      default: 30,
      min: [5, "Delivery time must be at least 5 minutes"],
      max: [180, "Delivery time cannot exceed 3 hours"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((tag) => typeof tag === "string" && tag.length > 0),
        message: "Tags must be non-empty strings",
      },
    },
    isPromoted: {
      type: Boolean,
      default: false,
    },
    menu: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
RestaurantSchema.index({ location: 1 });
RestaurantSchema.index({ rating: -1 });
RestaurantSchema.index({ name: 1 });

// Recalculate restaurant rating using aggregation
RestaurantSchema.statics.updateRating = async function (restaurantId) {
  try {
    const Review = mongoose.model("Review");
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
      await this.findByIdAndUpdate(restaurantId, {
        rating: stats[0].avgRating,
        numReviews: stats[0].numReviews,
      });
    } else {
      await this.findByIdAndUpdate(restaurantId, { rating: 0, numReviews: 0 });
    }
  } catch (err) {
    console.error("❌ Error updating restaurant rating:", err.message);
  }
};

module.exports = mongoose.model("Restaurant", RestaurantSchema);