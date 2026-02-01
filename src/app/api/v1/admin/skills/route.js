import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Skill from "@/models/Skill";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

export async function GET(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};
    if (category) query.category = category;
    if (active !== null && active !== undefined) {
      query.active = active === "true";
    }

    const skip = (page - 1) * limit;

    const [skills, total] = await Promise.all([
      Skill.find(query)
        .sort({ category: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Skill.countDocuments(query),
    ]);

    return NextResponse.json({
      skills,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { name, category } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Skill name is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check for duplicate skill name
    const existing = await Skill.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { message: "Skill already exists" },
        { status: 409 },
      );
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: (category || "General").trim(),
      active: true,
    });

    return NextResponse.json(
      { message: "Skill created", skill },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
