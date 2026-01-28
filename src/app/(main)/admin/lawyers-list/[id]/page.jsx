"use client";

import moment from "moment";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { apiUrls } from "@/apis";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Avatar,
  Descriptions,
  Button,
  Modal,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  StarOutlined,
  TrophyOutlined,
  BookOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { Title: AntTitle, Text, Paragraph } = Typography;

const LawyerDetailsPage = () => {
  const params = useParams();
  const lawyerId = params.id;
  const { getQuery, loading } = useGetQuery();
  const [lawyerData, setLawyerData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUrl, setModalUrl] = useState("");

  useEffect(() => {
    if (lawyerId) {
      getQuery({
        url: `${apiUrls.lawyers.getLawyerById}/${lawyerId}`,
        onSuccess: (response) => {
          console.log("Lawyer data:", response);
          setLawyerData(response.data?.lawyer || response.data || response);
        },
        onFail: (err) => {
          console.error("Failed to fetch lawyer data:", err);
        },
      });
    }
  }, [lawyerId]);

  const handlePreviewDocument = (url, title) => {
    setModalUrl(url);
    setModalTitle(title);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setModalUrl("");
    setModalTitle("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (!lawyerData) {
    return (
      <>
        <BackHeader label={"Back"} />
        <Title title={"Lawyer Details"} />
        <div className="text-center py-8">No lawyer data found</div>
      </>
    );
  }

  return (
    <>
      <BackHeader label={"Back"} />
      <Title title={`Lawyer Details`} />

      <div className="pt-6">
        {/* Basic Information Card */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={8}>
            <Card className="h-full shadow-lg hover:shadow-xl transition-shadow text-center">
              <Avatar
                size={120}
                src={lawyerData.profilePic}
                icon={<UserOutlined />}
                className="mb-4"
              />
              <AntTitle level={3} className="mb-2">
                {lawyerData.fullName || "N/A"}
              </AntTitle>
              <Text type="secondary" className="text-lg">
                {lawyerData.role || "Lawyer"}
              </Text>
              {lawyerData.rating && (
                <div className="mt-3">
                  <Space>
                    <StarOutlined className="text-yellow-500" />
                    <Text strong>{lawyerData.rating}</Text>
                    <Text type="secondary">Rating</Text>
                  </Space>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <UserOutlined className="text-blue-500" />
                  <span>Personal Information</span>
                </Space>
              }
              className="h-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Full Name">
                  <Text strong>{lawyerData.fullName || "N/A"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mobile Number">
                  <Space>
                    <PhoneOutlined />
                    <Text>{lawyerData.mobileNumber || "N/A"}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <Space>
                    <MailOutlined />
                    <Text>{lawyerData.email || "N/A"}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Profile Status">
                  <Tag color={lawyerData.isProfileUpdated ? "green" : "orange"}>
                    {lawyerData.isProfileUpdated ? "Updated" : "Not Updated"}
                  </Tag>
                </Descriptions.Item>
                {lawyerData.coordinates && (
                  <Descriptions.Item label="Location">
                    <Space>
                      <EnvironmentOutlined />
                      <Text>
                        Lat: {lawyerData.coordinates.latitude}, Lng:{" "}
                        {lawyerData.coordinates.longitude}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Professional Information */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BookOutlined className="text-green-500" />
                  <span>Categories</span>
                </Space>
              }
              className="h-full shadow-lg hover:shadow-xl transition-shadow"
            >
              {lawyerData.category && lawyerData.category.length > 0 ? (
                <div className="space-y-2">
                  {lawyerData.category.map((cat, index) => (
                    <Tag key={index} color="blue" className="mb-2">
                      {cat
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Text type="secondary">No categories assigned</Text>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TrophyOutlined className="text-orange-500" />
                  <span>Languages</span>
                </Space>
              }
              className="h-full shadow-lg hover:shadow-xl transition-shadow"
            >
              {lawyerData.languages && lawyerData.languages.length > 0 ? (
                <div className="space-y-2">
                  {lawyerData.languages.map((lang, index) => (
                    <Tag key={index} color="green" className="mb-2">
                      {lang}
                    </Tag>
                  ))}
                </div>
              ) : (
                <Text type="secondary">No languages specified</Text>
              )}
            </Card>
          </Col>
        </Row>

        {/* Social Information */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={8}>
            <Card
              title="Followers"
              className="h-full shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <AntTitle level={2} className="text-blue-500">
                {lawyerData.followers ? lawyerData.followers.length : 0}
              </AntTitle>
              <Text type="secondary">Total Followers</Text>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="Following"
              className="h-full shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <AntTitle level={2} className="text-green-500">
                {lawyerData.following ? lawyerData.following.length : 0}
              </AntTitle>
              <Text type="secondary">Following</Text>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="User ID"
              className="h-full shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <Text code className="text-sm">
                {lawyerData._id || "N/A"}
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Business Information */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TrophyOutlined className="text-indigo-500" />
                  <span>Business Information</span>
                </Space>
              }
              className="h-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Business Name">
                  <Text strong>
                    {lawyerData.business_name || "Not provided"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  <Text>{lawyerData.address || "Not provided"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="GPS Address">
                  <Text>{lawyerData.gps_address || "Not provided"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Operating Hours">
                  <Text>
                    {lawyerData.open_time && lawyerData.closing_time
                      ? `${lawyerData.open_time} - ${lawyerData.closing_time}`
                      : "Not specified"}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <StarOutlined className="text-yellow-500" />
                  <span>Service Charges</span>
                </Space>
              }
              className="h-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Audio Call Charge">
                  <Text strong>₹{lawyerData.audio_call_charge || "0"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Chat Charge">
                  <Text strong>₹{lawyerData.chat_charge || "0"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="SOS Charge">
                  <Text strong>₹{lawyerData.sos_charge || "0"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Wallet Balance">
                  <Text strong className="text-green-600">
                    ₹{lawyerData.wallet_balance || "0"}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Personal Details */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <UserOutlined className="text-cyan-500" />
                  <span>Personal Details</span>
                </Space>
              }
              className="h-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Gender">
                  <Text>{lawyerData.gender || "Not specified"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Aadhar Number">
                  {lawyerData.aadhar ? (
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        handlePreviewDocument(
                          lawyerData.aadhar,
                          "Aadhar Document"
                        )
                      }
                      style={{ padding: 0 }}
                    >
                      Preview Document
                    </Button>
                  ) : (
                    <Text type="secondary">Not provided</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="PAN Card">
                  {lawyerData.pancard ? (
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        handlePreviewDocument(
                          lawyerData.pancard,
                          "PAN Card Document"
                        )
                      }
                      style={{ padding: 0 }}
                    >
                      Preview Document
                    </Button>
                  ) : (
                    <Text type="secondary">Not provided</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Bar Council ID">
                  {lawyerData.business_document ? (
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        handlePreviewDocument(
                          lawyerData.business_document,
                          "Bar Council ID Document"
                        )
                      }
                      style={{ padding: 0 }}
                    >
                      Preview Document
                    </Button>
                  ) : (
                    <Text type="secondary">Not provided</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Device Type">
                  <Tag color="blue">{lawyerData.device_type || "Unknown"}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TrophyOutlined className="text-purple-500" />
                  <span>Banking Information</span>
                </Space>
              }
              className="h-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label="Bank Name">
                  <Text>{lawyerData.bank_name || "Not provided"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Account Number">
                  <Text code>{lawyerData.account_no || "Not provided"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="IFSC Code">
                  <Text code>{lawyerData.ifsc_code || "Not provided"}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Account Holder">
                  <Text>
                    {lawyerData.account_holder_name || "Not provided"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Bank Branch">
                  <Text>{lawyerData.bank_branch || "Not provided"}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Referral & Status Information */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={8}>
            <Card
              title="Referral Information"
              className="h-full shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="text-sm">
                    My Referral Code
                  </Text>
                  <div className="mt-1">
                    <Text code className="text-lg">
                      {lawyerData.my_referral_code || "Not generated"}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Parent Referral ID
                  </Text>
                  <div className="mt-1">
                    <Text code>{lawyerData.parent_refer_id || "None"}</Text>
                  </div>
                </div>
                <div>
                  <Tag color={lawyerData.referral_status ? "green" : "default"}>
                    {lawyerData.referral_status || "No status"}
                  </Tag>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="Account Status"
              className="h-full shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="text-sm">
                    Status
                  </Text>
                  <div className="mt-1">
                    <Tag color={lawyerData.status === "1" ? "green" : "red"}>
                      {lawyerData.status === "1" ? "Active" : "Inactive"}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Deleted
                  </Text>
                  <div className="mt-1">
                    <Tag
                      color={lawyerData.is_deleted === "0" ? "green" : "red"}
                    >
                      {lawyerData.is_deleted === "0"
                        ? "Not Deleted"
                        : "Deleted"}
                    </Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Profile Updated
                  </Text>
                  <div className="mt-1">
                    <Tag
                      color={lawyerData.isProfileUpdated ? "green" : "orange"}
                    >
                      {lawyerData.isProfileUpdated ? "Yes" : "No"}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="Timestamps"
              className="h-full shadow-lg hover:shadow-xl transition-shadow text-center"
            >
              <div className="space-y-3">
                <div>
                  <Text type="secondary" className="text-sm">
                    Created At
                  </Text>
                  <div className="mt-1">
                    <Text className="text-xs">
                      {lawyerData.createdAt
                        ? moment(lawyerData.createdAt).format(
                            "DD MMM YYYY, h:mm A"
                          )
                        : "N/A"}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Updated At
                  </Text>
                  <div className="mt-1">
                    <Text className="text-xs">
                      {lawyerData.updatedAt
                        ? moment(lawyerData.updatedAt).format(
                            "DD MMM YYYY, h:mm A"
                          )
                        : "N/A"}
                    </Text>
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-sm">
                    Added By
                  </Text>
                  <div className="mt-1">
                    <Text>{lawyerData.addedBy || "System"}</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Additional Information */}
        {lawyerData.bio && (
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <BookOutlined className="text-purple-500" />
                    <span>Biography</span>
                  </Space>
                }
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Paragraph>{lawyerData.bio}</Paragraph>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      {/* Document Preview Modal */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{ height: "80vh", padding: 0 }}
      >
        {modalUrl && (
          <iframe
            src={modalUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title={modalTitle}
          />
        )}
      </Modal>
    </>
  );
};

export default LawyerDetailsPage;
