import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SalarySheetTemplate from "@/models/SalarySheetTemplate";
import { requireViewPermission, requireEditPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

/**
 * GET /api/v1/admin/salary-sheet-templates/[id]/columns
 * Get column mappings for a template
 */
export async function GET(request, { params }) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    await connectDB();

    const template = await SalarySheetTemplate.findById(id).lean();
    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Sort by order
    const columns = (template.columnMappings || []).sort(
      (a, b) => a.order - b.order
    );

    return NextResponse.json({ columns });
  } catch (err) {
    console.error("GET column mappings error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch column mappings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/salary-sheet-templates/[id]/columns
 * Save column mappings for a template
 */
export async function POST(request, { params }) {
  try {
    const auth = await requireEditPermission(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const { columns } = body;

    if (!Array.isArray(columns)) {
      return NextResponse.json(
        { message: "Columns must be an array" },
        { status: 400 }
      );
    }

    await connectDB();
    const template = await SalarySheetTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Authorization check for HR
    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR) {
      if (String(template.company) !== String(currentUser.company)) {
        return NextResponse.json(
          { message: "You can only edit templates for your company" },
          { status: 403 }
        );
      }
    }

    // Replace column mappings
    template.columnMappings = columns.map((col, idx) => ({
      order: col.order !== undefined ? col.order : idx + 1,
      excelColumnHeader: col.excelColumnHeader,
      dataType: col.dataType || "TEXT",
      sourceType: col.sourceType,
      sourceKey: col.sourceKey,
      roundTo: col.roundTo || "NONE",
      defaultValue: col.defaultValue || "",
      active: col.active !== false,
    }));

    template.updatedBy = currentUser._id;
    await template.save();

    return NextResponse.json({
      message: "Column mappings saved successfully",
      columns: template.columnMappings,
    });
  } catch (err) {
    console.error("POST column mappings error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to save column mappings" },
      { status: 500 }
    );
  }
}
