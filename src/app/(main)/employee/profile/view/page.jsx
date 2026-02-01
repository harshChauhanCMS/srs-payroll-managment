"use client";

import { useSelector } from "react-redux";
import Title from "@/components/Title/Title";
import BackHeader from "@/components/BackHeader/BackHeader";
import { Card, Descriptions, Tag } from "antd";
import {
  UserOutlined,
  MailOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ClusterOutlined,
  IdcardOutlined,
  HomeOutlined,
} from "@ant-design/icons";

export default function EmployeeProfileViewPage() {
  const user = useSelector((state) => state.user?.user);

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
          <Descriptions.Item label="Role">
            <Tag color="blue">{user.role?.toUpperCase() || "N/A"}</Tag>
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
        </Descriptions>
      </Card>
    </div>
  );
}
