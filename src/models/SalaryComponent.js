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

    workingDays: { type: Number, default: 0 },
    overtimeDays: { type: Number, default: 0 },
    totalDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    nationalHoliday: { type: Number, default: 0 },
    payableDays: { type: Number, default: 0 },
    halfDayPresent: { type: Number, default: 0 },

    basic: { type: Number, default: 0 },
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
    basicEarned: { type: Number, default: 0 },
    hraEarned: { type: Number, default: 0 },
    totalEarning: { type: Number, default: 0 },

    gross: { type: Number, default: 0 },
    esiApplicableGross: { type: Number, default: 0 },

    pfDeduction: { type: Number, default: 0 },
    esiEmployerContribution: { type: Number, default: 0 },
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

    netPayment: { type: Number, default: 0 },
    roundedAmount: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },

    remarks: { type: String, trim: true, default: "" },
    active: { type: Boolean, default: true },

    bankAccountNumber: { type: String, trim: true, default: "" },
    ifscCode: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },
    permanentAddress: { type: String, trim: true, default: "" },
    aadharNumber: { type: String, trim: true, default: "" },
    mobileNumber: { type: String, trim: true, default: "" },
    esiCode: { type: String, trim: true, default: "" },
    uan: { type: String, trim: true, default: "" },
    pfNumber: { type: String, trim: true, default: "" },
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
    if (path.instance === "Number" && typeof this[key] === "number" && Number.isNaN(this[key])) {
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
