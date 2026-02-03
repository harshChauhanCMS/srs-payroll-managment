import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PayrollRun from "@/models/PayrollRun";
import { requireViewPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

/**
 * GET /api/v1/admin/payroll-runs/[id]
 * Get full payroll run details including per-employee results
 */
export async function GET(request, { params }) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { id } = await params;

    await connectDB();

    const payrollRun = await PayrollRun.findById(id)
      .populate("site", "name siteCode address")
      .populate("company", "name")
      .populate("runBy", "name")
      .populate("reviewedBy", "name")
      .populate("approvedBy", "name")
      .populate("lockedBy", "name")
      .lean();

    if (!payrollRun) {
      return NextResponse.json(
        { message: "Payroll run not found" },
        { status: 404 },
      );
    }

    // HR can only view their site's payroll
    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      if (String(payrollRun.site._id || payrollRun.site) !== String(currentUser.site)) {
        return NextResponse.json(
          { message: "Forbidden" },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ payrollRun });
  } catch (err) {
    console.error("Get payroll run error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch payroll run" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/admin/payroll-runs/[id]
 * Soft delete a payroll run (only if draft)
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { id } = await params;

    await connectDB();

    const payrollRun = await PayrollRun.findById(id);
    if (!payrollRun) {
      return NextResponse.json(
        { message: "Payroll run not found" },
        { status: 404 },
      );
    }

    if (payrollRun.status !== "draft") {
      return NextResponse.json(
        { message: "Only draft payroll runs can be deleted." },
        { status: 400 },
      );
    }

    // HR can only delete their site's payroll
    if (currentUser.role === ROLES.HR) {
      if (String(payrollRun.site) !== String(currentUser.site)) {
        return NextResponse.json(
          { message: "Forbidden" },
          { status: 403 },
        );
      }
    }

    payrollRun.active = false;
    await payrollRun.save();

    return NextResponse.json({ message: "Payroll run deleted successfully" });
  } catch (err) {
    console.error("Delete payroll run error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete payroll run" },
      { status: 500 },
    );
  }
}
