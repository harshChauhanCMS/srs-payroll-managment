import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Site from "@/models/Site";
import { ROLES } from "@/constants/roles";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

/**
 * GET /api/v1/admin/sites/[id]
 * Get a single site by ID (HR: only their company's sites)
 */
export async function GET(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { id } = await params;

    await connectDB();

    const site = await Site.findById(id).populate("company", "name").lean();

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    if (auth.user.role === ROLES.HR) {
      if (
        !auth.user.company ||
        String(site.company?._id ?? site.company) !== String(auth.user.company)
      ) {
        return NextResponse.json(
          { message: "Forbidden. You can only view sites in your company." },
          { status: 403 },
        );
      }
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
 * Update site details (HR: only their company's sites and permissions.edit)
 */
export async function PUT(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.edit) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to edit sites." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const { name, siteCode, company, address, active, geofencingRadius, fenceType } =
      body;

    await connectDB();

    const site = await Site.findById(id);

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    if (currentUser.role === ROLES.HR) {
      if (
        !currentUser.company ||
        String(site.company) !== String(currentUser.company)
      ) {
        return NextResponse.json(
          { message: "Forbidden. You can only edit sites in your company." },
          { status: 403 },
        );
      }
      if (
        company !== undefined &&
        String(company) !== String(currentUser.company)
      ) {
        return NextResponse.json(
          { message: "Forbidden. You cannot assign sites to another company." },
          { status: 403 },
        );
      }
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
    if (geofencingRadius !== undefined) site.geofencingRadius = geofencingRadius;
    if (fenceType !== undefined) site.fenceType = fenceType;
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
 * Hard delete site (HR: only their company's sites and permissions.delete)
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.delete) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to delete sites." },
        { status: 403 },
      );
    }

    const { id } = await params;

    await connectDB();

    const site = await Site.findById(id);

    if (!site) {
      return NextResponse.json({ message: "Site not found" }, { status: 404 });
    }

    if (currentUser.role === ROLES.HR) {
      if (
        !currentUser.company ||
        String(site.company) !== String(currentUser.company)
      ) {
        return NextResponse.json(
          { message: "Forbidden. You can only delete sites in your company." },
          { status: 403 },
        );
      }
    }

    // Permanently delete site
    await Site.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Site deleted successfully",
    });
  } catch (err) {
    console.error("Delete site error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete site" },
      { status: 500 },
    );
  }
}
