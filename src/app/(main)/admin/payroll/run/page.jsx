"use client";

import PayrollRunComponent from "@/components/Payroll/PayrollRun";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

export default function PayrollRunPage() {
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
        <PayrollRunComponent />
      </>
    </PermissionGuard>
  );
}
