import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Department from "@/models/Department";
import { ROLES } from "@/constants/roles";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

/**
 * GET /api/v1/admin/departments
 * List all departments (HR: only their company's departments)
 */
export async function GET(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    let company = searchParams.get("company");
    const site = searchParams.get("site");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};
    if (currentUser.role === ROLES.HR) {
      if (!currentUser.company) {
        return NextResponse.json({
          departments: [],
          pagination: { page: 1, limit, total: 0, pages: 0 },
        });
      }
      query.company = currentUser.company;
    } else {
      if (company) query.company = company;
      if (site) query.site = site;
    }
    if (active !== null && active !== undefined && active !== "") {
      query.active = active === "true";
    }

    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate("company", "name")
        .populate("site", "name siteCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Department.countDocuments(query),
    ]);

    return NextResponse.json({
      departments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("List departments error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch departments" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/admin/departments
 * Create a new department (HR: only for their company and permissions.create)
 */
export async function POST(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.create) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to create departments." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, code, company, site, description } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Department name is required" },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json(
        { message: "Department code is required" },
        { status: 400 },
      );
    }

    if (!company) {
      return NextResponse.json(
        { message: "Company is required" },
        { status: 400 },
      );
    }

    if (!site) {
      return NextResponse.json(
        { message: "Site is required" },
        { status: 400 },
      );
    }

    if (currentUser.role === ROLES.HR) {
      if (String(company) !== String(currentUser.company)) {
        return NextResponse.json(
          { message: "Forbidden. You can only create departments for your own company." },
          { status: 403 },
        );
      }
    }

    await connectDB();

    // Check if code already exists
    const existing = await Department.findOne({
      code: code.trim().toUpperCase(),
    });
    if (existing) {
      return NextResponse.json(
        { message: "Department with this code already exists" },
        { status: 409 },
      );
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      company,
      site,
      description: (description || "").trim(),
      active: true,
    });

    // Populate and return
    await department.populate("company", "name");
    await department.populate("site", "name siteCode");

    return NextResponse.json(
      {
        message: "Department created successfully",
        department,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create department error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to create department" },
      { status: 500 },
    );
  }
}
