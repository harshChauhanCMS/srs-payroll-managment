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
} from "antd";
import { ToolOutlined, DollarOutlined } from "@ant-design/icons";

const basePath = "/admin";

export default function EditSkillPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();

  const [skill, setSkill] = useState(null);

  const fetchSkill = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/skills/${id}`,
      onSuccess: (response) => {
        const data = response?.skill || null;
        setSkill(data);
        if (data) {
          form.setFieldsValue({
            name: data.name,
            category: data.category || "General",
            active: data.active !== false,
            basic: data.basic ?? 0,
            houseRentAllowance: data.houseRentAllowance ?? 0,
            otherAllowance: data.otherAllowance ?? 0,
            leaveEarnings: data.leaveEarnings ?? 0,
            bonusEarnings: data.bonusEarnings ?? 0,
            arrear: data.arrear ?? 0,
          });
        }
      },
      onFail: () => {
        toast.error("Failed to fetch skill");
      },
    });
  }, [id, getQuery, form]);

  useEffect(() => {
    if (id) fetchSkill();
  }, [id, fetchSkill]);

  const handleSubmit = (values) => {
    putQuery({
      url: `/api/v1/admin/skills/${id}`,
      putData: {
        name: values.name,
        category: values.category || "General",
        active: values.active !== false,
        basic: Number(values.basic) || 0,
        houseRentAllowance: Number(values.houseRentAllowance) || 0,
        otherAllowance: Number(values.otherAllowance) || 0,
        leaveEarnings: Number(values.leaveEarnings) || 0,
        bonusEarnings: Number(values.bonusEarnings) || 0,
        arrear: Number(values.arrear) || 0,
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
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Skill Name"
                rules={[{ required: true, message: "Please enter skill name" }]}
              >
                <Input placeholder="e.g., Welding" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
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
              <DollarOutlined /> Salary (Earnings – monthly rates)
            </span>
          </Typography.Title>
          <p className="text-gray-600 text-sm mb-4">
            These rates define the salary band for users assigned to this skill.
          </p>
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
            <Col xs={24} md={8}>
              <Form.Item name="houseRentAllowance" label="HRA (₹)">
                <InputNumber
                  min={0}
                  placeholder="0"
                  size="large"
                  style={{ width: "100%" }}
                  prefix="₹"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="otherAllowance" label="Other Allowance (₹)">
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
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="leaveEarnings" label="Leave Earnings (₹)">
                <InputNumber
                  min={0}
                  placeholder="0"
                  size="large"
                  style={{ width: "100%" }}
                  prefix="₹"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="bonusEarnings" label="Bonus Earnings (₹)">
                <InputNumber
                  min={0}
                  placeholder="0"
                  size="large"
                  style={{ width: "100%" }}
                  prefix="₹"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="arrear" label="Arrear (₹)">
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
