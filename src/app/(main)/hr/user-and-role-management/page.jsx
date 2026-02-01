"use client";

import { useSelector } from "react-redux";
import UserAndRoleManagement from "@/components/UserAndRoleManagement/UserAndRoleManagement";

export default function HRUserAndRoleManagementPage() {
  const user = useSelector((state) => state.user?.user);
  const permissions = user?.permissions;
  return (
    <UserAndRoleManagement
      basePath="/hr"
      showAddButton={permissions?.create}
      canEdit={permissions?.edit}
      canDelete={permissions?.delete}
    />
  );
}
