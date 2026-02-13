// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, "Email cannot exceed 100 characters"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    avatar: {
      type: String,
      default: "https://via.placeholder.com/150.png",
      validate: {
        validator: (v) => /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(v),
        message: "Please provide a valid image URL",
      },
    },
    favorites: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
      default: [],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

// DB-level unique index
UserSchema.index({ email: 1 }, { unique: true });

// Hide sensitive fields
const hideSensitive = (_doc, ret) => {
  delete ret.password;
  delete ret.resetPasswordToken;
  delete ret.resetPasswordExpire;
  delete ret.__v;
  return ret;
};
UserSchema.set("toJSON", { transform: hideSensitive });
UserSchema.set("toObject", { transform: hideSensitive });

// Normalize before save
UserSchema.pre("save", async function (next) {
  try {
    if (typeof this.email === "string") this.email = this.email.trim().toLowerCase();
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Handle password/email normalization on updates as well
UserSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate() || {};
    const $set = update.$set || {};

    // Normalize email on update
    if (typeof update.email === "string") update.email = update.email.trim().toLowerCase();
    if (typeof $set.email === "string") $set.email = $set.email.trim().toLowerCase();

    // Hash password if provided in update (and validate basic length to avoid bypass)
    const newPassword = update.password || $set.password;
    if (typeof newPassword === "string") {
      if (newPassword.length < 6) {
        return next(new Error("Password must be at least 6 characters long"));
      }
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);
      if (update.password) update.password = hashed;
      if ($set.password) $set.password = hashed;
    }

    if (Object.keys($set).length) {
      update.$set = $set;
      this.setUpdate(update);
    }

    // Ensure validators run on update
    this.setOptions({ runValidators: true, new: true, context: "query" });
    next();
  } catch (err) {
    next(err);
  }
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Avoid OverwriteModelError during dev/hot-reload
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);