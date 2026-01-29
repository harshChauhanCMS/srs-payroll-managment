import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/lib/db";
import User from "@/models/User";

/**
 * GET /api/v1/admin/users/[id]
 * Get a single user by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const user = await User.findById(id)
      .select("-password")
      .populate("company", "name")
      .populate("createdBy", "name email")
      .lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
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
      active,
      company,
    } = body;

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (role !== undefined) user.role = role;
    if (pan !== undefined) user.pan = pan.trim();
    if (aadhar !== undefined) user.aadhar = aadhar.trim();
    if (address !== undefined) user.address = address.trim();
    if (active !== undefined) user.active = active;
    if (company !== undefined) user.company = company;

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
 * DELETE /api/v1/admin/users/[id]
 * Soft delete user (set active = false)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded._id === id) {
          return NextResponse.json(
            { message: "You cannot delete your own account" },
            { status: 403 },
          );
        }
      } catch (tokenError) {
        // Continue if token verification fails - middleware or other checks might have handled it,
        // or we just proceed with standard deletion. Ideally this should be robust auth middleware.
        console.error("Token check warning in delete:", tokenError.message);
      }
    }

    // Soft delete by setting active to false
    user.active = false;
    await user.save();

    return NextResponse.json({
      message: "User deactivated successfully",
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete user" },
      { status: 500 },
    );
  }
}
