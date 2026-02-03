import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SalaryComponent from "@/models/SalaryComponent";
import Site from "@/models/Site";
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

const DAY_KEYS = [
  "totalDays",
  "workingDays",
  "nationalHoliday",
  "overtimeDays",
  "presentDays",
  "payableDays",
  "halfDayPresent",
];
const ALLOWANCE_KEYS = [
  "houseRentAllowance",
  "overtimeAmount",
  "incentive",
  "exportAllowance",
  "basicSpecialAllowance",
  "citySpecialAllowance",
  "conveyanceAllowance",
  "bonusAllowance",
  "specialHeadConveyanceAllowance",
  "arrear",
  "medicalAllowance",
  "leavePayment",
  "specialAllowance",
  "uniformMaintenanceAllowance",
  "otherAllowance",
  "leaveEarnings",
  "bonusEarnings",
];
const DEDUCTION_KEYS = [
  "pfPercentage",
  "esiDeduction",
  "haryanaWelfareFund",
  "labourWelfareFund",
  "groupTermLifeInsurance",
  "miscellaneousDeduction",
  "shoesDeduction",
  "jacketDeduction",
  "canteenDeduction",
  "iCardDeduction",
  "totalDeductions",
];

/**
 * GET /api/v1/admin/salary-components
 */
export async function GET(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { searchParams } = new URL(request.url);
    const site = searchParams.get("site");
    const company = searchParams.get("company");
    const payrollYear = searchParams.get("payrollYear");
    const payrollMonth = searchParams.get("payrollMonth");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};

    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      if (!currentUser.site) {
        return NextResponse.json({
          salaryComponents: [],
          pagination: { page: 1, limit, total: 0, pages: 0 },
        });
      }
      query.site = currentUser.site;
    } else {
      if (site) {
        query.site = site;
      } else if (company) {
        const sites = await Site.find({ company, active: true }).select("_id").lean();
        if (sites.length > 0) {
          query.site = { $in: sites.map((s) => s._id) };
        } else {
          return NextResponse.json({
            salaryComponents: [],
            pagination: { page: 1, limit, total: 0, pages: 0 },
          });
        }
      }
    }
    if (payrollYear) query.payrollYear = parseInt(payrollYear, 10);
    if (payrollMonth) query.payrollMonth = parseInt(payrollMonth, 10);

    const skip = (page - 1) * limit;

    const [salaryComponents, totalCount] = await Promise.all([
      SalaryComponent.find(query)
        .populate("site", "name siteCode address")
        .populate({ path: "site", populate: { path: "company", select: "name" } })
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

    if (currentUser.role === ROLES.HR && !currentUser.permissions?.create) {
      return NextResponse.json(
        {
          message:
            "Forbidden. You do not have permission to create salary components.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    if (!body.site) {
      return NextResponse.json(
        { message: "Site is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const site = await Site.findById(body.site).lean();
    if (!site) {
      return NextResponse.json(
        { message: "Site not found" },
        { status: 404 },
      );
    }

    if (currentUser.role === ROLES.HR) {
      if (
        !currentUser.company ||
        String(site.company) !== String(currentUser.company)
      ) {
        return NextResponse.json(
          {
            message: "You can only create salary components for sites in your company.",
          },
          { status: 403 },
        );
      }
      if (
        !currentUser.site ||
        String(site._id) !== String(currentUser.site)
      ) {
        return NextResponse.json(
          {
            message: "You can only create salary components for your assigned site.",
          },
          { status: 403 },
        );
      }
    }

    const payableDays = getPayableDays(body);
    const totalDeductionsSum =
      safeNum(body.esiDeduction) +
      safeNum(body.haryanaWelfareFund) +
      safeNum(body.labourWelfareFund) +
      safeNum(body.groupTermLifeInsurance) +
      safeNum(body.miscellaneousDeduction) +
      safeNum(body.shoesDeduction) +
      safeNum(body.jacketDeduction) +
      safeNum(body.canteenDeduction) +
      safeNum(body.iCardDeduction);

    const now = new Date();
    const payload = {
      site: body.site,
      company: site.company,
      payrollMonth: body.payrollMonth ?? now.getMonth() + 1,
      payrollYear: body.payrollYear ?? now.getFullYear(),
      active: body.active !== false,
    };
    DAY_KEYS.forEach((k) => {
      payload[k] = k === "payableDays" ? payableDays : safeNum(body[k]);
    });
    ALLOWANCE_KEYS.forEach((k) => {
      payload[k] = safeNum(body[k]);
    });
    DEDUCTION_KEYS.filter((k) => k !== "totalDeductions").forEach((k) => {
      payload[k] = safeNum(body[k]);
    });
    payload.totalDeductions = totalDeductionsSum;

    const doc = await SalaryComponent.create(payload);
    const salaryComponent = await SalaryComponent.findById(doc._id)
      .populate("site", "name siteCode address")
      .populate({ path: "site", populate: { path: "company", select: "name" } })
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
