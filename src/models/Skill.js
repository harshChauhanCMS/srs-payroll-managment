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
    basic: { type: Number, default: 0 },
    houseRentAllowance: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },
    leaveEarnings: { type: Number, default: 0 },
    bonusEarnings: { type: Number, default: 0 },
    arrear: { type: Number, default: 0 },
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
