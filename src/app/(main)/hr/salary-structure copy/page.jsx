/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

import { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function SalaryStructurePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canView, canCreate } = usePermissions();
  const { getQuery, loading } = useGetQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `/api/v1/admin/salary-structures?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const list = Array.isArray(response?.salaryStructures)
          ? response.salaryStructures
          : [];
        setTotalDocuments(response.pagination?.total || 0);
        setTableData(
          list.map((item) => ({
            _id: item._id,
            employeeName: item.employeeName || item.employee?.name || "—",
            cardId: item.cardId || "—",
            company: item.company?.name || "—",
            payrollPeriod: `${item.payrollMonth}/${item.payrollYear}`,
            payableDays: item.payableDays ?? "—",
            basicEarned: item.basicEarned ?? "—",
            gross: item.gross ?? "—",
            totalDeductions: item.totalDeductions ?? "—",
            amount: item.amount ?? item.roundedAmount ?? "—",
            date: item.createdAt
              ? moment(item.createdAt).format("DD-MM-YYYY")
              : "—",
          }))
        );
      },
      onFail: () => {
        toast.error("Failed to fetch salary records");
      },
    });
  };

  useEffect(() => {
    if (canView()) fetchData();
  }, []);

  const columns = [
    { Header: "Employee", accessor: "employeeName", width: 200 },
    { Header: "Card ID", accessor: "cardId", width: 150 },
    { Header: "Company", accessor: "company", width: 200 },
    { Header: "Period", accessor: "payrollPeriod", width: 120 },
    { Header: "Payable Days", accessor: "payableDays", width: 150 },
    { Header: "Basic Earned", accessor: "basicEarned", width: 150 },
    { Header: "Gross", accessor: "gross", width: 150 },
    { Header: "Deductions", accessor: "totalDeductions", width: 150 },
    { Header: "Net Amount", accessor: "amount", width: 150 },
    { Header: "Created", accessor: "date", width: 150 },
  ];

  const handlePageChange = (newPage) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", newPage);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleLimitChange = (newLimit) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("limit", newLimit);
    newSearchParams.set("page", 1);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const basePath = pathname?.startsWith("/hr") ? "/hr" : "/admin";

  return (
    <PermissionGuard
      permission="view"
      fallback={
        <div className="p-4 text-gray-500">
          You do not have permission to view salary structure.
        </div>
      }
    >
      <Title
        title="Salary Structure"
        showButton={canCreate()}
        buttonText="Add Salary"
        destination={`${basePath}/salary-structure/add`}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          <EnhancedTable
            columns={columns}
            data={tableData}
            showDate={true}
            showActions={true}
            onView={
              canView()
                ? (row) =>
                    router.push(
                      `${basePath}/salary-structure/view/${row._id}?page=${page}&limit=${limit}`
                    )
                : undefined
            }
            onEdit={
              canCreate()
                ? (row) =>
                    router.push(`${basePath}/salary-structure/edit/${row._id}`)
                : undefined
            }
            onDelete={undefined}
            entryText={`Total Records: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        </div>
      )}
    </PermissionGuard>
  );
}
