import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { ROLES } from "@/constants/roles";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * POST /api/v1/admin/users
 * Create a new user (HR or Employee) with permissions
 * Sends welcome email with credentials
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      role = ROLES.EMPLOYEE,
      permissions = {},
      pan = "",
      aadhar = "",
      address = "",
    } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password and name are required" },
        { status: 400 },
      );
    }

    // Only allow creating HR or Employee users
    if (role === ROLES.ADMIN) {
      return NextResponse.json(
        { message: "Cannot create admin users through this endpoint" },
        { status: 403 },
      );
    }

    const validRoles = [ROLES.HR, ROLES.EMPLOYEE];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: `Role must be one of: ${validRoles.join(", ")}` },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if user already exists
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse permissions with defaults
    const userPermissions = {
      view: permissions.view !== undefined ? permissions.view : true,
      edit: permissions.edit !== undefined ? permissions.edit : false,
      delete: permissions.delete !== undefined ? permissions.delete : false,
      create: permissions.create !== undefined ? permissions.create : false,
    };

    // Extract admin ID from token for createdBy
    let createdBy = null;
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        createdBy = decoded._id;
      } catch (error) {
        console.warn(
          "Failed to extract admin ID for createdBy:",
          error.message,
        );
      }
    }

    // Create user
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role,
      permissions: userPermissions,
      pan: (pan || "").trim(),
      aadhar: (aadhar || "").trim(),
      address: (address || "").trim(),
      active: true,
      createdBy,
      company: body.company || null,
    });

    // Send welcome email with credentials
    const emailResult = await sendWelcomeEmail(
      user.email,
      user.name,
      password, // Send plain password before hashing
    );

    const userObj = user.toJSON();

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userObj,
        emailSent: emailResult.success,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create user error:", err);
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors || {})
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        { message: msg || "Validation failed" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: err.message || "Failed to create user" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/admin/users
 * List all users with optional filtering
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const excludeRole = searchParams.get("excludeRole");
    const company = searchParams.get("company");
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    // Build query
    const query = {};
    if (role) query.role = role;
    if (excludeRole) query.role = { $ne: excludeRole };
    if (company) query.company = company;
    if (active !== null && active !== undefined) {
      query.active = active === "true";
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .populate("company", "name")
        .populate({
          path: "site",
          select: "name siteCode",
          populate: { path: "company", select: "name" },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("List users error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch users" },
      { status: 500 },
    );
  }
}
