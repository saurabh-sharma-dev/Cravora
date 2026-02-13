// models/Restaurant.js
const mongoose = require("mongoose");

// Sub-schema for coordinates (single nested, no _id)
const CoordsSchema = new mongoose.Schema(
  {
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
  },
  { _id: false }
);

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
      type: CoordsSchema,
      validate: {
        validator: function (v) {
          if (!v) return true; // allow empty
          const hasLat = v.lat !== undefined && v.lat !== null;
          const hasLng = v.lng !== undefined && v.lng !== null;
          return hasLat && hasLng;
        },
        message: "Both coords.lat and coords.lng must be provided",
      },
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/400x200.png",
      validate: {
        validator: (v) =>
          /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg|bmp)(\?.*)?$/i.test(v),
        message: "Image must be a valid URL",
      },
    },
    cuisines: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every((c) => typeof c === "string" && c.trim().length > 0),
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
      index: true,
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
        validator: (arr) =>
          arr.every((tag) => typeof tag === "string" && tag.trim().length > 0),
        message: "Tags must be non-empty strings",
      },
    },
    isPromoted: { type: Boolean, default: false },

    // FIX: default [] should be on the array path, not on the element
    menu: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
      default: [],
    },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
RestaurantSchema.index({ location: 1 });
RestaurantSchema.index({ rating: -1 });
RestaurantSchema.index({ name: 1 });
RestaurantSchema.index({ tags: 1 });
RestaurantSchema.index({ cuisines: 1 });

// Hide internal fields
const hideInternal = (_doc, ret) => {
  delete ret.__v;
  return ret;
};
RestaurantSchema.set("toJSON", { transform: hideInternal });
RestaurantSchema.set("toObject", { transform: hideInternal });

// Normalize before save
RestaurantSchema.pre("save", function (next) {
  try {
    if (typeof this.name === "string") this.name = this.name.trim();
    if (typeof this.address === "string") this.address = this.address.trim();
    if (typeof this.location === "string") this.location = this.location.trim();
    if (typeof this.description === "string") this.description = this.description.trim();

    if (Array.isArray(this.tags)) {
      this.tags = this.tags.map((t) => String(t).trim()).filter(Boolean);
    }
    if (Array.isArray(this.cuisines)) {
      this.cuisines = this.cuisines.map((c) => String(c).trim()).filter(Boolean);
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Normalize on updates + ensure validators run
RestaurantSchema.pre("findOneAndUpdate", function (next) {
  try {
    const update = this.getUpdate() || {};
    const $set = update.$set || {};

    const normalize = (v) => (typeof v === "string" ? v.trim() : v);
    const cleanArr = (arr) =>
      Array.isArray(arr) ? arr.map((x) => String(x).trim()).filter(Boolean) : arr;

    if (update.name) update.name = normalize(update.name);
    if ($set.name) $set.name = normalize($set.name);

    if (update.address) update.address = normalize(update.address);
    if ($set.address) $set.address = normalize($set.address);

    if (update.location) update.location = normalize(update.location);
    if ($set.location) $set.location = normalize($set.location);

    if (update.description) update.description = normalize(update.description);
    if ($set.description) $set.description = normalize($set.description);

    if (update.tags) update.tags = cleanArr(update.tags);
    if ($set.tags) $set.tags = cleanArr($set.tags);

    if (update.cuisines) update.cuisines = cleanArr(update.cuisines);
    if ($set.cuisines) $set.cuisines = cleanArr($set.cuisines);

    if (Object.keys($set).length) update.$set = $set;
    this.setUpdate(update);

    this.setOptions({ runValidators: true, new: true, context: "query" });
    next();
  } catch (err) {
    next(err);
  }
});

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
      const avg = Math.round(stats[0].avgRating * 10) / 10;
      await this.findByIdAndUpdate(restaurantId, {
        rating: avg,
        numReviews: stats[0].numReviews,
      });
    } else {
      await this.findByIdAndUpdate(restaurantId, { rating: 0, numReviews: 0 });
    }
  } catch (err) {
    console.error("❌ Error updating restaurant rating:", err.message);
  }
};

module.exports =
  mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);