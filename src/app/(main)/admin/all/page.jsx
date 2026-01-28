"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import Loader from "@/components/Loader/Loader";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { Modal, Tag } from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const AllUsers = () => {
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
      url: `${apiUrls?.auth?.getAllUsers}?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.users)
          ? response?.data?.users
          : [];
        setTotalDocuments(response.data.pagination.totalUsers);

        const mappedData = dataList.map((item) => ({
          fullName: item?.fullName || "N/A",
          mobileNumber: item?.mobileNumber || "N/A",
          email: item?.email || "N/A",
          role: item?.role || "N/A",
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          updatedAt: item?.updatedAt,
          status: item?.status,
          disable: item?.disable,
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
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
      url: `${apiUrls.auth.deleteUser.replace("/id", `/${userToDelete._id}`)}`,
      onSuccess: (response) => {
        toast.success("User deleted successfully");
        setTableData((prevData) =>
          prevData.filter((item) => item._id !== userToDelete._id)
        );
        setTotalDocuments((prev) => prev - 1);
        setDeleteModalVisible(false);
        setUserToDelete(null);
      },
      onFail: (err) => {
        console.log("Delete failed:", err);
        toast.error("Failed to delete user");
        setDeleteModalVisible(false);
        setUserToDelete(null);
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setUserToDelete(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "lawyer":
        return "blue";
      case "clerk":
        return "green";
      case "public":
        return "orange";
      default:
        return "default";
    }
  };

  const columns = [
    {
      Header: "Full Name",
      accessor: "fullName",
      width: 180,
    },
    {
      Header: "Mobile Number",
      accessor: "mobileNumber",
      width: 140,
    },
    {
      Header: "Email ID",
      accessor: "email",
      width: 180,
    },
    {
      Header: "Role",
      accessor: "role",
      width: 100,
      Cell: (value) => (
        <Tag color={getRoleColor(value)}>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </Tag>
      ),
    },
    {
      Header: "Created",
      accessor: "date",
      width: 100,
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
      <Title title={"All Users List"} />

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
        title="Delete User"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
        }}
        cancelButtonProps={{ disabled: deleteLoading }}
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
          {userToDelete && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800">User Name:</p>
              <p className="text-gray-600">{userToDelete.fullName}</p>
              <p className="font-medium text-gray-800 mt-2">Email:</p>
              <p className="text-gray-600">{userToDelete.email}</p>
              <p className="font-medium text-gray-800 mt-2">Role:</p>
              <Tag color={getRoleColor(userToDelete.role)}>
                {userToDelete.role?.charAt(0).toUpperCase() +
                  userToDelete.role?.slice(1)}
              </Tag>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AllUsers;
