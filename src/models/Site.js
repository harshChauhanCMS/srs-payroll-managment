import mongoose from "mongoose";

const siteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Site name is required"],
      trim: true,
    },
    siteCode: {
      type: String,
      required: [true, "Site code is required"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Parent company is required"],
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
siteSchema.index({ company: 1, siteCode: 1 });

// Avoid using a cached model
if (mongoose.models.Site) {
  delete mongoose.models.Site;
}

const Site = mongoose.model("Site", siteSchema);
export default Site;
