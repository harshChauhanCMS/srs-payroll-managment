import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      index: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    mobileNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      sparse: true,
      unique: true,
      validate: [
        {
          validator: (v) => {
            if (!v) return true;
            return /^\+[1-9]\d{1,14}$/.test(v);
          },
          message:
            "Mobile number must be in international format (e.g., +919599334387)",
        },
      ],
    },
    role: {
      type: String,
      enum: {
        values: ["rider", "admin", "driver"],
        message: "Role must be either rider, admin, or driver",
      },
      default: "rider",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRY || "1d",
  });
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
