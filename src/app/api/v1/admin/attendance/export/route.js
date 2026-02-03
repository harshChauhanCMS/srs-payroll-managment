import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Site from "@/models/Site";
import { requireViewPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

/**
 * GET /api/v1/admin/attendance/export
 * Export attendance data to Excel or generate a blank template
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
    const templateOnly = searchParams.get("template") === "true";

    if (!siteId || !payrollMonth || !payrollYear) {
      return NextResponse.json(
        { message: "site, payrollMonth, and payrollYear are required" },
        { status: 400 },
      );
    }

    // HR can only export their site
    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      siteId = String(currentUser.site);
    }

    await connectDB();

    const site = await Site.findById(siteId).lean();
    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    // Get employees at site
    const employees = await User.find({
      site: siteId,
      active: true,
      softDelete: false,
    })
      .select("_id name employeeCode")
      .sort({ employeeCode: 1 })
      .lean();

    // Get existing attendance (if not template only)
    let attendanceMap = {};
    if (!templateOnly) {
      const records = await Attendance.find({
        site: siteId,
        payrollMonth,
        payrollYear,
        active: true,
      }).lean();
      for (const r of records) {
        attendanceMap[String(r.employee)] = r;
      }
    }

    // Build Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    // Header style
    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } },
      alignment: { horizontal: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    worksheet.columns = [
      { header: "Employee Code", key: "employeeCode", width: 18 },
      { header: "Employee Name", key: "employeeName", width: 25 },
      { header: "Working Days", key: "workingDays", width: 15 },
      { header: "Present Days", key: "presentDays", width: 15 },
      { header: "Payable Days", key: "payableDays", width: 15 },
      { header: "Leave Days", key: "leaveDays", width: 13 },
      { header: "OT Hours", key: "otHours", width: 12 },
      { header: "Incentive", key: "incentive", width: 12 },
      { header: "Arrear", key: "arrear", width: 12 },
    ];

    // Apply header style
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Add data rows
    for (const emp of employees) {
      const att = attendanceMap[String(emp._id)] || {};
      worksheet.addRow({
        employeeCode: emp.employeeCode || "",
        employeeName: emp.name || "",
        workingDays: templateOnly ? "" : (att.workingDays || 0),
        presentDays: templateOnly ? "" : (att.presentDays || 0),
        payableDays: templateOnly ? "" : (att.payableDays || 0),
        leaveDays: templateOnly ? "" : (att.leaveDays || 0),
        otHours: templateOnly ? "" : (att.otHours || 0),
        incentive: templateOnly ? "" : (att.incentive || 0),
        arrear: templateOnly ? "" : (att.arrear || 0),
      });
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fileName = `Attendance_${site.siteCode || site.name}_${monthNames[payrollMonth - 1]}_${payrollYear}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Export attendance error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to export attendance" },
      { status: 500 },
    );
  }
}
