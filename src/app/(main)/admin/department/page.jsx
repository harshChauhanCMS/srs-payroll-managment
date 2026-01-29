"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { useEffect, useState } from "react";
import { Modal, Tag } from "antd";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const DepartmentPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = () => {
    getQuery({
      url: `/api/v1/admin/departments?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.departments)
          ? response.departments
          : [];
        setTotalDocuments(response.pagination?.total || 0);

        const mappedData = dataList.map((item) => ({
          name: item?.name || "N/A",
          code: item?.code || "N/A",
          description: item?.description || "-",
          status: item?.active ? "Active" : "Inactive",
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch departments");
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handleEditStart = (row) => {
    router.push(`/admin/department/edit/${row._id}`);
  };

  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem?._id) return;

    deleteQuery({
      url: `/api/v1/admin/departments/${selectedItem._id}`,
      onSuccess: () => {
        toast.success("Department deactivated successfully");
        setDeleteModalOpen(false);
        setSelectedItem(null);
        fetchData();
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to deactivate department");
      },
    });
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (newLimit) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", newLimit.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const columns = [
    { Header: "Name", accessor: "name", width: 200 },
    { Header: "Code", accessor: "code", width: 120 },
    { Header: "Description", accessor: "description", width: 250 },
    {
      Header: "Status",
      accessor: "status",
      width: 100,
      Cell: (value) => (
        <Tag color={value === "Active" ? "green" : "red"}>{value}</Tag>
      ),
    },
    { Header: "Created", accessor: "date", width: 120 },
  ];

  return (
    <>
      <Title
        title="Department Management"
        showButton={true}
        buttonText="Add Department"
        destination="/admin/department/add"
      />

      {fetchLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          <EnhancedTable
            columns={columns}
            data={tableData}
            showActions={true}
            onEdit={handleEditStart}
            onDelete={handleDeleteClick}
            entryText={`Total Departments: ${totalDocuments}`}
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
        title="Deactivate Department"
        open={deleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        confirmLoading={deleteLoading}
        okText="Deactivate"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to deactivate `{selectedItem?.name}`?</p>
      </Modal>
    </>
  );
};

export default DepartmentPage;
