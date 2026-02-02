import { NextResponse } from "next/server";
import { requireViewPermission } from "@/lib/apiAuth";

/**
 * All salary structure field keys that can be used in the form.
 * Companies can define which of these they use (future: company config).
 * Keys are grouped by category for the form.
 */
const SALARY_STRUCTURE_KEYS = {
  required: [
    { key: "company", label: "Company", type: "ref", ref: "Company", required: true },
    { key: "payrollMonth", label: "Payroll Month", type: "number", required: true, min: 1, max: 12 },
    { key: "payrollYear", label: "Payroll Year", type: "number", required: true },
    { key: "employeeName", label: "Employee Name", type: "string", required: true },
    { key: "cardId", label: "Card ID", type: "string" },
    { key: "payCode", label: "Pay Code", type: "string" },
  ],
  employee: [
    { key: "employee", label: "Employee (User)", type: "ref", ref: "User" },
    { key: "fathersName", label: "Father's Name", type: "string" },
    { key: "area", label: "Area", type: "string" },
    { key: "division", label: "Division", type: "string" },
    { key: "category", label: "Category", type: "string" },
    { key: "contractor", label: "Contractor", type: "string" },
  ],
  refs: [
    { key: "site", label: "Site / Location", type: "ref", ref: "Site" },
    { key: "department", label: "Department", type: "ref", ref: "Department" },
    { key: "departmentId", label: "Department ID", type: "string" },
    { key: "designation", label: "Designation", type: "ref", ref: "Designation" },
    { key: "grade", label: "Grade", type: "ref", ref: "Grade" },
    { key: "skills", label: "Skills", type: "refArray", ref: "Skill" },
  ],
  bank: [
    { key: "bankAccountNumber", label: "Bank Account No.", type: "string" },
    { key: "ifscCode", label: "IFSC Code", type: "string" },
    { key: "bankName", label: "Bank Name", type: "string" },
    { key: "permanentAddress", label: "Permanent Address", type: "string" },
    { key: "aadharNumber", label: "Aadhar No.", type: "string" },
    { key: "mobileNumber", label: "Mobile No.", type: "string" },
  ],
  statutory: [
    { key: "esiCode", label: "ESI Code", type: "string" },
    { key: "uan", label: "UAN", type: "string" },
    { key: "pfNumber", label: "PF Number", type: "string" },
    { key: "skillLabel", label: "Skill (Label)", type: "string" },
  ],
  dates: [
    { key: "dateOfBirth", label: "Date of Birth", type: "date" },
    { key: "dateOfJoining", label: "Date of Joining", type: "date" },
    { key: "dateOfConfirmation", label: "Date of Confirmation", type: "date" },
  ],
  days: [
    { key: "workingDays", label: "Working Days", type: "number", calculated: true },
    { key: "presentDays", label: "Present Days", type: "number" },
    { key: "nationalHoliday", label: "National Holiday", type: "number" },
    { key: "payableDays", label: "Payable Days", type: "number", calculated: true },
    { key: "overtimeDays", label: "Overtime Days", type: "number" },
    { key: "totalDays", label: "Total Days", type: "number" },
    { key: "halfDayPresent", label: "Half Day Present", type: "number" },
  ],
  earnings: [
    { key: "basic", label: "Basic (Monthly Rate)", type: "number" },
    { key: "houseRentAllowance", label: "HRA (Monthly Rate)", type: "number" },
    { key: "otherAllowance", label: "Other Allowance (Monthly)", type: "number" },
    { key: "leaveEarnings", label: "Leave Earnings", type: "number" },
    { key: "bonusEarnings", label: "Bonus Earnings", type: "number" },
    { key: "basicEarned", label: "Basic Earned", type: "number", calculated: true },
    { key: "hraEarned", label: "HRA Earned", type: "number", calculated: true },
    { key: "totalEarning", label: "Total Earning", type: "number", calculated: true },
    { key: "incentive", label: "Incentive Amt.", type: "number", calculated: true },
    { key: "overtimeAmount", label: "OT Amount", type: "number", calculated: true },
    { key: "basicSpecialAllowance", label: "Basic Special Allowance", type: "number" },
    { key: "citySpecialAllowance", label: "City Special Allowance", type: "number" },
    { key: "conveyanceAllowance", label: "Conveyance Allowance", type: "number" },
    { key: "bonusAllowance", label: "Bonus Allowance", type: "number" },
    { key: "specialHeadConveyanceAllowance", label: "S/H Conveyance Allowance", type: "number" },
    { key: "arrear", label: "Arrear", type: "number" },
    { key: "medicalAllowance", label: "Medical Allowance", type: "number" },
    { key: "leavePayment", label: "Leave Payment", type: "number" },
    { key: "specialAllowance", label: "Special Allowance", type: "number" },
    { key: "uniformMaintenanceAllowance", label: "Uniform Maintenance Allowance", type: "number" },
    { key: "exportAllowance", label: "Export Allowance", type: "number" },
  ],
  gross: [
    { key: "gross", label: "Gross", type: "number", calculated: true },
    { key: "esiApplicableGross", label: "ESI Applicable Gross", type: "number", calculated: true },
  ],
  deductions: [
    { key: "pfDeduction", label: "PF @12%", type: "number", calculated: true },
    { key: "esiDeduction", label: "ESI 0.75%", type: "number", calculated: true },
    { key: "labourWelfareFund", label: "LWF", type: "number" },
    { key: "haryanaWelfareFund", label: "HWF", type: "number" },
    { key: "groupTermLifeInsurance", label: "GTLI", type: "number" },
    { key: "miscellaneousDeduction", label: "Misc. Deduction", type: "number" },
    { key: "shoesDeduction", label: "Shoes", type: "number" },
    { key: "jacketDeduction", label: "Jacket", type: "number" },
    { key: "canteenDeduction", label: "Canteen", type: "number" },
    { key: "iCardDeduction", label: "I Card", type: "number" },
    { key: "totalDeductions", label: "Total Deductions", type: "number", calculated: true },
  ],
  net: [
    { key: "netPayment", label: "Net Payment", type: "number", calculated: true },
    { key: "roundedAmount", label: "Rounded Amount", type: "number", calculated: true },
    { key: "totalPayable", label: "Total Payable", type: "number", calculated: true },
    { key: "amount", label: "Amount", type: "number", calculated: true },
  ],
  meta: [
    { key: "remarks", label: "Remarks", type: "string" },
  ],
};

/**
 * GET /api/v1/admin/salary-structures/keys
 * Returns all salary structure field keys (for form building).
 * Admin/HR with view permission can see; company-specific config can filter these later.
 */
export async function GET(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    return NextResponse.json({
      keys: SALARY_STRUCTURE_KEYS,
      message: "Salary structure keys fetched successfully",
    });
  } catch (err) {
    console.error("Get salary structure keys error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch keys" },
      { status: 500 },
    );
  }
}
