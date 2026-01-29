"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import usePostQuery from "@/hooks/postQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Row, Col } from "antd";
import { ClusterOutlined, NumberOutlined } from "@ant-design/icons";

const AddDepartment = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();

  const handleSubmit = (values) => {
    postQuery({
      url: "/api/v1/admin/departments",
      postData: {
        name: values.name,
        code: values.code,
        description: values.description,
      },
      onSuccess: () => {
        toast.success("Department created successfully");
        router.push("/admin/department");
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to create department");
      },
    });
  };

  return (
    <>
      <BackHeader label="Back" />
      <Title title="Add Department" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Department Name"
                rules={[
                  { required: true, message: "Please enter department name" },
                ]}
              >
                <Input
                  prefix={<ClusterOutlined className="text-gray-400" />}
                  placeholder="Human Resources"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="code"
                label="Department Code"
                rules={[
                  { required: true, message: "Please enter department code" },
                ]}
              >
                <Input
                  prefix={<NumberOutlined className="text-gray-400" />}
                  placeholder="HR"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="description" label="Description">
                <Input.TextArea
                  rows={3}
                  placeholder="Brief description of the department..."
                  style={{ resize: "none" }}
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
              loading={loading}
            >
              Create Department
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
};

export default AddDepartment;
