"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Space,
  Statistic,
  Table,
  Typography,
} from "antd";
import { DownloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import useGetQuery from "@/hooks/getQuery.hook";
import Title from "@/components/Title/Title";

const { Text } = Typography;
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function GenerateDownload() {
  const { getQuery, loading } = useGetQuery();

  const [payrollRuns, setPayrollRuns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedPayrollRun, setSelectedPayrollRun] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [exportType, setExportType] = useState("VALUES_ONLY");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchApprovedPayrollRuns();
    fetchTemplates();
  }, []);

  const fetchApprovedPayrollRuns = useCallback(() => {
    getQuery({
      url: "/api/v1/admin/salary-sheet-templates/approved-payrolls",
      onSuccess: (res) => {
        setPayrollRuns(res.payrollRuns || []);
      },
      onFail: () => toast.error("Failed to fetch payroll runs"),
    });
  }, [getQuery]);

  const fetchTemplates = useCallback(() => {
    getQuery({
      url: "/api/v1/admin/salary-sheet-templates?active=true",
      onSuccess: (res) => {
        setTemplates(res.templates || []);
      },
      onFail: () => toast.error("Failed to fetch templates"),
    });
  }, [getQuery]);

  const handleGenerate = async () => {
    if (!selectedPayrollRun || !selectedTemplate) {
      toast.error("Please select both payroll run and template");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch(
        "/api/v1/admin/salary-sheet-templates/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            templateId: selectedTemplate,
            payrollRunId: selectedPayrollRun,
            exportType,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate salary sheet");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `salary_sheet_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Salary sheet generated successfully");
    } catch (err) {
      console.error("Generation error:", err);
      toast.error(err.message || "Failed to generate salary sheet");
    } finally {
      setGenerating(false);
    }
  };

  const selectedRun = payrollRuns.find((r) => r._id === selectedPayrollRun);
  const selectedTpl = templates.find((t) => t._id === selectedTemplate);

  const recentPayrollColumns = [
    {
      title: "Period",
      key: "period",
      render: (_, record) =>
        `${MONTH_NAMES[record.payrollMonth - 1]} ${record.payrollYear}`,
    },
    {
      title: "Site",
      dataIndex: ["site", "name"],
      key: "site",
    },
    {
      title: "Employees",
      dataIndex: "totalEmployees",
      key: "totalEmployees",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => status.toUpperCase(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          icon={<DownloadOutlined />}
          onClick={() => {
            setSelectedPayrollRun(record._id);
          }}
        >
          Select
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title title="Generate & Download Salary Sheet" />

      <Card title="Select Generation Parameters">
        <Row gutter={16}>
          <Col span={8}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Select Payroll Run</Text>
              <Select
                style={{ width: "100%" }}
                placeholder="Select Payroll Run"
                value={selectedPayrollRun}
                onChange={setSelectedPayrollRun}
                showSearch
                optionFilterProp="children"
              >
                {payrollRuns.map((run) => (
                  <Select.Option key={run._id} value={run._id}>
                    {MONTH_NAMES[run.payrollMonth - 1]} {run.payrollYear} -{" "}
                    {run.site?.name}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col span={8}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Select Template</Text>
              <Select
                style={{ width: "100%" }}
                placeholder="Select Template"
                value={selectedTemplate}
                onChange={setSelectedTemplate}
                showSearch
                optionFilterProp="children"
              >
                {templates.map((tpl) => (
                  <Select.Option key={tpl._id} value={tpl._id}>
                    {tpl.templateName} ({tpl.company?.name})
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col span={8}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Export Type</Text>
              <Select
                style={{ width: "100%" }}
                value={exportType}
                onChange={setExportType}
              >
                <Select.Option value="VALUES_ONLY">Values Only</Select.Option>
                <Select.Option value="WITH_FORMULAS">
                  With Formulas
                </Select.Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {selectedRun && selectedTpl && (
        <Card title="Generation Preview" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Output Filename"
                value={selectedTpl.outputFilenamePattern}
                valueStyle={{ fontSize: 14 }}
              />
            </Col>
            <Col span={6}>
              <Statistic title="Sheet Name" value={selectedTpl.sheetName} />
            </Col>
            <Col span={6}>
              <Statistic
                title="Estimated Rows"
                value={selectedRun.totalEmployees}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Columns"
                value={(selectedTpl.columnMappings || []).length}
              />
            </Col>
          </Row>

          <div style={{ marginTop: 24, textAlign: "center" }}>
            <Button
              type="primary"
              size="large"
              icon={<FileExcelOutlined />}
              onClick={handleGenerate}
              loading={generating}
            >
              Generate & Download
            </Button>
          </div>
        </Card>
      )}

      <Card title="Quick Generate - Recent Payrolls" style={{ marginTop: 16 }}>
        <Table
          dataSource={payrollRuns.slice(0, 10)}
          columns={recentPayrollColumns}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}
