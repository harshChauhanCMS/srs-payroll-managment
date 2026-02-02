import mongoose from "mongoose";

const salaryComponentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
      index: true,
    },
    payrollMonth: { type: Number, min: 1, max: 12, required: true },
    payrollYear: { type: Number, required: true, index: true },

    totalDays: { type: Number, default: 0 },
    workingDays: { type: Number, default: 0 },
    nationalHoliday: { type: Number, default: 0 },
    overtimeDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    payableDays: { type: Number, default: 0 },
    halfDayPresent: { type: Number, default: 0 },

    houseRentAllowance: { type: Number, default: 0 },
    overtimeAmount: { type: Number, default: 0 },
    incentive: { type: Number, default: 0 },
    exportAllowance: { type: Number, default: 0 },
    basicSpecialAllowance: { type: Number, default: 0 },
    citySpecialAllowance: { type: Number, default: 0 },
    conveyanceAllowance: { type: Number, default: 0 },
    bonusAllowance: { type: Number, default: 0 },
    specialHeadConveyanceAllowance: { type: Number, default: 0 },
    arrear: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    leavePayment: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    uniformMaintenanceAllowance: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },
    leaveEarnings: { type: Number, default: 0 },
    bonusEarnings: { type: Number, default: 0 },

    pfPercentage: { type: Number, default: 0 },
    esiDeduction: { type: Number, default: 0 },
    haryanaWelfareFund: { type: Number, default: 0 },
    labourWelfareFund: { type: Number, default: 0 },
    groupTermLifeInsurance: { type: Number, default: 0 },
    miscellaneousDeduction: { type: Number, default: 0 },
    shoesDeduction: { type: Number, default: 0 },
    jacketDeduction: { type: Number, default: 0 },
    canteenDeduction: { type: Number, default: 0 },
    iCardDeduction: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },

    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

salaryComponentSchema.index({ company: 1, payrollYear: 1, payrollMonth: 1 });

// Coerce NaN to 0 for all Number paths (Mongoose throws on NaN)
// Mongoose 9: pre middleware no longer receives next(); use async or return.
salaryComponentSchema.pre("save", function () {
  const schemaPaths = this.schema.paths;
  for (const key of Object.keys(schemaPaths)) {
    const path = schemaPaths[key];
    if (
      path.instance === "Number" &&
      typeof this[key] === "number" &&
      Number.isNaN(this[key])
    ) {
      this[key] = 0;
    }
  }
});

if (mongoose.models.SalaryComponent) {
  delete mongoose.models.SalaryComponent;
}

const SalaryComponent = mongoose.model(
  "SalaryComponent",
  salaryComponentSchema,
);
export default SalaryComponent;
