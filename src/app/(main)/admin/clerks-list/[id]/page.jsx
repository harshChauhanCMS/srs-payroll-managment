"use client";

import moment from "moment";
import toast from "react-hot-toast";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import Loader from "@/components/Loader/Loader";

import { apiUrls } from "@/apis";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserOutlined, EyeOutlined } from "@ant-design/icons";
import {
  Card,
  Row,
  Col,
  Avatar,
  Descriptions,
  Tag,
  Switch,
  Button,
  Space,
  Modal,
} from "antd";
import Title from "@/components/Title/Title";
import BackHeader from "@/components/BackHeader/BackHeader";

const ClerkDetail = () => {
  const { id: clerkId } = useParams();
  const { getQuery, loading } = useGetQuery();
  const { putQuery, loading: toggleLoading } = usePutQuery();
  const [clerkData, setClerkData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUrl, setModalUrl] = useState("");

  const fetchClerkData = () => {
    getQuery({
      url: `${apiUrls?.auth?.getById}/${clerkId}`,
      onSuccess: (response) => {
        setClerkData(response.data);
      },
      onFail: (error) => {
        console.error("Failed to fetch clerk data:", error);
        toast.error("Failed to load clerk details");
      },
    });
  };

  const handleToggleProfileStatus = (clerkId, currentStatus) => {
    putQuery({
      url: `${apiUrls.auth.toggleStatus}/${clerkId}`,
      onSuccess: (response) => {
        toast.success("Profile status updated successfully");
        setClerkData((prev) => ({
          ...prev,
          isProfileUpdated: !currentStatus,
        }));
      },
      onFail: (error) => {
        console.error("Failed to toggle profile status:", error);
        toast.error("Failed to update profile status");
      },
    });
  };

  useEffect(() => {
    if (clerkId) {
      fetchClerkData();
    }
  }, [clerkId]);

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

  if (!clerkData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No clerk data found</p>
      </div>
    );
  }

  return (
    <div className="">
      <BackHeader label={"Back"} />
      <div className="mb-6">
        <Title title={"Clerk Details"} />
        <p className="text-gray-600 pt-2">
          Complete information about the clerk
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {/* Basic Information */}
        <Col xs={24} lg={8}>
          <Card title="Basic Information" className="h-full">
            <div className="text-center mb-4">
              <Avatar
                size={80}
                src={clerkData.profilePic}
                icon={<UserOutlined />}
                className="mb-3"
              />
              <h3 className="text-lg font-semibold">{clerkData.fullName}</h3>
              <Tag color="blue" className="mt-2">
                {clerkData.role?.toUpperCase()}
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Personal Information */}
        <Col xs={24} lg={16}>
          <Card title="Personal Information" className="h-full">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Full Name" span={2}>
                {clerkData.fullName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile Number">
                {clerkData.mobileNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {clerkData.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {clerkData.experience || 0} years
              </Descriptions.Item>
              <Descriptions.Item label="Overall Rating">
                {clerkData.overall_rating || 0}/5
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {clerkData.description || "No description available"}
              </Descriptions.Item>
              <Descriptions.Item label="Profile Status">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={clerkData.isProfileUpdated}
                    onChange={() =>
                      handleToggleProfileStatus(
                        clerkData._id,
                        clerkData.isProfileUpdated
                      )
                    }
                    loading={toggleLoading}
                  />
                  <span
                    className={
                      clerkData.isProfileUpdated
                        ? "text-green-600"
                        : "text-orange-600"
                    }
                  >
                    {clerkData.isProfileUpdated ? "Updated" : "Not Updated"}
                  </span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {clerkData.coordinates ? (
                  <div>
                    <div>Lat: {clerkData.coordinates.latitude}</div>
                    <div>Lng: {clerkData.coordinates.longitude}</div>
                  </div>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Professional Information */}
        <Col xs={24} lg={12}>
          <Card title="Professional Information" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Categories">
                {clerkData.category && clerkData.category.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {clerkData.category.map((cat, index) => (
                      <Tag key={index} color="purple">
                        {cat
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  "No categories"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Languages">
                {clerkData.languages && clerkData.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {clerkData.languages.map((lang, index) => (
                      <Tag key={index} color="green">
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  "No languages"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Social Information */}
        <Col xs={24} lg={12}>
          <Card title="Social Information" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Followers">
                {clerkData.followers?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Following">
                {clerkData.following?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                {clerkData._id}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Business Information */}
        <Col xs={24} lg={12}>
          <Card title="Business Information" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Business Name">
                {clerkData.business_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {clerkData.address || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="GPS Address">
                {clerkData.gps_address || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Operating Hours">
                {clerkData.open_time && clerkData.closing_time ? (
                  <div>
                    <div>Open: {clerkData.open_time}</div>
                    <div>Close: {clerkData.closing_time}</div>
                  </div>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Service Charges */}
        <Col xs={24} lg={12}>
          <Card title="Service Charges" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Audio Call Charge">
                ₹{clerkData.audio_call_charge || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="Chat Charge">
                ₹{clerkData.chat_charge || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="SOS Charge">
                ₹{clerkData.sos_charge || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="Wallet Balance">
                ₹{clerkData.wallet_balance || "0"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Personal Details */}
        <Col xs={24} lg={12}>
          <Card title="Personal Details" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Gender">
                {clerkData.gender || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Aadhar">
                {clerkData.aadhar ? (
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handlePreviewDocument(clerkData.aadhar, "Aadhar Document")
                    }
                    style={{ padding: 0 }}
                  >
                    Preview Document
                  </Button>
                ) : (
                  <Text type="secondary">N/A</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="PAN Card">
                {clerkData.pancard ? (
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handlePreviewDocument(
                        clerkData.pancard,
                        "PAN Card Document"
                      )
                    }
                    style={{ padding: 0 }}
                  >
                    Preview Document
                  </Button>
                ) : (
                  <Text type="secondary">N/A</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Device Type">
                <Tag color="blue">{clerkData.device_type || "N/A"}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Banking Information */}
        <Col xs={24} lg={12}>
          <Card title="Banking Information" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Bank Name">
                {clerkData.bank_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Account Number">
                {clerkData.account_no || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="IFSC Code">
                {clerkData.ifsc_code || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Account Holder">
                {clerkData.account_holder_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Branch">
                {clerkData.bank_branch || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Referral Information */}
        <Col xs={24} lg={12}>
          <Card title="Referral Information" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="My Referral Code">
                {clerkData.my_referral_code || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Parent Refer ID">
                {clerkData.parent_refer_id || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Referral Status">
                {clerkData.referral_status || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Account Status */}
        <Col xs={24} lg={12}>
          <Card title="Account Status" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Status">
                <Tag color={clerkData.status === "1" ? "green" : "red"}>
                  {clerkData.status === "1" ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Is Deleted">
                <Tag color={clerkData.is_deleted === "0" ? "green" : "red"}>
                  {clerkData.is_deleted === "0" ? "No" : "Yes"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Profile Updated">
                <Tag color={clerkData.isProfileUpdated ? "green" : "orange"}>
                  {clerkData.isProfileUpdated ? "Yes" : "No"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Timestamps */}
        <Col xs={24}>
          <Card title="Timestamps" className="h-full">
            <Descriptions column={3} bordered>
              <Descriptions.Item label="Created At">
                {moment(clerkData.createdAt).format("DD MMM YYYY, h:mm A")}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {moment(clerkData.updatedAt).format("DD MMM YYYY, h:mm A")}
              </Descriptions.Item>
              <Descriptions.Item label="Added By">
                {clerkData.addedBy || "System"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

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
    </div>
  );
};

export default ClerkDetail;
