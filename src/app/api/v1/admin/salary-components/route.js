import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SalaryComponent from "@/models/SalaryComponent";
import { ROLES } from "@/constants/roles";
import { requireViewPermission, requireCreatePermission } from "@/lib/apiAuth";

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

/** Company-level: payable days = present + national holiday if not set. Earnings come from user's Skill. */
function getPayableDays(body) {
  const direct = Number(body.payableDays) || 0;
  if (direct > 0) return direct;
  return (Number(body.presentDays) || 0) + (Number(body.nationalHoliday) || 0);
}

/** Sum of optional deduction fields (company-level rates). PF/ESI are per employee. */
function getTotalDeductions(body) {
  return (
    (Number(body.labourWelfareFund) || 0) +
    (Number(body.haryanaWelfareFund) || 0) +
    (Number(body.groupTermLifeInsurance) || 0) +
    (Number(body.miscellaneousDeduction) || 0) +
    (Number(body.shoesDeduction) || 0) +
    (Number(body.jacketDeduction) || 0) +
    (Number(body.canteenDeduction) || 0) +
    (Number(body.iCardDeduction) || 0)
  );
}

/**
 * GET /api/v1/admin/salary-components
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
          salaryComponents: [],
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

    const [salaryComponents, totalCount] = await Promise.all([
      SalaryComponent.find(query)
        .populate("company", "name")
        .sort({ payrollYear: -1, payrollMonth: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SalaryComponent.countDocuments(query),
    ]);

    return NextResponse.json({
      salaryComponents,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("List salary components error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch salary components" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/admin/salary-components
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
        { message: "Forbidden. You do not have permission to create salary components." },
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
          { message: "You can only create salary components for your company." },
          { status: 403 },
        );
      }
    }

    const payableDays = getPayableDays(body);
    const totalDeductions = getTotalDeductions(body);

    await connectDB();

    const now = new Date();
    const payload = {
      company: body.company,
      payrollMonth: body.payrollMonth ?? now.getMonth() + 1,
      payrollYear: body.payrollYear ?? now.getFullYear(),
      workingDays: Number(body.workingDays) || 0,
      overtimeDays: Number(body.overtimeDays) || 0,
      totalDays: Number(body.totalDays) || 0,
      presentDays: Number(body.presentDays) || 0,
      nationalHoliday: Number(body.nationalHoliday) || 0,
      payableDays,
      halfDayPresent: Number(body.halfDayPresent) || 0,
      basic: 0,
      houseRentAllowance: 0,
      overtimeAmount: 0,
      incentive: 0,
      exportAllowance: 0,
      basicSpecialAllowance: 0,
      citySpecialAllowance: 0,
      conveyanceAllowance: 0,
      bonusAllowance: 0,
      specialHeadConveyanceAllowance: 0,
      arrear: 0,
      medicalAllowance: 0,
      leavePayment: 0,
      specialAllowance: 0,
      uniformMaintenanceAllowance: 0,
      otherAllowance: 0,
      leaveEarnings: 0,
      bonusEarnings: 0,
      basicEarned: 0,
      hraEarned: 0,
      totalEarning: 0,
      gross: 0,
      esiApplicableGross: 0,
      pfDeduction: 0,
      esiEmployerContribution: 0,
      esiDeduction: 0,
      haryanaWelfareFund: Number(body.haryanaWelfareFund) || 0,
      labourWelfareFund: Number(body.labourWelfareFund) || 0,
      groupTermLifeInsurance: Number(body.groupTermLifeInsurance) || 0,
      miscellaneousDeduction: Number(body.miscellaneousDeduction) || 0,
      shoesDeduction: Number(body.shoesDeduction) || 0,
      jacketDeduction: Number(body.jacketDeduction) || 0,
      canteenDeduction: Number(body.canteenDeduction) || 0,
      iCardDeduction: Number(body.iCardDeduction) || 0,
      totalDeductions,
      netPayment: 0,
      roundedAmount: 0,
      totalPayable: 0,
      amount: 0,
      remarks: (body.remarks || "").trim(),
      active: body.active !== false,
      bankAccountNumber: (body.bankAccountNumber || "").trim(),
      ifscCode: (body.ifscCode || "").trim(),
      bankName: (body.bankName || "").trim(),
      permanentAddress: (body.permanentAddress || "").trim(),
      aadharNumber: (body.aadharNumber || "").trim(),
      mobileNumber: (body.mobileNumber || "").trim(),
      esiCode: (body.esiCode || "").trim(),
      uan: (body.uan || "").trim(),
      pfNumber: (body.pfNumber || "").trim(),
    };

    const doc = await SalaryComponent.create(payload);
    const salaryComponent = await SalaryComponent.findById(doc._id)
      .populate("company", "name")
      .lean();

    return NextResponse.json(
      {
        message: "Salary component created successfully",
        salaryComponent,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create salary component error:", err);
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
      { message: err.message || "Failed to create salary component" },
      { status: 500 },
    );
  }
}
