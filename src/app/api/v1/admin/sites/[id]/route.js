import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Site from "@/models/Site";

/**
 * GET /api/v1/admin/sites/[id]
 * Get a single site by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const site = await Site.findById(id).populate("company", "name").lean();

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({ site });
  } catch (err) {
    console.error("Get site error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch site" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/v1/admin/sites/[id]
 * Update site details
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, siteCode, company, address, active } = body;

    await connectDB();

    const site = await Site.findById(id);

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    // Check if siteCode is being changed and if new code already exists
    if (siteCode && siteCode.trim().toUpperCase() !== site.siteCode) {
      const existing = await Site.findOne({
        siteCode: siteCode.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Site with this code already exists" },
          { status: 409 },
        );
      }
    }

    // Update fields if provided
    if (name !== undefined) site.name = name.trim();
    if (siteCode !== undefined) site.siteCode = siteCode.trim().toUpperCase();
    if (company !== undefined) site.company = company;
    if (address !== undefined) site.address = address.trim();
    if (active !== undefined) site.active = active;

    await site.save();
    await site.populate("company", "name");

    return NextResponse.json({
      message: "Site updated successfully",
      site,
    });
  } catch (err) {
    console.error("Update site error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to update site" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/admin/sites/[id]
 * Soft delete site (set active = false)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const site = await Site.findById(id);

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    // Soft delete
    site.active = false;
    await site.save();

    return NextResponse.json({
      message: "Site deactivated successfully",
    });
  } catch (err) {
    console.error("Delete site error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete site" },
      { status: 500 },
    );
  }
}
