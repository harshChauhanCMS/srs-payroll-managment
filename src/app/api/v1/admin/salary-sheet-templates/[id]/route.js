import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SalarySheetTemplate from "@/models/SalarySheetTemplate";
import {
  requireViewPermission,
  requireEditPermission,
  requireDeletePermission,
} from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

/**
 * GET /api/v1/admin/salary-sheet-templates/[id]
 * Get a single template by ID
 */
export async function GET(request, { params }) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    await connectDB();

    const template = await SalarySheetTemplate.findById(id)
      .populate("company", "name")
      .populate("site", "name siteCode")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .lean();

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Authorization check for HR
    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR) {
      if (
        String(template.company._id || template.company) !==
        String(currentUser.company)
      ) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ template });
  } catch (err) {
    console.error("GET template error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch template" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/admin/salary-sheet-templates/[id]
 * Update a template
 */
export async function PUT(request, { params }) {
  try {
    const auth = await requireEditPermission(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const currentUser = auth.user;

    await connectDB();
    const template = await SalarySheetTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Authorization check for HR
    if (currentUser.role === ROLES.HR) {
      if (String(template.company) !== String(currentUser.company)) {
        return NextResponse.json(
          { message: "You can only edit templates for your company" },
          { status: 403 }
        );
      }
    }

    // Update fields
    if (body.templateName !== undefined)
      template.templateName = body.templateName.trim();
    if (body.company !== undefined) template.company = body.company;
    if (body.site !== undefined) template.site = body.site || null;
    if (body.outputFilenamePattern !== undefined)
      template.outputFilenamePattern = body.outputFilenamePattern.trim();
    if (body.sheetName !== undefined)
      template.sheetName = body.sheetName.trim();
    if (body.active !== undefined) template.active = body.active;

    template.updatedBy = currentUser._id;

    await template.save();

    const populated = await SalarySheetTemplate.findById(template._id)
      .populate("company", "name")
      .populate("site", "name siteCode")
      .lean();

    return NextResponse.json({
      message: "Template updated successfully",
      template: populated,
    });
  } catch (err) {
    console.error("PUT template error:", err);
    if (err.code === 11000) {
      return NextResponse.json(
        { message: "Template name already exists for this company" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: err.message || "Failed to update template" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/salary-sheet-templates/[id]
 * Delete a template
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await requireDeletePermission(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const currentUser = auth.user;

    await connectDB();
    const template = await SalarySheetTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Authorization check for HR
    if (currentUser.role === ROLES.HR) {
      if (String(template.company) !== String(currentUser.company)) {
        return NextResponse.json(
          { message: "You can only delete templates for your company" },
          { status: 403 }
        );
      }
    }

    await SalarySheetTemplate.findByIdAndDelete(id);

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (err) {
    console.error("DELETE template error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}
