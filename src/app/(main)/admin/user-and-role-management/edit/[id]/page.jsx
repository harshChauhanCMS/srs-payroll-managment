"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  BankOutlined,
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
  Switch,
} from "antd";

const { Option } = Select;

const EditUser = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { patchQuery, loading: updateLoading } = usePatchQuery();
  const { getQuery: getCompanies, loading: companiesLoading } = useGetQuery();
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    getCompanies({
      url: "/api/v1/admin/companies?active=true&limit=100",
      onSuccess: (res) => {
        setCompanies(res.companies || []);
      },
      onFail: (err) => {
        console.error("Failed to fetch companies", err);
      },
    });
  }, []);

  const fetchUser = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/users/${id}`,
      onSuccess: (response) => {
        const userData = response?.user || null;
        setUser(userData);
        if (userData) {
          form.setFieldsValue({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            pan: userData.pan,
            company: userData.company?._id || userData.company, // Handle object or ID
            aadhar: userData.aadhar,
            address: userData.address,
            active: userData.active,
            permissions: {
              view: userData.permissions?.view || false,
              edit: userData.permissions?.edit || false,
              delete: userData.permissions?.delete || false,
              create: userData.permissions?.create || false,
            },
          });
        }
      },
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch user details");
      },
    });
  }, [id, getQuery, form]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, []);

  const handleSubmit = (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
      company: values.company,
      pan: values.pan,
      aadhar: values.aadhar,
      address: values.address,
      active: values.active,
      permissions: {
        view: values.permissions?.view || false,
        edit: values.permissions?.edit || false,
        delete: values.permissions?.delete || false,
        create: values.permissions?.create || false,
      },
    };

    // Only include password if it's provided
    if (values.password) {
      payload.password = values.password;
    }

    patchQuery({
      url: `/api/v1/admin/users/${id}`,
      patchData: payload,
      onSuccess: () => {
        toast.success("User updated successfully");
        router.push("/admin/user-and-role-management");
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to update user");
      },
    });
  };

  if (fetchLoading) {
    return (
      <>
        <BackHeader label="Back" />
        <Title title="Edit User" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <BackHeader label="Back" />
        <Title title="Edit User" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">User not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader label="Back" />
      <Title title="Edit User" />

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
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
                extra="Leave blank to keep current password"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter new password (optional)"
                  size="large"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role" size="large" disabled>
                  <Option value="hr">HR</Option>
                  <Option value="employee">Employee</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="active" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="company"
                label="Company"
                rules={[{ required: true, message: "Please select a company" }]}
              >
                <Select
                  placeholder="Select company"
                  prefix={<BankOutlined className="text-gray-400" />}
                  size="large"
                  loading={companiesLoading}
                  showSearch
                  optionFilterProp="children"
                  disabled
                >
                  {companies.map((company) => (
                    <Option key={company._id} value={company._id}>
                      {company.name}
                    </Option>
                  ))}
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
              <Form.Item
                name="pan"
                label="PAN Number"
                rules={[
                  {
                    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    message: "Invalid PAN format (e.g., ABCDE1234F)",
                  },
                ]}
              >
                <Input placeholder="ABCDE1234F" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="aadhar"
                label="Aadhar Number"
                rules={[
                  {
                    pattern: /^\d{12}$/,
                    message: "Aadhar must be exactly 12 digits",
                  },
                ]}
              >
                <Input placeholder="123456789012" size="large" maxLength={12} />
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
              loading={updateLoading}
            >
              Update User
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
};

export default EditUser;
