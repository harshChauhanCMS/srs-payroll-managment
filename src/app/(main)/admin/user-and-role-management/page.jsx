"use client";

import UserAndRoleManagement from "@/components/UserAndRoleManagement/UserAndRoleManagement";

export default function AdminUserAndRoleManagementPage() {
  return <UserAndRoleManagement basePath="/admin" showAddButton={true} />;
}
