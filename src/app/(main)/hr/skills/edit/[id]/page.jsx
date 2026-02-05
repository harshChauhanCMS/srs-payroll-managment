/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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
const basePath = "/hr";

export default function EditSkillPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();

  const [skill, setSkill] = useState(null);
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

  const fetchSkill = () => {
    getQuery({
      url: `/api/v1/admin/skills/${id}`,
      onSuccess: (response) => {
        const data = response?.skill || null;
        setSkill(data);
        if (data) {
          const departmentId = data.department?._id || data.department;
          const designationId = data.designation?._id || data.designation;
          const gradeId = data.grade?._id || data.grade;

          setSelectedDepartment(departmentId);
          setSelectedDesignation(designationId);

          if (departmentId) fetchDesignations(departmentId);
          if (designationId) fetchGrades(designationId);

          form.setFieldsValue({
            name: data.name,
            skillCode: data.skillCode,
            category: data.category || "General",
            department: departmentId,
            designation: designationId,
            grade: gradeId,
            active: data.active !== false,
            basic: data.basic ?? 0,
          });
        }
      },
      onFail: () => {
        toast.error("Failed to fetch skill");
      },
    });
  };

  useEffect(() => {
    if (id) fetchSkill();
  }, []);

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
    putQuery({
      url: `/api/v1/admin/skills/${id}`,
      putData: {
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
        toast.success("Skill updated successfully");
        router.push(`${basePath}/skills`);
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to update skill");
      },
    });
  };

  if (fetchLoading) {
    return (
      <>
        <BackHeader label="Back" href={`${basePath}/skills`} />
        <Title title="Edit Skill" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!skill) {
    return (
      <>
        <BackHeader label="Back" href={`${basePath}/skills`} />
        <Title title="Edit Skill" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Skill not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader label="Back" href={`${basePath}/skills`} />
      <Title title="Edit Skill" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
              loading={updateLoading}
            >
              Update Skill
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
}
