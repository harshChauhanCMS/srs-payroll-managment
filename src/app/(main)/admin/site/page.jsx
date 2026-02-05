"use client";

import SiteManagement from "@/components/SiteManagement/SiteManagement";

export default function AdminSitePage() {
  return <SiteManagement basePath="/admin" showAddButton={true} />;
}
