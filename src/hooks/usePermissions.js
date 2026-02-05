import { useAuth } from "./useAuth";
import { ROLES } from "@/constants/roles";

/**
 * Custom hook for checking user permissions and roles
 *
 * Permission logic:
 * - Admin/Super Admin: Always has ALL permissions
 * - HR/Employee: Must have explicit permission granted (permissions.view, permissions.edit, etc.)
 * - No permission = No access
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if user is admin or super admin
   * Admins always have all permissions
   */
  const isAdmin = () => {
    return user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;
  };

  const isHR = () => user?.role === ROLES.HR;
  const isEmployee = () => user?.role === ROLES.EMPLOYEE;

  /**
   * Check if user has a specific permission
   *
   * @param {string} permission - One of: 'view', 'edit', 'create', 'delete'
   * @returns {boolean}
   */
  const can = (permission) => {
    if (!user) return false;

    // Admins and Super Admins ALWAYS have all permissions
    if (isAdmin()) return true;

    // For HR and Employee, check their individual permissions
    // If permission is not explicitly granted (true), they don't have access
    return user.permissions?.[permission] === true;
  };

  /**
   * Check if user can view content
   */
  const canView = () => can("view");

  /**
   * Check if user can edit content
   */
  const canEdit = () => can("edit");

  /**
   * Check if user can create content
   */
  const canCreate = () => can("create");

  /**
   * Check if user can delete content
   */
  const canDelete = () => can("delete");

  /**
   * Check if user has a specific role
   */
  const isRole = (roleName) => user?.role === roleName;

  /**
   * Get user's role
   */
  const getRole = () => user?.role;

  return {
    user,
    can,
    canView,
    canEdit,
    canCreate,
    canDelete,
    isAdmin,
    isHR,
    isEmployee,
    isRole,
    getRole,
  };
};
