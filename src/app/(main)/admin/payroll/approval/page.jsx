"use client";

import Title from "@/components/Title/Title";
import ApprovalWorkflow from "@/components/Payroll/ApprovalWorkflow";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

export default function ApprovalPage() {
  return (
    <PermissionGuard
      permission="view"
      fallback={
        <div className="p-4 text-gray-500">
          You do not have permission to view this page.
        </div>
      }
    >
      <Title title="Payroll Approval" />
      <div className="pt-4">
        <ApprovalWorkflow />
      </div>
    </PermissionGuard>
  );
}
