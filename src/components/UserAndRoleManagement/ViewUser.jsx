"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useParams } from "next/navigation";
import { Card, Tag, Descriptions, Divider } from "antd";
import { useEffect, useState, useCallback } from "react";
import {
  UserOutlined,
  MailOutlined,
  SafetyOutlined,
  IdcardOutlined,
  HomeOutlined,
  CalendarOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ClusterOutlined,
  StarOutlined,
  ToolOutlined,
} from "@ant-design/icons";

export default function ViewUser({ basePath = "/admin" }) {
  const params = useParams();
  const { id } = params;

  const { getQuery, loading } = useGetQuery();
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/users/${id}`,
      onSuccess: (response) => {
        setUser(response?.user || null);
      },
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch user details");
      },
    });
  }, [id, getQuery]);

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
      case "super_admin":
        return "red";
      case "hr":
        return "blue";
      case "employee":
        return "green";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <>
        <BackHeader
          label="Back"
          href={`${basePath}/user-and-role-management`}
        />
        <Title title="User Details" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <BackHeader
          label="Back"
          href={`${basePath}/user-and-role-management`}
        />
        <Title title="User Details" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">User not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader label="Back" href={`${basePath}/user-and-role-management`} />
      <Title
        title="User Details"
        buttonText={user.softDelete ? undefined : "Edit User"}
        destination={user.softDelete ? undefined : `${basePath}/user-and-role-management/edit/${id}`}
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
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <SafetyOutlined /> Role
              </span>
            }
          >
            <Tag color={getRoleColor(user.role)}>
              {user.role?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={user.softDelete ? "default" : user.active ? "success" : "default"}>
              {user.softDelete ? "Deleted" : user.active ? "Active" : "Inactive"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <CalendarOutlined /> Created At
              </span>
            }
          >
            {user.createdAt
              ? moment(user.createdAt).format("DD-MM-YYYY hh:mm A")
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <CalendarOutlined /> Updated At
              </span>
            }
          >
            {user.updatedAt
              ? moment(user.updatedAt).format("DD-MM-YYYY hh:mm A")
              : "N/A"}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <BankOutlined /> Organization Details
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
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
            {user.department?.name
              ? `${user.department.name} (${user.department.code || ""})`
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> Designation
              </span>
            }
          >
            {user.designation?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <StarOutlined /> Grade
              </span>
            }
          >
            {user.grade?.name ? user.grade.name : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <ToolOutlined /> Skills
              </span>
            }
          >
            {user.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {user.skills.map((skill) => (
                  <Tag key={skill._id || skill} color="blue">
                    {skill.name}
                  </Tag>
                ))}
              </div>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <SafetyOutlined /> Permissions
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 4 }}
        >
          <Descriptions.Item label="View">
            <Tag color={user.permissions?.view ? "cyan" : "default"}>
              {user.permissions?.view ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Edit">
            <Tag color={user.permissions?.edit ? "orange" : "default"}>
              {user.permissions?.edit ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Delete">
            <Tag color={user.permissions?.delete ? "red" : "default"}>
              {user.permissions?.delete ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Create">
            <Tag color={user.permissions?.create ? "green" : "default"}>
              {user.permissions?.create ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <IdcardOutlined /> Additional Information
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> PAN Number
              </span>
            }
          >
            {user.pan || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> Aadhar Number
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
        </Descriptions>
      </Card>
    </>
  );
}
