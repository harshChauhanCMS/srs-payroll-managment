import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PayrollRun from "@/models/PayrollRun";
import { requireEditPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

// Valid status transitions
const VALID_TRANSITIONS = {
  draft: ["reviewed"],
  reviewed: ["approved"],
  approved: ["locked"],
  locked: [], // terminal state
};

// Who can perform each transition
const TRANSITION_ROLES = {
  reviewed: [ROLES.HR, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  approved: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  locked: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
};

/**
 * PATCH /api/v1/admin/payroll-runs/[id]/status
 * Update payroll run status (approval workflow)
 */
export async function PATCH(request, { params }) {
  try {
    const auth = await requireEditPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { id } = await params;
    const body = await request.json();
    const newStatus = body.status;

    if (!newStatus) {
      return NextResponse.json(
        { message: "status is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const payrollRun = await PayrollRun.findById(id);
    if (!payrollRun) {
      return NextResponse.json(
        { message: "Payroll run not found" },
        { status: 404 },
      );
    }

    // HR can only manage their site
    if (currentUser.role === ROLES.HR) {
      if (String(payrollRun.site) !== String(currentUser.site)) {
        return NextResponse.json(
          { message: "Forbidden" },
          { status: 403 },
        );
      }
    }

    // Validate transition
    const currentStatus = payrollRun.status;
    const validNext = VALID_TRANSITIONS[currentStatus] || [];

    if (!validNext.includes(newStatus)) {
      return NextResponse.json(
        { message: `Cannot transition from '${currentStatus}' to '${newStatus}'. Valid transitions: ${validNext.join(", ") || "none"}` },
        { status: 400 },
      );
    }

    // Check role authorization for this transition
    const allowedRoles = TRANSITION_ROLES[newStatus] || [];
    if (!allowedRoles.includes(currentUser.role)) {
      return NextResponse.json(
        { message: `Your role (${currentUser.role}) cannot perform this status change.` },
        { status: 403 },
      );
    }

    // Update status and record who/when
    payrollRun.status = newStatus;
    const now = new Date();

    if (newStatus === "reviewed") {
      payrollRun.reviewedBy = currentUser._id;
      payrollRun.reviewedAt = now;
    } else if (newStatus === "approved") {
      payrollRun.approvedBy = currentUser._id;
      payrollRun.approvedAt = now;
    } else if (newStatus === "locked") {
      payrollRun.lockedBy = currentUser._id;
      payrollRun.lockedAt = now;
    }

    await payrollRun.save();

    const populated = await PayrollRun.findById(id)
      .select("-results")
      .populate("site", "name siteCode")
      .populate("company", "name")
      .populate("runBy", "name")
      .populate("reviewedBy", "name")
      .populate("approvedBy", "name")
      .populate("lockedBy", "name")
      .lean();

    return NextResponse.json({
      message: `Payroll run status updated to '${newStatus}'`,
      payrollRun: populated,
    });
  } catch (err) {
    console.error("Update payroll run status error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to update status" },
      { status: 500 },
    );
  }
}
