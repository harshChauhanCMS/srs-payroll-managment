import mongoose from "mongoose";

const payrollResultSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    employeeName: { type: String },
    employeeCode: { type: String },
    // Earnings
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },
    otAmount: { type: Number, default: 0 },
    incentive: { type: Number, default: 0 },
    arrear: { type: Number, default: 0 },
    grossEarning: { type: Number, default: 0 },
    // Deductions
    pfDeduction: { type: Number, default: 0 },
    esiDeduction: { type: Number, default: 0 },
    lwf: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    // Net
    netPay: { type: Number, default: 0 },
    // Attendance snapshot
    payableDays: { type: Number, default: 0 },
    otHours: { type: Number, default: 0 },
  },
  { _id: false },
);

const payrollRunSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: [true, "Site is required"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    payrollMonth: {
      type: Number,
      min: 1,
      max: 12,
      required: [true, "Payroll month is required"],
    },
    payrollYear: {
      type: Number,
      required: [true, "Payroll year is required"],
    },
    status: {
      type: String,
      enum: ["draft", "reviewed", "approved", "locked"],
      default: "draft",
    },
    // Settings used during this run
    settings: {
      activeDeploymentsOnly: { type: Boolean, default: true },
      autoCalculateStatutory: { type: Boolean, default: true },
      skipExceptions: { type: Boolean, default: false },
      applyRounding: { type: Boolean, default: true },
    },
    // Per-employee results
    results: [payrollResultSchema],
    // Summary
    totalEmployees: { type: Number, default: 0 },
    totalGross: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    totalNetPay: { type: Number, default: 0 },
    // Exceptions at time of run
    exceptionCount: { type: Number, default: 0 },
    // Approval tracking
    runBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    runAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lockedAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// One payroll run per site per period
payrollRunSchema.index(
  { site: 1, payrollMonth: 1, payrollYear: 1 },
  { unique: true },
);

// For listing/filtering
payrollRunSchema.index({ company: 1, status: 1 });

// Avoid using a cached model
if (mongoose.models.PayrollRun) {
  delete mongoose.models.PayrollRun;
}

const PayrollRun = mongoose.model("PayrollRun", payrollRunSchema);
export default PayrollRun;
