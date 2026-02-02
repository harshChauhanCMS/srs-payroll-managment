"use client";

import { usePathname } from "next/navigation";
import AddSalaryForm from "@/components/SalaryStructure/AddSalaryForm";

export default function HRAddSalaryPage() {
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/hr") ? "/hr" : "/admin";
  return <AddSalaryForm basePath={basePath} />;
}
