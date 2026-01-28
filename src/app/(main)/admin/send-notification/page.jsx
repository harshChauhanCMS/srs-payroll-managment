"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import Loader from "@/components/Loader/Loader";
import usePostQuery from "@/hooks/postQuery.hook";

import { Modal, Tag, Input, Button, Checkbox } from "antd";
import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import { SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const SendNotification = () => {
  const { getQuery, loading } = useGetQuery();
  const { postQuery, loading: sendingNotification } = usePostQuery();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationModalVisible, setNotificationModalVisible] =
    useState(false);
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
  });

  const [roleFilter, setRoleFilter] = useState({
    all: true,
    lawyer: false,
    clerk: false,
    public: false,
  });

  // Fetch all users (excluding admin)
  const fetchUsers = () => {
    getQuery({
      url: `${apiUrls?.auth?.getAllUsers}?page=1&limit=10000`, // Fetch all users
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.data?.users)
          ? response?.data?.users
          : [];

        // Filter out admin users
        const nonAdminUsers = dataList.filter((user) => user?.role !== "admin");

        const mappedData = nonAdminUsers.map((item) => ({
          fullName: item?.fullName || "N/A",
          mobileNumber: item?.mobileNumber || "N/A",
          email: item?.email || "N/A",
          role: item?.role || "N/A",
          date: moment(item?.createdAt).format("DD-MM-YYYY") || "N/A",
          _id: item?._id,
          fcmToken: item?.fcmToken || null,
        }));

        setUsers(mappedData);
        setFilteredUsers(mappedData);
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch users");
      },
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and role filter
  useEffect(() => {
    let filtered = users;

    // Apply role filter
    if (!roleFilter.all) {
      // Check if any role is selected
      const hasSelectedRoles =
        roleFilter.lawyer || roleFilter.clerk || roleFilter.public;

      if (hasSelectedRoles) {
        filtered = filtered.filter((user) => roleFilter[user.role]);
      } else {
        // If no role is selected, show nothing
        filtered = [];
      }
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.mobileNumber.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
    // Reset selection when filter changes
    setSelectedUsers([]);
    setSelectAll(false);
  }, [searchTerm, roleFilter, users]);

  const handleRoleFilterChange = (role) => {
    if (role === "all") {
      setRoleFilter({
        all: true,
        lawyer: false,
        clerk: false,
        public: false,
      });
    } else {
      setRoleFilter((prev) => {
        const newValue = !prev[role];
        // If turning on a specific role, turn off "all"
        // If turning off the last selected role, turn on "all"
        const otherRolesSelected =
          role === "lawyer"
            ? prev.clerk || prev.public
            : role === "clerk"
            ? prev.lawyer || prev.public
            : prev.lawyer || prev.clerk;

        return {
          ...prev,
          all: !newValue && !otherRolesSelected,
          [role]: newValue,
        };
      });
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(filteredUsers.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  useEffect(() => {
    // Update selectAll state based on selected users
    if (
      filteredUsers.length > 0 &&
      selectedUsers.length === filteredUsers.length
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedUsers, filteredUsers]);

  const handleOpenNotificationModal = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    setNotificationModalVisible(true);
  };

  const handleSendNotification = () => {
    if (!notificationData.title.trim()) {
      toast.error("Please enter notification title");
      return;
    }
    if (!notificationData.message.trim()) {
      toast.error("Please enter notification message");
      return;
    }

    const payload = {
      user_ids: selectedUsers,
      title: notificationData.title,
      body: notificationData.message,
      data: {
        type: "notification",
        timestamp: new Date().toISOString(),
      },
    };

    postQuery({
      url: apiUrls.notifications.sendNotification,
      postData: payload,
      onSuccess: (response) => {
        toast.success(response?.message || "Notification sent successfully!");
        setNotificationModalVisible(false);
        setNotificationData({ title: "", message: "" });
        setSelectedUsers([]);
        setSelectAll(false);
      },
      onFail: (err) => {
        console.log("Send notification failed:", err);
        toast.error("Failed to send notification");
      },
    });
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

  return (
    <>
      <Title title={"Send Notification"} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          {/* Filter and Search Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Filter by Role
              </h3>
              <div className="flex flex-wrap gap-3">
                <Checkbox
                  checked={roleFilter.all}
                  onChange={() => handleRoleFilterChange("all")}
                >
                  All Roles
                </Checkbox>
                <Checkbox
                  checked={roleFilter.lawyer}
                  onChange={() => handleRoleFilterChange("lawyer")}
                  //   disabled={roleFilter.all}
                >
                  Lawyers
                </Checkbox>
                <Checkbox
                  checked={roleFilter.clerk}
                  onChange={() => handleRoleFilterChange("clerk")}
                  //   disabled={roleFilter.all}
                >
                  Clerks
                </Checkbox>
                <Checkbox
                  checked={roleFilter.public}
                  onChange={() => handleRoleFilterChange("public")}
                  //   disabled={roleFilter.all}
                >
                  Public
                </Checkbox>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Search Users
              </h3>
              <Input
                placeholder="Search by name, email, or mobile number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
                allowClear
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  Select All ({filteredUsers.length} users)
                </Checkbox>
                <span className="text-gray-600">
                  Selected: {selectedUsers.length} user(s)
                </span>
              </div>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleOpenNotificationModal}
                disabled={selectedUsers.length === 0}
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Send Notification
              </Button>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Users List ({filteredUsers.length})
            </h3>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found matching the criteria
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedUsers.includes(user._id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleUserSelection(user._id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelection(user._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Tag color={getRoleColor(user.role)}>
                        {user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1)}
                      </Tag>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {user.fullName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      {user.mobileNumber}
                    </p>
                    <p className="text-xs text-gray-500">Joined: {user.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SendOutlined className="text-blue-600" />
            <span>Send Notification</span>
          </div>
        }
        open={notificationModalVisible}
        onOk={handleSendNotification}
        onCancel={() => {
          setNotificationModalVisible(false);
          setNotificationData({ title: "", message: "" });
        }}
        okText="Send"
        cancelText="Cancel"
        okButtonProps={{
          loading: sendingNotification,
          className: "bg-blue-600 hover:bg-blue-700",
        }}
        cancelButtonProps={{ disabled: sendingNotification }}
        width={600}
      >
        <div className="py-4">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Sending to <strong>{selectedUsers.length}</strong> selected
              user(s)
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter notification title"
              value={notificationData.title}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              maxLength={100}
              showCount
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Message <span className="text-red-500">*</span>
            </label>
            <TextArea
              placeholder="Enter notification message"
              value={notificationData.message}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              rows={4}
              maxLength={500}
              showCount
            />
          </div>

          <div className="text-xs text-gray-500">
            <p>
              💡 Tip: Keep your notification concise and clear for better
              engagement.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SendNotification;
