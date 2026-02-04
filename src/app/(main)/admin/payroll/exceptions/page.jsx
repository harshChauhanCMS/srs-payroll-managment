"use client";

import ExceptionsView from "@/components/Payroll/ExceptionsView";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

export default function ExceptionsPage() {
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
        <ExceptionsView />
      </>
    </PermissionGuard>
  );
}
