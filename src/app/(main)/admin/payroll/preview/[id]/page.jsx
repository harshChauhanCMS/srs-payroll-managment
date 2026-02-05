"use client";

import { use } from "react";
import Title from "@/components/Title/Title";
import PayrollPreview from "@/components/Payroll/PayrollPreview";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

export default function PayrollPreviewPage({ params }) {
  const { id } = use(params);

  return (
    <PermissionGuard
      permission="view"
      fallback={
        <div className="p-4 text-gray-500">
          You do not have permission to view this page.
        </div>
      }
    >
      <Title title="Payroll Preview" />
      <div className="pt-4">
        <PayrollPreview payrollRunId={id} />
      </div>
    </PermissionGuard>
  );
}
