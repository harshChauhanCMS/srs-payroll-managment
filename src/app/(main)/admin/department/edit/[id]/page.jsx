"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Form, Input, Button, Card, Row, Col, Switch } from "antd";
import { ClusterOutlined, NumberOutlined } from "@ant-design/icons";

const EditDepartment = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();

  const [department, setDepartment] = useState(null);

  const fetchDepartment = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/departments/${id}`,
      onSuccess: (response) => {
        const data = response?.department || null;
        setDepartment(data);
        if (data) {
          form.setFieldsValue({
            name: data.name,
            code: data.code,
            description: data.description,
            active: data.active,
          });
        }
      },
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch department details");
      },
    });
  }, [id, getQuery, form]);

  useEffect(() => {
    if (id) {
      fetchDepartment();
    }
  }, [id]);

  const handleSubmit = (values) => {
    putQuery({
      url: `/api/v1/admin/departments/${id}`,
      putData: values,
      onSuccess: () => {
        toast.success("Department updated successfully");
        router.push("/admin/department");
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to update department");
      },
    });
  };

  if (fetchLoading) {
    return (
      <>
        <BackHeader label="Back" />
        <Title title="Edit Department" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!department) {
    return (
      <>
        <BackHeader label="Back" />
        <Title title="Edit Department" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Department not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader label="Back" />
      <Title title="Edit Department" />

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
            <Col xs={24} md={18}>
              <Form.Item name="description" label="Description">
                <Input.TextArea
                  rows={3}
                  placeholder="Brief description of the department..."
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="active" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
              Update Department
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
};

export default EditDepartment;
