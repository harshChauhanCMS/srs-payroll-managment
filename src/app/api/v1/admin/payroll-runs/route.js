import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PayrollRun from "@/models/PayrollRun";
import Attendance from "@/models/Attendance";
import SalaryComponent from "@/models/SalaryComponent";
import User from "@/models/User";
import Skill from "@/models/Skill";
import Site from "@/models/Site";
import { requireViewPermission, requireCreatePermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

const STANDARD_WORKING_DAYS = 26;
const PF_RATE = 0.12;
const ESI_RATE = 0.0075;
const ESI_CEILING = 21000;

function round(num) {
  return Math.round(Number(num) || 0);
}

/**
 * GET /api/v1/admin/payroll-runs
 * List payroll runs
 */
export async function GET(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { searchParams } = new URL(request.url);
    const site = searchParams.get("site");
    const company = searchParams.get("company");
    const payrollMonth = searchParams.get("payrollMonth");
    const payrollYear = searchParams.get("payrollYear");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = { active: true };

    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      if (!currentUser.site) {
        return NextResponse.json({
          payrollRuns: [],
          pagination: { page: 1, limit, total: 0, pages: 0 },
        });
      }
      query.site = currentUser.site;
    } else {
      if (site) query.site = site;
      if (company) query.company = company;
    }

    if (payrollMonth) query.payrollMonth = parseInt(payrollMonth, 10);
    if (payrollYear) query.payrollYear = parseInt(payrollYear, 10);
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [payrollRuns, totalCount] = await Promise.all([
      PayrollRun.find(query)
        .select("-results") // Exclude results array for list view
        .populate("site", "name siteCode")
        .populate("company", "name")
        .populate("runBy", "name")
        .populate("reviewedBy", "name")
        .populate("approvedBy", "name")
        .sort({ payrollYear: -1, payrollMonth: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PayrollRun.countDocuments(query),
    ]);

    return NextResponse.json({
      payrollRuns,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("List payroll runs error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch payroll runs" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/admin/payroll-runs
 * Execute a payroll run for a site/month/year
 */
export async function POST(request) {
  try {
    const auth = await requireCreatePermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const body = await request.json();

    const { site: siteId, payrollMonth, payrollYear, settings = {} } = body;

    if (!siteId || !payrollMonth || !payrollYear) {
      return NextResponse.json(
        { message: "site, payrollMonth, and payrollYear are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Validate site
    const site = await Site.findById(siteId).lean();
    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    // HR authorization
    if (currentUser.role === ROLES.HR) {
      if (String(site._id) !== String(currentUser.site)) {
        return NextResponse.json(
          { message: "You can only run payroll for your assigned site." },
          { status: 403 },
        );
      }
    }

    // Check if payroll run already exists
    const existing = await PayrollRun.findOne({
      site: siteId,
      payrollMonth,
      payrollYear,
      active: true,
    });
    if (existing) {
      return NextResponse.json(
        { message: `Payroll run already exists for this site/period (status: ${existing.status}). Delete or lock the existing run first.` },
        { status: 409 },
      );
    }

    // Fetch salary component for this site/period
    const salaryComponent = await SalaryComponent.findOne({
      site: siteId,
      payrollMonth,
      payrollYear,
      active: true,
    }).lean();

    // Fetch attendance records
    const attendanceRecords = await Attendance.find({
      site: siteId,
      payrollMonth,
      payrollYear,
      active: true,
    }).lean();

    if (attendanceRecords.length === 0) {
      return NextResponse.json(
        { message: "No attendance records found for this site/period. Please import attendance first." },
        { status: 400 },
      );
    }

    // Fetch employees with their skills
    const employeeIds = attendanceRecords.map((a) => a.employee);
    const employeeQuery = { _id: { $in: employeeIds }, active: true, softDelete: false };
    if (settings.activeDeploymentsOnly !== false) {
      employeeQuery.active = true;
    }

    const employees = await User.find(employeeQuery)
      .populate("skills")
      .select("_id name employeeCode skills pfApplicable esiApplicable pfPercentage esiPercentage bankName accountNumber ifscCode uan pfNumber esiCode")
      .lean();

    const employeeMap = {};
    for (const emp of employees) {
      employeeMap[String(emp._id)] = emp;
    }

    // Count exceptions
    let exceptionCount = 0;
    const results = [];

    for (const att of attendanceRecords) {
      const emp = employeeMap[String(att.employee)];
      if (!emp) continue;

      // Check for exceptions
      const hasException =
        !emp.bankName || !emp.accountNumber || !emp.ifscCode ||
        (emp.pfApplicable && !emp.uan && !emp.pfNumber) ||
        (emp.esiApplicable && !emp.esiCode) ||
        att.payableDays <= 0;

      if (hasException) {
        exceptionCount++;
        if (settings.skipExceptions) continue;
      }

      // Get salary rates from employee's first skill
      const skill = Array.isArray(emp.skills) && emp.skills.length > 0 ? emp.skills[0] : null;
      const basicRate = skill?.basic || 0;
      const hraRate = skill?.houseRentAllowance || 0;
      const otherRate = skill?.otherAllowance || 0;

      // Calculate earnings
      const payableDays = att.payableDays || 0;
      const basicEarned = round((basicRate / STANDARD_WORKING_DAYS) * payableDays);
      const hraEarned = round((hraRate / STANDARD_WORKING_DAYS) * payableDays);
      const otherEarned = round((otherRate / STANDARD_WORKING_DAYS) * payableDays);

      // OT amount: (basic / 26 / 8) * 2 * OT_hours
      const otHours = att.otHours || 0;
      const otAmount = round((basicRate / STANDARD_WORKING_DAYS / 8) * 2 * otHours);

      const incentive = att.incentive || 0;
      const arrear = att.arrear || 0;

      const grossEarning = basicEarned + hraEarned + otherEarned + otAmount + incentive + arrear;

      // Calculate deductions
      let pfDeduction = 0;
      if (emp.pfApplicable && settings.autoCalculateStatutory !== false) {
        const pfRate = emp.pfPercentage ? emp.pfPercentage / 100 : PF_RATE;
        pfDeduction = round(basicEarned * pfRate);
      }

      let esiDeduction = 0;
      if (emp.esiApplicable && settings.autoCalculateStatutory !== false) {
        const esiRate = emp.esiPercentage ? emp.esiPercentage / 100 : ESI_RATE;
        if (grossEarning < ESI_CEILING) {
          esiDeduction = round(grossEarning * esiRate);
        }
      }

      const lwf = salaryComponent?.labourWelfareFund || 0;
      const totalDeductions = pfDeduction + esiDeduction + lwf;
      let netPay = grossEarning - totalDeductions;

      if (settings.applyRounding !== false) {
        netPay = round(netPay);
      }

      results.push({
        employee: emp._id,
        employeeName: emp.name,
        employeeCode: emp.employeeCode || "",
        basic: basicEarned,
        hra: hraEarned,
        otherAllowance: otherEarned,
        otAmount,
        incentive,
        arrear,
        grossEarning,
        pfDeduction,
        esiDeduction,
        lwf,
        totalDeductions,
        netPay,
        payableDays,
        otHours,
      });
    }

    // Calculate summary
    const totalGross = results.reduce((sum, r) => sum + r.grossEarning, 0);
    const totalDed = results.reduce((sum, r) => sum + r.totalDeductions, 0);
    const totalNet = results.reduce((sum, r) => sum + r.netPay, 0);

    // Create payroll run
    const payrollRun = await PayrollRun.create({
      site: siteId,
      company: site.company,
      payrollMonth,
      payrollYear,
      status: "draft",
      settings: {
        activeDeploymentsOnly: settings.activeDeploymentsOnly !== false,
        autoCalculateStatutory: settings.autoCalculateStatutory !== false,
        skipExceptions: !!settings.skipExceptions,
        applyRounding: settings.applyRounding !== false,
      },
      results,
      totalEmployees: results.length,
      totalGross,
      totalDeductions: totalDed,
      totalNetPay: totalNet,
      exceptionCount,
      runBy: currentUser._id,
      runAt: new Date(),
    });

    const populated = await PayrollRun.findById(payrollRun._id)
      .populate("site", "name siteCode")
      .populate("company", "name")
      .populate("runBy", "name")
      .lean();

    return NextResponse.json(
      {
        message: `Payroll run created successfully. ${results.length} employees processed, ${exceptionCount} exceptions found.`,
        payrollRun: populated,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create payroll run error:", err);
    if (err.code === 11000) {
      return NextResponse.json(
        { message: "A payroll run already exists for this site/period." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: err.message || "Failed to create payroll run" },
      { status: 500 },
    );
  }
}
