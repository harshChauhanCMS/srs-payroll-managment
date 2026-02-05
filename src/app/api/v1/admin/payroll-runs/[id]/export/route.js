import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import connectDB from "@/lib/db";
import PayrollRun from "@/models/PayrollRun";
import { requireViewPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

/**
 * GET /api/v1/admin/payroll-runs/[id]/export
 * Export payroll preview to Excel
 */
export async function GET(request, { params }) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { id } = await params;

    await connectDB();

    const payrollRun = await PayrollRun.findById(id)
      .populate("site", "name siteCode")
      .populate("company", "name")
      .lean();

    if (!payrollRun) {
      return NextResponse.json(
        { message: "Payroll run not found" },
        { status: 404 },
      );
    }

    // HR can only export their site's payroll
    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      if (String(payrollRun.site._id || payrollRun.site) !== String(currentUser.site)) {
        return NextResponse.json(
          { message: "Forbidden" },
          { status: 403 },
        );
      }
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Payroll Preview");

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
      { header: "S.No", key: "sno", width: 8 },
      { header: "Emp Code", key: "employeeCode", width: 15 },
      { header: "Employee Name", key: "employeeName", width: 25 },
      { header: "Payable Days", key: "payableDays", width: 14 },
      { header: "Basic", key: "basic", width: 12 },
      { header: "HRA", key: "hra", width: 12 },
      { header: "Other Allow.", key: "otherAllowance", width: 14 },
      { header: "OT Amount", key: "otAmount", width: 12 },
      { header: "Incentive", key: "incentive", width: 12 },
      { header: "Arrear", key: "arrear", width: 12 },
      { header: "Gross", key: "grossEarning", width: 14 },
      { header: "PF", key: "pfDeduction", width: 12 },
      { header: "ESI", key: "esiDeduction", width: 12 },
      { header: "LWF", key: "lwf", width: 10 },
      { header: "Total Ded.", key: "totalDeductions", width: 14 },
      { header: "Net Pay", key: "netPay", width: 14 },
    ];

    // Apply header style
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Add data rows
    const results = payrollRun.results || [];
    results.forEach((r, idx) => {
      worksheet.addRow({
        sno: idx + 1,
        employeeCode: r.employeeCode || "",
        employeeName: r.employeeName || "",
        payableDays: r.payableDays,
        basic: r.basic,
        hra: r.hra,
        otherAllowance: r.otherAllowance,
        otAmount: r.otAmount,
        incentive: r.incentive,
        arrear: r.arrear,
        grossEarning: r.grossEarning,
        pfDeduction: r.pfDeduction,
        esiDeduction: r.esiDeduction,
        lwf: r.lwf,
        totalDeductions: r.totalDeductions,
        netPay: r.netPay,
      });
    });

    // Add totals row
    const totalsRow = worksheet.addRow({
      sno: "",
      employeeCode: "",
      employeeName: "TOTAL",
      payableDays: "",
      basic: results.reduce((s, r) => s + r.basic, 0),
      hra: results.reduce((s, r) => s + r.hra, 0),
      otherAllowance: results.reduce((s, r) => s + r.otherAllowance, 0),
      otAmount: results.reduce((s, r) => s + r.otAmount, 0),
      incentive: results.reduce((s, r) => s + r.incentive, 0),
      arrear: results.reduce((s, r) => s + r.arrear, 0),
      grossEarning: payrollRun.totalGross,
      pfDeduction: results.reduce((s, r) => s + r.pfDeduction, 0),
      esiDeduction: results.reduce((s, r) => s + r.esiDeduction, 0),
      lwf: results.reduce((s, r) => s + r.lwf, 0),
      totalDeductions: payrollRun.totalDeductions,
      netPay: payrollRun.totalNetPay,
    });

    totalsRow.font = { bold: true };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const siteName = payrollRun.site?.siteCode || payrollRun.site?.name || "Site";
    const fileName = `Payroll_${siteName}_${monthNames[payrollRun.payrollMonth - 1]}_${payrollRun.payrollYear}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("Export payroll run error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to export payroll" },
      { status: 500 },
    );
  }
}
