import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import { requireViewPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

/**
 * GET /api/v1/admin/attendance
 * List attendance records for a site/month/year
 */
export async function GET(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { searchParams } = new URL(request.url);
    const site = searchParams.get("site");
    const payrollMonth = searchParams.get("payrollMonth");
    const payrollYear = searchParams.get("payrollYear");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    await connectDB();

    const query = { active: true };

    // HR/Employee can only see their site
    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      if (!currentUser.site) {
        return NextResponse.json({ attendance: [], pagination: { page: 1, limit, total: 0, pages: 0 } });
      }
      query.site = currentUser.site;
    } else if (site) {
      query.site = site;
    }

    if (payrollMonth) query.payrollMonth = parseInt(payrollMonth, 10);
    if (payrollYear) query.payrollYear = parseInt(payrollYear, 10);

    const skip = (page - 1) * limit;

    const [attendance, totalCount] = await Promise.all([
      Attendance.find(query)
        .populate("employee", "name employeeCode")
        .populate("site", "name siteCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(query),
    ]);

    return NextResponse.json({
      attendance,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("List attendance error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch attendance" },
      { status: 500 },
    );
  }
}
