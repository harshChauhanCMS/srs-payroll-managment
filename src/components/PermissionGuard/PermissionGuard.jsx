"use client";

import { usePermissions } from "@/hooks/usePermissions";

/**
 * Component that conditionally renders children based on permissions
 *
 * - Admin/Super Admin: Always shows content
 * - HR/Employee: Only shows if they have the specific permission
 *
 * @param {string} permission - 'view', 'edit', 'create', 'delete'
 * @param {React.ReactNode} children - Content to show if permission granted
 * @param {React.ReactNode} fallback - Content to show if permission denied (default: null)
 *
 * @example
 * <PermissionGuard permission="edit">
 *   <Button>Edit</Button>
 * </PermissionGuard>
 */
export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}) {
  const { can } = usePermissions();

  // Check if user has the required permission
  if (permission && !can(permission)) {
    return fallback;
  }

  return <>{children}</>;
}
