"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import usePostQuery from "@/hooks/postQuery.hook";
import useGetQuery from "@/hooks/getQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Switch,
  Select,
} from "antd";
import { ToolOutlined, DollarOutlined, ApartmentOutlined } from "@ant-design/icons";

const { Option } = Select;
const basePath = "/admin";

export default function AddSkillPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();
  const { getQuery } = useGetQuery();

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  useEffect(() => {
    getQuery({
      url: "/api/v1/admin/departments?active=true&limit=100",
      onSuccess: (res) => setDepartments(res.departments || []),
    });
  }, []);

  const fetchDesignations = useCallback(
    (departmentId) => {
      if (!departmentId) { setDesignations([]); return; }
      getQuery({
        url: `/api/v1/admin/designations?department=${departmentId}&active=true&limit=100`,
        onSuccess: (res) => setDesignations(res.designations || []),
      });
    },
    [getQuery],
  );

  const fetchGrades = useCallback(
    (designationId) => {
      if (!designationId) { setGrades([]); return; }
      getQuery({
        url: `/api/v1/admin/grades?designation=${designationId}&active=true&limit=100`,
        onSuccess: (res) => setGrades(res.grades || []),
      });
    },
    [getQuery],
  );

  const handleDepartmentChange = (departmentId) => {
    setSelectedDepartment(departmentId);
    setSelectedDesignation(null);
    form.setFieldValue("designation", undefined);
    form.setFieldValue("grade", undefined);
    setDesignations([]);
    setGrades([]);
    if (departmentId) fetchDesignations(departmentId);
  };

  const handleDesignationChange = (designationId) => {
    setSelectedDesignation(designationId);
    form.setFieldValue("grade", undefined);
    setGrades([]);
    if (designationId) fetchGrades(designationId);
  };

  const handleSubmit = (values) => {
    postQuery({
      url: "/api/v1/admin/skills",
      postData: {
        name: values.name,
        skillCode: values.skillCode,
        category: values.category || "General",
        department: values.department,
        designation: values.designation,
        grade: values.grade,
        active: values.active !== false,
        basic: Number(values.basic) || 0,
      },
      onSuccess: () => {
        toast.success("Skill created successfully");
        router.push(`${basePath}/skills`);
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to create skill");
      },
    });
  };

  return (
    <>
      <BackHeader label="Back" href={`${basePath}/skills`} />
      <Title title="Add Skill" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: "General",
            active: true,
            basic: 0,
          }}
        >
          <Typography.Title level={5} className="mb-4">
            <span className="flex items-center gap-2">
              <ToolOutlined /> Basic Info
            </span>
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="name"
                label="Skill Name"
                rules={[{ required: true, message: "Please enter skill name" }]}
              >
                <Input placeholder="e.g., Welding" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="skillCode"
                label="Skill Code"
                rules={[{ required: true, message: "Please enter skill code" }]}
              >
                <Input placeholder="e.g., WLD" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="category" label="Category">
                <Input placeholder="e.g., Technical" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="active" label="Active" valuePropName="checked">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} className="mt-6 mb-4">
            <span className="flex items-center gap-2">
              <ApartmentOutlined /> Organization Hierarchy
            </span>
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: "Please select department" }]}
              >
                <Select
                  placeholder="Select department"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleDepartmentChange}
                  allowClear
                >
                  {departments.map((d) => (
                    <Option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="designation"
                label="Designation"
                rules={[{ required: true, message: "Please select designation" }]}
                extra={!selectedDepartment ? "Select department first" : ""}
              >
                <Select
                  placeholder={selectedDepartment ? "Select designation" : "Select department first"}
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedDepartment}
                  onChange={handleDesignationChange}
                  allowClear
                >
                  {designations.map((d) => (
                    <Option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="grade"
                label="Grade"
                rules={[{ required: true, message: "Please select grade" }]}
                extra={!selectedDesignation ? "Select designation first" : ""}
              >
                <Select
                  placeholder={selectedDesignation ? "Select grade" : "Select designation first"}
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedDesignation}
                  allowClear
                >
                  {grades.map((g) => (
                    <Option key={g._id} value={g._id}>
                      {g.name} ({g.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} className="mt-6 mb-4">
            <span className="flex items-center gap-2">
              <DollarOutlined /> Salary
            </span>
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="basic" label="Basic (₹)">
                <InputNumber
                  min={0}
                  placeholder="0"
                  size="large"
                  style={{ width: "100%" }}
                  prefix="₹"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              type="default"
              onClick={() => router.push(`${basePath}/skills`)}
              size="large"
              style={{ borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="simple-button"
              size="large"
              style={{ borderRadius: "8px" }}
              loading={loading}
            >
              Create Skill
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
}
