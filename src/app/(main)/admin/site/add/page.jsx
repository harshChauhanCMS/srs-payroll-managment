"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Form, Input, Button, Card, Row, Col, Select, InputNumber } from "antd";
import {
  BankOutlined,
  EnvironmentOutlined,
  NumberOutlined,
  RadiusSettingOutlined,
  BorderOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const AddSite = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();
  const { getQuery: getCompanies, loading: companiesLoading } = useGetQuery();

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

  const handleSubmit = (values) => {
    postQuery({
      url: "/api/v1/admin/sites",
      postData: values,
      onSuccess: () => {
        toast.success("Site created successfully");
        router.push("/admin/site");
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to create site");
      },
    });
  };

  return (
    <>
      <BackHeader label="Back" />
      <Title title="Add New Site" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Site Name"
                rules={[{ required: true, message: "Please enter site name" }]}
              >
                <Input
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                  placeholder="Kolkata Office"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="siteCode"
                label="Site Code"
                rules={[
                  { required: true, message: "Please enter site code" },
                  {
                    pattern: /^[A-Za-z0-9_-]+$/,
                    message: "Only letters, numbers, - and _ allowed",
                  },
                ]}
              >
                <Input
                  prefix={<NumberOutlined className="text-gray-400" />}
                  placeholder="KOL-01"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="company"
                label="Parent Company"
                rules={[{ required: true, message: "Please select a company" }]}
              >
                <Select
                  placeholder="Select company"
                  suffixIcon={<BankOutlined className="text-gray-400" />}
                  size="large"
                  loading={companiesLoading}
                  showSearch
                  optionFilterProp="children"
                >
                  {companies.map((company) => (
                    <Option key={company._id} value={company._id}>
                      {company.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="address" label="Address">
                <Input.TextArea
                  rows={1}
                  placeholder="123 Business Park, City"
                  style={{ resize: "none" }}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="geofencingRadius"
                label="Geofencing Radius (meters)"
                initialValue={100}
                rules={[
                  {
                    required: false,
                    message: "Please enter geofencing radius",
                  },
                  {
                    type: "number",
                    min: 0,
                    message: "Radius must be a positive number",
                  },
                ]}
              >
                <InputNumber
                  prefix={<RadiusSettingOutlined className="text-gray-400" />}
                  placeholder="100"
                  size="large"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="meters"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="fenceType"
                label="Fence Type"
                initialValue="circular"
              >
                <Select
                  placeholder="Select fence type"
                  suffixIcon={<BorderOutlined className="text-gray-400" />}
                  size="large"
                >
                  <Option value="circular">Circular</Option>
                  <Option value="rectangle">Rectangle</Option>
                  <Option value="polygon">Polygon</Option>
                </Select>
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
              Create Site
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
};

export default AddSite;
