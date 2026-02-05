import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PayrollRun from "@/models/PayrollRun";
import { requireViewPermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

/**
 * GET /api/v1/admin/salary-sheet-templates/approved-payrolls
 * Get list of approved/locked payroll runs for generation
 */
export async function GET(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("site");
    const companyId = searchParams.get("company");

    await connectDB();

    const query = {
      status: { $in: ["approved", "locked"] },
      active: true,
    };

    // HR can only see their site's payroll runs
    if (currentUser.role === ROLES.HR) {
      query.site = currentUser.site;
      query.company = currentUser.company;
    } else if (
      currentUser.role === ROLES.ADMIN ||
      currentUser.role === ROLES.SUPER_ADMIN
    ) {
      if (siteId) query.site = siteId;
      if (companyId) query.company = companyId;
    }

    const payrollRuns = await PayrollRun.find(query)
      .populate("site", "name siteCode")
      .populate("company", "name")
      .sort({ payrollYear: -1, payrollMonth: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ payrollRuns });
  } catch (err) {
    console.error("GET approved payrolls error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch approved payrolls" },
      { status: 500 }
    );
  }
}
