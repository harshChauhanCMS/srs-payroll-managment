import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee is required"],
    },
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
    // Attendance fields
    totalDays: { type: Number, default: 0 },
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    payableDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    otHours: { type: Number, default: 0 },
    incentive: { type: Number, default: 0 },
    arrear: { type: Number, default: 0 },
    // Import tracking
    importedAt: { type: Date },
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    manuallyEdited: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// One attendance record per employee per site per month/year
attendanceSchema.index(
  { employee: 1, site: 1, payrollMonth: 1, payrollYear: 1 },
  { unique: true },
);

// For querying all attendance for a site/period
attendanceSchema.index({ site: 1, payrollMonth: 1, payrollYear: 1 });

// Avoid using a cached model
if (mongoose.models.Attendance) {
  delete mongoose.models.Attendance;
}

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
