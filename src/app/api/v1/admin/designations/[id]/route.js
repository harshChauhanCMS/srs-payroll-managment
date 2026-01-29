import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Designation from "@/models/Designation";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const designation = await Designation.findById(id)
      .populate("department", "name code")
      .lean();
    if (!designation) {
      return NextResponse.json(
        { message: "Designation not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ designation });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, department, level, active } = body;

    await connectDB();
    const designation = await Designation.findById(id);
    if (!designation) {
      return NextResponse.json(
        { message: "Designation not found" },
        { status: 404 },
      );
    }

    if (code && code.trim().toUpperCase() !== designation.code) {
      const existing = await Designation.findOne({
        code: code.trim().toUpperCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { message: "Code already exists" },
          { status: 409 },
        );
      }
    }

    if (name !== undefined) designation.name = name.trim();
    if (code !== undefined) designation.code = code.trim().toUpperCase();
    if (department !== undefined) designation.department = department;
    if (level !== undefined) designation.level = level;
    if (active !== undefined) designation.active = active;

    await designation.save();
    await designation.populate("department", "name code");

    return NextResponse.json({ message: "Designation updated", designation });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const designation = await Designation.findById(id);
    if (!designation) {
      return NextResponse.json(
        { message: "Designation not found" },
        { status: 404 },
      );
    }
    designation.active = false;
    await designation.save();
    return NextResponse.json({ message: "Designation deactivated" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
