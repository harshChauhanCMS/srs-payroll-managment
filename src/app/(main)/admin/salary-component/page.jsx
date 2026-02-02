/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

import { Tag, Modal } from "antd";
import { useEffect, useState, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function SalaryComponentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canView, canCreate, canDelete } = usePermissions();
  const { getQuery, loading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/salary-components?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const list = Array.isArray(response?.salaryComponents)
          ? response.salaryComponents
          : [];
        setTotalDocuments(response.pagination?.total || 0);
        setTableData(
          list.map((item) => ({
            _id: item._id,
            company: item.company?.name || "—",
            payrollPeriod: `${item.payrollMonth}/${item.payrollYear}`,
            address: item.company.address ?? "—",
            bankName: item.company.bankName ?? "—",
            totalDeductions: item.totalDeductions ?? "—",
            amount: item.amount ?? item.roundedAmount ?? "—",
            status: item.active,
            date: item.createdAt
              ? moment(item.createdAt).format("DD-MM-YYYY")
              : "—",
          }))
        );
      },
      onFail: () => {
        toast.error("Failed to fetch salary components");
      },
    });
  }, [page, limit]);

  useEffect(() => {
    if (canView()) fetchData();
  }, []);

  const columns = [
    { Header: "Company", accessor: "company", width: 200 },
    { Header: "Address", accessor: "address", width: 200 },
    { Header: "Period", accessor: "payrollPeriod", width: 120 },
    { Header: "Deductions", accessor: "totalDeductions", width: 120 },
    {
      Header: "Status",
      accessor: "status",
      width: 100,
      Cell: ({ value }) => (
        <Tag color={value ? "success" : "default"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    { Header: "Created", accessor: "date", width: 120 },
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

  const basePath = pathname?.startsWith("/hr")
    ? "/hr"
    : pathname?.startsWith("/employee")
    ? "/employee"
    : "/admin";

  const handleDelete = (row) => {
    Modal.confirm({
      title: "Delete Salary Component",
      content: `Are you sure you want to delete the salary component for ${row.company} (${row.payrollPeriod})?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        deleteQuery({
          url: `/api/v1/admin/salary-components/${row._id}`,
          onSuccess: () => {
            toast.success("Salary component deleted successfully");
            fetchData();
          },
          onFail: (err) => {
            toast.error(err?.message || "Failed to delete salary component");
          },
        });
      },
    });
  };

  return (
    <PermissionGuard
      permission="view"
      fallback={
        <div className="p-4 text-gray-500">
          You do not have permission to view salary components.
        </div>
      }
    >
      <Title
        title="Salary Component"
        showButton={canCreate()}
        buttonText="Add Salary Component"
        destination={`${basePath}/salary-component/add`}
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
                      `${basePath}/salary-component/view/${row._id}?page=${page}&limit=${limit}`
                    )
                : undefined
            }
            onEdit={
              canCreate()
                ? (row) =>
                    router.push(`${basePath}/salary-component/edit/${row._id}`)
                : undefined
            }
            onDelete={canDelete() ? handleDelete : undefined}
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
