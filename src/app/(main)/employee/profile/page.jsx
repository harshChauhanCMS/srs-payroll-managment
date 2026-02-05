"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employee/profile/view");
  }, [router]);

  return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );
}
