import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Grade from "@/models/Grade";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

export async function GET(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

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

    const [grades, total] = await Promise.all([
      Grade.find(query).sort({ minSalary: 1 }).skip(skip).limit(limit).lean(),
      Grade.countDocuments(query),
    ]);

    return NextResponse.json({
      grades,
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
    const { name, code, minSalary, maxSalary } = body;

    if (!name || !code) {
      return NextResponse.json(
        { message: "Name and code are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await Grade.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return NextResponse.json(
        { message: "Grade code already exists" },
        { status: 409 },
      );
    }

    const grade = await Grade.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      minSalary: minSalary || 0,
      maxSalary: maxSalary || 0,
      active: true,
    });

    return NextResponse.json(
      { message: "Grade created", grade },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
