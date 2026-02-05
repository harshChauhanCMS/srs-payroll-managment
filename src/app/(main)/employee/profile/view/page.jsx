"use client";

import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";

import { useSelector } from "react-redux";
import { Card, Descriptions, Tag } from "antd";
import { useEffect, useState, useCallback } from "react";
import BackHeader from "@/components/BackHeader/BackHeader";
import {
  UserOutlined,
  MailOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ClusterOutlined,
  IdcardOutlined,
  HomeOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

export default function EmployeeProfileViewPage() {
  const reduxUser = useSelector((state) => state.user?.user);
  const [user, setUser] = useState(null);
  const { getQuery, loading } = useGetQuery();

  const fetchUserProfile = useCallback(() => {
    if (!reduxUser?._id) return;

    getQuery({
      url: `/api/v1/admin/users/${reduxUser._id}`,
      onSuccess: (response) => {
        setUser(response?.user || null);
      },
      onFail: () => {
        // Fallback to Redux user if API fetch fails
        setUser(reduxUser);
      },
    });
  }, [reduxUser, getQuery]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading && !user) {
    return (
      <div className="text-slate-950">
        <BackHeader label="Back" href="/employee/dashboard" />
        <Title title="My Profile" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-slate-950">
        <BackHeader label="Back" href="/employee/dashboard" />
        <Title title="My Profile" />
        <p className="text-gray-500 mt-4">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="text-slate-950">
      <BackHeader label="Back" href="/employee/dashboard" />
      <Title
        title="My Profile"
        buttonText="Edit Profile"
        destination="/employee/profile/edit"
      />

      <Card className="shadow-md" style={{ marginTop: "8px" }}>
        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <UserOutlined /> Basic Information
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <UserOutlined /> Name
              </span>
            }
          >
            {user.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <MailOutlined /> Email
              </span>
            }
          >
            {user.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Employee Code">
            {user.employeeCode || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color="blue">{user.role?.toUpperCase() || "N/A"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <PhoneOutlined /> Mobile
              </span>
            }
          >
            {user.mobile || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {user.gender || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <CalendarOutlined /> Date of Birth
              </span>
            }
          >
            {user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <CalendarOutlined /> Date of Joining
              </span>
            }
          >
            {user.doj ? new Date(user.doj).toLocaleDateString() : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Father's Name">
            {user.fatherName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> PAN
              </span>
            }
          >
            {user.pan || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> Aadhar
              </span>
            }
          >
            {user.aadhar || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <HomeOutlined /> Address
              </span>
            }
          >
            {user.address || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <BankOutlined /> Company
              </span>
            }
          >
            {user.company?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <EnvironmentOutlined /> Site
              </span>
            }
          >
            {user.site ? `${user.site.name} (${user.site.siteCode})` : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <ClusterOutlined /> Department
              </span>
            }
          >
            {user.department?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Designation">
            {user.designation?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <BankOutlined /> Bank Name
              </span>
            }
          >
            {user.bankName || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Account Number">
            {user.accountNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="IFSC Code">
            {user.ifscCode || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
