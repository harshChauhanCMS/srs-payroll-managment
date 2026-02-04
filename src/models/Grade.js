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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: [true, "Designation is required"],
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

gradeSchema.index({ designation: 1, code: 1 });

// Avoid using a cached model
if (mongoose.models.Grade) {
  delete mongoose.models.Grade;
}

const Grade = mongoose.model("Grade", gradeSchema);
export default Grade;
