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
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      category,
      active,
      basic,
      houseRentAllowance,
      otherAllowance,
      leaveEarnings,
      bonusEarnings,
      arrear,
    } = body;

    await connectDB();
    const skill = await Skill.findById(id);
    if (!skill) {
      return NextResponse.json({ message: "Skill not found" }, { status: 404 });
    }

    if (name !== undefined) skill.name = name.trim();
    if (category !== undefined) skill.category = category.trim();
    if (active !== undefined) skill.active = active;
    if (basic !== undefined) skill.basic = Number(basic) || 0;
    if (houseRentAllowance !== undefined) skill.houseRentAllowance = Number(houseRentAllowance) || 0;
    if (otherAllowance !== undefined) skill.otherAllowance = Number(otherAllowance) || 0;
    if (leaveEarnings !== undefined) skill.leaveEarnings = Number(leaveEarnings) || 0;
    if (bonusEarnings !== undefined) skill.bonusEarnings = Number(bonusEarnings) || 0;
    if (arrear !== undefined) skill.arrear = Number(arrear) || 0;

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
    // Permanently delete skill
    await Skill.findByIdAndDelete(id);
    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
