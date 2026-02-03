/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Select, Form, Button, Checkbox, Table, Tag, Space, Typography, Divider, Modal } from "antd";
import { PlayCircleOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import moment from "moment";
import { useRouter, usePathname } from "next/navigation";
import useGetQuery from "@/hooks/getQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";

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

const STATUS_COLORS = {
  draft: "default",
  reviewed: "blue",
  approved: "green",
  locked: "purple",
};

export default function PayrollRunComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { getQuery: getSites } = useGetQuery();
  const { postQuery, loading: runLoading } = usePostQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [payrollRuns, setPayrollRuns] = useState([]);

  const [settings, setSettings] = useState({
    activeDeploymentsOnly: true,
    autoCalculateStatutory: true,
    skipExceptions: false,
    applyRounding: true,
  });

  const basePath = pathname?.startsWith("/hr")
    ? "/hr"
    : pathname?.startsWith("/employee")
    ? "/employee"
    : "/admin";

  // Fetch companies
  useEffect(() => {
    getQuery({
      url: "/api/v1/admin/companies?active=true",
      onSuccess: (res) => {
        setCompanies(
          (res.companies || []).map((c) => ({ value: c._id, label: c.name }))
        );
      },
    });
    fetchPayrollRuns();
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

  const fetchPayrollRuns = useCallback(() => {
    getQuery({
      url: "/api/v1/admin/payroll-runs?limit=20",
      onSuccess: (res) => {
        setPayrollRuns(res.payrollRuns || []);
      },
    });
  }, []);

  const handleRunPayroll = async () => {
    const site = form.getFieldValue("site");
    const month = form.getFieldValue("payrollMonth");
    const year = form.getFieldValue("payrollYear");

    if (!site || !month || !year) {
      toast.error("Please select site, month, and year");
      return;
    }

    await postQuery({
      url: "/api/v1/admin/payroll-runs",
      postData: {
        site,
        payrollMonth: month,
        payrollYear: year,
        settings,
      },
      onSuccess: (res) => {
        toast.success(res.message || "Payroll run completed");
        fetchPayrollRuns();
        if (res.payrollRun?._id) {
          router.push(`${basePath}/payroll/preview/${res.payrollRun._id}`);
        }
      },
    });
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Payroll Run",
      content: `Delete payroll run for ${record.site?.name || "site"} (${record.payrollMonth}/${record.payrollYear})?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        deleteQuery({
          url: `/api/v1/admin/payroll-runs/${record._id}`,
          onSuccess: () => {
            toast.success("Payroll run deleted");
            fetchPayrollRuns();
          },
        });
      },
    });
  };

  const columns = [
    {
      title: "Period",
      key: "period",
      width: 100,
      render: (_, r) => `${r.payrollMonth}/${r.payrollYear}`,
    },
    {
      title: "Site",
      dataIndex: ["site", "name"],
      key: "site",
      width: 150,
    },
    {
      title: "Company",
      dataIndex: ["company", "name"],
      key: "company",
      width: 150,
    },
    {
      title: "Employees",
      dataIndex: "totalEmployees",
      key: "totalEmployees",
      width: 90,
      align: "right",
    },
    {
      title: "Gross",
      dataIndex: "totalGross",
      key: "totalGross",
      width: 120,
      align: "right",
      render: (v) => `₹${(v || 0).toLocaleString("en-IN")}`,
    },
    {
      title: "Deductions",
      dataIndex: "totalDeductions",
      key: "totalDeductions",
      width: 110,
      align: "right",
      render: (v) => `₹${(v || 0).toLocaleString("en-IN")}`,
    },
    {
      title: "Net Pay",
      dataIndex: "totalNetPay",
      key: "totalNetPay",
      width: 120,
      align: "right",
      render: (v) => `₹${(v || 0).toLocaleString("en-IN")}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s) => (
        <Tag color={STATUS_COLORS[s] || "default"}>
          {(s || "").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Run Date",
      dataIndex: "runAt",
      key: "runAt",
      width: 110,
      render: (v) => v ? moment(v).format("DD-MM-YYYY") : "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => router.push(`${basePath}/payroll/preview/${record._id}`)}
          >
            Preview
          </Button>
          {record.status === "draft" && (
            <Button
              size="small"
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>Payroll Processing</Title>

        <Form form={form} layout="vertical" initialValues={{ payrollMonth: new Date().getMonth() + 1, payrollYear: currentYear }}>
          <Row gutter={16}>
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
          </Row>

          <Card size="small" title="Payroll Settings" style={{ marginBottom: 16 }}>
            <Row gutter={[24, 8]}>
              <Col xs={24} md={6}>
                <Checkbox
                  checked={settings.activeDeploymentsOnly}
                  onChange={(e) => setSettings((s) => ({ ...s, activeDeploymentsOnly: e.target.checked }))}
                >
                  Active Deployments Only
                </Checkbox>
              </Col>
              <Col xs={24} md={6}>
                <Checkbox
                  checked={settings.autoCalculateStatutory}
                  onChange={(e) => setSettings((s) => ({ ...s, autoCalculateStatutory: e.target.checked }))}
                >
                  Auto-calculate Statutory
                </Checkbox>
              </Col>
              <Col xs={24} md={6}>
                <Checkbox
                  checked={settings.skipExceptions}
                  onChange={(e) => setSettings((s) => ({ ...s, skipExceptions: e.target.checked }))}
                >
                  Skip Employees with Exceptions
                </Checkbox>
              </Col>
              <Col xs={24} md={6}>
                <Checkbox
                  checked={settings.applyRounding}
                  onChange={(e) => setSettings((s) => ({ ...s, applyRounding: e.target.checked }))}
                >
                  Apply Rounding Rules
                </Checkbox>
              </Col>
            </Row>
          </Card>

          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleRunPayroll}
            loading={runLoading}
          >
            Run Payroll
          </Button>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }} title="Recent Payroll Runs">
        <Table
          dataSource={payrollRuns}
          columns={columns}
          rowKey="_id"
          size="small"
          scroll={{ x: 1200 }}
          pagination={false}
          loading={fetchLoading}
          bordered
          locale={{ emptyText: "No payroll runs yet" }}
        />
      </Card>
    </div>
  );
}
