"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import { Card, Row, Col, Descriptions, Tag, Badge } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const EmployeeDashboard = () => {
  const user = useSelector((state) => state.user?.user);
  const { getQuery, loading } = useGetQuery();

  const [companyInfo, setCompanyInfo] = useState(null);
  const [siteInfo, setSiteInfo] = useState(null);
  const [departmentInfo, setDepartmentInfo] = useState(null);

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

    // Fetch site info
    if (user?.site) {
      getQuery({
        url: `/api/v1/admin/sites/${user.site}`,
        onSuccess: (response) => {
          setSiteInfo(response?.site);
        },
        onFail: () => {},
      });
    }

    // Fetch department info
    if (user?.department) {
      getQuery({
        url: `/api/v1/admin/departments/${user.department}`,
        onSuccess: (response) => {
          setDepartmentInfo(response?.department);
        },
        onFail: () => {},
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company, user?.site, user?.department]);

  return (
    <div className="text-slate-950">
      <Title title="Employee Dashboard" />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="mt-8">
          {/* Welcome Card */}
          {/* <Card className="mb-6 shadow-md bg-linear-to-r from-blue-50 to-blue-100">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 text-white p-4 rounded-full">
                <UserOutlined className="text-3xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900">
                  Welcome, {user?.name || "Employee"}!
                </h2>
                <p className="text-blue-700">
                  Role: <Tag color="blue">{user?.role?.toUpperCase()}</Tag>
                </p>
              </div>
            </div>
          </Card> */}

          {/* Personal Information */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <IdcardOutlined className="mr-2" />
                    Personal Information
                  </span>
                }
                className="shadow-sm"
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Name">
                    {user?.name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <MailOutlined className="mr-2" />
                    {user?.email || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Badge
                      status={user?.active ? "success" : "default"}
                      text={user?.active ? "Active" : "Inactive"}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="PAN">
                    {user?.pan || "Not Provided"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Aadhar">
                    {user?.aadhar
                      ? `${user.aadhar.slice(0, 4)} XXXX XXXX`
                      : "Not Provided"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Organizational Information */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span>
                    <BankOutlined className="mr-2" />
                    Organization Details
                  </span>
                }
                className="shadow-sm"
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Company">
                    {companyInfo?.name || "Not Assigned"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Site">
                    <EnvironmentOutlined className="mr-2" />
                    {siteInfo?.name || "Not Assigned"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Department">
                    <AppstoreOutlined className="mr-2" />
                    {departmentInfo?.name || "Not Assigned"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Designation">
                    {user?.designation?.name || "Not Assigned"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Grade">
                    {user?.grade?.name || "Not Assigned"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>

          {/* Permissions Card */}
          {user?.permissions && (
            <Row gutter={[16, 16]} className="mt-6">
              <Col xs={24}>
                <Card title="Your Permissions" className="shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {user.permissions.view && (
                      <Tag color="cyan" className="text-sm px-3 py-1">
                        👁️ View
                      </Tag>
                    )}
                    {user.permissions.edit && (
                      <Tag color="orange" className="text-sm px-3 py-1">
                        ✏️ Edit
                      </Tag>
                    )}
                    {user.permissions.create && (
                      <Tag color="green" className="text-sm px-3 py-1">
                        ➕ Create
                      </Tag>
                    )}
                    {user.permissions.delete && (
                      <Tag color="red" className="text-sm px-3 py-1">
                        🗑️ Delete
                      </Tag>
                    )}
                    {!user.permissions.view &&
                      !user.permissions.edit &&
                      !user.permissions.create &&
                      !user.permissions.delete && (
                        <span className="text-gray-500">
                          No special permissions granted
                        </span>
                      )}
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
