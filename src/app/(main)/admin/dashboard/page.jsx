"use client";

import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";

import { apiUrls } from "@/apis";
import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  Tag,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  BarChartOutlined,
  PieChartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const Dashboard = () => {
  const { getQuery, loading } = useGetQuery();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getQuery({
      url: apiUrls.auth.statistics,
      onSuccess: (res) => {
        console.log(res);
        setStats(res.data);
      },
      onFail: (err) => {
        console.log(err);
      },
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-slate-950">
        <Title title={"Dashboard"} />
        <div className="text-center py-8">No data available</div>
      </div>
    );
  }

  const {
    overview,
    roleBreakdown,
    profileStatus,
    detailedProfileStats,
    categoryStats,
    summary,
  } = stats;

  return (
    <div className="text-slate-950">
      <Title title={"Dashboard"} />

      {/* Overview Cards */}
      <Row gutter={[16, 16]} className="mb-6 pt-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
            <Statistic
              title="Total Users"
              value={overview.totalUsers}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
            <Statistic
              title="Active Users"
              value={overview.activeUsers}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
            <Statistic
              title="Inactive Users"
              value={overview.inactiveUsers}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
            <Statistic
              title="Deleted Users"
              value={overview.deletedUsers}
              prefix={<DeleteOutlined className="text-gray-500" />}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6 mb-6">
        <Col xs={24}>
          <Card
            title={
              <Space>
                <PieChartOutlined className="text-indigo-500" />
                <span>Summary Statistics</span>
              </Space>
            }
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={4}>
                <div className="text-center">
                  <Statistic
                    title="Total Active Users"
                    value={summary.totalActiveUsers}
                    valueStyle={{ color: "#52c41a", fontSize: "18px" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <div className="text-center">
                  <Statistic
                    title="Total Inactive Users"
                    value={summary.totalInactiveUsers}
                    valueStyle={{ color: "#ff4d4f", fontSize: "18px" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <div className="text-center">
                  <Statistic
                    title="Total Deleted Users"
                    value={summary.totalDeletedUsers}
                    valueStyle={{ color: "#8c8c8c", fontSize: "18px" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <div className="text-center">
                  <Statistic
                    title="Total Profile Updated"
                    value={summary.totalProfileUpdated}
                    valueStyle={{ color: "#1890ff", fontSize: "18px" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <div className="text-center">
                  <Statistic
                    title="Total Profile Not Updated"
                    value={summary.totalProfileNotUpdated}
                    valueStyle={{ color: "#faad14", fontSize: "18px" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <div className="text-center">
                  <Statistic
                    title="Recent Profile Updates"
                    value={summary.recentProfileUpdates}
                    valueStyle={{ color: "#722ed1", fontSize: "18px" }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Profile Status Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined className="text-purple-500" />
                <span>Profile Update Status</span>
              </Space>
            }
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <Progress
                type="circle"
                percent={profileStatus.percentage}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                size={120}
              />
              <div className="mt-4">
                <Text strong>{profileStatus.totalWithProfileUpdated}</Text>
                <Text type="secondary">
                  {" "}
                  out of{" "}
                  {profileStatus.totalWithProfileUpdated +
                    profileStatus.totalWithoutProfileUpdated}{" "}
                  users have updated profiles
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined className="text-orange-500" />
                <span>Active User Percentage</span>
              </Space>
            }
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <Progress
                type="circle"
                percent={overview.activeUserPercentage}
                strokeColor="#52c41a"
                size={120}
              />
              <div className="mt-4">
                <Text strong>{overview.activeUsers}</Text>
                <Text type="secondary"> active users</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Additional Profile Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow text-center">
            <Statistic
              title="Recent Users"
              value={overview.recentUsers}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Text type="secondary" className="text-xs">
              New registrations
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow text-center">
            <Statistic
              title="Recent Profile Updates"
              value={profileStatus.recentProfileUpdates}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Text type="secondary" className="text-xs">
              Recently updated profiles
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="h-full shadow-lg hover:shadow-xl transition-shadow text-center">
            <Statistic
              title="Never Updated"
              value={profileStatus.neverUpdatedProfiles}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <Text type="secondary" className="text-xs">
              Profiles never updated
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Role Breakdown */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card
            title={
              <Space>
                <TeamOutlined className="text-indigo-500" />
                <span>Role Breakdown</span>
              </Space>
            }
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <Row gutter={[16, 16]}>
              {Object.entries(roleBreakdown).map(([role, data]) => (
                <Col xs={24} sm={12} lg={6} key={role}>
                  <Card
                    size="small"
                    className="text-center h-full"
                    styles={{ body: { padding: "16px" } }}
                  >
                    <div className="mb-2">
                      <Tag
                        color={
                          role === "lawyers"
                            ? "blue"
                            : role === "clerks"
                            ? "green"
                            : role === "publicUsers"
                            ? "orange"
                            : "purple"
                        }
                        className="text-sm px-3 py-1"
                      >
                        {role === "publicUsers"
                          ? "Public Users"
                          : role.charAt(0).toUpperCase() + role.slice(1)}
                      </Tag>
                    </div>
                    <Statistic
                      title="Total"
                      value={data.total}
                      valueStyle={{ fontSize: "24px", fontWeight: "bold" }}
                    />
                    {data.profileUpdatePercentage !== undefined && (
                      <div className="mt-2">
                        <Progress
                          percent={data.profileUpdatePercentage}
                          size="small"
                          strokeColor="#1890ff"
                        />
                        <Text type="secondary" className="text-xs">
                          {data.profileUpdatePercentage}% profiles updated
                        </Text>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Detailed Profile Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card
            title={
              <Space>
                <BarChartOutlined className="text-cyan-500" />
                <span>Detailed Profile Statistics by Role</span>
              </Space>
            }
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <Row gutter={[16, 16]}>
              {detailedProfileStats.map((roleData, index) => (
                <Col xs={24} sm={12} lg={6} key={roleData._id}>
                  <Card
                    size="small"
                    className="text-center h-full"
                    styles={{ body: { padding: "16px" } }}
                  >
                    <div className="mb-3">
                      <Tag
                        color={
                          roleData._id === "lawyer"
                            ? "blue"
                            : roleData._id === "clerk"
                            ? "green"
                            : roleData._id === "public"
                            ? "orange"
                            : "purple"
                        }
                        className="text-sm px-3 py-1"
                      >
                        {roleData._id.charAt(0).toUpperCase() +
                          roleData._id.slice(1)}
                      </Tag>
                    </div>
                    <Statistic
                      title="Total"
                      value={roleData.total}
                      valueStyle={{ fontSize: "20px", fontWeight: "bold" }}
                    />
                    <div className="mt-3 space-y-2">
                      {roleData.profileStats.map((stat, statIndex) => (
                        <div
                          key={statIndex}
                          className="flex justify-between items-center"
                        >
                          <Text
                            type={
                              stat.isProfileUpdated ? "success" : "secondary"
                            }
                            className="text-xs"
                          >
                            {stat.isProfileUpdated ? "Updated" : "Not Updated"}
                          </Text>
                          <Text
                            strong
                            className={
                              stat.isProfileUpdated
                                ? "text-green-600"
                                : "text-gray-500"
                            }
                          >
                            {stat.count}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Category Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <TrophyOutlined className="text-yellow-500" />
                <span>Lawyer Categories</span>
              </Space>
            }
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <Row gutter={[16, 16]}>
              {categoryStats.map((category, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={category._id}>
                  <Card
                    size="small"
                    className="text-center h-full hover:shadow-md transition-shadow"
                    styles={{ body: { padding: "16px" } }}
                  >
                    <div className="mb-2">
                      <Tag
                        color={
                          ["blue", "green", "orange", "purple", "red"][
                            index % 5
                          ]
                        }
                        className="text-sm px-3 py-1"
                      >
                        {category._id
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Tag>
                    </div>
                    <Statistic
                      title="Lawyers"
                      value={category.count}
                      valueStyle={{ fontSize: "20px", fontWeight: "bold" }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
