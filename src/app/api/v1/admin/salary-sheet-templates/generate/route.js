import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import connectDB from "@/lib/db";
import SalarySheetTemplate from "@/models/SalarySheetTemplate";
import PayrollRun from "@/models/PayrollRun";
import User from "@/models/User";
import { requireViewPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * POST /api/v1/admin/salary-sheet-templates/generate
 * Generate salary sheet from template and payroll run
 */
export async function POST(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const body = await request.json();
    const { templateId, payrollRunId, exportType } = body;

    if (!templateId || !payrollRunId) {
      return NextResponse.json(
        { message: "Template ID and Payroll Run ID are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch template
    const template = await SalarySheetTemplate.findById(templateId)
      .populate("company", "name")
      .populate("site", "name siteCode")
      .lean();

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Fetch payroll run
    const payrollRun = await PayrollRun.findById(payrollRunId)
      .populate("site", "name siteCode")
      .populate("company", "name")
      .lean();

    if (!payrollRun) {
      return NextResponse.json(
        { message: "Payroll run not found" },
        { status: 404 }
      );
    }

    // Authorization: HR can only generate for their site
    if (currentUser.role === ROLES.HR) {
      if (
        String(payrollRun.site._id || payrollRun.site) !==
        String(currentUser.site)
      ) {
        return NextResponse.json(
          { message: "You can only generate salary sheets for your site" },
          { status: 403 }
        );
      }
    }

    // Only allow generation for approved/locked payrolls
    if (!["approved", "locked"].includes(payrollRun.status)) {
      return NextResponse.json(
        {
          message:
            "Can only generate salary sheets for approved or locked payrolls",
        },
        { status: 400 }
      );
    }

    // Fetch all employees for this payroll run
    const employeeIds = payrollRun.results
      .map((r) => r.employee)
      .filter(Boolean);
    const employees = await User.find({ _id: { $in: employeeIds } }).lean();
    const employeeMap = {};
    employees.forEach((emp) => {
      employeeMap[String(emp._id)] = emp;
    });

    // Generate Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(template.sheetName);

    // Header styling
    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      },
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    // Get active column mappings sorted by order
    const columns = template.columnMappings
      .filter((col) => col.active !== false)
      .sort((a, b) => a.order - b.order);

    // Set up columns
    worksheet.columns = columns.map((col) => ({
      header: col.excelColumnHeader,
      key: `col_${col.order}`,
      width: 15,
    }));

    // Apply header style
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Generate data rows
    payrollRun.results.forEach((result, rowIdx) => {
      const employee = employeeMap[String(result.employee)] || {};
      const rowData = {};

      columns.forEach((col) => {
        const value = resolveColumnValue(
          col,
          result,
          employee,
          payrollRun,
          exportType,
          rowIdx + 2
        );
        rowData[`col_${col.order}`] = value;
      });

      const row = worksheet.addRow(rowData);

      // Apply number formatting for NUMBER type columns
      columns.forEach((col, colIdx) => {
        if (col.dataType === "NUMBER") {
          row.getCell(colIdx + 1).numFmt = "#,##0";
        }
      });
    });

    // Generate filename
    const filename = generateFilename(
      template.outputFilenamePattern,
      payrollRun.payrollMonth,
      payrollRun.payrollYear,
      payrollRun.site
    );

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Generate salary sheet error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to generate salary sheet" },
      { status: 500 }
    );
  }
}

/**
 * Helper: Resolve column value based on source type
 */
function resolveColumnValue(
  column,
  result,
  employee,
  payrollRun,
  exportType,
  rowNumber
) {
  let value = null;

  try {
    switch (column.sourceType) {
      case "EMPLOYEE":
        // e.g., "employee.employeeCode", "employee.name"
        const empField = column.sourceKey.replace("employee.", "");
        value = employee[empField];
        break;

      case "PAYROLL_COMPONENT":
        // e.g., "component:basic", "component:hra"
        const componentKey = column.sourceKey.replace("component:", "");
        value = result[componentKey];
        break;

      case "PAYROLL_SUMMARY":
        // e.g., "summary:grossEarning", "summary:netPay"
        const summaryKey = column.sourceKey.replace("summary:", "");
        value = result[summaryKey];
        break;

      case "FORMULA":
        // e.g., "={B}+{C}" (simple column references)
        if (exportType === "WITH_FORMULAS") {
          // Replace placeholders like {B}, {C} with actual row references
          value = {
            formula: column.sourceKey.replace(/\{(\w+)\}/g, `$1${rowNumber}`),
          };
        } else {
          // For VALUES_ONLY, use default value
          value = column.defaultValue || 0;
        }
        break;

      default:
        value = column.defaultValue;
    }
  } catch (err) {
    console.error(`Error resolving column ${column.excelColumnHeader}:`, err);
    value = column.defaultValue;
  }

  // Handle null/undefined
  if (value === null || value === undefined) {
    value =
      column.defaultValue || (column.dataType === "NUMBER" ? 0 : "");
  }

  // Apply rounding for numbers
  if (
    column.dataType === "NUMBER" &&
    typeof value === "number" &&
    column.roundTo !== "NONE"
  ) {
    switch (column.roundTo) {
      case "NEAREST_1":
        value = Math.round(value);
        break;
      case "NEAREST_10":
        value = Math.round(value / 10) * 10;
        break;
      default:
        // NONE - keep as is
        break;
    }
  }

  return value;
}

/**
 * Helper: Generate filename from pattern
 */
function generateFilename(pattern, month, year, site) {
  const monthName = MONTH_NAMES[month - 1] || "Unknown";
  const siteName = site?.siteCode || site?.name || "Site";

  return pattern
    .replace(/\{MMM\}/g, monthName)
    .replace(/\{YYYY\}/g, String(year))
    .replace(/\{MM\}/g, String(month).padStart(2, "0"))
    .replace(/\{SITE\}/g, siteName);
}
