/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Select, Form, Button, Table, Tag, Space, Typography, Modal } from "antd";
import { CheckCircleOutlined, LockOutlined, EyeOutlined, AuditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import moment from "moment";
import { useRouter, usePathname } from "next/navigation";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";

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

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "locked", label: "Locked" },
];

const STATUS_COLORS = {
  draft: "default",
  reviewed: "blue",
  approved: "green",
  locked: "purple",
};

const STATUS_ACTIONS = {
  draft: { next: "reviewed", label: "Mark Reviewed", icon: <AuditOutlined /> },
  reviewed: { next: "approved", label: "Approve", icon: <CheckCircleOutlined /> },
  approved: { next: "locked", label: "Lock", icon: <LockOutlined /> },
};

export default function ApprovalWorkflow() {
  const router = useRouter();
  const pathname = usePathname();
  const [form] = Form.useForm();
  const { getQuery, loading } = useGetQuery();
  const { getQuery: getSites } = useGetQuery();
  const { patchQuery, loading: statusLoading } = usePatchQuery();

  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [payrollRuns, setPayrollRuns] = useState([]);

  const basePath = pathname?.startsWith("/hr")
    ? "/hr"
    : pathname?.startsWith("/employee")
    ? "/employee"
    : "/admin";

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
    const site = form.getFieldValue("site");
    const month = form.getFieldValue("payrollMonth");
    const year = form.getFieldValue("payrollYear");
    const status = form.getFieldValue("status");

    let url = "/api/v1/admin/payroll-runs?limit=50";
    if (site) url += `&site=${site}`;
    if (month) url += `&payrollMonth=${month}`;
    if (year) url += `&payrollYear=${year}`;
    if (status) url += `&status=${status}`;

    getQuery({
      url,
      onSuccess: (res) => {
        setPayrollRuns(res.payrollRuns || []);
      },
    });
  }, [form, getQuery]);

  const handleStatusUpdate = (record, newStatus) => {
    const actionLabel = STATUS_ACTIONS[record.status]?.label || newStatus;

    Modal.confirm({
      title: `${actionLabel} Payroll`,
      content: `Are you sure you want to ${actionLabel.toLowerCase()} the payroll for ${record.site?.name || "site"} (${record.payrollMonth}/${record.payrollYear})?`,
      okText: actionLabel,
      onOk: async () => {
        await patchQuery({
          url: `/api/v1/admin/payroll-runs/${record._id}/status`,
          patchData: { status: newStatus },
          onSuccess: (res) => {
            toast.success(res.message || `Status updated to ${newStatus}`);
            fetchPayrollRuns();
          },
          onFail: (err) => {
            toast.error(err?.response?.data?.message || "Failed to update status");
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
      title: "Gross Pay",
      dataIndex: "totalGross",
      key: "totalGross",
      width: 120,
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
      width: 110,
      render: (s) => (
        <Tag color={STATUS_COLORS[s] || "default"}>
          {(s || "").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Run By",
      dataIndex: ["runBy", "name"],
      key: "runBy",
      width: 120,
      render: (v) => v || "—",
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
      width: 180,
      fixed: "right",
      render: (_, record) => {
        const action = STATUS_ACTIONS[record.status];
        return (
          <Space>
            <Button
              size="small"
              type="link"
              icon={<EyeOutlined />}
              onClick={() => router.push(`${basePath}/payroll/preview/${record._id}`)}
            >
              View
            </Button>
            {action && (
              <Button
                size="small"
                type="primary"
                icon={action.icon}
                onClick={() => handleStatusUpdate(record, action.next)}
                loading={statusLoading}
              >
                {action.label}
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>Payroll Approval</Title>

        <Form form={form} layout="vertical">
          <Row gutter={16} align="bottom">
            <Col xs={24} md={4}>
              <Form.Item name="company" label="Company">
                <Select
                  placeholder="All companies"
                  options={companies}
                  onChange={handleCompanyChange}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item name="site" label="Site">
                <Select
                  placeholder="All sites"
                  options={sites}
                  disabled={!selectedCompany}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={3}>
              <Form.Item name="payrollMonth" label="Month">
                <Select placeholder="All" options={MONTHS} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={3}>
              <Form.Item name="payrollYear" label="Year">
                <Select placeholder="All" options={YEARS} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={3}>
              <Form.Item name="status" label="Status">
                <Select placeholder="All" options={STATUS_OPTIONS} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={3}>
              <Form.Item label=" ">
                <Button type="primary" onClick={fetchPayrollRuns} loading={loading}>
                  Filter
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          dataSource={payrollRuns}
          columns={columns}
          rowKey="_id"
          size="small"
          scroll={{ x: 1400 }}
          pagination={false}
          bordered
          loading={loading}
          locale={{ emptyText: "No payroll runs found" }}
        />
      </Card>
    </div>
  );
}
