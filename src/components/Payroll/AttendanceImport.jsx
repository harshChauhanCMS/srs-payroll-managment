/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Form,
  Button,
  Upload,
  Alert,
  Typography,
  Divider,
  List,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import useGetQuery from "@/hooks/getQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import { useAuth } from "@/hooks/useAuth";

const { Dragger } = Upload;
const { Title, Text } = Typography;

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: currentYear - 2 + i,
  label: String(currentYear - 2 + i),
}));

export default function AttendanceImport() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { postQuery, loading: importLoading } = usePostQuery();
  const { getQuery: getSites, loading: sitesLoading } = useGetQuery();

  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [importResult, setImportResult] = useState(null);

  // Fetch companies on mount
  useEffect(() => {
    getQuery({
      url: "/api/v1/admin/companies?active=true",
      onSuccess: (res) => {
        setCompanies(
          (res.companies || []).map((c) => ({ value: c._id, label: c.name })),
        );
      },
    });
  }, []);

  // Fetch sites when company changes
  useEffect(() => {
    if (selectedCompany) {
      getSites({
        url: `/api/v1/admin/sites?company=${selectedCompany}&active=true`,
        onSuccess: (res) => {
          setSites(
            (res.sites || []).map((s) => ({
              value: s._id,
              label: `${s.name} (${s.siteCode})`,
            })),
          );
        },
      });
    } else {
      setSites([]);
    }
  }, [selectedCompany]);

  const handleCompanyChange = (value) => {
    setSelectedCompany(value);
    form.setFieldValue("site", null);
  };

  const handleDownloadTemplate = useCallback(() => {
    // Download the template from assets folder
    const link = document.createElement("a");
    link.href = "/SRS_Sample_Sheet.xlsx";
    link.download = "SRS_Sample_Sheet.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template downloaded successfully");
  }, []);

  const handleUpload = async (info) => {
    const site = form.getFieldValue("site");
    const month = form.getFieldValue("payrollMonth");
    const year = form.getFieldValue("payrollYear");

    if (!site || !month || !year) {
      toast.error("Please select site, month, and year first");
      return;
    }

    const formData = new FormData();
    formData.append("file", info.file);
    formData.append("site", site);
    formData.append("payrollMonth", month);
    formData.append("payrollYear", year);

    await postQuery({
      url: "/api/v1/admin/attendance/import",
      postData: formData,
      onSuccess: (res) => {
        toast.success(res.message || "Import successful");
        setImportResult(res);
      },
      onFail: (err) => {
        toast.error(err?.response?.data?.message || "Import failed");
      },
    });
  };

  return (
    <div>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>
          Monthly Attendance Import
        </Title>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            payrollMonth: new Date().getMonth() + 1,
            payrollYear: currentYear,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item
                name="company"
                label="Company"
                rules={[{ required: true, message: "Select company" }]}
              >
                <Select
                  placeholder="Select company"
                  options={companies}
                  onChange={handleCompanyChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="site"
                label="Site / Location"
                rules={[{ required: true, message: "Select site" }]}
              >
                <Select
                  placeholder={
                    selectedCompany ? "Select site" : "Select company first"
                  }
                  options={sites}
                  disabled={!selectedCompany}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="payrollMonth"
                label="Month"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select month" options={MONTHS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="payrollYear"
                label="Year"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select year" options={YEARS} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider />

        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Dragger
              name="file"
              accept=".xlsx,.xls"
              showUploadList={false}
              customRequest={handleUpload}
              disabled={importLoading}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag Excel file to upload
              </p>
              <p className="ant-upload-hint">
                Supports .xlsx and .xls files. Upload attendance data for the
                selected site and period.
              </p>
            </Dragger>

            <div style={{ marginTop: 12 }}>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                className="green-button"
                style={{ borderRadius: "8px" }}
                disabled={fetchLoading}
              >
                Download Template
              </Button>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <Card
              size="small"
              title="Import Instructions"
              style={{ background: "#f5f5f5" }}
            >
              <List
                size="small"
                dataSource={[
                  "Select company, site, month, and year",
                  "Download the template with pre-filled employee list",
                  "Fill in attendance data in the template",
                  "Upload the filled template",
                  "Review imported data in Attendance Review",
                ]}
                renderItem={(item, idx) => (
                  <List.Item style={{ padding: "4px 0", border: "none" }}>
                    <Text type="secondary">
                      {idx + 1}. {item}
                    </Text>
                  </List.Item>
                )}
              />
              <Divider style={{ margin: "8px 0" }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Expected columns: Employee Code, Employee Name, Working Days,
                Present Days, Payable Days, Leave Days, OT Hours, Incentive,
                Arrear
              </Text>
            </Card>
          </Col>
        </Row>

        {importResult && (
          <>
            <Divider />
            <Alert
              type={importResult.errors?.length > 0 ? "warning" : "success"}
              showIcon
              icon={
                importResult.errors?.length > 0 ? (
                  <WarningOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              message={importResult.message}
              description={
                <div>
                  <Text>
                    Imported: {importResult.imported} | Skipped:{" "}
                    {importResult.skipped}
                  </Text>
                  {importResult.errors?.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Text strong>Errors:</Text>
                      <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                        {importResult.errors.map((err, i) => (
                          <li key={i}>
                            <Text type="danger">
                              Row {err.row}: {err.employeeCode} - {err.message}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              }
            />
          </>
        )}
      </Card>
    </div>
  );
}
