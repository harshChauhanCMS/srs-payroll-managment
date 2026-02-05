import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { ROLES } from "@/constants/roles";

/**
 * Verify JWT from request and load current user from DB.
 * Returns { user } or { error: NextResponse }.
 * Use in API route: const auth = await getCurrentUser(request); if (auth.error) return auth.error;
 */
export async function getCurrentUser(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { message: "Unauthorized. Missing or invalid token." },
        { status: 401 },
      ),
    };
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return {
      error: NextResponse.json(
        { message: "Unauthorized. Invalid or expired token." },
        { status: 401 },
      ),
    };
  }

  await connectDB();
  const user = await User.findById(decoded._id).lean();
  if (!user) {
    return {
      error: NextResponse.json({ message: "User not found." }, { status: 401 }),
    };
  }

  return { user };
}

/**
 * DEPRECATED: Use requireViewPermission or requirePermission instead.
 *
 * For backward compatibility, this now checks view permission for employees.
 * Admin/HR are allowed through automatically.
 * Employees need view permission to access management routes.
 *
 * @deprecated Use the new permission-based functions below
 */
export async function getCurrentUserRequireManagement(request) {
  const auth = await getCurrentUser(request);
  if (auth.error) return auth;

  // Admin, Super Admin, and HR can proceed
  if (
    auth.user.role === ROLES.ADMIN ||
    auth.user.role === ROLES.SUPER_ADMIN ||
    auth.user.role === ROLES.HR
  ) {
    return auth;
  }

  // For employees, check if they have view permission
  if (auth.user.role === ROLES.EMPLOYEE) {
    if (!auth.user.permissions?.view) {
      return {
        error: NextResponse.json(
          { message: "You are not authorized to access this resource." },
          { status: 403 },
        ),
      };
    }
    // Employee has view permission, allow access
    return auth;
  }

  // Unknown role, block access
  return {
    error: NextResponse.json(
      { message: "You are not authorized to access this resource." },
      { status: 403 },
    ),
  };
}

/**
 * Check if user has a specific permission.
 * Admins always have all permissions.
 * HR/Employees must have explicit permission granted.
 *
 * @param {Object} user - User object from database
 * @param {string} permission - One of: 'view', 'edit', 'create', 'delete'
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false;

  // Admins and Super Admins ALWAYS have all permissions
  if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
    return true;
  }

  // For HR and Employee, check their individual permissions
  return user.permissions?.[permission] === true;
}

/**
 * Middleware to require view permission.
 * Use this for GET endpoints.
 *
 * @param {Request} request
 * @returns {Promise<{user: Object} | {error: NextResponse}>}
 */
export async function requireViewPermission(request) {
  const auth = await getCurrentUser(request);
  if (auth.error) return auth;

  if (!hasPermission(auth.user, "view")) {
    return {
      error: NextResponse.json(
        {
          message: "You are not authorized to view this resource.",
          required: "view permission",
          userPermissions: auth.user?.permissions || {},
        },
        { status: 403 },
      ),
    };
  }

  return auth;
}

/**
 * Middleware to require edit permission.
 * Use this for PUT/PATCH endpoints.
 */
export async function requireEditPermission(request) {
  const auth = await getCurrentUser(request);
  if (auth.error) return auth;

  if (!hasPermission(auth.user, "edit")) {
    return {
      error: NextResponse.json(
        {
          message: "You are not authorized to modify this resource.",
          required: "edit permission",
        },
        { status: 403 },
      ),
    };
  }

  return auth;
}

/**
 * Middleware to require create permission.
 * Use this for POST endpoints.
 */
export async function requireCreatePermission(request) {
  const auth = await getCurrentUser(request);
  if (auth.error) return auth;

  if (!hasPermission(auth.user, "create")) {
    return {
      error: NextResponse.json(
        {
          message: "You are not authorized to create resources.",
          required: "create permission",
        },
        { status: 403 },
      ),
    };
  }

  return auth;
}

/**
 * Middleware to require delete permission.
 * Use this for DELETE endpoints.
 */
export async function requireDeletePermission(request) {
  const auth = await getCurrentUser(request);
  if (auth.error) return auth;

  if (!hasPermission(auth.user, "delete")) {
    return {
      error: NextResponse.json(
        {
          message: "You are not authorized to delete this resource.",
          required: "delete permission",
        },
        { status: 403 },
      ),
    };
  }

  return auth;
}
