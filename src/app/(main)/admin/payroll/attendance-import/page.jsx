"use client";

import AttendanceImport from "@/components/Payroll/AttendanceImport";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

export default function AttendanceImportPage() {
  return (
    <PermissionGuard
      permission="view"
      fallback={
        <div className="p-4 text-gray-500">
          You do not have permission to view this page.
        </div>
      }
    >
      <>
        <AttendanceImport />
      </>
    </PermissionGuard>
  );
}
