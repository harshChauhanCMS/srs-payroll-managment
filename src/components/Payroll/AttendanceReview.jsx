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
  Table,
  InputNumber,
  Space,
  Typography,
} from "antd";
import {
  SaveOutlined,
  FileExcelOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";

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

const EDITABLE_FIELDS = [
  "workingDays",
  "presentDays",
  "payableDays",
  "leaveDays",
  "otHours",
  "incentive",
  "arrear",
];

export default function AttendanceReview() {
  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { getQuery: getSites } = useGetQuery();
  const { patchQuery, loading: saveLoading } = usePatchQuery();

  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [loaded, setLoaded] = useState(false);

  // Fetch companies
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

  const loadAttendance = useCallback(() => {
    const site = form.getFieldValue("site");
    const month = form.getFieldValue("payrollMonth");
    const year = form.getFieldValue("payrollYear");

    if (!site || !month || !year) {
      toast.error("Please select site, month, and year");
      return;
    }

    getQuery({
      url: `/api/v1/admin/attendance?site=${site}&payrollMonth=${month}&payrollYear=${year}&limit=500`,
      onSuccess: (res) => {
        setAttendance(res.attendance || []);
        setEditedRows({});
        setLoaded(true);
      },
    });
  }, [form, getQuery]);

  const handleCellChange = (recordId, field, value) => {
    setEditedRows((prev) => ({
      ...prev,
      [recordId]: {
        ...(prev[recordId] || {}),
        _id: recordId,
        [field]: value,
      },
    }));

    // Update local state for display
    setAttendance((prev) =>
      prev.map((row) =>
        row._id === recordId ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleSaveRow = async (recordId) => {
    const changes = editedRows[recordId];
    if (!changes) {
      toast.error("No changes to save");
      return;
    }

    await patchQuery({
      url: `/api/v1/admin/attendance/${recordId}`,
      patchData: changes,
      onSuccess: () => {
        toast.success("Row saved successfully");
        setEditedRows((prev) => {
          const next = { ...prev };
          delete next[recordId];
          return next;
        });
      },
      onFail: () => {
        toast.error("Failed to save row");
      },
    });
  };

  const handleSaveAll = async () => {
    const records = Object.values(editedRows);
    if (records.length === 0) {
      toast.error("No changes to save");
      return;
    }

    await patchQuery({
      url: "/api/v1/admin/attendance/bulk-update",
      patchData: { records },
      onSuccess: (res) => {
        toast.success(res.message || "All changes saved");
        setEditedRows({});
      },
      onFail: () => {
        toast.error("Failed to save changes");
      },
    });
  };

  const handleExport = () => {
    const site = form.getFieldValue("site");
    const month = form.getFieldValue("payrollMonth");
    const year = form.getFieldValue("payrollYear");

    if (!site || !month || !year) {
      toast.error("Please select site, month, and year");
      return;
    }

    window.open(
      `/api/v1/admin/attendance/export?site=${site}&payrollMonth=${month}&payrollYear=${year}`,
      "_blank",
    );
  };

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
      dataIndex: ["employee", "employeeCode"],
      key: "employeeCode",
      width: 120,
      fixed: "left",
    },
    {
      title: "Employee Name",
      dataIndex: ["employee", "name"],
      key: "employeeName",
      width: 180,
      fixed: "left",
    },
    ...EDITABLE_FIELDS.map((field) => ({
      title: field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase()),
      dataIndex: field,
      key: field,
      width: 120,
      render: (value, record) => (
        <InputNumber
          size="small"
          value={value || 0}
          min={0}
          style={{ width: "100%" }}
          onChange={(val) => handleCellChange(record._id, field, val)}
        />
      ),
    })),
    {
      title: "Action",
      key: "action",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Button
          size="small"
          type="link"
          icon={<SaveOutlined />}
          onClick={() => handleSaveRow(record._id)}
          disabled={!editedRows[record._id]}
          loading={saveLoading}
        >
          Save
        </Button>
      ),
    },
  ];

  const hasEdits = Object.keys(editedRows).length > 0;

  return (
    <div>
      <Card>
        <Title level={4} style={{ marginBottom: 24 }}>
          Attendance Review & Edit
        </Title>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            payrollMonth: new Date().getMonth() + 1,
            payrollYear: currentYear,
          }}
        >
          <Row gutter={16} align="bottom">
            <Col xs={24} md={5}>
              <Form.Item
                name="company"
                label="Company"
                rules={[{ required: true }]}
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
            <Col xs={24} md={5}>
              <Form.Item name="site" label="Site" rules={[{ required: true }]}>
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
            <Col xs={24} md={4}>
              <Form.Item
                name="payrollMonth"
                label="Month"
                rules={[{ required: true }]}
              >
                <Select options={MONTHS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item
                name="payrollYear"
                label="Year"
                rules={[{ required: true }]}
              >
                <Select options={YEARS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item label=" ">
                <Space>
                  <Button
                    type="primary"
                    className="simple-button"
                    style={{ borderRadius: "8px" }}
                    icon={<ReloadOutlined />}
                    onClick={loadAttendance}
                    loading={fetchLoading}
                  >
                    Load
                  </Button>
                  {loaded && (
                    <>
                      <Button
                        icon={<SaveOutlined />}
                        onClick={handleSaveAll}
                        disabled={!hasEdits}
                        loading={saveLoading}
                      >
                        Save All
                      </Button>
                      <Button
                        icon={<FileExcelOutlined />}
                        onClick={handleExport}
                      >
                        Export
                      </Button>
                    </>
                  )}
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {loaded && (
          <Table
            dataSource={attendance}
            columns={columns}
            rowKey="_id"
            size="small"
            scroll={{ x: 1200 }}
            pagination={false}
            bordered
            loading={fetchLoading}
            locale={{
              emptyText:
                "No attendance records found. Import attendance data first.",
            }}
          />
        )}
      </Card>
    </div>
  );
}
