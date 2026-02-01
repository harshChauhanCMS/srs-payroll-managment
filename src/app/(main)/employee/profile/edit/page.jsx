"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import BackHeader from "@/components/BackHeader/BackHeader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Row, Col } from "antd";
import { UserOutlined, IdcardOutlined, HomeOutlined } from "@ant-design/icons";

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
            pan: userData.pan,
            aadhar: userData.aadhar,
            address: userData.address,
          });
        }
      },
      onFail: () => {
        setUser(reduxUser);
        form.setFieldsValue({
          name: reduxUser.name,
          pan: reduxUser.pan,
          aadhar: reduxUser.aadhar,
          address: reduxUser.address,
        });
      },
    });
  }, [reduxUser?._id]);

  const handleSubmit = (values) => {
    if (!reduxUser?._id) return;
    patchQuery({
      url: `/api/v1/admin/users/${reduxUser._id}`,
      patchData: {
        name: values.name,
        pan: values.pan,
        aadhar: values.aadhar,
        address: values.address,
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
              <Form.Item name="pan" label="PAN Number">
                <Input
                  prefix={<IdcardOutlined className="text-gray-400" />}
                  placeholder="ABCDE1234F"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
