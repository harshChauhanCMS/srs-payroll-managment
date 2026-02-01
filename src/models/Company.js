import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    pan: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
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
if (mongoose.models.Company) {
  delete mongoose.models.Company;
}

const Company = mongoose.model("Company", companySchema);
export default Company;
