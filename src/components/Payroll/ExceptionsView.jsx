/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Select, Form, Button, Badge, Table, Tag, Statistic, Typography, Empty } from "antd";
import { WarningOutlined, BankOutlined, SafetyCertificateOutlined, ClockCircleOutlined, UserDeleteOutlined, MinusCircleOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import useGetQuery from "@/hooks/getQuery.hook";

const { Title } = Typography;

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

const exceptionColumns = [
  { title: "Emp Code", dataIndex: "employeeCode", key: "employeeCode", width: 120 },
  { title: "Employee Name", dataIndex: "employeeName", key: "employeeName", width: 200 },
  { title: "Issue", dataIndex: "issue", key: "issue" },
];

const CATEGORIES = [
  {
    key: "missingBankDetails",
    title: "Missing Bank Details",
    icon: <BankOutlined />,
    color: "red",
    tagColor: "error",
  },
  {
    key: "missingStatutoryInfo",
    title: "Missing UAN / ESI Info",
    icon: <SafetyCertificateOutlined />,
    color: "orange",
    tagColor: "warning",
  },
  {
    key: "negativePayable",
    title: "Negative / Zero Payable Days",
    icon: <MinusCircleOutlined />,
    color: "volcano",
    tagColor: "error",
  },
  {
    key: "outlierOT",
    title: "Outlier OT Hours",
    icon: <ClockCircleOutlined />,
    color: "gold",
    tagColor: "warning",
  },
  {
    key: "noAttendance",
    title: "Missing Attendance Records",
    icon: <UserDeleteOutlined />,
    color: "purple",
    tagColor: "processing",
  },
];

export default function ExceptionsView() {
  const [form] = Form.useForm();
  const { getQuery, loading } = useGetQuery();
  const { getQuery: getSites } = useGetQuery();

  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [exceptionsData, setExceptionsData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getQuery({
      url: "/api/v1/admin/companies?active=true",
      onSuccess: (res) => {
        setCompanies(
          (res.companies || []).map((c) => ({ value: c._id, label: c.name }))
        );
      },
    });
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      getSites({
        url: `/api/v1/admin/sites?company=${selectedCompany}&active=true`,
        onSuccess: (res) => {
          setSites(
            (res.sites || []).map((s) => ({
              value: s._id,
              label: `${s.name} (${s.siteCode})`,
            }))
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

  const loadExceptions = useCallback(() => {
    const site = form.getFieldValue("site");
    const month = form.getFieldValue("payrollMonth");
    const year = form.getFieldValue("payrollYear");

    if (!site || !month || !year) {
      toast.error("Please select site, month, and year");
      return;
    }

    getQuery({
      url: `/api/v1/admin/attendance/exceptions?site=${site}&payrollMonth=${month}&payrollYear=${year}`,
      onSuccess: (res) => {
        setExceptionsData(res);
        setLoaded(true);
      },
    });
  }, [form, getQuery]);

  return (
    <div>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>Input Exceptions</Title>

        <Form form={form} layout="vertical" initialValues={{ payrollMonth: new Date().getMonth() + 1, payrollYear: currentYear }}>
          <Row gutter={16} align="bottom">
            <Col xs={24} md={6}>
              <Form.Item name="company" label="Company" rules={[{ required: true }]}>
                <Select
                  placeholder="Select company"
                  options={companies}
                  onChange={handleCompanyChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="site" label="Site" rules={[{ required: true }]}>
                <Select
                  placeholder={selectedCompany ? "Select site" : "Select company first"}
                  options={sites}
                  disabled={!selectedCompany}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="payrollMonth" label="Month" rules={[{ required: true }]}>
                <Select options={MONTHS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="payrollYear" label="Year" rules={[{ required: true }]}>
                <Select options={YEARS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label=" ">
                <Button type="primary" onClick={loadExceptions} loading={loading}>
                  Check Exceptions
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {loaded && exceptionsData && (
        <>
          {/* Summary Cards */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24} md={4}>
              <Card size="small">
                <Statistic
                  title="Total Exceptions"
                  value={exceptionsData.summary?.total || 0}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: exceptionsData.summary?.total > 0 ? "#cf1322" : "#3f8600" }}
                />
              </Card>
            </Col>
            {CATEGORIES.map((cat) => (
              <Col xs={24} md={4} key={cat.key}>
                <Card size="small">
                  <Statistic
                    title={cat.title}
                    value={exceptionsData.summary?.[cat.key] || 0}
                    prefix={cat.icon}
                    valueStyle={{ color: (exceptionsData.summary?.[cat.key] || 0) > 0 ? "#cf1322" : "#3f8600" }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* Exception Details */}
          {exceptionsData.summary?.total === 0 ? (
            <Card style={{ marginTop: 16 }}>
              <Empty description="No exceptions found. All data looks good!" />
            </Card>
          ) : (
            CATEGORIES.map((cat) => {
              const items = exceptionsData.exceptions?.[cat.key] || [];
              if (items.length === 0) return null;

              return (
                <Card
                  key={cat.key}
                  style={{ marginTop: 16 }}
                  title={
                    <span>
                      {cat.icon}{" "}
                      {cat.title}{" "}
                      <Tag color={cat.tagColor}>{items.length}</Tag>
                    </span>
                  }
                  size="small"
                >
                  <Table
                    dataSource={items}
                    columns={exceptionColumns}
                    rowKey={(r) => `${r.employeeId}-${r.issue}`}
                    size="small"
                    pagination={false}
                    bordered
                  />
                </Card>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
