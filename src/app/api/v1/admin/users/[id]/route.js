import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/lib/db";
import User from "@/models/User";
import SalaryComponent from "@/models/SalaryComponent";
import { ROLES } from "@/constants/roles";
import { getCurrentUserRequireManagement } from "@/lib/apiAuth";

/**
 * GET /api/v1/admin/users/[id]
 * Get a single user by ID
 */
export async function GET(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const { id } = await params;

    await connectDB();

    const user = await User.findById(id)
      .select("-password")
      .populate("company", "name")
      .populate("site", "name siteCode")
      .populate("department", "name code")
      .populate("designation", "name code level")
      .populate("grade", "name code minSalary maxSalary")
      .populate("skills", "name category basic houseRentAllowance otherAllowance leaveEarnings bonusEarnings arrear")
      .populate("createdBy", "name email")
      .lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // HR can only view users in their company
    if (auth.user.role === ROLES.HR) {
      if (
        !auth.user.company ||
        String(user.company) !== String(auth.user.company)
      ) {
        return NextResponse.json(
          { message: "Forbidden. You can only view users in your company." },
          { status: 403 },
        );
      }
    }

    // Fetch the latest salary component for the user's company
    let salaryComponent = null;
    const companyId = user.company?._id || user.company;
    if (companyId) {
      salaryComponent = await SalaryComponent.findOne({
        company: companyId,
        active: true,
      })
        .sort({ payrollYear: -1, payrollMonth: -1 })
        .lean();
    }

    return NextResponse.json({ user, salaryComponent });
  } catch (err) {
    console.error("Get user error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch user" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/v1/admin/users/[id]
 * Update user details and permissions
 */
export async function PATCH(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.edit) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to edit users." },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const {
      name,
      email,
      password,
      role,
      permissions,
      pan,
      aadhar,
      address,
      esiCode,
      uan,
      pfNumber,
      active,
      company,
      site,
      department,
      designation,
      grade,
      skills,
      pfPercentage,
      esiPercentage,
    } = body;

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.softDelete) {
      return NextResponse.json(
        { message: "Cannot update a deleted user." },
        { status: 400 },
      );
    }

    // Do not allow setting softDelete via PATCH (only DELETE can set it)
    // body.softDelete is intentionally not destructured or applied

    // HR can only update users in their company; cannot change company to another
    if (currentUser.role === ROLES.HR) {
      if (
        !currentUser.company ||
        String(user.company) !== String(currentUser.company)
      ) {
        return NextResponse.json(
          { message: "Forbidden. You can only edit users in your company." },
          { status: 403 },
        );
      }
      if (
        company !== undefined &&
        String(company) !== String(currentUser.company)
      ) {
        return NextResponse.json(
          { message: "Forbidden. You cannot assign users to another company." },
          { status: 403 },
        );
      }
    }

    // Update fields if provided
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (role !== undefined) user.role = role;
    if (pan !== undefined) user.pan = pan.trim();
    if (aadhar !== undefined) user.aadhar = aadhar.trim();
    if (address !== undefined) user.address = address.trim();
    if (esiCode !== undefined) user.esiCode = esiCode.trim();
    if (uan !== undefined) user.uan = uan.trim();
    if (pfNumber !== undefined) user.pfNumber = pfNumber.trim();
    if (active !== undefined) user.active = active;
    if (company !== undefined) user.company = company;
    if (site !== undefined) user.site = site;
    if (department !== undefined) user.department = department;
    if (designation !== undefined) user.designation = designation;
    if (grade !== undefined) user.grade = grade;
    if (skills !== undefined) user.skills = skills;
    if (pfPercentage !== undefined) user.pfPercentage = Number(pfPercentage);
    if (esiPercentage !== undefined) user.esiPercentage = Number(esiPercentage);

    // Update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Update permissions if provided
    if (permissions) {
      user.permissions = {
        view:
          permissions.view !== undefined
            ? permissions.view
            : user.permissions.view,
        edit:
          permissions.edit !== undefined
            ? permissions.edit
            : user.permissions.edit,
        delete:
          permissions.delete !== undefined
            ? permissions.delete
            : user.permissions.delete,
        create:
          permissions.create !== undefined
            ? permissions.create
            : user.permissions.create,
      };
    }

    await user.save();

    const userObj = user.toJSON();

    return NextResponse.json({
      message: "User updated successfully",
      user: userObj,
    });
  } catch (err) {
    console.error("Update user error:", err);
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
      { message: err.message || "Failed to update user" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/v1/admin/users/[id]
 * Alias for PATCH - Update user details and permissions
 */
export async function PUT(request, { params }) {
  return PATCH(request, { params });
}

/**
 * DELETE /api/v1/admin/users/[id]
 * Hard delete: release from skills, grade, designation, department, site, company; then delete user from database.
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await getCurrentUserRequireManagement(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.delete) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to delete users." },
        { status: 403 },
      );
    }

    const { id } = await params;

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (String(currentUser._id) === String(id)) {
      return NextResponse.json(
        { message: "You cannot delete your own account" },
        { status: 403 },
      );
    }

    // HR can only delete users in their company
    if (currentUser.role === ROLES.HR) {
      if (
        !currentUser.company ||
        String(user.company) !== String(currentUser.company)
      ) {
        return NextResponse.json(
          { message: "Forbidden. You can only delete users in your company." },
          { status: 403 },
        );
      }
    }

    // Release from all assignments before deletion
    user.skills = [];
    user.grade = null;
    user.designation = null;
    user.department = null;
    user.site = null;
    user.company = null;

    // Actually delete the user from database
    await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete user" },
      { status: 500 },
    );
  }
}
