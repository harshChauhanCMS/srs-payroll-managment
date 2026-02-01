import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Department from "@/models/Department";
import { ROLES } from "@/constants/roles";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

/**
 * GET /api/v1/admin/departments/[id]
 * Get a single department by ID (HR: only their company's departments)
 */
export async function GET(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { id } = await params;

    await connectDB();

    const department = await Department.findById(id)
      .populate("company", "name")
      .populate("site", "name siteCode")
      .lean();

    if (!department) {
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 },
      );
    }

    if (auth.user.role === ROLES.HR) {
      const deptCompanyId = department.company?._id ?? department.company;
      if (!auth.user.company || String(deptCompanyId) !== String(auth.user.company)) {
        return NextResponse.json(
          { message: "Forbidden. You can only view departments in your company." },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ department });
  } catch (err) {
    console.error("Get department error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch department" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/v1/admin/departments/[id]
 * Update department details (HR: only their company and permissions.edit)
 */
export async function PUT(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.edit) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to edit departments." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const { name, code, company, site, description, active } = body;

    await connectDB();

    const department = await Department.findById(id);

    if (!department) {
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 },
      );
    }

    if (currentUser.role === ROLES.HR) {
      if (!currentUser.company || String(department.company) !== String(currentUser.company)) {
        return NextResponse.json(
          { message: "Forbidden. You can only edit departments in your company." },
          { status: 403 },
        );
      }
      if (company !== undefined && String(company) !== String(currentUser.company)) {
        return NextResponse.json(
          { message: "Forbidden. You cannot assign departments to another company." },
          { status: 403 },
        );
      }
    }

    // Check if code is being changed and if new code already exists
    if (code && code.trim().toUpperCase() !== department.code) {
      const existing = await Department.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Department with this code already exists" },
          { status: 409 },
        );
      }
    }

    // Update fields if provided
    if (name !== undefined) department.name = name.trim();
    if (code !== undefined) department.code = code.trim().toUpperCase();
    if (company !== undefined) department.company = company;
    if (site !== undefined) department.site = site;
    if (description !== undefined) department.description = description.trim();
    if (active !== undefined) department.active = active;

    await department.save();

    // Populate for response
    await department.populate("company", "name");
    await department.populate("site", "name siteCode");

    return NextResponse.json({
      message: "Department updated successfully",
      department,
    });
  } catch (err) {
    console.error("Update department error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to update department" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/admin/departments/[id]
 * Soft delete department (HR: only their company and permissions.delete)
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.delete) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to deactivate departments." },
        { status: 403 },
      );
    }

    const { id } = await params;

    await connectDB();

    const department = await Department.findById(id);

    if (!department) {
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 },
      );
    }

    if (currentUser.role === ROLES.HR) {
      if (!currentUser.company || String(department.company) !== String(currentUser.company)) {
        return NextResponse.json(
          { message: "Forbidden. You can only deactivate departments in your company." },
          { status: 403 },
        );
      }
    }

    // Soft delete
    department.active = false;
    await department.save();

    return NextResponse.json({
      message: "Department deactivated successfully",
    });
  } catch (err) {
    console.error("Delete department error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete department" },
      { status: 500 },
    );
  }
}
