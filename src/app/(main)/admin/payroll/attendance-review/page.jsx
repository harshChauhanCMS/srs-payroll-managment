"use client";

import AttendanceReview from "@/components/Payroll/AttendanceReview";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

export default function AttendanceReviewPage() {
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
        <AttendanceReview />
      </>
    </PermissionGuard>
  );
}
