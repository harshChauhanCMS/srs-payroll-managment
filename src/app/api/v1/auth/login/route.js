import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
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

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.softDelete) {
      return NextResponse.json(
        { message: "Account has been deleted." },
        { status: 403 }
      );
    }
    if (!user.active) {
      return NextResponse.json(
        { message: "Account is inactive. Contact admin." },
        { status: 403 }
      );
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = user.generateToken();
    const userObj = user.toJSON();

    return NextResponse.json({
      message: "Login successful",
      token,
      user: userObj,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: err.message || "Login failed" },
      { status: 500 }
    );
  }
}
