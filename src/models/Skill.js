import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
    },
    skillCode: {
      type: String,
      required: [true, "Skill code is required"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
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
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade is required"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    basic: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

skillSchema.index({ grade: 1, skillCode: 1 });

// Avoid using a cached model
if (mongoose.models.Skill) {
  delete mongoose.models.Skill;
}

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
