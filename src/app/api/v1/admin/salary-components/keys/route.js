import { NextResponse } from "next/server";
import { requireViewPermission } from "@/lib/apiAuth";

/**
 * Salary component field keys (company-level template; no employee fields).
 */
const SALARY_COMPONENT_KEYS = {
  required: [
    { key: "company", label: "Company", type: "ref", ref: "Company", required: true },
    { key: "payrollMonth", label: "Payroll Month", type: "number", required: true, min: 1, max: 12 },
    { key: "payrollYear", label: "Payroll Year", type: "number", required: true },
  ],
  days: [
    { key: "presentDays", label: "Present Days", type: "number" },
    { key: "nationalHoliday", label: "National Holiday", type: "number" },
    { key: "payableDays", label: "Payable Days", type: "number", calculated: true },
    { key: "overtimeDays", label: "Overtime Days", type: "number" },
  ],
  earnings: [
    { key: "basic", label: "Basic (Monthly Rate)", type: "number" },
    { key: "houseRentAllowance", label: "HRA (Monthly Rate)", type: "number" },
    { key: "otherAllowance", label: "Other Allowance (Monthly)", type: "number" },
    { key: "leaveEarnings", label: "Leave Earnings", type: "number" },
    { key: "bonusEarnings", label: "Bonus Earnings", type: "number" },
    { key: "arrear", label: "Arrear", type: "number" },
    { key: "basicEarned", label: "Basic Earned", type: "number", calculated: true },
    { key: "hraEarned", label: "HRA Earned", type: "number", calculated: true },
    { key: "totalEarning", label: "Total Earning", type: "number", calculated: true },
    { key: "incentive", label: "Incentive Amt.", type: "number", calculated: true },
    { key: "gross", label: "Gross", type: "number", calculated: true },
  ],
  deductions: [
    { key: "labourWelfareFund", label: "Labour Welfare Fund", type: "number" },
    { key: "haryanaWelfareFund", label: "Haryana Welfare Fund", type: "number" },
    { key: "groupTermLifeInsurance", label: "Group Term Life Insurance", type: "number" },
    { key: "miscellaneousDeduction", label: "Miscellaneous Deduction", type: "number" },
    { key: "shoesDeduction", label: "Shoes Deduction", type: "number" },
    { key: "jacketDeduction", label: "Jacket Deduction", type: "number" },
    { key: "canteenDeduction", label: "Canteen Deduction", type: "number" },
    { key: "iCardDeduction", label: "I Card Deduction", type: "number" },
    { key: "totalDeductions", label: "Total Deductions", type: "number", calculated: true },
  ],
  bank: [
    { key: "bankAccountNumber", label: "Bank Account No.", type: "string" },
    { key: "ifscCode", label: "IFSC Code", type: "string" },
    { key: "bankName", label: "Bank Name", type: "string" },
    { key: "permanentAddress", label: "Permanent Address", type: "string" },
    { key: "aadharNumber", label: "Aadhar No.", type: "string" },
    { key: "mobileNumber", label: "Mobile No.", type: "string" },
    { key: "esiCode", label: "ESI Code", type: "string" },
    { key: "uan", label: "UAN", type: "string" },
    { key: "pfNumber", label: "PF Number", type: "string" },
  ],
  meta: [{ key: "remarks", label: "Remarks", type: "string" }],
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
