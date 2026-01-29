"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { Modal, Tag, Space } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const UserAndRoleManagement = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `/api/v1/admin/users?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.users) ? response.users : [];
        setTotalDocuments(response.pagination?.total || 0);

        const mappedData = dataList.map((item) => ({
          name: item?.name || "N/A",
          email: item?.email || "N/A",
          role: item?.role || "N/A",
          permissions: item?.permissions || {},
          status: item?.active ? "Active" : "Inactive",
          active: item?.active,
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch users");
      },
    });
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;

    deleteQuery({
      url: `/api/v1/admin/users/${userToDelete._id}`,
      onSuccess: () => {
        toast.success("User deactivated successfully");
        setTableData((prevData) =>
          prevData.filter((item) => item._id !== userToDelete._id),
        );
        setTotalDocuments((prev) => prev - 1);
        setDeleteModalVisible(false);
        setUserToDelete(null);
      },
      onFail: (err) => {
        console.log("Delete failed:", err);
        toast.error("Failed to deactivate user");
        setDeleteModalVisible(false);
        setUserToDelete(null);
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const columns = [
    {
      Header: "Name",
      accessor: "name",
      width: 150,
    },
    {
      Header: "Email",
      accessor: "email",
      width: 200,
    },
    {
      Header: "Role",
      accessor: "role",
      width: 100,
      Cell: (value) => (
        <Tag
          color={value === "admin" ? "red" : value === "hr" ? "blue" : "green"}
        >
          {value?.toUpperCase()}
        </Tag>
      ),
    },
    {
      Header: "Permissions",
      accessor: "permissions",
      width: 200,
      Cell: (value) => (
        <div className="flex flex-wrap gap-1.5">
          {value?.view && <Tag color="cyan">View</Tag>}
          {value?.edit && <Tag color="orange">Edit</Tag>}
          {value?.delete && <Tag color="red">Delete</Tag>}
          {value?.create && <Tag color="green">Create</Tag>}
        </div>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      width: 100,
      Cell: (value, record) => (
        <Tag color={record.active ? "success" : "default"}>{value}</Tag>
      ),
    },
    {
      Header: "Created",
      accessor: "date",
      width: 120,
    },
  ];

  useEffect(() => {
    fetchData();
  }, [page, limit]);

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

  return (
    <>
      <Title
        title={"User & Role Management"}
        showButton={true}
        buttonText="Add User"
        destination="/admin/user-and-role-management/add"
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
            onView={(row) =>
              `/admin/user-and-role-management/view/${row._id}?page=${page}&limit=${limit}`
            }
            onEdit={(row) =>
              router.push(`/admin/user-and-role-management/edit/${row._id}`)
            }
            onDelete={handleDeleteClick}
            entryText={`Total Users: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Deactivate User"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Deactivate"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
          className: "red-button",
          style: { borderRadius: "8px" },
        }}
        cancelButtonProps={{
          disabled: deleteLoading,
          className: "white-button",
          style: { borderRadius: "8px" },
        }}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to deactivate this user? They will no longer
            be able to login.
          </p>
          {userToDelete && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800">Name:</p>
              <p className="text-gray-600">{userToDelete.name}</p>
              <p className="font-medium text-gray-800 mt-2">Email:</p>
              <p className="text-gray-600">{userToDelete.email}</p>
              <p className="font-medium text-gray-800 mt-2">Role:</p>
              <p className="text-gray-600 capitalize">{userToDelete.role}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default UserAndRoleManagement;
