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
 * PATCH /api/v1/admin/attendance/bulk-update
 * Update multiple attendance records at once
 */
export async function PATCH(request) {
  try {
    const auth = await requireEditPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const body = await request.json();

    if (!Array.isArray(body.records) || body.records.length === 0) {
      return NextResponse.json(
        { message: "records array is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const results = { updated: 0, failed: 0, errors: [] };

    for (const record of body.records) {
      if (!record._id) {
        results.failed++;
        results.errors.push({ _id: null, message: "Missing _id" });
        continue;
      }

      try {
        const doc = await Attendance.findById(record._id);
        if (!doc) {
          results.failed++;
          results.errors.push({ _id: record._id, message: "Not found" });
          continue;
        }

        // HR can only edit their site's attendance
        if (currentUser.role === ROLES.HR) {
          if (String(doc.site) !== String(currentUser.site)) {
            results.failed++;
            results.errors.push({ _id: record._id, message: "Forbidden" });
            continue;
          }
        }

        const updates = {};
        for (const key of ALLOWED_FIELDS) {
          if (record[key] !== undefined) {
            const n = Number(record[key]);
            updates[key] = Number.isNaN(n) ? 0 : n;
          }
        }
        updates.manuallyEdited = true;

        await Attendance.findByIdAndUpdate(record._id, { $set: updates });
        results.updated++;
      } catch (updateErr) {
        results.failed++;
        results.errors.push({ _id: record._id, message: updateErr.message });
      }
    }

    return NextResponse.json({
      message: `Bulk update complete. ${results.updated} updated, ${results.failed} failed.`,
      ...results,
    });
  } catch (err) {
    console.error("Bulk update attendance error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to bulk update attendance" },
      { status: 500 },
    );
  }
}
