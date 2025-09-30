// models/Admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true, // setter applies on document set/save
      trim: true,
      maxlength: [100, "Email cannot exceed 100 characters"],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // do not select by default
    },
    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
  },
  { timestamps: true }
);

// DB-level unique index
AdminSchema.index({ email: 1 }, { unique: true });

// Hide sensitive fields in JSON/object outputs
const hideSensitive = (_doc, ret) => {
  delete ret.password;
  delete ret.__v;
  return ret;
};
AdminSchema.set("toJSON", { transform: hideSensitive });
AdminSchema.set("toObject", { transform: hideSensitive });

// Hash password before saving (only if modified)
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Also handle password/email normalization on findOneAndUpdate/findByIdAndUpdate
AdminSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate() || {};
    const $set = update.$set || {};

    // Normalize email on updates too
    if (typeof update.email === "string") {
      update.email = update.email.trim().toLowerCase();
    }
    if (typeof $set.email === "string") {
      $set.email = $set.email.trim().toLowerCase();
    }

    // Hash password if provided in update
    const newPassword = update.password || $set.password;
    if (typeof newPassword === "string" && newPassword.length > 0) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);
      if (update.password) update.password = hashed;
      if ($set.password) $set.password = hashed;
    }

    if (Object.keys($set).length) {
      update.$set = $set;
    }

    // Ensure validators run on update
    this.setOptions({ runValidators: true, context: "query" });

    next();
  } catch (err) {
    next(err);
  }
});

// Compare entered password with hashed password
AdminSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Avoid OverwriteModelError in dev/hot-reload
module.exports = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);