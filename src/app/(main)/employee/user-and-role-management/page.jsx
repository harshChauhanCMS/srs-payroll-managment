"use client";

import UserAndRoleManagement from "@/components/UserAndRoleManagement/UserAndRoleManagement";

export default function EmployeeUserAndRoleManagementPage() {
  return <UserAndRoleManagement basePath="/employee" showAddButton={false} />;
}
