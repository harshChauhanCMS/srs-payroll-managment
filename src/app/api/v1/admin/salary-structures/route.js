import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SalaryStructure from "@/models/SalaryStructure";
import { ROLES } from "@/constants/roles";
import { requireViewPermission, requireCreatePermission } from "@/lib/apiAuth";

const STANDARD_WORKING_DAYS = 26;
const ESI_CEILING = 21000;
const PF_RATE = 0.12;
const ESI_RATE = 0.0075;

/**
 * Round to integer (like Excel ROUND)
 */
function round(num) {
  return Math.round(Number(num) || 0);
}

/**
 * Calculate salary fields from input rates and days (for POST validation/defaults)
 */
export function calculateSalaryFields(input) {
  const payableDays = Number(input.payableDays) || 0;
  const presentDays = Number(input.presentDays) || 0;
  const nationalHoliday = Number(input.nationalHoliday) || 0;
  const overtimeDays = Number(input.overtimeDays) || 0;
  const basicMonthly = Number(input.basic) || 0;
  const hraMonthly = Number(input.houseRentAllowance) || 0;
  const otherAllowanceMonthly = Number(input.otherAllowance) || 0;
  const leaveEarnings = Number(input.leaveEarnings) || 0;
  const bonusEarnings = Number(input.bonusEarnings) || 0;
  const labourWelfareFund = Number(input.labourWelfareFund) || 0;
  const miscDed = Number(input.miscellaneousDeduction) || 0;

  const payable = payableDays || presentDays + nationalHoliday;
  const basicEarned = round((basicMonthly / STANDARD_WORKING_DAYS) * payable);
  const hraEarned = round((hraMonthly / STANDARD_WORKING_DAYS) * payable);
  const otherEarned = round((otherAllowanceMonthly / STANDARD_WORKING_DAYS) * payable);
  const totalEarning =
    basicEarned + hraEarned + otherEarned + leaveEarnings + bonusEarnings;
  const incentive = round(
    (basicMonthly / STANDARD_WORKING_DAYS / 8) * 2 * overtimeDays * 8
  );
  const gross = round(totalEarning + incentive);
  const esiApplicableGross = gross;
  const pfDeduction = round(basicEarned * PF_RATE);
  const esiDeduction =
    gross < ESI_CEILING ? round(gross * ESI_RATE) : 0;
  const totalDeductions =
    pfDeduction + esiDeduction + labourWelfareFund + miscDed;
  const netPayment = round(gross - totalDeductions);
  const roundedAmount = round(netPayment);

  return {
    payableDays: payable,
    basicEarned,
    hraEarned,
    totalEarning,
    incentive,
    gross,
    esiApplicableGross,
    pfDeduction,
    esiDeduction,
    totalDeductions,
    netPayment,
    roundedAmount,
    totalPayable: roundedAmount,
    amount: roundedAmount,
  };
}

/**
 * GET /api/v1/admin/salary-structures
 * List salary records (HR: only their company)
 */
