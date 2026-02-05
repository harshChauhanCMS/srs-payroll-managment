"use client";

import CompanyManagement from "@/components/CompanyManagement/CompanyManagement";

export default function EmployeeCompanyPage() {
  return <CompanyManagement basePath="/employee" showAddButton={false} />;
}
