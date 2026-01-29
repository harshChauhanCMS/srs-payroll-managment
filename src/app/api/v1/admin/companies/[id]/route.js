import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";

/**
 * GET /api/v1/admin/companies/[id]
 * Get single company
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
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
 * Update company details
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, gstNumber, pan, address, active } = body;

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
 * Soft delete company
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
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
