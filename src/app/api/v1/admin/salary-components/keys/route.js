import { NextResponse } from "next/server";
import { requireViewPermission } from "@/lib/apiAuth";

const DAY_KEYS = [
  { key: "totalDays", label: "Total Days", type: "number" },
  { key: "workingDays", label: "Working Days", type: "number" },
  { key: "nationalHoliday", label: "National Holiday", type: "number" },
  { key: "overtimeDays", label: "Overtime Days", type: "number" },
  { key: "presentDays", label: "Present Days", type: "number" },
  { key: "payableDays", label: "Payable Days", type: "number" },
  { key: "halfDayPresent", label: "Half Day Present", type: "number" },
];

const ALLOWANCE_KEYS = [
  { key: "houseRentAllowance", label: "House Rent Allowance (HRA)", type: "number" },
  { key: "overtimeAmount", label: "Overtime Amount (OT)", type: "number" },
  { key: "incentive", label: "Incentive", type: "number" },
  { key: "exportAllowance", label: "Export Allowance", type: "number" },
  { key: "basicSpecialAllowance", label: "Basic Special Allowance (BSA)", type: "number" },
  { key: "citySpecialAllowance", label: "City Special Allowance (CSA)", type: "number" },
  { key: "conveyanceAllowance", label: "Conveyance Allowance", type: "number" },
  { key: "bonusAllowance", label: "Bonus Allowance", type: "number" },
  { key: "specialHeadConveyanceAllowance", label: "Special Head Conveyance (SHCA)", type: "number" },
  { key: "arrear", label: "Arrear", type: "number" },
  { key: "medicalAllowance", label: "Medical Allowance", type: "number" },
  { key: "leavePayment", label: "Leave Payment", type: "number" },
  { key: "specialAllowance", label: "Special Allowance", type: "number" },
  { key: "uniformMaintenanceAllowance", label: "Uniform Maintenance (UMA)", type: "number" },
  { key: "otherAllowance", label: "Other Allowance", type: "number" },
  { key: "leaveEarnings", label: "Leave Earnings", type: "number" },
  { key: "bonusEarnings", label: "Bonus Earnings", type: "number" },
  { key: "basicEarned", label: "Basic Earned", type: "number" },
  { key: "hraEarned", label: "HRA Earned", type: "number" },
  { key: "gross", label: "Gross", type: "number" },
];

const DEDUCTION_KEYS = [
  { key: "pfDeduction", label: "PF Deduction (PF)", type: "number" },
  { key: "esiEmployerContribution", label: "ESI Employer (ESI Emp)", type: "number" },
  { key: "esiDeduction", label: "ESI Deduction (ESI)", type: "number" },
  { key: "haryanaWelfareFund", label: "Haryana Welfare Fund (HWF)", type: "number" },
  { key: "labourWelfareFund", label: "Labour Welfare Fund (LWF)", type: "number" },
  { key: "groupTermLifeInsurance", label: "Group Term Life Insurance (GTLI)", type: "number" },
  { key: "miscellaneousDeduction", label: "Miscellaneous (Misc)", type: "number" },
  { key: "shoesDeduction", label: "Shoes Deduction", type: "number" },
  { key: "jacketDeduction", label: "Jacket Deduction", type: "number" },
  { key: "canteenDeduction", label: "Canteen Deduction", type: "number" },
  { key: "iCardDeduction", label: "I Card Deduction", type: "number" },
  { key: "totalDeductions", label: "Total Deductions", type: "number", calculated: true },
];

const SALARY_COMPONENT_KEYS = {
  required: [
    { key: "company", label: "Company", type: "ref", ref: "Company", required: true },
    { key: "payrollMonth", label: "Payroll Month", type: "number", required: true, min: 1, max: 12 },
    { key: "payrollYear", label: "Payroll Year", type: "number", required: true },
  ],
  days: DAY_KEYS,
  allowances: ALLOWANCE_KEYS,
  deductions: DEDUCTION_KEYS,
};

/**
 * GET /api/v1/admin/salary-components/keys
 */
export async function GET(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    return NextResponse.json({
      keys: SALARY_COMPONENT_KEYS,
      message: "Salary component keys fetched successfully",
    });
  } catch (err) {
    console.error("Get salary component keys error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch keys" },
      { status: 500 },
    );
  }
}
