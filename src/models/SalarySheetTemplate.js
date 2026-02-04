import mongoose from "mongoose";

const templateColumnMappingSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    excelColumnHeader: { type: String, required: true, trim: true },
    dataType: {
      type: String,
      enum: ["TEXT", "NUMBER"],
      default: "TEXT",
    },
    sourceType: {
      type: String,
      enum: ["EMPLOYEE", "PAYROLL_COMPONENT", "PAYROLL_SUMMARY", "FORMULA"],
      required: true,
    },
    sourceKey: { type: String, required: true, trim: true },
    roundTo: {
      type: String,
      enum: ["NONE", "NEAREST_1", "NEAREST_10"],
      default: "NONE",
    },
    defaultValue: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

const salarySheetTemplateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
      index: true,
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      default: null,
      index: true,
    },
    outputFilenamePattern: {
      type: String,
      required: [true, "Output filename pattern is required"],
      trim: true,
    },
    sheetName: {
      type: String,
      required: [true, "Sheet name is required"],
      default: "Salary Sheet",
      trim: true,
    },
    columnMappings: [templateColumnMappingSchema],
    active: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: One template name per company
salarySheetTemplateSchema.index(
  { company: 1, templateName: 1 },
  { unique: true }
);

// Index for filtering by site
salarySheetTemplateSchema.index({ company: 1, site: 1, active: 1 });

// Avoid using cached model
if (mongoose.models.SalarySheetTemplate) {
  delete mongoose.models.SalarySheetTemplate;
}

const SalarySheetTemplate = mongoose.model(
  "SalarySheetTemplate",
  salarySheetTemplateSchema
);

export default SalarySheetTemplate;
