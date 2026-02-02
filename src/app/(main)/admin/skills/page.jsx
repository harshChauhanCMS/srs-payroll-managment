"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";
import { usePermissions } from "@/hooks/usePermissions";

import { Modal, Tag } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const basePath = "/admin";

export default function SkillsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canView, canEdit, canDelete, canCreate } = usePermissions();

  const { getQuery, loading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `/api/v1/admin/skills?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.skills) ? response.skills : [];
        setTotalDocuments(response.pagination?.total || 0);
        setTableData(
          dataList.map((item) => ({
            name: item?.name || "N/A",
            category: item?.category || "N/A",
            basic: item?.basic != null ? Number(item.basic) : 0,
            status: item?.active ? "Active" : "Inactive",
            active: item?.active,
            date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
            _id: item?._id,
          }))
        );
      },
      onFail: () => {
        toast.error("Failed to fetch skills");
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handleDeleteClick = (row) => {
    setSkillToDelete(row);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!skillToDelete) return;
    deleteQuery({
      url: `/api/v1/admin/skills/${skillToDelete._id}`,
      onSuccess: () => {
        toast.success("Skill deleted successfully");
        fetchData();
        setDeleteModalVisible(false);
        setSkillToDelete(null);
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to delete skill");
        setDeleteModalVisible(false);
        setSkillToDelete(null);
      },
    });
  };

  const columns = [
    { Header: "Name", accessor: "name", width: 180 },
    { Header: "Category", accessor: "category", width: 140 },
    {
      Header: "Basic (₹)",
      accessor: "basic",
      width: 120,
      Cell: (value) => (
        <span className="text-gray-700">
          {value != null ? `₹${Number(value).toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      width: 100,
      Cell: (value, record) => (
        <Tag color={record.active ? "green" : "default"}>{value}</Tag>
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
    newSearchParams.set("page", "1");
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <>
      <Title
        title="Skills"
        showButton={canCreate()}
        buttonText="Add Skill"
        destination={`${basePath}/skills/add`}
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
                    `${basePath}/skills/edit/${row._id}?page=${page}&limit=${limit}`
                : undefined
            }
            onEdit={
              canEdit()
                ? (row) => router.push(`${basePath}/skills/edit/${row._id}`)
                : undefined
            }
            onDelete={canDelete() ? handleDeleteClick : undefined}
            entryText={`Total Skills: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        </div>
      )}

      <Modal
        title="Delete Skill"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
          className: "red-button",
          style: { borderRadius: "8px" },
        }}
        cancelButtonProps={{
          className: "white-button",
          style: { borderRadius: "8px" },
        }}
        centered
      >
        <p className="text-red-600 font-semibold mb-2">
          ⚠️ This action cannot be undone.
        </p>
        <p className="text-gray-600">
          Are you sure you want to delete skill{" "}
          <strong>{skillToDelete?.name}</strong>?
        </p>
      </Modal>
    </>
  );
}
