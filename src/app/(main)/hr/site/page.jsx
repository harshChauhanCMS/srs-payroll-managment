"use client";

import { useSelector } from "react-redux";
import SiteManagement from "@/components/SiteManagement/SiteManagement";

export default function HRSitePage() {
  const user = useSelector((state) => state.user?.user);
  const permissions = user?.permissions;
  return (
    <SiteManagement
      basePath="/hr"
      showAddButton={permissions?.create}
      canEdit={permissions?.edit}
      canDelete={permissions?.delete}
    />
  );
}
