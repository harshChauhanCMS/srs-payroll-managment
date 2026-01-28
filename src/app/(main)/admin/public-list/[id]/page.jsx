"use client";

import moment from "moment";
import toast from "react-hot-toast";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import Loader from "@/components/Loader/Loader";

import { apiUrls } from "@/apis";
import { UserOutlined, EyeOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
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
import { useEffect, useState } from "react";
import Title from "@/components/Title/Title";
import BackHeader from "@/components/BackHeader/BackHeader";

const PublicUserDetail = () => {
  const { id: userId } = useParams();
  const { getQuery, loading } = useGetQuery();
  const { putQuery, loading: toggleLoading } = usePutQuery();
  const [userData, setUserData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUrl, setModalUrl] = useState("");

  const fetchUserData = () => {
    getQuery({
      url: `${apiUrls?.auth?.getById}/${userId}`,
      onSuccess: (response) => {
        setUserData(response.data);
      },
      onFail: (error) => {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load user details");
      },
    });
  };

  const handleToggleProfileStatus = (userId, currentStatus) => {
    putQuery({
      url: `${apiUrls.auth.toggleStatus}/${userId}`,
      onSuccess: (response) => {
        toast.success("Profile status updated successfully");
        setUserData((prev) => ({
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
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

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

  if (!userData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No user data found</p>
      </div>
    );
  }

  return (
    <div className="">
      <BackHeader label={"Back"} />
      <div className="mb-6">
        <Title title={"Public User Details"} />
        <p className="text-gray-600 pt-2">
          Complete information about the public user
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {/* Basic Information */}
        <Col xs={24} lg={8}>
          <Card title="Basic Information" className="h-full">
            <div className="text-center mb-4">
              <Avatar
                size={80}
                src={userData.profilePic}
                icon={<UserOutlined />}
                className="mb-3"
              />
              <h3 className="text-lg font-semibold">{userData.fullName}</h3>
              <Tag color="green" className="mt-2">
                {userData.role?.toUpperCase()}
              </Tag>
            </div>
          </Card>
        </Col>

        {/* Personal Information */}
        <Col xs={24} lg={16}>
          <Card title="Personal Information" className="h-full">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Full Name" span={2}>
                {userData.fullName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Mobile Number">
                {userData.mobileNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {userData.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {userData.experience || 0} years
              </Descriptions.Item>
              <Descriptions.Item label="Overall Rating">
                {userData.overall_rating || 0}/5
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {userData.description || "No description available"}
              </Descriptions.Item>
              <Descriptions.Item label="Profile Status">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={userData.isProfileUpdated}
                    onChange={() =>
                      handleToggleProfileStatus(
                        userData._id,
                        userData.isProfileUpdated
                      )
                    }
                    loading={toggleLoading}
                  />
                  <span
                    className={
                      userData.isProfileUpdated
                        ? "text-green-600"
                        : "text-orange-600"
                    }
                  >
                    {userData.isProfileUpdated ? "Updated" : "Not Updated"}
                  </span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {userData.coordinates ? (
                  <div>
                    <div>Lat: {userData.coordinates.latitude}</div>
                    <div>Lng: {userData.coordinates.longitude}</div>
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
                {userData.category && userData.category.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {userData.category.map((cat, index) => (
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
                {userData.languages && userData.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {userData.languages.map((lang, index) => (
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
                {userData.followers?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Following">
                {userData.following?.length || 0}
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                {userData._id}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Business Information */}
        <Col xs={24} lg={12}>
          <Card title="Business Information" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Business Name">
                {userData.business_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {userData.address || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="GPS Address">
                {userData.gps_address || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Operating Hours">
                {userData.open_time && userData.closing_time ? (
                  <div>
                    <div>Open: {userData.open_time}</div>
                    <div>Close: {userData.closing_time}</div>
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
                ₹{userData.audio_call_charge || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="Chat Charge">
                ₹{userData.chat_charge || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="SOS Charge">
                ₹{userData.sos_charge || "0"}
              </Descriptions.Item>
              <Descriptions.Item label="Wallet Balance">
                ₹{userData.wallet_balance || "0"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Personal Details */}
        <Col xs={24} lg={12}>
          <Card title="Personal Details" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Gender">
                {userData.gender || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Aadhar">
                {userData.aadhar ? (
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handlePreviewDocument(userData.aadhar, "Aadhar Document")
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
                {userData.pancard ? (
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handlePreviewDocument(
                        userData.pancard,
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
                <Tag color="blue">{userData.device_type || "N/A"}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Banking Information */}
        <Col xs={24} lg={12}>
          <Card title="Banking Information" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Bank Name">
                {userData.bank_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Account Number">
                {userData.account_no || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="IFSC Code">
                {userData.ifsc_code || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Account Holder">
                {userData.account_holder_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Branch">
                {userData.bank_branch || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Referral Information */}
        <Col xs={24} lg={12}>
          <Card title="Referral Information" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="My Referral Code">
                {userData.my_referral_code || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Parent Refer ID">
                {userData.parent_refer_id || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Referral Status">
                {userData.referral_status || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Account Status */}
        <Col xs={24} lg={12}>
          <Card title="Account Status" className="h-full">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Status">
                <Tag color={userData.status === "1" ? "green" : "red"}>
                  {userData.status === "1" ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Is Deleted">
                <Tag color={userData.is_deleted === "0" ? "green" : "red"}>
                  {userData.is_deleted === "0" ? "No" : "Yes"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Profile Updated">
                <Tag color={userData.isProfileUpdated ? "green" : "orange"}>
                  {userData.isProfileUpdated ? "Yes" : "No"}
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
                {moment(userData.createdAt).format("DD MMM YYYY, h:mm A")}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {moment(userData.updatedAt).format("DD MMM YYYY, h:mm A")}
              </Descriptions.Item>
              <Descriptions.Item label="Added By">
                {userData.addedBy || "System"}
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

export default PublicUserDetail;
