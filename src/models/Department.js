import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Department code is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Designations within this department
    designations: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        code: {
          type: String,
          required: true,
          trim: true,
        },
        level: {
          type: Number,
          default: 1,
        },
      },
    ],
    // Grades for salary/position classification
    grades: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        code: {
          type: String,
          required: true,
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
      },
    ],
    // Skills required/associated with this department
    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          trim: true,
          default: "General",
        },
      },
    ],
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
if (mongoose.models.Department) {
  delete mongoose.models.Department;
}

const Department = mongoose.model("Department", departmentSchema);
export default Department;
