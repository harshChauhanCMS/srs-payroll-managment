import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
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
if (mongoose.models.Skill) {
  delete mongoose.models.Skill;
}

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
