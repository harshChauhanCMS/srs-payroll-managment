"use client";

import Title from "@/components/Title/Title";
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
      <Title title="Attendance Review" />
      <div className="pt-4">
        <AttendanceReview />
      </div>
    </PermissionGuard>
  );
}
