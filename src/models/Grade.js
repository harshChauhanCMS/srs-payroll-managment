import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Grade name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Grade code is required"],
      unique: true,
      trim: true,
    },
    minSalary: {
      type: Number,
      default: 0,
    },
    maxSalary: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Avoid using a cached model
if (mongoose.models.Grade) {
  delete mongoose.models.Grade;
}

const Grade = mongoose.model("Grade", gradeSchema);
export default Grade;
