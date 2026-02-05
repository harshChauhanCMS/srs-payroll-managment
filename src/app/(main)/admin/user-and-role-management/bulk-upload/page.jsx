/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import moment from "moment";
import ExcelJS from "exceljs";
import toast from "react-hot-toast";
import apiClient from "@/apis/apiClient";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import React, { useState, useEffect } from "react";
import BackHeader from "@/components/BackHeader/BackHeader";
import {
  Upload,
  Button,
  Table,
  Input,
  Select,
  DatePicker,
  Space,
  Alert,
  Card,
  Progress,
  Modal,
  List,
  Tag,
  Tooltip,
  Typography,
  Spin,
  Collapse,
} from "antd";
import {
  InboxOutlined,
  DownloadOutlined,
  UserAddOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  MailOutlined,
} from "@ant-design/icons";

const { Dragger } = Upload;
const { Text } = Typography;

const BulkUploadPage = () => {
  // State management
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  // Reference data
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [companySitesMap, setCompanySitesMap] = useState({});

  // Creation state
  const [creating, setCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(null);
  const [creationResults, setCreationResults] = useState(null);

  const { getQuery } = useGetQuery();

  // Fetch reference data on mount
  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Fetch companies, sites, departments, designations
  const fetchReferenceData = async () => {
    // Fetch companies
    getQuery({
      url: "/api/v1/admin/companies?active=true",
      onSuccess: async (res) => {
        const companiesData = res.companies || [];
        setCompanies(companiesData);

        // Fetch sites for each company
        const sitesMap = {};
        await Promise.all(
          companiesData.map(async (company) => {
            try {
              const { data } = await apiClient.get(
                `/api/v1/admin/sites?company=${company._id}&active=true`,
              );
              sitesMap[company._id] = data.sites || [];
            } catch (error) {
              console.error(
                `Failed to fetch sites for ${company.name}:`,
                error,
              );
            }
          }),
        );

        setCompanySitesMap(sitesMap);

        // Flatten all sites
        const allSites = Object.values(sitesMap).flat();
        setSites(allSites);
      },
      onFail: () => {
        toast.error("Failed to fetch companies");
      },
    });

    // Fetch departments
    getQuery({
      url: "/api/v1/admin/departments?active=true",
      onSuccess: (res) => {
        setDepartments(res.departments || []);
      },
    });

    // Fetch designations
    getQuery({
      url: "/api/v1/admin/designations?active=true",
      onSuccess: (res) => {
        setDesignations(res.designations || []);
      },
    });
  };

  // Download sample sheet
  const handleDownloadSample = () => {
    setDownloading(true);

    try {
      const link = document.createElement("a");
      link.href = "/Employee_Sample_Sheet.xlsx";
      link.download = "Employee_Sample_Sheet.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Sample sheet downloaded successfully");
    } catch (error) {
      toast.error("Failed to download sample sheet");
    } finally {
      setDownloading(false);
    }
  };

  // Utility: Generate 8-digit random password
  const generatePassword = () => {
    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Utility: Email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Utility: Parse Excel date
  const parseDateCell = (cellValue) => {
    // Handle Excel date serial numbers
    if (typeof cellValue === "number") {
      const date = new Date((cellValue - 25569) * 86400 * 1000);
      return date;
    }

    // Handle date objects
    if (cellValue instanceof Date) {
      return cellValue;
    }

    // Handle string dates (YYYY-MM-DD format)
    if (typeof cellValue === "string") {
      const parsed = new Date(cellValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  };

  // Utility: Get cell value safely
  const getCellValue = (row, colIndex) => {
    if (!colIndex) return null;
    const cell = row.getCell(colIndex);
    return cell.value ? String(cell.value).trim() : null;
  };

  // Map Excel column headers to field names
  const mapColumns = (headerRow) => {
    const headers = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value || "")
        .trim()
        .toLowerCase();
    });

    const columnAliases = {
      employeeCode: ["emp code", "employee code", "empcode", "code"],
      name: ["full name", "employee name", "name"],
      email: ["email", "email id", "email address"],
      doj: ["date of joining", "doj", "joining date"],
      fatherName: ["father's name", "father name", "fathername"],
      gender: ["gender", "sex"],
      mobile: ["mobile number", "mobile", "phone", "contact"],
      company: ["company", "client"],
      site: ["site", "location"],
      department: ["department", "dept"],
      designation: ["designation", "position", "role"],
    };

    const colMap = {};
    for (const [key, aliases] of Object.entries(columnAliases)) {
      const idx = headers.findIndex(
        (h) => h && aliases.some((alias) => h.includes(alias)),
      );
      if (idx !== -1) {
        colMap[key] = idx;
      }
    }

    return colMap;
  };

  // Validate row data
  const validateRow = (row) => {
    const errors = [];

    if (!row.name) errors.push("Name is required");
    if (!row.email) errors.push("Email is required");
    if (row.email && !isValidEmail(row.email))
      errors.push("Invalid email format");
    if (!row.doj) errors.push("Date of Joining is required");
    if (!row.company) errors.push("Company is required");
    if (!row.site) errors.push("Site is required");

    if (row.gender && !["Male", "Female", "Other"].includes(row.gender)) {
      errors.push(`Invalid gender: ${row.gender}`);
    }

    if (row.mobile && !/^\d{10}$/.test(row.mobile)) {
      errors.push("Mobile must be exactly 10 digits");
    }

    return errors;
  };

  // Transform and validate parsed data
  const transformAndValidate = (parsed) => {
    const transformed = [];
    const errors = {};

    for (const emp of parsed) {
      // Map company name to ID
      const company = companies.find(
        (c) => c.name.toLowerCase() === emp.company?.toLowerCase(),
      );

      // Map site name to ID
      const site = company
        ? companySitesMap[company._id]?.find(
            (s) =>
              s.name.toLowerCase() === emp.site?.toLowerCase() ||
              s.siteCode?.toLowerCase() === emp.site?.toLowerCase(),
          )
        : null;

      // Map department name to ID
      const department = departments.find(
        (d) => d.name.toLowerCase() === emp.department?.toLowerCase(),
      );

      // Map designation name to ID
      const designation = designations.find(
        (d) => d.name.toLowerCase() === emp.designation?.toLowerCase(),
      );

      const transformedEmployee = {
        ...emp,
        company: company?._id,
        companyName: company?.name || emp.company,
        site: site?._id,
        siteName: site?.name || emp.site,
        department: department?._id,
        departmentName: department?.name || emp.department,
        designation: designation?._id,
        designationName: designation?.name || emp.designation,
        password: generatePassword(),
        role: "employee",
      };

      // Validate
      const rowErrors = validateRow(transformedEmployee);

      // Add mapping errors
      if (emp.company && !company) {
        rowErrors.push(`Company "${emp.company}" not found`);
      }
      if (emp.site && !site) {
        rowErrors.push(`Site "${emp.site}" not found`);
      }

      if (rowErrors.length > 0) {
        errors[emp._rowIndex] = rowErrors;
      }

      transformed.push(transformedEmployee);
    }

    setEmployeeData(transformed);
    setValidationErrors(errors);
  };

  // Handle file upload
  const handleFileUpload = async (info) => {
    setUploading(true);

    try {
      const file = info.file;
      const buffer = await file.arrayBuffer();

      // Parse with ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        toast.error("Excel file is empty");
        setUploading(false);
        return;
      }

      // Map headers
      const headerRow = worksheet.getRow(1);
      const colMap = mapColumns(headerRow);

      // Validate required columns
      const requiredCols = ["employeeCode", "name", "email", "doj", "site"];
      const missingCols = requiredCols.filter((col) => !colMap[col]);

      if (missingCols.length > 0) {
        toast.error(`Missing required columns: ${missingCols.join(", ")}`);
        setUploading(false);
        return;
      }

      // Parse data rows
      const parsed = [];
      for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
        const row = worksheet.getRow(rowNum);
        const empCode = getCellValue(row, colMap.employeeCode);

        if (!empCode) continue; // Skip empty rows

        const dojValue = row.getCell(colMap.doj).value;
        const doj = parseDateCell(dojValue);

        const employeeData = {
          _rowIndex: rowNum,
          employeeCode: empCode,
          name: getCellValue(row, colMap.name),
          email: getCellValue(row, colMap.email),
          doj: doj,
          fatherName: getCellValue(row, colMap.fatherName),
          gender: getCellValue(row, colMap.gender),
          mobile: getCellValue(row, colMap.mobile),
          company: getCellValue(row, colMap.company),
          site: getCellValue(row, colMap.site),
          department: getCellValue(row, colMap.department),
          designation: getCellValue(row, colMap.designation),
        };

        parsed.push(employeeData);
      }

      if (parsed.length === 0) {
        toast.error("No valid data found in the Excel file");
        setUploading(false);
        return;
      }

      toast.success(`Parsed ${parsed.length} employees from Excel file`);

      // Transform and validate
      transformAndValidate(parsed);
    } catch (error) {
      console.error("File parsing error:", error);
      toast.error(error.message || "Failed to parse Excel file");
    } finally {
      setUploading(false);
    }
  };

  // Handle cell changes
  const handleCellChange = (rowIndex, field, value) => {
    setEmployeeData((prev) =>
      prev.map((row) =>
        row._rowIndex === rowIndex ? { ...row, [field]: value } : row,
      ),
    );

    // Re-validate the changed row
    const updatedRow = employeeData.find((r) => r._rowIndex === rowIndex);
    if (updatedRow) {
      const rowErrors = validateRow({ ...updatedRow, [field]: value });
      setValidationErrors((prev) => {
        const next = { ...prev };
        if (rowErrors.length > 0) {
          next[rowIndex] = rowErrors;
        } else {
          delete next[rowIndex];
        }
        return next;
      });
    }
  };

  // Handle bulk employee creation
  const handleCreateEmployees = async () => {
    // Validate all rows first
    const hasErrors = Object.keys(validationErrors).length > 0;
    if (hasErrors) {
      toast.error("Please fix all validation errors before creating employees");
      return;
    }

    setCreating(true);

    const results = {
      success: [],
      failed: [],
      errors: [],
    };

    // Create employees sequentially
    for (const [index, employee] of employeeData.entries()) {
      try {
        // Update progress
        setCreationProgress({
          current: index + 1,
          total: employeeData.length,
          currentEmployee: employee.name,
        });

        // Prepare payload
        const payload = {
          name: employee.name,
          email: employee.email,
          password: employee.password,
          role: "employee",
          employeeCode: employee.employeeCode,
          fatherName: employee.fatherName,
          gender: employee.gender,
          mobile: employee.mobile,
          doj: employee.doj,
          company: employee.company,
          site: employee.site,
          department: employee.department || null,
          designation: employee.designation || null,
          permissions: {
            view: true,
            edit: false,
            delete: false,
            create: false,
          },
        };

        // Call API
        const { data } = await apiClient.post("/api/v1/admin/users", payload);

        results.success.push({
          rowIndex: employee._rowIndex,
          employeeCode: employee.employeeCode,
          name: employee.name,
          email: employee.email,
          emailSent: data.emailSent,
        });
      } catch (error) {
        results.failed.push(employee.employeeCode);
        results.errors.push({
          rowIndex: employee._rowIndex,
          employeeCode: employee.employeeCode,
          name: employee.name,
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to create",
        });
      }
    }

    setCreating(false);
    setCreationProgress(null);
    setCreationResults(results);

    // Show summary
    if (results.success.length > 0) {
      toast.success(
        `Successfully created ${results.success.length} out of ${employeeData.length} employees`,
      );
    }

    if (results.failed.length > 0) {
      toast.error(`Failed to create ${results.failed.length} employees`);
    }
  };

  // Reset the form
  const handleReset = () => {
    setEmployeeData([]);
    setValidationErrors({});
    setCreationResults(null);
  };

  // Preview table columns
  const columns = [
    {
      title: "Row",
      key: "rowIndex",
      width: 70,
      fixed: "left",
      render: (_, record) => (
        <Space>
          {record._rowIndex}
          {validationErrors[record._rowIndex] && (
            <Tooltip title={validationErrors[record._rowIndex].join(", ")}>
              <WarningOutlined style={{ color: "#ff4d4f" }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Emp Code",
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: 120,
      fixed: "left",
      render: (value, record) => (
        <Input
          size="small"
          value={value}
          onChange={(e) =>
            handleCellChange(record._rowIndex, "employeeCode", e.target.value)
          }
          status={validationErrors[record._rowIndex] ? "error" : ""}
        />
      ),
    },
    {
      title: "Full Name *",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (value, record) => (
        <Input
          size="small"
          value={value}
          onChange={(e) =>
            handleCellChange(record._rowIndex, "name", e.target.value)
          }
          status={!value ? "error" : ""}
        />
      ),
    },
    {
      title: "Email *",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (value, record) => (
        <Input
          size="small"
          value={value}
          onChange={(e) =>
            handleCellChange(record._rowIndex, "email", e.target.value)
          }
          status={!value || !isValidEmail(value) ? "error" : ""}
        />
      ),
    },
    {
      title: "DOJ *",
      dataIndex: "doj",
      key: "doj",
      width: 150,
      render: (value, record) => (
        <DatePicker
          size="small"
          value={value ? moment(value) : null}
          format="YYYY-MM-DD"
          onChange={(date) =>
            handleCellChange(record._rowIndex, "doj", date?.toDate())
          }
          status={!value ? "error" : ""}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Father's Name",
      dataIndex: "fatherName",
      key: "fatherName",
      width: 150,
      render: (value, record) => (
        <Input
          size="small"
          value={value}
          onChange={(e) =>
            handleCellChange(record._rowIndex, "fatherName", e.target.value)
          }
        />
      ),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 120,
      render: (value, record) => (
        <Select
          size="small"
          value={value}
          onChange={(val) => handleCellChange(record._rowIndex, "gender", val)}
          style={{ width: "100%" }}
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
          ]}
        />
      ),
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      width: 130,
      render: (value, record) => (
        <Input
          size="small"
          value={value}
          maxLength={10}
          onChange={(e) =>
            handleCellChange(record._rowIndex, "mobile", e.target.value)
          }
          status={value && !/^\d{10}$/.test(value) ? "error" : ""}
        />
      ),
    },
    {
      title: "Company *",
      dataIndex: "companyName",
      key: "company",
      width: 150,
      render: (value, record) => (
        <Select
          size="small"
          value={record.company}
          showSearch
          onChange={(val) => {
            handleCellChange(record._rowIndex, "company", val);
            // Update company name
            const company = companies.find((c) => c._id === val);
            handleCellChange(record._rowIndex, "companyName", company?.name);
            // Reset site when company changes
            handleCellChange(record._rowIndex, "site", null);
            handleCellChange(record._rowIndex, "siteName", null);
          }}
          style={{ width: "100%" }}
          options={companies.map((c) => ({ value: c._id, label: c.name }))}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: "Site *",
      dataIndex: "siteName",
      key: "site",
      width: 150,
      render: (value, record) => (
        <Select
          size="small"
          value={record.site}
          showSearch
          onChange={(val) => {
            handleCellChange(record._rowIndex, "site", val);
            // Update site name
            const site = sites.find((s) => s._id === val);
            handleCellChange(record._rowIndex, "siteName", site?.name);
          }}
          style={{ width: "100%" }}
          disabled={!record.company}
          options={(companySitesMap[record.company] || []).map((s) => ({
            value: s._id,
            label: s.name,
          }))}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "department",
      width: 150,
      render: (value, record) => (
        <Select
          size="small"
          value={record.department}
          showSearch
          allowClear
          onChange={(val) => {
            handleCellChange(record._rowIndex, "department", val);
            const dept = departments.find((d) => d._id === val);
            handleCellChange(
              record._rowIndex,
              "departmentName",
              dept?.name || null,
            );
          }}
          style={{ width: "100%" }}
          options={departments.map((d) => ({ value: d._id, label: d.name }))}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: "Designation",
      dataIndex: "designationName",
      key: "designation",
      width: 150,
      render: (value, record) => (
        <Select
          size="small"
          value={record.designation}
          showSearch
          allowClear
          onChange={(val) => {
            handleCellChange(record._rowIndex, "designation", val);
            const desig = designations.find((d) => d._id === val);
            handleCellChange(
              record._rowIndex,
              "designationName",
              desig?.name || null,
            );
          }}
          style={{ width: "100%" }}
          options={designations.map((d) => ({ value: d._id, label: d.name }))}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
      width: 120,
      render: (value) => (
        <Text code copyable style={{ fontSize: "12px" }}>
          {value}
        </Text>
      ),
    },
  ];

  return (
    <>
      <BackHeader label="User Management" />
      <Title
        title="Bulk Upload Users"
        showButton={true}
        buttonText="Download Sample Sheet"
        onButtonClick={handleDownloadSample}
      />

      <div className="rounded-lg shadow-md" style={{ marginTop: "16px" }}>
        {/* Phase 1: Upload */}
        {employeeData.length === 0 && !creationResults && (
          <Dragger
            accept=".xlsx,.xls"
            showUploadList={false}
            customRequest={handleFileUpload}
            disabled={uploading}
            style={{ padding: "40px 0" }}
          >
            {uploading ? (
              <Spin tip="Parsing Excel file..." size="large" />
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ color: "#366598" }} />
                </p>
                <p className="ant-upload-text text-lg font-medium text-gray-700">
                  Click or drag Excel file to upload
                </p>
                <p className="ant-upload-hint text-gray-500 mt-2">
                  Use the downloaded sample sheet template for best results
                </p>
              </>
            )}
          </Dragger>
        )}

        {/* Phase 2: Preview & Edit */}
        {employeeData.length > 0 && !creationResults && (
          <Card style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Typography.Title level={4}>
                Review & Edit Employee Data ({employeeData.length} rows)
              </Typography.Title>

              {Object.keys(validationErrors).length > 0 && (
                <Alert
                  type="error"
                  message={`${Object.keys(validationErrors).length} rows have validation errors`}
                  description="Please fix all errors before creating employees. Hover over warning icons to see details."
                  showIcon
                />
              )}

              <Table
                dataSource={employeeData}
                columns={columns}
                rowKey="_rowIndex"
                size="small"
                scroll={{ x: 2000, y: 400 }}
                pagination={false}
                bordered
                rowClassName={(record) =>
                  validationErrors[record._rowIndex] ? "bg-red-50" : ""
                }
              />

              <Space>
                <Button
                  type="default"
                  size="medium"
                  className="red-button"
                  style={{ borderRadius: "8px" }}
                  onClick={handleReset}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="medium"
                  icon={<UserAddOutlined />}
                  className="green-button"
                  style={{ borderRadius: "8px" }}
                  onClick={handleCreateEmployees}
                  disabled={Object.keys(validationErrors).length > 0}
                  loading={creating}
                >
                  Create {employeeData.length} Employees
                </Button>
              </Space>
            </Space>
          </Card>
        )}

        {/* Phase 3: Creation Progress */}
        {creating && creationProgress && (
          <Card style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Typography.Text strong>
                Creating Employees... {creationProgress.current} /{" "}
                {creationProgress.total}
              </Typography.Text>
              <Progress
                percent={Math.round(
                  (creationProgress.current / creationProgress.total) * 100,
                )}
                status="active"
              />
              <Typography.Text type="secondary">
                Currently processing: {creationProgress.currentEmployee}
              </Typography.Text>
            </Space>
          </Card>
        )}

        {/* Phase 4: Results Modal */}
        {creationResults && (
          <Modal
            title="Bulk Upload Results"
            open={true}
            onCancel={handleReset}
            footer={[
              <Button
                key="close"
                className="red-button"
                style={{ borderRadius: "8px" }}
                type="primary"
                onClick={handleReset}
              >
                Close
              </Button>,
            ]}
            width={800}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Alert
                type="success"
                message={`Successfully Created: ${creationResults.success.length}`}
                showIcon
              />

              {creationResults.success.length > 0 && (
                <Collapse>
                  <Collapse.Panel
                    header="View Successful Creations"
                    key="success"
                  >
                    <List
                      size="small"
                      dataSource={creationResults.success}
                      renderItem={(item) => (
                        <List.Item>
                          <Space>
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                            <Typography.Text>
                              Row {item.rowIndex}: {item.employeeCode} -{" "}
                              {item.name}
                            </Typography.Text>
                            {item.emailSent && (
                              <Tag color="blue" icon={<MailOutlined />}>
                                Email Sent
                              </Tag>
                            )}
                          </Space>
                        </List.Item>
                      )}
                    />
                  </Collapse.Panel>
                </Collapse>
              )}

              {creationResults.failed.length > 0 && (
                <>
                  <Alert
                    type="error"
                    message={`Failed to Create: ${creationResults.failed.length}`}
                    showIcon
                  />
                  <List
                    size="small"
                    bordered
                    dataSource={creationResults.errors}
                    renderItem={(err) => (
                      <List.Item>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Typography.Text type="danger">
                            Row {err.rowIndex}: {err.employeeCode} - {err.name}
                          </Typography.Text>
                          <Typography.Text type="secondary">
                            Error: {err.message}
                          </Typography.Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Space>
          </Modal>
        )}
      </div>
    </>
  );
};

export default BulkUploadPage;
