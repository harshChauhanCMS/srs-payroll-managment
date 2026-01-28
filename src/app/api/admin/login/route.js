import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      );
    }

    await connectDB();

    // Find admin user by email
    const admin = await User.findOne({
      email: email.toLowerCase(),
      role: "admin",
    }).select("+password");

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await admin.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      );
    }

    // Generate token
    const token = admin.generateToken();

    return NextResponse.json(
      {
        success: true,
        message: "Admin login successful",
        data: {
          user: {
            _id: admin._id,
            email: admin.email,
            fullName: admin.fullName,
            role: admin.role,
            verificationStatus: admin.verificationStatus,
          },
          token,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
