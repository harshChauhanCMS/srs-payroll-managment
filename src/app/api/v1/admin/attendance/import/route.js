import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Site from "@/models/Site";
import { requireCreatePermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

/**
 * POST /api/v1/admin/attendance/import
 * Import attendance data from an Excel file
 */
export async function POST(request) {
  try {
    const auth = await requireCreatePermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const formData = await request.formData();
    const file = formData.get("file");
    const siteId = formData.get("site");
    const payrollMonth = parseInt(formData.get("payrollMonth"), 10);
    const payrollYear = parseInt(formData.get("payrollYear"), 10);

    if (!file || !siteId || !payrollMonth || !payrollYear) {
      return NextResponse.json(
        { message: "File, site, payroll month, and payroll year are required" },
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
          { message: "You can only import attendance for your assigned site." },
          { status: 403 },
        );
      }
    }

    // Get all employees at this site
    const employees = await User.find({
      site: siteId,
      active: true,
      softDelete: false,
    })
      .select("_id name employeeCode")
      .lean();

    const employeeMap = {};
    for (const emp of employees) {
      if (emp.employeeCode) {
        employeeMap[emp.employeeCode.trim().toUpperCase()] = emp;
      }
    }

    // Parse Excel
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json(
        { message: "No worksheet found in the uploaded file" },
        { status: 400 },
      );
    }

    const imported = [];
    const skipped = [];
    const errors = [];

    // Expected columns (header row 1):
    // Employee Code | Employee Name | Working Days | Present Days | Payable Days | Leave Days | OT Hours | Incentive | Arrear
    const headerRow = worksheet.getRow(1);
    const headers = [];
    headerRow.eachCell((cell) => {
      headers.push(String(cell.value || "").trim().toLowerCase());
    });

    // Map column indices
    const colMap = {};
    const expectedCols = [
      { key: "employeeCode", aliases: ["employee code", "emp code", "empcode", "code"] },
      { key: "employeeName", aliases: ["employee name", "emp name", "empname", "name"] },
      { key: "workingDays", aliases: ["working days", "workingdays", "total working days"] },
      { key: "presentDays", aliases: ["present days", "presentdays"] },
      { key: "payableDays", aliases: ["payable days", "payabledays"] },
      { key: "leaveDays", aliases: ["leave days", "leavedays", "leaves"] },
      { key: "otHours", aliases: ["ot hours", "othours", "overtime hours", "ot"] },
      { key: "incentive", aliases: ["incentive"] },
      { key: "arrear", aliases: ["arrear", "arrears"] },
    ];

    for (const col of expectedCols) {
      const idx = headers.findIndex((h) => col.aliases.includes(h));
      if (idx !== -1) {
        colMap[col.key] = idx + 1; // ExcelJS uses 1-based indices
      }
    }

    if (!colMap.employeeCode) {
      return NextResponse.json(
        { message: "Employee Code column not found in the uploaded file. Expected header: 'Employee Code'" },
        { status: 400 },
      );
    }

    // Process data rows
    for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);
      const empCode = String(row.getCell(colMap.employeeCode).value || "").trim().toUpperCase();

      if (!empCode) continue; // Skip empty rows

      const employee = employeeMap[empCode];
      if (!employee) {
        errors.push({
          row: rowNum,
          employeeCode: empCode,
          message: "Employee not found at this site",
        });
        skipped.push(empCode);
        continue;
      }

      const safeNum = (colKey) => {
        if (!colMap[colKey]) return 0;
        const val = row.getCell(colMap[colKey]).value;
        const n = Number(val);
        return Number.isNaN(n) ? 0 : n;
      };

      const data = {
        employee: employee._id,
        site: siteId,
        company: site.company,
        payrollMonth,
        payrollYear,
        workingDays: safeNum("workingDays"),
        presentDays: safeNum("presentDays"),
        payableDays: safeNum("payableDays"),
        leaveDays: safeNum("leaveDays"),
        otHours: safeNum("otHours"),
        incentive: safeNum("incentive"),
        arrear: safeNum("arrear"),
        importedAt: new Date(),
        importedBy: currentUser._id,
      };

      try {
        await Attendance.findOneAndUpdate(
          {
            employee: employee._id,
            site: siteId,
            payrollMonth,
            payrollYear,
          },
          { $set: data },
          { upsert: true, new: true },
        );
        imported.push(empCode);
      } catch (upsertErr) {
        errors.push({
          row: rowNum,
          employeeCode: empCode,
          message: upsertErr.message,
        });
        skipped.push(empCode);
      }
    }

    return NextResponse.json({
      message: `Import complete. ${imported.length} records imported, ${skipped.length} skipped.`,
      imported: imported.length,
      skipped: skipped.length,
      errors,
    });
  } catch (err) {
    console.error("Import attendance error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to import attendance" },
      { status: 500 },
    );
  }
}
