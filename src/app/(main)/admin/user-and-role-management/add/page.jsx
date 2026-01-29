"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import usePostQuery from "@/hooks/postQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useRouter } from "next/navigation";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Card,
  Row,
  Col,
  Typography,
} from "antd";

const { Option } = Select;

const AddUser = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      permissions: {
        view: values.permissions?.view || false,
        edit: values.permissions?.edit || false,
        delete: values.permissions?.delete || false,
        create: values.permissions?.create || false,
      },
    };

    postQuery({
      url: "/api/v1/admin/users",
      postData: payload,
      onSuccess: (response) => {
        const emailSent = response?.emailSent;
        toast.success(
          `User created successfully${emailSent ? " and credentials sent via email" : ""}`,
        );
        router.push("/admin/user-and-role-management");
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to create user");
      },
    });
  };

  return (
    <>
      <BackHeader label={"Back"} />
      <Title title="Add New User" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            role: "employee",
            permissions: {
              view: true,
              edit: false,
              delete: false,
              create: false,
            },
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="John Doe"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="john@company.com"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
                extra="This password will be sent to the user's email"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter password"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role" size="large">
                  <Option value="hr">HR</Option>
                  <Option value="employee">Employee</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Permissions" className="mb-4">
            <div className="flex flex-wrap gap-6 p-4 bg-gray-50 rounded-lg">
              <Form.Item
                name={["permissions", "view"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>
                  <span className="ml-1">View</span>
                </Checkbox>
              </Form.Item>
              <Form.Item
                name={["permissions", "edit"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>
                  <span className="ml-1">Edit</span>
                </Checkbox>
              </Form.Item>
              <Form.Item
                name={["permissions", "delete"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>
                  <span className="ml-1">Delete</span>
                </Checkbox>
              </Form.Item>
              <Form.Item
                name={["permissions", "create"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>
                  <span className="ml-1">Create</span>
                </Checkbox>
              </Form.Item>
            </div>
          </Form.Item>

          <Typography.Title level={5} className="mt-6! mb-4!">
            Additional Information
          </Typography.Title>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="pan" label="PAN Number">
                <Input placeholder="ABCDE1234F" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="aadhar" label="Aadhar Number">
                <Input placeholder="1234-5678-9012" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="address" label="Address">
                <Input placeholder="Enter address" size="large" />
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
              loading={loading}
            >
              Create User
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
};

export default AddUser;
