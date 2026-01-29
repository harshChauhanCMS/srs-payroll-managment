import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Site from "@/models/Site";

/**
 * GET /api/v1/admin/sites
 * List all sites with optional filtering by company
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get("company");
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};
    if (company) query.company = company;
    if (active !== null && active !== undefined) {
      query.active = active === "true";
    }

    const skip = (page - 1) * limit;

    const [sites, total] = await Promise.all([
      Site.find(query)
        .populate("company", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Site.countDocuments(query),
    ]);

    return NextResponse.json({
      sites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      message: "Sites fetched successfully",
    });
  } catch (err) {
    console.error("List sites error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch sites" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/v1/admin/sites
 * Create a new site
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, siteCode, company, address } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Site name is required" },
        { status: 400 },
      );
    }

    if (!siteCode) {
      return NextResponse.json(
        { message: "Site code is required" },
        { status: 400 },
      );
    }

    if (!company) {
      return NextResponse.json(
        { message: "Parent company is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if site code already exists
    const existing = await Site.findOne({ siteCode: siteCode.trim() });
    if (existing) {
      return NextResponse.json(
        { message: "Site with this code already exists" },
        { status: 409 },
      );
    }

    const site = await Site.create({
      name: name.trim(),
      siteCode: siteCode.trim().toUpperCase(),
      company,
      address: (address || "").trim(),
      active: true,
    });

    // Populate company for response
    await site.populate("company", "name");

    return NextResponse.json(
      {
        message: "Site created successfully",
        site,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create site error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to create site" },
      { status: 500 },
    );
  }
}
