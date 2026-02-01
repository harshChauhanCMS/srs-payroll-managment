import { NextResponse } from "next/server";
import { ROLES } from "@/constants/roles";

/**
 * Check if a user has a specific permission
 *
 * Permission logic:
 * - Admin/Super Admin: Always has ALL permissions
 * - HR/Employee: Must have explicit permission granted
 *
 * @param {Object} user - User object from database
 * @param {string} permission - One of: 'view', 'edit', 'create', 'delete'
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;

  // Admins and Super Admins ALWAYS have all permissions
  if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
    return true;
  }

  // For HR and Employee, check their individual permissions
  // If permission is not explicitly granted (true), they don't have access
  return user.permissions?.[permission] === true;
};

/**
 * Require a specific permission for an API route
 * Returns an error response if permission is denied
 *
 * @param {Object} user - User object from database
 * @param {string} permission - Required permission
 * @returns {NextResponse|null} - Error response or null if permitted
 *
 * @example
 * const permissionError = requirePermission(currentUser, 'edit');
 * if (permissionError) return permissionError;
 */
export const requirePermission = (user, permission) => {
  if (!hasPermission(user, permission)) {
    return NextResponse.json(
      {
        message: `Forbidden. You do not have permission to ${permission}.`,
        required: permission,
        userPermissions: user?.permissions || {},
      },
      { status: 403 },
    );
  }
  return null;
};

/**
 * Check if user can access a resource for a specific company
 * HR users can only access their own company's resources
 *
 * @param {Object} user - User object from database
 * @param {string} targetCompanyId - Company ID of the resource
 * @returns {boolean}
 */
export const canAccessCompany = (user, targetCompanyId) => {
  if (!user) return false;

  // Admins can access any company
  if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
    return true;
  }

  // HR can only access their own company
  if (user.role === ROLES.HR) {
    return String(user.company) === String(targetCompanyId);
  }

  // Employees can only access their own company
  if (user.role === ROLES.EMPLOYEE) {
    return String(user.company) === String(targetCompanyId);
  }

  return false;
};

/**
 * Get default permissions for a role
 *
 * @param {string} role - User role
 * @returns {Object} Default permission object
 */
export const getDefaultPermissions = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return {
        view: true,
        create: true,
        edit: true,
        delete: true,
      };

    case ROLES.HR:
      return {
        view: true,
        create: true,
        edit: true,
        delete: false,
      };

    case ROLES.EMPLOYEE:
    default:
      return {
        view: true,
        create: false,
        edit: false,
        delete: false,
      };
  }
};
