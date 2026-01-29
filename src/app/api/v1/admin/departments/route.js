import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Department from "@/models/Department";

/**
 * GET /api/v1/admin/departments
 * List all departments with optional filtering
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};
    if (active !== null && active !== undefined) {
      query.active = active === "true";
    }

    const skip = (page - 1) * limit;

    const [departments, total] = await Promise.all([
      Department.find(query)
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
      message: "Departments fetched successfully",
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
 * Create a new department
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, code, description } = body;

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
      description: (description || "").trim(),
      active: true,
    });

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
