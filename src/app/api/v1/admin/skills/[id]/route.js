import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Skill from "@/models/Skill";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

export async function GET(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    await connectDB();
    const skill = await Skill.findById(id)
      .populate("department", "name code")
      .populate("designation", "name code")
      .populate("grade", "name code")
      .lean();
    if (!skill) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
    }
    return NextResponse.json({ skill });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      skillCode,
      category,
      department,
      designation,
      grade,
      active,
      basic,
    } = body;

    await connectDB();
    const skill = await Skill.findById(id);
    if (!skill) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
    }

    if (skillCode && skillCode.trim().toUpperCase() !== skill.skillCode) {
      const existing = await Skill.findOne({
        skillCode: skillCode.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Skill code already exists" },
          { status: 409 },
        );
      }
    }

    if (name !== undefined) skill.name = name.trim();
    if (skillCode !== undefined) skill.skillCode = skillCode.trim().toUpperCase();
    if (category !== undefined) skill.category = category.trim();
    if (department !== undefined) skill.department = department;
    if (designation !== undefined) skill.designation = designation;
    if (grade !== undefined) skill.grade = grade;
    if (active !== undefined) skill.active = active;
    if (basic !== undefined) skill.basic = Number(basic) || 0;

    await skill.save();
    return NextResponse.json({ message: "Skill updated", skill });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    await connectDB();
    const skill = await Skill.findById(id);
    if (!skill) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
    }
    await Skill.findByIdAndDelete(id);
    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
