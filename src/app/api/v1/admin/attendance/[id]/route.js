import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import { requireEditPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

const ALLOWED_FIELDS = [
  "workingDays",
  "presentDays",
  "payableDays",
  "leaveDays",
  "otHours",
  "incentive",
  "arrear",
  "totalDays",
];

/**
 * PATCH /api/v1/admin/attendance/[id]
 * Update a single attendance record
 */
export async function PATCH(request, { params }) {
  try {
    const auth = await requireEditPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { id } = await params;

    await connectDB();

    const doc = await Attendance.findById(id);
    if (!doc) {
      return NextResponse.json(
        { message: "Attendance record not found" },
        { status: 404 },
      );
    }

    // HR can only edit their site's attendance
    if (currentUser.role === ROLES.HR) {
      if (String(doc.site) !== String(currentUser.site)) {
        return NextResponse.json(
          { message: "You can only edit attendance for your assigned site." },
          { status: 403 },
        );
      }
    }

    const body = await request.json();
    const updates = {};

    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        const n = Number(body[key]);
        updates[key] = Number.isNaN(n) ? 0 : n;
      }
    }

    updates.manuallyEdited = true;

    const updated = await Attendance.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true },
    )
      .populate("employee", "name employeeCode")
      .lean();

    return NextResponse.json({
      message: "Attendance updated successfully",
      attendance: updated,
    });
  } catch (err) {
    console.error("Update attendance error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to update attendance" },
      { status: 500 },
    );
  }
}
