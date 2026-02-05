"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import BackHeader from "@/components/BackHeader/BackHeader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Row, Col, Select, DatePicker } from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  HomeOutlined,
  PhoneOutlined,
  BankOutlined,
  ManOutlined,
} from "@ant-design/icons";
import moment from "moment";

export default function EmployeeProfileEditPage() {
  const router = useRouter();
  const reduxUser = useSelector((state) => state.user?.user);
  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { patchQuery, loading: updateLoading } = usePatchQuery();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!reduxUser?._id) return;
    getQuery({
      url: `/api/v1/admin/users/${reduxUser._id}`,
      onSuccess: (response) => {
        const userData = response?.user || null;
        setUser(userData);
        if (userData) {
          form.setFieldsValue({
            name: userData.name,
            mobile: userData.mobile,
            fatherName: userData.fatherName,
            gender: userData.gender,
            dob: userData.dob ? moment(userData.dob) : null,
            pan: userData.pan,
            aadhar: userData.aadhar,
            address: userData.address,
            bankName: userData.bankName,
            accountNumber: userData.accountNumber,
            ifscCode: userData.ifscCode,
          });
        }
      },
      onFail: () => {
        setUser(reduxUser);
        form.setFieldsValue({
          name: reduxUser.name,
          mobile: reduxUser.mobile,
          fatherName: reduxUser.fatherName,
          gender: reduxUser.gender,
          dob: reduxUser.dob ? moment(reduxUser.dob) : null,
          pan: reduxUser.pan,
          aadhar: reduxUser.aadhar,
          address: reduxUser.address,
          bankName: reduxUser.bankName,
          accountNumber: reduxUser.accountNumber,
          ifscCode: reduxUser.ifscCode,
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduxUser?._id]);

  const handleSubmit = (values) => {
    if (!reduxUser?._id) return;
    patchQuery({
      url: `/api/v1/admin/users/${reduxUser._id}`,
      patchData: {
        name: values.name,
        mobile: values.mobile,
        fatherName: values.fatherName,
        gender: values.gender,
        dob: values.dob ? values.dob.toISOString() : null,
        pan: values.pan,
        aadhar: values.aadhar,
        address: values.address,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode,
      },
      onSuccess: () => {
        toast.success("Profile updated successfully");
        router.push("/employee/profile/view");
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to update profile");
      },
    });
  };

  if (fetchLoading && !user) {
    return (
      <div className="text-slate-950">
        <BackHeader label="Back" href="/employee/profile/view" />
        <Title title="Edit My Profile" />
        <div className="flex justify-center items-center h-64">Loading...</div>
      </div>
    );
  }

  return (
    <div className="text-slate-950">
      <BackHeader label="Back" href="/employee/profile/view" />
      <Title title="Edit My Profile" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Personal Information */}
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Personal Information
          </h3>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Your name"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="mobile"
                label="Mobile Number"
                rules={[
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Mobile must be 10 digits",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="10-digit mobile number"
                  size="large"
                  maxLength={10}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="fatherName" label="Father's Name">
                <Input
                  prefix={<ManOutlined className="text-gray-400" />}
                  placeholder="Father's name"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="gender" label="Gender">
                <Select placeholder="Select gender" size="large">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="dob" label="Date of Birth">
                <DatePicker
                  placeholder="Select date of birth"
                  size="large"
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="address" label="Address">
                <Input
                  prefix={<HomeOutlined className="text-gray-400" />}
                  placeholder="Your address"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Document Details */}
          <h3 className="text-lg font-semibold mb-4 mt-6 text-gray-700">
            Document Details
          </h3>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="pan" label="PAN Number">
                <Input
                  prefix={<IdcardOutlined className="text-gray-400" />}
                  placeholder="ABCDE1234F"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="aadhar" label="Aadhar Number">
                <Input
                  prefix={<IdcardOutlined className="text-gray-400" />}
                  placeholder="123456789012"
                  size="large"
                  maxLength={12}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Bank Details */}
          <h3 className="text-lg font-semibold mb-4 mt-6 text-gray-700">
            Bank Details
          </h3>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="bankName" label="Bank Name">
                <Input
                  prefix={<BankOutlined className="text-gray-400" />}
                  placeholder="Bank name"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="accountNumber" label="Account Number">
                <Input
                  prefix={<BankOutlined className="text-gray-400" />}
                  placeholder="Account number"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="ifscCode" label="IFSC Code">
                <Input
                  prefix={<BankOutlined className="text-gray-400" />}
                  placeholder="IFSC code"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              type="primary"
              htmlType="submit"
              className="simple-button"
              size="large"
              style={{ borderRadius: "8px" }}
              loading={updateLoading}
            >
              Update Profile
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
