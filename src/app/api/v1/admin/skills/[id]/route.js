import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Skill from "@/models/Skill";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const skill = await Skill.findById(id).lean();
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
    const { id } = await params;
    const body = await request.json();
    const { name, category, active } = body;

    await connectDB();
    const skill = await Skill.findById(id);
    if (!skill) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
    }

    if (name !== undefined) skill.name = name.trim();
    if (category !== undefined) skill.category = category.trim();
    if (active !== undefined) skill.active = active;

    await skill.save();
    return NextResponse.json({ message: "Skill updated", skill });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const skill = await Skill.findById(id);
    if (!skill) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
    }
    skill.active = false;
    await skill.save();
    return NextResponse.json({ message: "Skill deactivated" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
