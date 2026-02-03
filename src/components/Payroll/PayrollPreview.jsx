/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Card, Row, Col, Table, Tag, Button, Statistic, Space, Typography, Divider } from "antd";
import { FileExcelOutlined, CheckCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import moment from "moment";
import { useRouter, usePathname } from "next/navigation";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";

const { Title, Text } = Typography;

const STATUS_COLORS = {
  draft: "default",
  reviewed: "blue",
  approved: "green",
  locked: "purple",
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PayrollPreview({ payrollRunId }) {
  const router = useRouter();
  const pathname = usePathname();
  const { getQuery, loading } = useGetQuery();
  const { patchQuery, loading: statusLoading } = usePatchQuery();

  const [payrollRun, setPayrollRun] = useState(null);

  const basePath = pathname?.startsWith("/hr")
    ? "/hr"
    : pathname?.startsWith("/employee")
    ? "/employee"
    : "/admin";

  useEffect(() => {
    if (payrollRunId) {
      fetchPayrollRun();
    }
  }, [payrollRunId]);

  const fetchPayrollRun = () => {
    getQuery({
      url: `/api/v1/admin/payroll-runs/${payrollRunId}`,
      onSuccess: (res) => {
        setPayrollRun(res.payrollRun);
      },
    });
  };

  const handleExport = () => {
    window.open(`/api/v1/admin/payroll-runs/${payrollRunId}/export`, "_blank");
  };

  const handleStatusChange = async (newStatus) => {
    await patchQuery({
      url: `/api/v1/admin/payroll-runs/${payrollRunId}/status`,
      patchData: { status: newStatus },
      onSuccess: (res) => {
        toast.success(res.message || `Status updated to ${newStatus}`);
        fetchPayrollRun();
      },
      onFail: (err) => {
        toast.error(err?.response?.data?.message || "Failed to update status");
      },
    });
  };

  if (loading && !payrollRun) {
    return (
      <Card loading={true}>
        <div style={{ height: 200 }} />
      </Card>
    );
  }

  if (!payrollRun) {
    return (
      <Card>
        <Text>Payroll run not found.</Text>
      </Card>
    );
  }

  const results = payrollRun.results || [];
  const siteName = payrollRun.site?.name || "Site";
  const monthName = MONTH_NAMES[payrollRun.payrollMonth - 1] || "";

  // Determine next status action
  let nextAction = null;
  if (payrollRun.status === "draft") {
    nextAction = { status: "reviewed", label: "Mark as Reviewed", color: "blue" };
  } else if (payrollRun.status === "reviewed") {
    nextAction = { status: "approved", label: "Approve Payroll", color: "green" };
  } else if (payrollRun.status === "approved") {
    nextAction = { status: "locked", label: "Lock Payroll", color: "purple" };
  }

  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 60,
      fixed: "left",
      render: (_, __, idx) => idx + 1,
    },
    {
      title: "Emp Code",
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: 110,
      fixed: "left",
    },
    {
      title: "Name",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 160,
      fixed: "left",
    },
    {
      title: "Payable Days",
      dataIndex: "payableDays",
      key: "payableDays",
      width: 100,
      align: "right",
    },
    {
      title: "Basic",
      dataIndex: "basic",
      key: "basic",
      width: 90,
      align: "right",
      render: (v) => (v || 0).toLocaleString("en-IN"),
    },
    {
      title: "HRA",
      dataIndex: "hra",
      key: "hra",
      width: 90,
      align: "right",
      render: (v) => (v || 0).toLocaleString("en-IN"),
    },
    {
      title: "Other",
      dataIndex: "otherAllowance",
      key: "otherAllowance",
      width: 90,
      align: "right",
      render: (v) => (v || 0).toLocaleString("en-IN"),
    },
    {
      title: "OT",
      dataIndex: "otAmount",
      key: "otAmount",
      width: 80,
      align: "right",
      render: (v) => (v || 0).toLocaleString("en-IN"),
    },
    {
      title: "Incentive",
      dataIndex: "incentive",
      key: "incentive",
      width: 90,
      align: "right",
      render: (v) => (v || 0).toLocaleString("en-IN"),
    },
    {
      title: "Arrear",
      dataIndex: "arrear",
      key: "arrear",
      width: 80,
      align: "right",
      render: (v) => (v || 0).toLocaleString("en-IN"),
    },
    {
      title: "Gross",
      dataIndex: "grossEarning",
      key: "grossEarning",
      width: 100,
      align: "right",
      render: (v) => <Text strong>{(v || 0).toLocaleString("en-IN")}</Text>,
    },
    {
      title: "PF",
      dataIndex: "pfDeduction",
      key: "pfDeduction",
      width: 80,
      align: "right",
      render: (v) => (v || 0).toLocaleString("en-IN"),
    },
    {
      title: "ESI",
      dataIndex: "esiDeduction",
      key: "esiDeduction",
      width: 80,
      align: "right",
      render: (v) => (v || 0).toLocaleString("en-IN"),
    },
    {
      title: "LWF",
      dataIndex: "lwf",
      key: "lwf",
      width: 70,
      align: "right",
      render: (v) => (v || 0).toLocaleString("en-IN"),
    },
    {
      title: "Total Ded.",
      dataIndex: "totalDeductions",
      key: "totalDeductions",
      width: 100,
      align: "right",
      render: (v) => <Text type="danger">{(v || 0).toLocaleString("en-IN")}</Text>,
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "netPay",
      width: 110,
      align: "right",
      fixed: "right",
      render: (v) => <Text strong style={{ color: "#389e0d" }}>{(v || 0).toLocaleString("en-IN")}</Text>,
    },
  ];

  // Totals row
  const totals = {
    basic: results.reduce((s, r) => s + (r.basic || 0), 0),
    hra: results.reduce((s, r) => s + (r.hra || 0), 0),
    otherAllowance: results.reduce((s, r) => s + (r.otherAllowance || 0), 0),
    otAmount: results.reduce((s, r) => s + (r.otAmount || 0), 0),
    incentive: results.reduce((s, r) => s + (r.incentive || 0), 0),
    arrear: results.reduce((s, r) => s + (r.arrear || 0), 0),
    grossEarning: payrollRun.totalGross || 0,
    pfDeduction: results.reduce((s, r) => s + (r.pfDeduction || 0), 0),
    esiDeduction: results.reduce((s, r) => s + (r.esiDeduction || 0), 0),
    lwf: results.reduce((s, r) => s + (r.lwf || 0), 0),
    totalDeductions: payrollRun.totalDeductions || 0,
    netPay: payrollRun.totalNetPay || 0,
  };

  return (
    <div>
      {/* Header */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push(`${basePath}/payroll/run`)}
              >
                Back
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                Payroll Preview - {monthName} {payrollRun.payrollYear} - {siteName}
              </Title>
              <Tag color={STATUS_COLORS[payrollRun.status]}>
                {(payrollRun.status || "").toUpperCase()}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<FileExcelOutlined />} onClick={handleExport}>
                Export Preview
              </Button>
              {nextAction && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(nextAction.status)}
                  loading={statusLoading}
                >
                  {nextAction.label}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Total Employees" value={payrollRun.totalEmployees} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Gross Pay"
              value={payrollRun.totalGross}
              prefix="₹"
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Total Deductions"
              value={payrollRun.totalDeductions}
              prefix="₹"
              precision={0}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Net Pay"
              value={payrollRun.totalNetPay}
              prefix="₹"
              precision={0}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Results Table */}
      <Card style={{ marginTop: 16 }}>
        <Table
          dataSource={results}
          columns={columns}
          rowKey={(r) => r.employee || r.employeeCode}
          size="small"
          scroll={{ x: 1600 }}
          pagination={false}
          bordered
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} />
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2}><Text strong>TOTAL</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={3} />
                <Table.Summary.Cell index={4} align="right"><Text strong>{totals.basic.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right"><Text strong>{totals.hra.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right"><Text strong>{totals.otherAllowance.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="right"><Text strong>{totals.otAmount.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="right"><Text strong>{totals.incentive.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={9} align="right"><Text strong>{totals.arrear.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={10} align="right"><Text strong>{totals.grossEarning.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={11} align="right"><Text strong>{totals.pfDeduction.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={12} align="right"><Text strong>{totals.esiDeduction.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={13} align="right"><Text strong>{totals.lwf.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={14} align="right"><Text strong type="danger">{totals.totalDeductions.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={15} align="right"><Text strong style={{ color: "#389e0d" }}>{totals.netPay.toLocaleString("en-IN")}</Text></Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* Run Info */}
      <Card size="small" style={{ marginTop: 16 }}>
        <Row gutter={24}>
          <Col>
            <Text type="secondary">Run By: </Text>
            <Text>{payrollRun.runBy?.name || "—"}</Text>
          </Col>
          <Col>
            <Text type="secondary">Run Date: </Text>
            <Text>{payrollRun.runAt ? moment(payrollRun.runAt).format("DD-MM-YYYY HH:mm") : "—"}</Text>
          </Col>
          {payrollRun.reviewedBy && (
            <Col>
              <Text type="secondary">Reviewed By: </Text>
              <Text>{payrollRun.reviewedBy?.name} ({moment(payrollRun.reviewedAt).format("DD-MM-YYYY")})</Text>
            </Col>
          )}
          {payrollRun.approvedBy && (
            <Col>
              <Text type="secondary">Approved By: </Text>
              <Text>{payrollRun.approvedBy?.name} ({moment(payrollRun.approvedAt).format("DD-MM-YYYY")})</Text>
            </Col>
          )}
          {payrollRun.exceptionCount > 0 && (
            <Col>
              <Text type="warning">Exceptions: {payrollRun.exceptionCount}</Text>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
}
