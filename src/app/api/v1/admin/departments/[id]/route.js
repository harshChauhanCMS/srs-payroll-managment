import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Department from "@/models/Department";

/**
 * GET /api/v1/admin/departments/[id]
 * Get a single department by ID
 */
export async function GET(request, { params }) {
  try {
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
 * Update department details
 */
export async function PUT(request, { params }) {
  try {
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
 * Soft delete department (set active = false)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const department = await Department.findById(id);

    if (!department) {
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 },
      );
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
