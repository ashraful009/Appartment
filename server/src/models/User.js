const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const VALID_ROLES = ["user", "customer", "seller", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    referralCode: {
      type: String,
      trim: true,
      default: null,
    },
    // The seller whose referral link this user registered through
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // ── Roles — array of strings ──────────────────────────────────
    // Possible values: "user", "customer", "seller", "admin"
    // Every new account gets ["user"] by default.
    roles: {
      type: [
        {
          type: String,
          enum: {
            values: VALID_ROLES,
            message: '"{VALUE}" is not a valid role.',
          },
        },
      ],
      default: ["user"],
    },
  },
  { timestamps: true }
);

// Ensure no duplicate role strings in the array
userSchema.pre("save", function () {
  this.roles = [...new Set(this.roles)];
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Convenience method: check if user has a specific role
userSchema.methods.hasRole = function (role) {
  return this.roles.includes(role);
};

module.exports = mongoose.model("User", userSchema);
