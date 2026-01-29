import mongoose from "mongoose";

const designationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Designation name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Designation code is required"],
      unique: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    level: {
      type: Number,
      default: 1,
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

// Compound index for efficient queries
designationSchema.index({ department: 1, code: 1 });

// Avoid using a cached model
if (mongoose.models.Designation) {
  delete mongoose.models.Designation;
}

const Designation = mongoose.model("Designation", designationSchema);
export default Designation;
