"use client";

import Title from "@/components/Title/Title";
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
      <Title title="Input Exceptions" />
      <div className="pt-4">
        <ExceptionsView />
      </div>
    </PermissionGuard>
  );
}
