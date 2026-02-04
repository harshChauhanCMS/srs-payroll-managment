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
    const department = searchParams.get("department");
    const designation = searchParams.get("designation");
    const grade = searchParams.get("grade");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};
    if (category) query.category = category;
    if (active !== null && active !== undefined) {
      query.active = active === "true";
    }
    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (grade) query.grade = grade;

    const skip = (page - 1) * limit;

    const [skills, total] = await Promise.all([
      Skill.find(query)
        .populate("department", "name code")
        .populate("designation", "name code")
        .populate("grade", "name code")
        .sort({ name: 1 })
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
    const {
      name,
      skillCode,
      category,
      department,
      designation,
      grade,
      basic = 0,
    } = body;

    if (!name || !skillCode || !department || !designation || !grade) {
      return NextResponse.json(
        { message: "Name, skill code, department, designation and grade are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check for duplicate skill code
    const existing = await Skill.findOne({ skillCode: skillCode.trim().toUpperCase() });
    if (existing) {
      return NextResponse.json(
        { message: "Skill code already exists" },
        { status: 409 },
      );
    }

    const skill = await Skill.create({
      name: name.trim(),
      skillCode: skillCode.trim().toUpperCase(),
      category: (category || "General").trim(),
      department,
      designation,
      grade,
      active: body.active !== false,
      basic: Number(basic) || 0,
    });

    return NextResponse.json(
      { message: "Skill created", skill },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
