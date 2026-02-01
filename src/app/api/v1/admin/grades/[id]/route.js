import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Grade from "@/models/Grade";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

export async function GET(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    await connectDB();
    const grade = await Grade.findById(id).lean();
    if (!grade) {
      return NextResponse.json({ message: "Grade not found" }, { status: 404 });
    }
    return NextResponse.json({ grade });
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
    const { name, code, minSalary, maxSalary, active } = body;

    await connectDB();
    const grade = await Grade.findById(id);
    if (!grade) {
      return NextResponse.json({ message: "Grade not found" }, { status: 404 });
    }

    if (code && code.trim().toUpperCase() !== grade.code) {
      const existing = await Grade.findOne({
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

    if (name !== undefined) grade.name = name.trim();
    if (code !== undefined) grade.code = code.trim().toUpperCase();
    if (minSalary !== undefined) grade.minSalary = minSalary;
    if (maxSalary !== undefined) grade.maxSalary = maxSalary;
    if (active !== undefined) grade.active = active;

    await grade.save();
    return NextResponse.json({ message: "Grade updated", grade });
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
    const grade = await Grade.findById(id);
    if (!grade) {
      return NextResponse.json({ message: "Grade not found" }, { status: 404 });
    }
    grade.active = false;
    await grade.save();
    return NextResponse.json({ message: "Grade deactivated" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
