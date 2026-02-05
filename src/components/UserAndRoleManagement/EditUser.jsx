"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";
import moment from "moment";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

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
  DollarOutlined,
  InboxOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import {
  Form,
  Input,
  InputNumber,
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

const { Option } = Select;
const { Dragger } = Upload;

export default function EditUser({ basePath = "/admin" }) {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { patchQuery, loading: updateLoading } = usePatchQuery();
  const { getQuery: getCompanies, loading: companiesLoading } = useGetQuery();
  const { getQuery: getSites, loading: sitesLoading } = useGetQuery();
  const { getQuery: getDepartments, loading: departmentsLoading } =
    useGetQuery();
  const { getQuery: getDesignations, loading: designationsLoading } =
    useGetQuery();
  const { getQuery: getGrades, loading: gradesLoading } = useGetQuery();
  const { getQuery: getSkills, loading: skillsLoading } = useGetQuery();

  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [grades, setGrades] = useState([]);
  const [skills, setSkills] = useState([]);
  const [hasCompany, setHasCompany] = useState(false);
  const [hasSite, setHasSite] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);

  // Upload State
  const [imageUploading, setImageUploading] = useState(false);
  const [aadharCardPhotoUrl, setAadharCardPhotoUrl] = useState("");

  useEffect(() => {
    getCompanies({
      url: "/api/v1/admin/companies?active=true&limit=100",
      onSuccess: (res) => setCompanies(res.companies || []),
      onFail: (err) => console.error("Failed to fetch companies", err),
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

  const fetchGrades = useCallback(
    (designationId) => {
      if (!designationId) {
        setGrades([]);
        return;
      }
      getGrades({
        url: `/api/v1/admin/grades?designation=${designationId}&active=true&limit=100`,
        onSuccess: (res) => setGrades(res.grades || []),
        onFail: (err) => console.error("Failed to fetch grades", err),
      });
    },
    [getGrades],
  );

  const fetchSkills = useCallback(
    (gradeId) => {
      if (!gradeId) {
        setSkills([]);
        return;
      }
      getSkills({
        url: `/api/v1/admin/skills?grade=${gradeId}&active=true&limit=100`,
        onSuccess: (res) => setSkills(res.skills || []),
        onFail: (err) => console.error("Failed to fetch skills", err),
      });
    },
    [getSkills],
  );

  const fetchUser = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/users/${id}`,
      onSuccess: (response) => {
        const userData = response?.user || null;
        setUser(userData);
        if (userData) {
          const companyId = userData.company?._id || userData.company;
          const siteId = userData.site?._id || userData.site;
          const departmentId = userData.department?._id || userData.department;
          const designationId =
            userData.designation?._id || userData.designation;
          const gradeId = userData.grade?._id || userData.grade;
          const skillIds = userData.skills?.map((s) => s._id || s) || [];

          setHasCompany(!!companyId);
          setHasSite(!!siteId);
          setSelectedDepartment(departmentId);
          setSelectedDesignation(designationId);
          setSelectedGrade(gradeId);

          // Initialize aadhar photo from existing data
          if (userData.aadharCardPhoto) {
            setAadharCardPhotoUrl(userData.aadharCardPhoto);
          }

          form.setFieldsValue({
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            role: userData.role,
            active: userData.active,
            // Professional Details
            employeeCode: userData.employeeCode,
            doj: userData.doj ? moment(userData.doj) : undefined,
            contractEndDate: userData.contractEndDate
              ? moment(userData.contractEndDate)
              : undefined,
            category: userData.category,
            wageType: userData.wageType,
            // Personal Details
            fatherName: userData.fatherName,
            gender: userData.gender,
            dob: userData.dob ? moment(userData.dob) : undefined,
            address: userData.address,
            // Organization
            company: companyId || undefined,
            site: siteId || undefined,
            department: departmentId || undefined,
            designation: designationId || undefined,
            grade: gradeId || undefined,
            skills: skillIds,
            // Banking
            bankName: userData.bankName,
            accountNumber: userData.accountNumber,
            ifscCode: userData.ifscCode,
            // Statutory
            pan: userData.pan,
            aadhar: userData.aadhar,
            uan: userData.uan,
            esiCode: userData.esiCode,
            pfNumber: userData.pfNumber,
            pfApplicable: userData.pfApplicable || false,
            esiApplicable: userData.esiApplicable || false,
            pfPercentage: userData.pfPercentage ?? undefined,
            esiPercentage: userData.esiPercentage ?? undefined,
            // Permissions
            permissions: {
              view: userData.permissions?.view || false,
              edit: userData.permissions?.edit || false,
              delete: userData.permissions?.delete || false,
              create: userData.permissions?.create || false,
            },
          });

          if (companyId) fetchSites(companyId);
          if (siteId) fetchDepartments(siteId);
          if (departmentId) fetchDesignations(departmentId);
          if (designationId) fetchGrades(designationId);
          if (gradeId) fetchSkills(gradeId);
        }
      },
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch user details");
      },
    });
  }, [id, getQuery, form, fetchSites, fetchDepartments, fetchDesignations, fetchGrades, fetchSkills]);

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const handleCompanyChange = (companyId) => {
    form.setFieldValue("site", undefined);
    form.setFieldValue("department", undefined);
    form.setFieldValue("designation", undefined);
    form.setFieldValue("grade", undefined);
    form.setFieldValue("skills", []);
    setSites([]);
    setDepartments([]);
    setDesignations([]);
    setGrades([]);
    setSkills([]);
    setHasSite(false);
    setSelectedDepartment(null);
    setSelectedDesignation(null);
    setSelectedGrade(null);
    if (companyId) {
      setHasCompany(true);
      fetchSites(companyId);
    } else {
      setHasCompany(false);
    }
  };

  const handleSiteChange = (siteId) => {
    form.setFieldValue("department", undefined);
    form.setFieldValue("designation", undefined);
    form.setFieldValue("grade", undefined);
    form.setFieldValue("skills", []);
    setDepartments([]);
    setDesignations([]);
    setGrades([]);
    setSkills([]);
    setSelectedDepartment(null);
    setSelectedDesignation(null);
    setSelectedGrade(null);
    if (siteId) {
      setHasSite(true);
      fetchDepartments(siteId);
    } else {
      setHasSite(false);
    }
  };

  const handleDepartmentChange = (departmentId) => {
    form.setFieldValue("designation", undefined);
    form.setFieldValue("grade", undefined);
    form.setFieldValue("skills", []);
    setDesignations([]);
    setGrades([]);
    setSkills([]);
    setSelectedDepartment(departmentId);
    setSelectedDesignation(null);
    setSelectedGrade(null);
    if (departmentId) {
      fetchDesignations(departmentId);
    }
  };

  const handleDesignationChange = (designationId) => {
    form.setFieldValue("grade", undefined);
    form.setFieldValue("skills", []);
    setGrades([]);
    setSkills([]);
    setSelectedDesignation(designationId);
    setSelectedGrade(null);
    if (designationId) {
      fetchGrades(designationId);
    }
  };

  const handleGradeChange = (gradeId) => {
    form.setFieldValue("skills", []);
    setSkills([]);
    setSelectedGrade(gradeId);
    if (gradeId) {
      fetchSkills(gradeId);
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
    return false;
  };

  const handleSubmit = (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      mobile: values.mobile,
      role: values.role,
      active: values.active,
      // Professional Details
      employeeCode: values.employeeCode,
      doj: values.doj ? values.doj.toISOString() : null,
      contractEndDate: values.contractEndDate
        ? values.contractEndDate.toISOString()
        : null,
      category: values.category,
      wageType: values.wageType,
      // Personal Details
      fatherName: values.fatherName,
      gender: values.gender,
      dob: values.dob ? values.dob.toISOString() : null,
      address: values.address,
      // Organization
      company: values.company || null,
      site: values.site || null,
      department: values.department || null,
      designation: values.designation || null,
      grade: values.grade || null,
      skills: values.skills || [],
      // Banking
      bankName: values.bankName,
      accountNumber: values.accountNumber,
      ifscCode: values.ifscCode,
      // Statutory
      pan: values.pan,
      aadhar: values.aadhar,
      uan: values.uan,
      esiCode: values.esiCode,
      pfNumber: values.pfNumber,
      pfApplicable: values.pfApplicable || false,
      esiApplicable: values.esiApplicable || false,
      pfPercentage: values.pfPercentage ?? null,
      esiPercentage: values.esiPercentage ?? null,
      // Documents
      aadharCardPhoto: aadharCardPhotoUrl,
      // Permissions
      permissions: {
        view: values.permissions?.view || false,
        edit: values.permissions?.edit || false,
        delete: values.permissions?.delete || false,
        create: values.permissions?.create || false,
      },
    };

    if (values.password) {
      payload.password = values.password;
    }

    patchQuery({
      url: `/api/v1/admin/users/${id}`,
      patchData: payload,
      onSuccess: () => {
        toast.success("User updated successfully");
        router.push(`${basePath}/user-and-role-management`);
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to update user");
      },
    });
  };

  if (fetchLoading) {
    return (
      <>
        <BackHeader
          label="Back"
          href={`${basePath}/user-and-role-management`}
        />
        <Title title="Edit User" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <BackHeader
          label="Back"
          href={`${basePath}/user-and-role-management`}
        />
        <Title title="Edit User" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">User not found</p>
        </div>
      </>
    );
  }

  if (user.softDelete) {
    return (
      <>
        <BackHeader
          label="Back"
          href={`${basePath}/user-and-role-management`}
        />
        <Title title="Edit User" />
        <Card className="shadow-md" style={{ marginTop: "20px" }}>
          <div className="py-8 px-4 text-center">
            <p className="text-gray-600 text-lg">User has been deleted.</p>
            <p className="text-gray-500 mt-2">
              Deleted users cannot be edited.
            </p>
          </div>
        </Card>
      </>
    );
  }

  const originalCompanyId = user?.company?._id || user?.company;
  const isCompanyLocked = !!originalCompanyId;

  return (
    <>
      <BackHeader label="Back" href={`${basePath}/user-and-role-management`} />
      <Title title="Edit User" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
                extra="Leave blank to keep current password"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter new password (optional)"
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
                <Select placeholder="Select role" size="large" disabled>
                  <Option value="hr">HR</Option>
                  <Option value="employee">Employee</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="active" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
                extra={isCompanyLocked ? "Cannot change once assigned" : ""}
              >
                <Select
                  placeholder="Select company"
                  suffixIcon={<BankOutlined className="text-gray-400" />}
                  size="large"
                  loading={companiesLoading}
                  showSearch
                  optionFilterProp="children"
                  disabled={isCompanyLocked}
                  onChange={handleCompanyChange}
                  allowClear={!isCompanyLocked}
                >
                  {companies.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {c.name}
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
                extra={!hasCompany ? "Select company first" : ""}
              >
                <Select
                  placeholder={
                    hasCompany ? "Select site" : "Select company first"
                  }
                  suffixIcon={<EnvironmentOutlined className="text-gray-400" />}
                  size="large"
                  loading={sitesLoading}
                  showSearch
                  optionFilterProp="children"
                  disabled={!hasCompany}
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
                extra={!hasSite ? "Select site first" : ""}
              >
                <Select
                  placeholder={
                    hasSite ? "Select department" : "Select site first"
                  }
                  suffixIcon={<ClusterOutlined className="text-gray-400" />}
                  size="large"
                  loading={departmentsLoading}
                  showSearch
                  optionFilterProp="children"
                  disabled={!hasSite}
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
                  onChange={handleDesignationChange}
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
              <Form.Item
                name="grade"
                label="Grade"
                extra={!selectedDesignation ? "Select designation first" : ""}
              >
                <Select
                  placeholder={
                    selectedDesignation
                      ? "Select grade"
                      : "Select designation first"
                  }
                  suffixIcon={<StarOutlined className="text-gray-400" />}
                  size="large"
                  loading={gradesLoading}
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedDesignation}
                  onChange={handleGradeChange}
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
              <Form.Item
                name="skills"
                label="Skills"
                extra={!selectedGrade ? "Select grade first" : ""}
              >
                <Select
                  mode="multiple"
                  placeholder={
                    selectedGrade ? "Select skills" : "Select grade first"
                  }
                  suffixIcon={<ToolOutlined className="text-gray-400" />}
                  size="large"
                  loading={skillsLoading}
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedGrade}
                  allowClear
                >
                  {skills.map((s) => (
                    <Option key={s._id} value={s._id}>
                      {s.name} ({s.skillCode})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {user?.skills?.length > 0 && (
            <>
              <Typography.Title level={5} className="mt-4! mb-3!">
                <span className="flex items-center gap-2">
                  <DollarOutlined /> Salary (from assigned skills)
                </span>
              </Typography.Title>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm mb-3">
                  Salary amounts are stored on the assigned Skill. To change
                  amounts, edit the skill below.
                </p>
                {user.skills.map((skill, idx) => {
                  const s = skill && typeof skill === "object" ? skill : {};
                  const basic = Number(s.basic) || 0;
                  const fmt = (n) => `₹${Number(n).toLocaleString()}`;
                  return (
                    <div key={s._id || idx} className="mb-3 last:mb-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">
                          {s.name || `Skill ${idx + 1}`}
                          {s.skillCode ? ` (${s.skillCode})` : ""}
                        </span>
                        <Button
                          type="link"
                          size="small"
                          className="p-0 h-auto"
                          onClick={() =>
                            router.push(`${basePath}/skills/edit/${s._id}`)
                          }
                        >
                          Edit skill salary
                        </Button>
                      </div>
                      {!basic ? (
                        <span className="text-gray-500 text-sm">
                          No salary configured
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-700 text-sm">
                          <span>Basic: {fmt(basic)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

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
                    message: "Invalid PAN format (e.g., ABCDE1234F)",
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
            <span className="flex items-center gap-2">
              <DollarOutlined /> Salary Deduction Rates (per-user override)
            </span>
          </Typography.Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="pfPercentage"
                label="PF Percentage (%)"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    max: 100,
                    message: "Must be between 0 and 100",
                  },
                ]}
                extra="Leave empty to use salary component default. Applied to basic."
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.01}
                  controls={false}
                  style={{ width: "100%" }}
                  placeholder="Empty = salary component default"
                  size="large"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="esiPercentage"
                label="ESI Percentage (%)"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    max: 100,
                    message: "Must be between 0 and 100",
                  },
                ]}
                extra="Leave empty to use salary component default. Applied when gross < Rs. 21,000."
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.01}
                  controls={false}
                  style={{ width: "100%" }}
                  placeholder="Empty = salary component default"
                  size="large"
                  addonAfter="%"
                />
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
              loading={updateLoading}
            >
              Update User
            </Button>
          </div>
        </Form>
      </Card>
    </>
  );
}
