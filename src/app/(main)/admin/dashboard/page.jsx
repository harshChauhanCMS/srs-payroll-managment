"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import { Card, Row, Col, Statistic, Table, Tag } from "antd";
import {
  TeamOutlined,
  BankOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ROLE_LABELS } from "@/constants/roles";

const AdminDashboard = () => {
  const user = useSelector((state) => state.user?.user);
  const { getQuery, loading } = useGetQuery();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalSites: 0,
    totalDepartments: 0,
    activeUsers: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    // Fetch users
    getQuery({
      url: "/api/v1/admin/users?limit=100",
      onSuccess: (response) => {
        const users = response?.users || [];
        setStats((prev) => ({
          ...prev,
          totalUsers: response?.pagination?.total || 0,
          activeUsers: users.filter((u) => u.active && !u.softDelete).length,
        }));
        setRecentUsers(users.slice(0, 5));
      },
      onFail: () => {},
    });

    // Fetch companies
    getQuery({
      url: "/api/v1/admin/companies?limit=100",
      onSuccess: (response) => {
        setStats((prev) => ({
          ...prev,
          totalCompanies: response?.pagination?.total || 0,
        }));
      },
      onFail: () => {},
    });

    // Fetch sites
    getQuery({
      url: "/api/v1/admin/sites?limit=100",
      onSuccess: (response) => {
        setStats((prev) => ({
          ...prev,
          totalSites: response?.pagination?.total || 0,
        }));
      },
      onFail: () => {},
    });

    // Fetch departments
    getQuery({
      url: "/api/v1/admin/departments?limit=100",
      onSuccess: (response) => {
        setStats((prev) => ({
          ...prev,
          totalDepartments: response?.pagination?.total || 0,
        }));
      },
      onFail: () => {},
    });
  }, []);

  const roleLabel = user?.role ? ROLE_LABELS[user.role] : "Admin";

  const userColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag
          color={role === "admin" ? "red" : role === "hr" ? "blue" : "green"}
        >
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (active, record) => (
        <Tag
          color={record.softDelete ? "default" : active ? "success" : "warning"}
        >
          {record.softDelete ? "Deleted" : active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="text-slate-950">
      <Title title={`${roleLabel} Dashboard`} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="mt-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Users"
                  value={stats.totalUsers}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {stats.activeUsers} active
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Companies"
                  value={stats.totalCompanies}
                  prefix={<BankOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Sites"
                  value={stats.totalSites}
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ color: "#cf1322" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Departments"
                  value={stats.totalDepartments}
                  prefix={<AppstoreOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mt-6">
            <Col xs={24}>
              <Card title="Recent Users" className="shadow-sm">
                <Table
                  columns={userColumns}
                  dataSource={recentUsers}
                  rowKey="_id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
