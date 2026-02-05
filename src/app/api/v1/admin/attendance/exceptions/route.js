import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { requireViewPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

const OT_HOURS_THRESHOLD = 50;

/**
 * GET /api/v1/admin/attendance/exceptions
 * Identify data quality issues for a site/month/year
 */
export async function GET(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { searchParams } = new URL(request.url);
    let siteId = searchParams.get("site");
    const payrollMonth = parseInt(searchParams.get("payrollMonth"), 10);
    const payrollYear = parseInt(searchParams.get("payrollYear"), 10);

    if (!payrollMonth || !payrollYear) {
      return NextResponse.json(
        { message: "payrollMonth and payrollYear are required" },
        { status: 400 },
      );
    }

    // HR can only see their site
    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      siteId = String(currentUser.site);
    }

    if (!siteId) {
      return NextResponse.json(
        { message: "site is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Fetch all employees at this site
    const employees = await User.find({
      site: siteId,
      active: true,
      softDelete: false,
    })
      .select("_id name employeeCode bankName accountNumber ifscCode pfApplicable esiApplicable uan pfNumber esiCode")
      .lean();

    // Fetch attendance records
    const attendanceRecords = await Attendance.find({
      site: siteId,
      payrollMonth,
      payrollYear,
      active: true,
    }).lean();

    const attendanceMap = {};
    for (const a of attendanceRecords) {
      attendanceMap[String(a.employee)] = a;
    }

    const exceptions = {
      missingBankDetails: [],
      missingStatutoryInfo: [],
      negativePayable: [],
      outlierOT: [],
      noAttendance: [],
    };

    for (const emp of employees) {
      const empId = String(emp._id);
      const attendance = attendanceMap[empId];

      // 1. Missing bank details
      if (!emp.bankName || !emp.accountNumber || !emp.ifscCode) {
        const missing = [];
        if (!emp.bankName) missing.push("Bank Name");
        if (!emp.accountNumber) missing.push("Account Number");
        if (!emp.ifscCode) missing.push("IFSC Code");
        exceptions.missingBankDetails.push({
          employeeId: emp._id,
          employeeCode: emp.employeeCode || "—",
          employeeName: emp.name,
          issue: `Missing: ${missing.join(", ")}`,
        });
      }

      // 2. Missing statutory info
      if (emp.pfApplicable && (!emp.uan && !emp.pfNumber)) {
        exceptions.missingStatutoryInfo.push({
          employeeId: emp._id,
          employeeCode: emp.employeeCode || "—",
          employeeName: emp.name,
          issue: "PF applicable but UAN/PF Number missing",
        });
      }
      if (emp.esiApplicable && !emp.esiCode) {
        exceptions.missingStatutoryInfo.push({
          employeeId: emp._id,
          employeeCode: emp.employeeCode || "—",
          employeeName: emp.name,
          issue: "ESI applicable but ESI Code missing",
        });
      }

      // 3. No attendance record
      if (!attendance) {
        exceptions.noAttendance.push({
          employeeId: emp._id,
          employeeCode: emp.employeeCode || "—",
          employeeName: emp.name,
          issue: "No attendance record for this period",
        });
        continue;
      }

      // 4. Negative or zero payable days
      if (attendance.payableDays <= 0) {
        exceptions.negativePayable.push({
          employeeId: emp._id,
          employeeCode: emp.employeeCode || "—",
          employeeName: emp.name,
          issue: `Payable days: ${attendance.payableDays}`,
          value: attendance.payableDays,
        });
      }

      // 5. Outlier OT hours
      if (attendance.otHours > OT_HOURS_THRESHOLD) {
        exceptions.outlierOT.push({
          employeeId: emp._id,
          employeeCode: emp.employeeCode || "—",
          employeeName: emp.name,
          issue: `OT hours: ${attendance.otHours} (threshold: ${OT_HOURS_THRESHOLD})`,
          value: attendance.otHours,
        });
      }
    }

    const totalExceptions =
      exceptions.missingBankDetails.length +
      exceptions.missingStatutoryInfo.length +
      exceptions.negativePayable.length +
      exceptions.outlierOT.length +
      exceptions.noAttendance.length;

    return NextResponse.json({
      exceptions,
      summary: {
        total: totalExceptions,
        missingBankDetails: exceptions.missingBankDetails.length,
        missingStatutoryInfo: exceptions.missingStatutoryInfo.length,
        negativePayable: exceptions.negativePayable.length,
        outlierOT: exceptions.outlierOT.length,
        noAttendance: exceptions.noAttendance.length,
      },
    });
  } catch (err) {
    console.error("Attendance exceptions error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch exceptions" },
      { status: 500 },
    );
  }
}
