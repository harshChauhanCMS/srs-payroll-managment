import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Company from "@/models/Company";

/**
 * GET /api/v1/admin/companies
 * List all companies
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
 * Create a new company
 */
export async function POST(request) {
  try {
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
