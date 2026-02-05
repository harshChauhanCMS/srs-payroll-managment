"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import { Card, Row, Col, Statistic, Table, Tag } from "antd";
import {
  TeamOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  UserOutlined,
} from "@ant-design/icons";

const HRDashboard = () => {
  const user = useSelector((state) => state.user?.user);
  const { getQuery, loading } = useGetQuery();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalSites: 0,
    totalDepartments: 0,
    activeEmployees: 0,
  });

  const [companyInfo, setCompanyInfo] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);

  useEffect(() => {
    // Fetch company info
    if (user?.company) {
      getQuery({
        url: `/api/v1/admin/companies/${user.company}`,
        onSuccess: (response) => {
          setCompanyInfo(response?.company);
        },
        onFail: () => {},
      });
    }

    // Fetch employees from HR's company only
    getQuery({
      url: "/api/v1/admin/users?limit=100",
      onSuccess: (response) => {
        const employees = response?.users || [];
        setStats((prev) => ({
          ...prev,
          totalEmployees: response?.pagination?.total || 0,
          activeEmployees: employees.filter((u) => u.active && !u.softDelete)
            .length,
        }));
        setRecentEmployees(employees.slice(0, 5));
      },
      onFail: () => {},
    });

    // Fetch sites from HR's company
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

    // Fetch departments from HR's company
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
  }, [user?.company]);

  const employeeColumns = [
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
        <Tag color={role === "hr" ? "blue" : "green"}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Site",
      dataIndex: "site",
      key: "site",
      render: (site) => site?.name || "Not Assigned",
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      render: (active) => (
        <Tag color={active ? "success" : "default"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="text-slate-950">
      <Title title="HR Dashboard" />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <>
          {/* Company Info */}
          {companyInfo && (
            <Card className="mb-6 shadow-sm">
              <div className="flex items-center gap-4">
                <UserOutlined className="text-4xl text-blue-500" />
                <div>
                  <h3 className="text-xl font-semibold">{companyInfo.name}</h3>
                  <p className="text-gray-500">Your Company</p>
                  {companyInfo.gstNumber && (
                    <p className="text-sm text-gray-400">
                      GST: {companyInfo.gstNumber}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Statistics */}
          <Row gutter={[16, 16]} className="mt-6">
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Total Employees"
                  value={stats.totalEmployees}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {stats.activeEmployees} active
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Sites"
                  value={stats.totalSites}
                  prefix={<EnvironmentOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
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

          {/* Recent Employees */}
          <Row gutter={[16, 16]} className="mt-6">
            <Col xs={24}>
              <Card title="Recent Employees" className="shadow-sm">
                <Table
                  columns={employeeColumns}
                  dataSource={recentEmployees}
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

export default HRDashboard;
