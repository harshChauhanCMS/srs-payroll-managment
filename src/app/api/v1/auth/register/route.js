import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { ROLES } from "@/constants/roles";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      role = ROLES.MANAGER,
      gstNumber = "",
      pan = "",
      aadhar = "",
      address = "",
      active = true,
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password and name are required" },
        { status: 400 }
      );
    }

    const validRoles = Object.values(ROLES);
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { message: `Role must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role,
      gstNumber: (gstNumber || "").trim(),
      pan: (pan || "").trim(),
      aadhar: (aadhar || "").trim(),
      address: (address || "").trim(),
      active: !!active,
    });

    const token = user.generateToken();
    const userObj = user.toJSON();

    return NextResponse.json({
      message: "Registration successful",
      token,
      user: userObj,
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors || {}).map((e) => e.message).join(", ");
      return NextResponse.json({ message: msg || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json(
      { message: err.message || "Registration failed" },
      { status: 500 }
    );
  }
}
