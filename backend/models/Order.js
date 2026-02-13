// models/Order.js
const mongoose = require("mongoose");

// Subdocument: Order Item
const OrderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: [true, "Menu item reference is required"],
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [1, "Item name is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be at least 1"],
    },
  },
  { _id: false } // prevents auto _id for subdocuments
);

// Main Order Schema
const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant reference is required"],
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: "Order must contain at least one item",
      },
    },
    total: {
      type: Number,
      min: [0, "Total must be positive"],
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "preparing",
        "out-for-delivery",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
    address: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters"],
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "cash", "card", "upi", "online"],
      required: [true, "Payment method is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    deliveryTime: {
      type: Number, // Estimated delivery time in mins
      default: 30,
    },
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or a separate DeliveryAgent model if you extend later
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Special instructions cannot exceed 300 characters"],
    },
  },
  { timestamps: true }
);

// Helpful indexes for common queries
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ restaurant: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

// Hide internal fields
const hideInternal = (_doc, ret) => {
  delete ret.__v;
  return ret;
};
OrderSchema.set("toJSON", { transform: hideInternal });
OrderSchema.set("toObject", { transform: hideInternal });

// Auto-calculate total before validation/save
OrderSchema.pre("validate", function (next) {
  try {
    if (Array.isArray(this.items) && this.items.length > 0) {
      this.total = this.items.reduce((acc, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return acc + qty * price;
      }, 0);
    } else {
      this.total = 0;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Recalculate total if items array is replaced via findOneAndUpdate/findByIdAndUpdate
OrderSchema.pre("findOneAndUpdate", function (next) {
  try {
    const update = this.getUpdate() || {};
    const $set = update.$set || {};
    const newItems =
      Array.isArray($set.items) ? $set.items :
      Array.isArray(update.items) ? update.items :
      null;

    if (Array.isArray(newItems)) {
      const newTotal = newItems.reduce((acc, item) => {
        const qty = Number(item?.quantity) || 0;
        const price = Number(item?.price) || 0;
        return acc + qty * price;
      }, 0);
      $set.total = Math.max(0, newTotal);
      update.$set = $set;
      this.setUpdate(update);
    }

    // Ensure validators run on update operations
    this.setOptions({ runValidators: true, new: true, context: "query" });

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);