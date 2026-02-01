"use client";

import { useSelector } from "react-redux";
import CompanyManagement from "@/components/CompanyManagement/CompanyManagement";

export default function HRCompanyPage() {
  const user = useSelector((state) => state.user?.user);
  const permissions = user?.permissions;
  return (
    <CompanyManagement
      basePath="/hr"
      showAddButton={permissions?.create ?? true}
      canEdit={permissions?.edit}
      canDelete={permissions?.delete}
    />
  );
}
