import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Company from "@/models/Company";
import Site from "@/models/Site";
import Department from "@/models/Department";
import Designation from "@/models/Designation";
import Grade from "@/models/Grade";
import Skill from "@/models/Skill";
import { ROLES } from "@/constants/roles";
import { sendWelcomeEmail } from "@/lib/email";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

/**
 * POST /api/v1/admin/users
 * Create a new user (HR or Employee) with permissions
 * Sends welcome email with credentials
 */
export async function POST(request) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.create) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to create users." },
        { status: 403 },
      );
    }

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
      esiCode = "",
      uan = "",
      pfNumber = "",
      // New fields
      employeeCode,
      fatherName,
      gender,
      dob,
      doj,
      contractEndDate,
      mobile,
      bankName,
      accountNumber,
      ifscCode,
      pfApplicable,
      esiApplicable,
      category,
      wageType,
      aadharCardPhoto,
    } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password and name are required" },
        { status: 400 },
      );
    }

    if (!body.site) {
      return NextResponse.json(
        { message: "Site assignment is required for all users" },
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

    // HR can only create users in their own company
    const companyId = body.company || null;
    if (currentUser.role === ROLES.HR) {
      if (!currentUser.company) {
        return NextResponse.json(
          { message: "HR user must be assigned to a company to create users." },
          { status: 403 },
        );
      }
      if (companyId && String(companyId) !== String(currentUser.company)) {
        return NextResponse.json(
          { message: "You can only create users in your own company." },
          { status: 403 },
        );
      }
      // Force company to HR's company
      body.company = currentUser.company;
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

    // Check if employee code exists
    if (employeeCode) {
      const existingCode = await User.findOne({
        employeeCode: employeeCode.trim(),
      });
      if (existingCode) {
        return NextResponse.json(
          { message: "User with this employee code already exists" },
          { status: 409 },
        );
      }
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

    const createdBy = currentUser._id;

    // Create user (use body.company which may have been forced for HR)
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role,
      permissions: userPermissions,
      pan: (pan || "").trim(),
      aadhar: (aadhar || "").trim(),
      address: (address || "").trim(),
      esiCode: (esiCode || "").trim(),
      uan: (uan || "").trim(),
      pfNumber: (pfNumber || "").trim(),
      active: true,
      createdBy,
      company: body.company || null,
      site: body.site,
      department: body.department || null,
      designation: body.designation || null,
      grade: body.grade || null,
      skills: body.skills || [],
      // New fields assignment
      employeeCode: employeeCode ? employeeCode.trim() : undefined,
      fatherName: fatherName ? fatherName.trim() : undefined,
      gender,
      dob,
      doj,
      contractEndDate,
      mobile: mobile ? mobile.trim() : undefined,
      bankName: bankName ? bankName.trim() : undefined,
      accountNumber: accountNumber ? accountNumber.trim() : undefined,
      ifscCode: ifscCode ? ifscCode.trim() : undefined,
      pfApplicable: pfApplicable || false,
      esiApplicable: esiApplicable || false,
      category,
      wageType,
      aadharCardPhoto: aadharCardPhoto ? aadharCardPhoto.trim() : undefined,
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
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const excludeRole = searchParams.get("excludeRole");
    let company = searchParams.get("company");
    const active = searchParams.get("active");
    const includeDeleted = searchParams.get("includeDeleted");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    // Build query
    const query = {};

    // HR and Employees: Only see users from their company
    if (currentUser.role === ROLES.HR || currentUser.role === ROLES.EMPLOYEE) {
      if (!currentUser.company) {
        return NextResponse.json({
          users: [],
          pagination: { page: 1, limit, total: 0, pages: 0 },
        });
      }
      query.company = currentUser.company;
    } else {
      // Admin: Can filter by role, company, etc.
      if (role) query.role = role;
      if (excludeRole) query.role = { $ne: excludeRole };
      if (company) query.company = company;
    }
    if (active !== null && active !== undefined) {
      query.active = active === "true";
    }
    // Exclude soft-deleted users by default
    if (includeDeleted !== "true") {
      query.softDelete = false;
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
        .populate("department", "name code")
        .populate("designation", "name code")
        .populate("grade", "name code")
        .populate(
          "skills",
          "name category basic houseRentAllowance otherAllowance leaveEarnings bonusEarnings arrear",
        )
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