export async function GET(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { searchParams } = new URL(request.url);
    const company = searchParams.get("company");
    const payrollYear = searchParams.get("payrollYear");
    const payrollMonth = searchParams.get("payrollMonth");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};

    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      if (!currentUser.company) {
        return NextResponse.json({
          salaryStructures: [],
          pagination: { page: 1, limit, total: 0, pages: 0 },
        });
      }
      query.company = currentUser.company;
    } else {
      if (company) query.company = company;
    }
    if (payrollYear) query.payrollYear = parseInt(payrollYear, 10);
    if (payrollMonth) query.payrollMonth = parseInt(payrollMonth, 10);

    const skip = (page - 1) * limit;

    const [salaryStructures, total] = await Promise.all([
      SalaryStructure.find(query)
        .populate("company", "name")
        .populate("employee", "name email")
        .populate("site", "name siteCode")
        .populate("department", "name code")
        .populate("designation", "name code")
        .populate("grade", "name code")
        .sort({ payrollYear: -1, payrollMonth: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SalaryStructure.countDocuments(query),
    ]);

    return NextResponse.json({
      salaryStructures,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("List salary structures error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch salary structures" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/admin/salary-structures
 * Create a salary record (requires create permission)
 */
export async function POST(request) {
  try {
    const auth = await requireCreatePermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;

    if (
      currentUser.role === ROLES.HR &&
      !currentUser.permissions?.create
    ) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to create salary records." },
        { status: 403 },
      );
    }

    const body = await request.json();

    if (!body.company) {
      return NextResponse.json(
        { message: "Company is required" },
        { status: 400 },
      );
    }

    if (currentUser.role === ROLES.HR) {
      if (
        !currentUser.company ||
        String(currentUser.company) !== String(body.company)
      ) {
        return NextResponse.json(
          { message: "You can only create salary records for your company." },
          { status: 403 },
        );
      }
    }

    const calculated = calculateSalaryFields(body);

    await connectDB();

    const now = new Date();
    const payload = {
      company: body.company,
      payrollMonth: body.payrollMonth ?? now.getMonth() + 1,
      payrollYear: body.payrollYear ?? now.getFullYear(),
      employee: body.employee || null,
      cardId: (body.cardId || "").trim(),
      payCode: (body.payCode || "").trim(),
      employeeName: (body.employeeName || "").trim(),
      fathersName: (body.fathersName || "").trim(),
      site: body.site || null,
      department: body.department || null,
      departmentId: (body.departmentId || "").trim(),
      area: (body.area || "").trim(),
      designation: body.designation || null,
      grade: body.grade || null,
      skills: Array.isArray(body.skills) ? body.skills : [],
      division: (body.division || "").trim(),
      category: (body.category || "").trim(),
      contractor: (body.contractor || "").trim(),
      bankAccountNumber: (body.bankAccountNumber || "").trim(),
      ifscCode: (body.ifscCode || "").trim(),
      bankName: (body.bankName || "").trim(),
      permanentAddress: (body.permanentAddress || "").trim(),
      aadharNumber: (body.aadharNumber || "").trim(),
      mobileNumber: (body.mobileNumber || "").trim(),
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      dateOfJoining: body.dateOfJoining ? new Date(body.dateOfJoining) : null,
      dateOfConfirmation: body.dateOfConfirmation ? new Date(body.dateOfConfirmation) : null,
      esiCode: (body.esiCode || "").trim(),
      uan: (body.uan || "").trim(),
      pfNumber: (body.pfNumber || "").trim(),
      skillLabel: (body.skillLabel || "").trim(),
      workingDays: Number(body.workingDays) || 0,
      overtimeDays: Number(body.overtimeDays) || 0,
      totalDays: Number(body.totalDays) || 0,
      presentDays: Number(body.presentDays) || 0,
      nationalHoliday: Number(body.nationalHoliday) || 0,
      payableDays: calculated.payableDays ?? 0,
      halfDayPresent: Number(body.halfDayPresent) || 0,
      basic: Number(body.basic) || 0,
      houseRentAllowance: Number(body.houseRentAllowance) || 0,
      overtimeAmount: Number(body.overtimeAmount) ?? calculated.overtimeAmount ?? 0,
      incentive: calculated.incentive ?? 0,
      exportAllowance: Number(body.exportAllowance) || 0,
      basicSpecialAllowance: Number(body.basicSpecialAllowance) || 0,
      citySpecialAllowance: Number(body.citySpecialAllowance) || 0,
      conveyanceAllowance: Number(body.conveyanceAllowance) || 0,
      bonusAllowance: Number(body.bonusAllowance) || 0,
      specialHeadConveyanceAllowance: Number(body.specialHeadConveyanceAllowance) || 0,
      arrear: Number(body.arrear) || 0,
      medicalAllowance: Number(body.medicalAllowance) || 0,
      leavePayment: Number(body.leavePayment) || 0,
      specialAllowance: Number(body.specialAllowance) || 0,
      uniformMaintenanceAllowance: Number(body.uniformMaintenanceAllowance) || 0,
      otherAllowance: Number(body.otherAllowance) || 0,
      leaveEarnings: Number(body.leaveEarnings) || 0,
      bonusEarnings: Number(body.bonusEarnings) || 0,
      basicEarned: calculated.basicEarned ?? 0,
      hraEarned: calculated.hraEarned ?? 0,
      totalEarning: calculated.totalEarning ?? 0,
      gross: calculated.gross ?? 0,
      esiApplicableGross: calculated.esiApplicableGross ?? 0,
      pfDeduction: calculated.pfDeduction ?? 0,
      esiEmployerContribution: Number(body.esiEmployerContribution) || 0,
      esiDeduction: calculated.esiDeduction ?? 0,
      haryanaWelfareFund: Number(body.haryanaWelfareFund) || 0,
      labourWelfareFund: Number(body.labourWelfareFund) || 0,
      groupTermLifeInsurance: Number(body.groupTermLifeInsurance) || 0,
      miscellaneousDeduction: Number(body.miscellaneousDeduction) || 0,
      shoesDeduction: Number(body.shoesDeduction) || 0,
      jacketDeduction: Number(body.jacketDeduction) || 0,
      canteenDeduction: Number(body.canteenDeduction) || 0,
      iCardDeduction: Number(body.iCardDeduction) || 0,
      totalDeductions: calculated.totalDeductions ?? 0,
      netPayment: calculated.netPayment ?? 0,
      roundedAmount: calculated.roundedAmount ?? 0,
      totalPayable: calculated.totalPayable ?? 0,
      amount: calculated.amount ?? 0,
      remarks: (body.remarks || "").trim(),
      active: body.active !== false,
    };

    const doc = await SalaryStructure.create(payload);
    const salaryStructure = await SalaryStructure.findById(doc._id)
      .populate("company", "name")
      .populate("employee", "name email")
      .populate("site", "name siteCode")
      .populate("department", "name code")
      .populate("designation", "name code")
      .populate("grade", "name code")
      .lean();

    return NextResponse.json(
      {
        message: "Salary record created successfully",
        salaryStructure,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create salary structure error:", err);
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors || {})
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { message: msg || "Validation failed" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: err.message || "Failed to create salary record" },
      { status: 500 },
    );
  }
}
