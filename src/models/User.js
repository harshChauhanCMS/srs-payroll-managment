import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLES, ALL_ROLES } from "@/constants/roles";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      required: true,
      default: ROLES.EMPLOYEE,
    },
    permissions: {
      view: { type: Boolean, default: true },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: [true, "Site assignment is required"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      default: null,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      default: null,
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    pan: {
      type: String,
      trim: true,
      default: "",
    },
    aadhar: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    esiCode: { type: String, trim: true, default: "" },
    uan: { type: String, trim: true, default: "" },
    pfNumber: { type: String, trim: true, default: "" },
    pfPercentage: { type: Number, default: null },
    esiPercentage: { type: Number, default: null },
    active: {
      type: Boolean,
      default: true,
    },
    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Avoid using a cached model that may have old middleware (e.g. pre-save with broken next)
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model("User", userSchema);
export default User;
