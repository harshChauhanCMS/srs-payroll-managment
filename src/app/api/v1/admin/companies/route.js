import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";
import { ROLES } from "@/constants/roles";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

/**
 * GET /api/v1/admin/companies
 * List all companies (HR: only their company)
 */
export async function GET(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};

    // HR and Employees: Only see their own company
    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      if (!currentUser.company) {
        return NextResponse.json({
          companies: [],
          pagination: { page: 1, limit, total: 0, pages: 0 },
          message: "Companies fetched successfully",
        });
      }
      query._id = currentUser.company;
    } else {
      // Admin: Can see all companies
      if (active !== null && active !== undefined) {
        query.active = active === "true";
      }
    }

    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      Company.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(query),
    ]);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      message: "Companies fetched successfully",
    });
  } catch (err) {
    console.error("List companies error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch companies" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/admin/companies
 * Create a new company (Admin only; HR gets 403)
 */
export async function POST(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    if (auth.user.role === ROLES.HR) {
      return NextResponse.json(
        { message: "Forbidden. HR cannot create companies." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, gstNumber, pan, address } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Company name is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if company with same name already exists
    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { message: "Company with this name already exists" },
        { status: 409 },
      );
    }

    const company = await Company.create({
      name: name.trim(),
      gstNumber: (gstNumber || "").trim(),
      pan: (pan || "").trim(),
      address: (address || "").trim(),
      active: true,
    });

    return NextResponse.json(
      {
        message: "Company created successfully",
        company,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create company error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to create company" },
      { status: 500 },
    );
  }
}
