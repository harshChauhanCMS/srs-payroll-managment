"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";
import moment from "moment";

import { useRouter } from "next/navigation";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ClusterOutlined,
  IdcardOutlined,
  StarOutlined,
  ToolOutlined,
  UploadOutlined,
  LoadingOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Switch,
  DatePicker,
  Radio,
  Upload,
  message,
} from "antd";

import { useEffect, useState, useCallback } from "react";

const { Option } = Select;
const { Dragger } = Upload;

export default function AddUser({ basePath = "/admin" }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();
  const { getQuery: getCompanies, loading: companiesLoading } = useGetQuery();
  const { getQuery: getSites, loading: sitesLoading } = useGetQuery();
  const { getQuery: getDepartments, loading: departmentsLoading } =
    useGetQuery();
  const { getQuery: getDesignations, loading: designationsLoading } =
    useGetQuery();
  const { getQuery: getGrades, loading: gradesLoading } = useGetQuery();
  const { getQuery: getSkills, loading: skillsLoading } = useGetQuery();

  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [grades, setGrades] = useState([]);
  const [skills, setSkills] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Upload State
  const [imageUploading, setImageUploading] = useState(false);
  const [aadharCardPhotoUrl, setAadharCardPhotoUrl] = useState("");

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

  const fetchSites = useCallback(
    (companyId) => {
      if (!companyId) {
        setSites([]);
        return;
      }
      getSites({
        url: `/api/v1/admin/sites?company=${companyId}&active=true&limit=100`,
        onSuccess: (res) => setSites(res.sites || []),
        onFail: (err) => console.error("Failed to fetch sites", err),
      });
    },
    [getSites],
  );

  const fetchDepartments = useCallback(
    (siteId) => {
      if (!siteId) {
        setDepartments([]);
        return;
      }
      getDepartments({
        url: `/api/v1/admin/departments?site=${siteId}&active=true&limit=100`,
        onSuccess: (res) => setDepartments(res.departments || []),
        onFail: (err) => console.error("Failed to fetch departments", err),
      });
    },
    [getDepartments],
  );

  const fetchDesignations = useCallback(
    (departmentId) => {
      if (!departmentId) {
        setDesignations([]);
        return;
      }
      getDesignations({
        url: `/api/v1/admin/designations?department=${departmentId}&active=true&limit=100`,
        onSuccess: (res) => setDesignations(res.designations || []),
        onFail: (err) => console.error("Failed to fetch designations", err),
      });
    },
    [getDesignations],
  );

  useEffect(() => {
    getGrades({
      url: "/api/v1/admin/grades?active=true&limit=100",
      onSuccess: (res) => setGrades(res.grades || []),
      onFail: (err) => console.error("Failed to fetch grades", err),
    });
  }, []);

  useEffect(() => {
    getSkills({
      url: "/api/v1/admin/skills?active=true&limit=100",
      onSuccess: (res) => setSkills(res.skills || []),
      onFail: (err) => console.error("Failed to fetch skills", err),
    });
  }, []);

  const handleCompanyChange = (companyId) => {
    form.setFieldValue("site", undefined);
    form.setFieldValue("department", undefined);
    form.setFieldValue("designation", undefined);
    setSites([]);
    setDepartments([]);
    setDesignations([]);
    setSelectedCompany(companyId);
    setSelectedSite(null);
    setSelectedDepartment(null);
    if (companyId) {
      fetchSites(companyId);
    }
  };

  const handleSiteChange = (siteId) => {
    form.setFieldValue("department", undefined);
    form.setFieldValue("designation", undefined);
    setDepartments([]);
    setDesignations([]);
    setSelectedSite(siteId);
    setSelectedDepartment(null);
    if (siteId) {
      fetchDepartments(siteId);
    }
  };

  const handleDepartmentChange = (departmentId) => {
    form.setFieldValue("designation", undefined);
    setDesignations([]);
    setSelectedDepartment(departmentId);
    if (departmentId) {
      fetchDesignations(departmentId);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    setImageUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setAadharCardPhotoUrl(data.url);
      message.success("File uploaded successfully");
    } catch (err) {
      console.error(err);
      message.error(err.message || "Upload failed");
    } finally {
      setImageUploading(false);
    }
    // Prevent default upload behavior
    return false;
  };

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      permissions: {
        view: values.permissions?.view || false,
        edit: values.permissions?.edit || false,
        delete: values.permissions?.delete || false,
        create: values.permissions?.create || false,
      },
      // New Fields
      dob: values.dob ? values.dob.toISOString() : null,
      doj: values.doj ? values.doj.toISOString() : null,
      contractEndDate: values.contractEndDate
        ? values.contractEndDate.toISOString()
        : null,
      aadharCardPhoto: aadharCardPhotoUrl,
      // Ensure defaults for switches if undefined
      pfApplicable: values.pfApplicable || false,
      esiApplicable: values.esiApplicable || false,
    };

    postQuery({
      url: "/api/v1/admin/users",
      postData: payload,
      onSuccess: (response) => {
        const emailSent = response?.emailSent;
        toast.success(
          `User created successfully${
            emailSent ? " and credentials sent via email" : ""
          }`,
        );
        router.push(`${basePath}/user-and-role-management`);
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to create user");
      },
    });
  };

  return (
    <>
      <BackHeader label="Back" href={`${basePath}/user-and-role-management`} />
      <Title title="Add New User" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            role: "employee",
            permissions: {
              view: true,
              edit: false,
              delete: false,
              create: false,
            },
            category: "payroll",
            wageType: "monthly",
            pfApplicable: false,
            esiApplicable: false,
          }}
        >
          <Typography.Title level={5} className="mb-4!">
            Basic Information
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="John Doe"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="john@company.com"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="mobile"
                label="Mobile Number"
                rules={[
                  {
                    pattern: /^\d{10}$/,
                    message: "Mobile number must be exactly 10 digits",
                  },
                ]}
              >
                <Input placeholder="9876543210" size="large" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
                extra="This password will be sent to the user's email"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter password"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role" size="large">
                  <Option value="hr">HR</Option>
                  <Option value="employee">Employee</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="active" label="Status" valuePropName="checked">
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  defaultChecked
                />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} className="mt-4! mb-3!">
            Professional Details
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="employeeCode" label="Employee Code">
                <Input placeholder="EMP001" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="doj" label="Date of Joining">
                <DatePicker style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="contractEndDate" label="Contract End Date">
                <DatePicker style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="category" label="Category">
                <Select size="large">
                  <Option value="payroll">Payroll</Option>
                  <Option value="consultant">Consultant</Option>
                  <Option value="contractor">Contractor</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="wageType" label="Wage Type">
                <Select size="large">
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} className="mt-4! mb-3!">
            Personal Details
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="fatherName" label="Father's Name">
                <Input placeholder="Father's Name" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="gender" label="Gender">
                <Radio.Group>
                  <Radio value="Male">Male</Radio>
                  <Radio value="Female">Female</Radio>
                  <Radio value="Other">Other</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="dob" label="Date of Birth">
                <DatePicker style={{ width: "100%" }} size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="address" label="Address">
                <Input.TextArea placeholder="Enter address" rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} className="mt-4! mb-3!">
            Organization Assignment
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="company"
                label="Company"
                rules={[{ required: true, message: "Please select a company" }]}
              >
                <Select
                  placeholder="Select company"
                  suffixIcon={<BankOutlined className="text-gray-400" />}
                  size="large"
                  loading={companiesLoading}
                  showSearch
                  optionFilterProp="children"
                  onChange={handleCompanyChange}
                >
                  {companies.map((company) => (
                    <Option key={company._id} value={company._id}>
                      {company.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="site"
                label="Site"
                rules={[{ required: true, message: "Site is required" }]}
                extra={!selectedCompany ? "Select company first" : ""}
              >
                <Select
                  placeholder={
                    selectedCompany ? "Select site" : "Select company first"
                  }
                  suffixIcon={<EnvironmentOutlined className="text-gray-400" />}
                  size="large"
                  loading={sitesLoading}
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedCompany}
                  onChange={handleSiteChange}
                  allowClear
                >
                  {sites.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name} ({s.siteCode})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="department"
                label="Department"
                extra={!selectedSite ? "Select site first" : ""}
              >
                <Select
                  placeholder={
                    selectedSite ? "Select department" : "Select site first"
                  }
                  suffixIcon={<ClusterOutlined className="text-gray-400" />}
                  size="large"
                  loading={departmentsLoading}
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedSite}
                  onChange={handleDepartmentChange}
                  allowClear
                >
                  {departments.map((d) => (
                    <Option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="designation"
                label="Designation"
                extra={!selectedDepartment ? "Select department first" : ""}
              >
                <Select
                  placeholder={
                    selectedDepartment
                      ? "Select designation"
                      : "Select department first"
                  }
                  suffixIcon={<IdcardOutlined className="text-gray-400" />}
                  size="large"
                  loading={designationsLoading}
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedDepartment}
                  allowClear
                >
                  {designations.map((d) => (
                    <Option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="grade" label="Grade">
                <Select
                  placeholder="Select grade"
                  suffixIcon={<StarOutlined className="text-gray-400" />}
                  size="large"
                  loading={gradesLoading}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  {grades.map((g) => (
                    <Option key={g._id} value={g._id}>
                      {g.name} ({g.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="skills" label="Skills">
                <Select
                  mode="multiple"
                  placeholder="Select skills"
                  suffixIcon={<ToolOutlined className="text-gray-400" />}
                  size="large"
                  loading={skillsLoading}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  {skills.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name} ({s.category})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} className="mt-4! mb-3!">
            Banking Details
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="bankName" label="Bank Name">
                <Input placeholder="Bank Name" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="accountNumber" label="Account Number">
                <Input placeholder="Account Number" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="ifscCode" label="IFSC Code">
                <Input placeholder="IFSC Code" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} className="mt-4! mb-3!">
            Statutory & Legal
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item
                name="pan"
                label="PAN Number"
                rules={[
                  {
                    pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    message: "Invalid PAN format",
                  },
                ]}
              >
                <Input placeholder="ABCDE1234F" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="aadhar"
                label="Aadhar Number"
                rules={[
                  {
                    pattern: /^\d{12}$/,
                    message: "Aadhar must be exactly 12 digits",
                  },
                ]}
              >
                <Input placeholder="123456789012" size="large" maxLength={12} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="uan" label="UAN Number">
                <Input placeholder="UAN" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="esiCode" label="ESI Code">
                <Input placeholder="ESI Code" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="pfNumber" label="PF Number">
                <Input placeholder="PF Number" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="pfApplicable"
                label="PF Applicable"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="esiApplicable"
                label="ESI Applicable"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} className="mt-4! mb-3!">
            Documents
          </Typography.Title>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Aadhar Card Photo"
                extra="Supports images and PDFs. Max 10MB."
              >
                <div className="w-full">
                  <Dragger
                    name="file"
                    multiple={false}
                    beforeUpload={handleUpload}
                    showUploadList={false}
                    disabled={imageUploading}
                    accept="image/*,.pdf"
                    style={{
                      padding: "20px",
                      background: "#fbfbfb",
                      borderColor: "#d9d9d9",
                    }}
                  >
                    {aadharCardPhotoUrl ? (
                      <div className="relative w-full h-[300px] flex flex-col items-center justify-center">
                        {aadharCardPhotoUrl.toLowerCase().endsWith(".pdf") ? (
                          <div className="flex flex-col items-center">
                            <IdcardOutlined
                              style={{ fontSize: "48px", color: "#1890ff" }}
                            />
                            <p className="mt-2 text-gray-600 font-medium">
                              PDF Document Uploaded
                            </p>
                            <a
                              href={aadharCardPhotoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-blue-500 hover:underline z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Preview PDF
                            </a>
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            <Image
                              src={aadharCardPhotoUrl}
                              alt="Aadhar Card Preview"
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                        )}
                        <p className="ant-upload-text mt-4 text-gray-500">
                          {imageUploading
                            ? "Uploading..."
                            : "Click or drag to replace"}
                        </p>
                      </div>
                    ) : (
                      <div className="py-8">
                        <p className="ant-upload-drag-icon">
                          {imageUploading ? (
                            <LoadingOutlined />
                          ) : (
                            <InboxOutlined />
                          )}
                        </p>
                        <p className="ant-upload-text">
                          {imageUploading
                            ? "Uploading..."
                            : "Click or drag file to this area to upload"}
                        </p>
                        <p className="ant-upload-hint">
                          Support for a single image or PDF upload.
                        </p>
                      </div>
                    )}
                  </Dragger>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Permissions" className="mb-4">
            <div className="flex flex-wrap gap-6 p-4 bg-gray-50 rounded-lg">
              <Form.Item
                name={["permissions", "view"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>
                  <span className="ml-1">View</span>
                </Checkbox>
              </Form.Item>
              <Form.Item
                name={["permissions", "edit"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>
                  <span className="ml-1">Edit</span>
                </Checkbox>
              </Form.Item>
              <Form.Item
                name={["permissions", "delete"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>
                  <span className="ml-1">Delete</span>
                </Checkbox>
              </Form.Item>
              <Form.Item
                name={["permissions", "create"]}
                valuePropName="checked"
                noStyle
              >
                <Checkbox>
                  <span className="ml-1">Create</span>
                </Checkbox>
              </Form.Item>
            </div>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              type="primary"
              htmlType="submit"
              className="simple-button"
              size="large"
              style={{ borderRadius: "8px" }}
              loading={loading}
            >
              Create User
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
}
