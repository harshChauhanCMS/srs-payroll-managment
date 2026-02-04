export const DATA_TYPES = {
  TEXT: "TEXT",
  NUMBER: "NUMBER",
};

export const SOURCE_TYPES = {
  EMPLOYEE: "EMPLOYEE",
  PAYROLL_COMPONENT: "PAYROLL_COMPONENT",
  PAYROLL_SUMMARY: "PAYROLL_SUMMARY",
  FORMULA: "FORMULA",
};

export const ROUND_TO = {
  NONE: "NONE",
  NEAREST_1: "NEAREST_1",
  NEAREST_10: "NEAREST_10",
};

export const EXPORT_TYPES = {
  VALUES_ONLY: "VALUES_ONLY",
  WITH_FORMULAS: "WITH_FORMULAS",
};

// Common employee field mappings for reference
export const EMPLOYEE_FIELDS = [
  { key: "employee.employeeCode", label: "Employee Code" },
  { key: "employee.name", label: "Employee Name" },
  { key: "employee.fatherName", label: "Father Name" },
  { key: "employee.dob", label: "Date of Birth" },
  { key: "employee.doj", label: "Date of Joining" },
  { key: "employee.bankName", label: "Bank Name" },
  { key: "employee.accountNumber", label: "Account Number" },
  { key: "employee.ifscCode", label: "IFSC Code" },
  { key: "employee.uan", label: "UAN" },
  { key: "employee.pfNumber", label: "PF Number" },
  { key: "employee.esiCode", label: "ESI Code" },
  { key: "employee.pan", label: "PAN" },
  { key: "employee.aadhar", label: "Aadhar" },
];

// Common payroll component mappings for reference
export const PAYROLL_COMPONENTS = [
  { key: "component:basic", label: "Basic" },
  { key: "component:hra", label: "HRA" },
  { key: "component:otherAllowance", label: "Other Allowance" },
  { key: "component:otAmount", label: "OT Amount" },
  { key: "component:incentive", label: "Incentive" },
  { key: "component:arrear", label: "Arrear" },
  { key: "component:pfDeduction", label: "PF Deduction" },
  { key: "component:esiDeduction", label: "ESI Deduction" },
  { key: "component:lwf", label: "LWF" },
];

// Common payroll summary mappings for reference
export const PAYROLL_SUMMARY = [
  { key: "summary:grossEarning", label: "Gross Earning" },
  { key: "summary:totalDeductions", label: "Total Deductions" },
  { key: "summary:netPay", label: "Net Pay" },
  { key: "summary:payableDays", label: "Payable Days" },
  { key: "summary:otHours", label: "OT Hours" },
];
