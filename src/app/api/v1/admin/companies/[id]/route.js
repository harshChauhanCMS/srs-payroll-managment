import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import { ROLES } from "@/constants/roles";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

/**
 * GET /api/v1/admin/companies/[id]
 * Get single company (HR: only their company)
 */
export async function GET(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { id } = await params;

    if (auth.user.role === ROLES.HR) {
      if (!auth.user.company || String(auth.user.company) !== String(id)) {
        return NextResponse.json(
          { message: "Forbidden. You can only view your own company." },
          { status: 403 },
        );
      }
    }

    await connectDB();

    const company = await Company.findById(id).lean();

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ company });
  } catch (err) {
    console.error("Get company error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch company" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/v1/admin/companies/[id]
 * Update company details (HR: only their company and permissions.edit)
 */
export async function PUT(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.edit) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to edit companies." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, gstNumber, pan, address, active } = body;

    if (currentUser.role === ROLES.HR) {
      if (!currentUser.company || String(currentUser.company) !== String(id)) {
        return NextResponse.json(
          { message: "Forbidden. You can only edit your own company." },
          { status: 403 },
        );
      }
    }

    await connectDB();
    const company = await Company.findById(id);

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 },
      );
    }

    if (name) company.name = name.trim();
    if (gstNumber !== undefined) company.gstNumber = gstNumber.trim();
    if (pan !== undefined) company.pan = pan.trim();
    if (address !== undefined) company.address = address.trim();
    if (active !== undefined) company.active = active;

    await company.save();

    return NextResponse.json({
      message: "Company updated successfully",
      company,
    });
  } catch (err) {
    console.error("Update company error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to update company" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/admin/companies/[id]
 * Soft delete company (HR: only their company and permissions.delete)
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.delete) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to deactivate companies." },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (currentUser.role === ROLES.HR) {
      if (!currentUser.company || String(currentUser.company) !== String(id)) {
        return NextResponse.json(
          { message: "Forbidden. You can only deactivate your own company." },
          { status: 403 },
        );
      }
    }

    await connectDB();

    const company = await Company.findById(id);

    if (!company) {
      return NextResponse.json(
        { message: "Company not found" },
        { status: 404 },
      );
    }

    company.active = false;
    await company.save();

    return NextResponse.json({
      message: "Company deactivated successfully",
    });
  } catch (err) {
    console.error("Delete company error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete company" },
      { status: 500 },
    );
  }
}
