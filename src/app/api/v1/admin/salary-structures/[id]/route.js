import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SalaryStructure from "@/models/SalaryStructure";
import { ROLES } from "@/constants/roles";
import {
  requireViewPermission,
  requireEditPermission,
} from "@/lib/apiAuth";

/**
 * GET /api/v1/admin/salary-structures/[id]
 */
export async function GET(request, { params }) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    await connectDB();

    const salaryStructure = await SalaryStructure.findById(id)
      .populate("company", "name")
      .populate("employee", "name email")
      .populate("site", "name siteCode")
      .populate("department", "name code")
      .populate("designation", "name code")
      .populate("grade", "name code")
      .populate("skills", "name category")
      .lean();

    if (!salaryStructure) {
      return NextResponse.json(
        { message: "Salary record not found" },
        { status: 404 },
      );
    }

    if (
      auth.user.role === ROLES.HR &&
      String(salaryStructure.company?._id) !== String(auth.user.company)
    ) {
      return NextResponse.json(
        { message: "Forbidden. You can only view salary records of your company." },
        { status: 403 },
      );
    }

    return NextResponse.json({ salaryStructure });
  } catch (err) {
    console.error("Get salary structure error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch salary record" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/v1/admin/salary-structures/[id]
 */
export async function PATCH(request, { params }) {
  try {
    const auth = await requireEditPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (
      currentUser.role === ROLES.HR &&
      !currentUser.permissions?.edit
    ) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to edit salary records." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    await connectDB();

    const doc = await SalaryStructure.findById(id);
    if (!doc) {
      return NextResponse.json(
        { message: "Salary record not found" },
        { status: 404 },
      );
    }

    if (
      currentUser.role === ROLES.HR &&
      String(doc.company) !== String(currentUser.company)
    ) {
      return NextResponse.json(
        { message: "Forbidden. You can only edit salary records of your company." },
        { status: 403 },
      );
    }

    Object.assign(doc, body);
    await doc.save();

    const salaryStructure = await SalaryStructure.findById(id)
      .populate("company", "name")
      .populate("employee", "name email")
      .populate("site", "name siteCode")
      .populate("department", "name code")
      .populate("designation", "name code")
      .populate("grade", "name code")
      .lean();

    return NextResponse.json({
      message: "Salary record updated successfully",
      salaryStructure,
    });
  } catch (err) {
    console.error("Update salary structure error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to update salary record" },
      { status: 500 },
    );
  }
}
