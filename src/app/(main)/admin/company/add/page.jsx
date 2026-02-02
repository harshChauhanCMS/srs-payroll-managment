"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import usePostQuery from "@/hooks/postQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Row, Col } from "antd";
import {
  BankOutlined,
  NumberOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const AddCompany = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();

  const handleSubmit = (values) => {
    postQuery({
      url: "/api/v1/admin/companies",
      postData: values,
      onSuccess: () => {
        toast.success("Company created successfully");
        router.push("/admin/company");
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to create company");
      },
    });
  };

  return (
    <>
      <BackHeader label={"Back"} />
      <Title title="Add New Company" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ active: true }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Company Name"
                rules={[
                  { required: true, message: "Please enter company name" },
                ]}
              >
                <Input
                  prefix={<BankOutlined className="text-gray-400" />}
                  placeholder="Acme Corp"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="gstNumber" label="GST Number">
                <Input
                  prefix={<NumberOutlined className="text-gray-400" />}
                  placeholder="22AAAAA0000A1Z5"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="pan" label="PAN Number">
                <Input
                  prefix={<FileTextOutlined className="text-gray-400" />}
                  placeholder="ABCDE1234F"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="address" label="Address">
                <Input.TextArea
                  rows={1}
                  placeholder="123 Business St, City"
                  style={{ resize: "none" }}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="bankAccountNumber" label="Bank Account Number">
                <Input placeholder="Account number" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="ifscCode" label="IFSC Code">
                <Input placeholder="IFSC" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="bankName" label="Bank Name">
                <Input placeholder="Bank name" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="mobileNumber"
                label="Mobile Number"
                rules={[
                  {
                    pattern: /^\d{10}$/,
                    message: "Mobile number must be exactly 10 digits",
                  },
                ]}
              >
                <Input
                  placeholder="10 digit mobile"
                  size="large"
                  maxLength={10}
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
              Create Company
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
};

export default AddCompany;
