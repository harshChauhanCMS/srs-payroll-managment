"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Modal, Tag, Switch, Button, Select } from "antd";
import { usePermissions } from "@/hooks/usePermissions";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function UserAndRoleManagement({
  basePath = "/admin",
  showAddButton = true, // Keep for backward compatibility but will be overridden by permissions
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canView, canEdit, canDelete, canCreate } = usePermissions();
  const currentUser = useSelector((state) => state.user?.user);

  const { getQuery, loading } = useGetQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();
  const { putQuery } = usePutQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [togglingUserId, setTogglingUserId] = useState(null);

  // Filter States
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    let url = `/api/v1/admin/users?page=${page}&limit=${limit}`;
    if (roleFilter) url += `&role=${roleFilter}`;
    if (statusFilter)
      url += `&active=${statusFilter === "active" ? "true" : "false"}`;

    getQuery({
      url,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.users) ? response.users : [];
        setTotalDocuments(response.pagination?.total || 0);

        const mappedData = dataList.map((item) => {
          const skills = item?.skills;
          let salaryDisplay = "Not set";
          if (skills?.length) {
            const first = skills[0];
            const amts = [
              first?.basic,
              first?.houseRentAllowance,
              first?.otherAllowance,
              first?.leaveEarnings,
              first?.bonusEarnings,
              first?.arrear,
            ].map((v) => Number(v) || 0);
            const hasAny = amts.some((v) => v > 0);
            if (hasAny) {
              const basic = Number(first?.basic) || 0;
              salaryDisplay =
                basic > 0 ? `Basic: ₹${basic.toLocaleString()}` : "Configured";
            }
          }
          return {
            name: item?.name || "N/A",
            email: item?.email || "N/A",
            role: item?.role || "N/A",
            permissions: item?.permissions || {},
            status: item?.softDelete
              ? "Deleted"
              : item?.active
                ? "Active"
                : "Inactive",
            active: item?.active,
            softDelete: item?.softDelete,
            company: item?.company?.name || "Not Assigned",
            site: item?.site?.name || "Not Assigned",
            salary: salaryDisplay,
            date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
            _id: item?._id,
          };
        });

        setTableData(mappedData);
      },
      onFail: (err) => {
        toast.error("Failed to fetch users");
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, roleFilter, statusFilter]);

  const handleStatusToggle = (userId, currentStatus) => {
    // Prevent toggling own account
    if (currentUser?._id === userId) {
      toast.error("You cannot toggle your own account status");
      return;
    }

    setTogglingUserId(userId);

    putQuery({
      url: `/api/v1/admin/users/${userId}`,
      putData: { active: !currentStatus },
      onSuccess: () => {
        toast.success(
          `User ${!currentStatus ? "activated" : "deactivated"} successfully`,
        );
        fetchData();
        setTogglingUserId(null);
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to update user status");
        setTogglingUserId(null);
      },
    });
  };

  const handleDeleteClick = (user) => {
    // Prevent deleting own account
    if (currentUser?._id === user._id) {
      toast.error("You cannot delete your own account");
      return;
    }
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;

    deleteQuery({
      url: `/api/v1/admin/users/${userToDelete._id}`,
      onSuccess: () => {
        toast.success("User deleted successfully");
        fetchData();
        setDeleteModalVisible(false);
        setUserToDelete(null);
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to delete user");
        setDeleteModalVisible(false);
        setUserToDelete(null);
      },
    });
  };

  const handleFilterChange = (key, value) => {
    if (key === "role") setRoleFilter(value);
    if (key === "status") setStatusFilter(value);

    // Reset to page 1 on filter change
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", 1);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const columns = [
    { Header: "Name", accessor: "name", width: 150 },
    { Header: "Email", accessor: "email", width: 200 },
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
      Header: "Company",
      accessor: "company",
      width: 150,
      Cell: (value) => (
        <Tag color={value === "Not Assigned" ? "default" : "purple"}>
          {value}
        </Tag>
      ),
    },
    {
      Header: "Site",
      accessor: "site",
      width: 150,
      Cell: (value) => (
        <Tag color={value === "Not Assigned" ? "default" : "blue"}>{value}</Tag>
      ),
    },
    {
      Header: "Salary",
      accessor: "salary",
      width: 140,
      Cell: (value) => (
        <span className="text-gray-700">{value || "Not set"}</span>
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
      accessor: "active",
      width: 120,
      Cell: (value, record) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={value}
            loading={togglingUserId === record._id}
            disabled={
              record.softDelete ||
              togglingUserId === record._id ||
              currentUser?._id === record._id ||
              !canEdit()
            }
            onChange={() => handleStatusToggle(record._id, value)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </div>
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

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <Title title={"User & Role Management"} showButton={canCreate()} />

          <div className="flex gap-2">
            <Button
              className="white-button"
              onClick={() => {
                router.push(`${basePath}/user-and-role-management/bulk-upload`);
              }}
              style={{ borderRadius: "8px" }}
            >
              Bulk Upload
            </Button>

            <Button
              className="simple-button"
              onClick={() => {
                router.push(`${basePath}/user-and-role-management/add`);
              }}
              style={{ borderRadius: "8px" }}
            >
              Add User
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Select
            placeholder="Filter by Role"
            style={{ width: 200 }}
            allowClear
            onChange={(val) => handleFilterChange("role", val)}
            options={[
              { value: "admin", label: "Admin" },
              { value: "hr", label: "HR" },
              { value: "employee", label: "Employee" },
            ]}
          />
          <Select
            placeholder="Filter by Status"
            style={{ width: 200 }}
            allowClear
            onChange={(val) => handleFilterChange("status", val)}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
      </div>

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
                    `${basePath}/user-and-role-management/view/${row._id}?page=${page}&limit=${limit}`
                : undefined
            }
            onEdit={
              canEdit()
                ? (row) =>
                    router.push(
                      `${basePath}/user-and-role-management/edit/${row._id}`,
                    )
                : undefined
            }
            onDelete={canDelete() ? handleDeleteClick : undefined}
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

      <Modal
        title="Delete User"
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
        <div className="py-4">
          <p className="text-red-600 font-semibold mb-4">
            ⚠️ Warning: This action cannot be undone!
          </p>
          <p className="text-gray-600 mb-4">
            The user will first be released from all assignments (skills, grade,
            designation, department, site, and company), and then{" "}
            <strong>permanently deleted</strong> from the database.
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
}
