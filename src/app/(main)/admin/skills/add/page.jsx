"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import usePostQuery from "@/hooks/postQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useRouter } from "next/navigation";
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

export default function AddSkillPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();

  const handleSubmit = (values) => {
    postQuery({
      url: "/api/v1/admin/skills",
      postData: {
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
            houseRentAllowance: 0,
            otherAllowance: 0,
            leaveEarnings: 0,
            bonusEarnings: 0,
            arrear: 0,
          }}
        >
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
            Actual pay is computed using company salary component (days,
            deductions) and these rates.
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
