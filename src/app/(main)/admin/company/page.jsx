"use client";

import CompanyManagement from "@/components/CompanyManagement/CompanyManagement";

export default function AdminCompanyPage() {
  return <CompanyManagement basePath="/admin" showAddButton={true} />;
}
