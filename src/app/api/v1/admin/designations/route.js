import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Designation from "@/models/Designation";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

/**
 * GET /api/v1/admin/designations
 * List all designations with optional filtering (Employee: 403)
 */
export async function GET(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};
    if (department) query.department = department;
    if (active !== null && active !== undefined) {
      query.active = active === "true";
    }

    const skip = (page - 1) * limit;

    const [designations, total] = await Promise.all([
      Designation.find(query)
        .populate("department", "name code")
        .sort({ level: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Designation.countDocuments(query),
    ]);

    return NextResponse.json({
      designations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("List designations error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch designations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/admin/designations (Employee: 403)
 */
export async function POST(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { name, code, department, level } = body;

    if (!name || !code || !department) {
      return NextResponse.json(
        { message: "Name, code, and department are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await Designation.findOne({
      code: code.trim().toUpperCase(),
    });
    if (existing) {
      return NextResponse.json(
        { message: "Designation with this code already exists" },
        { status: 409 },
      );
    }

    const designation = await Designation.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      department,
      level: level || 1,
      active: true,
    });

    await designation.populate("department", "name code");

    return NextResponse.json(
      { message: "Designation created", designation },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create designation error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to create designation" },
      { status: 500 },
    );
  }
}
