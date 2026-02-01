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
        { status: 401 }
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
        { status: 401 }
      ),
    };
  }

  await connectDB();
  const user = await User.findById(decoded._id).lean();
  if (!user) {
    return {
      error: NextResponse.json(
        { message: "User not found." },
        { status: 401 }
      ),
    };
  }

  return { user };
}

/**
 * Same as getCurrentUser but returns 403 if role is employee (for management-only routes).
 */
export async function getCurrentUserRequireManagement(request) {
  const auth = await getCurrentUser(request);
  if (auth.error) return auth;

  if (auth.user.role === ROLES.EMPLOYEE) {
    return {
      error: NextResponse.json(
        { message: "Forbidden. Employees cannot access this resource." },
        { status: 403 }
      ),
    };
  }

  return auth;
}
