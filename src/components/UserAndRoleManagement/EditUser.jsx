"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

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
} from "@ant-design/icons";
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
} from "antd";

const { Option } = Select;

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
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    getCompanies({
      url: "/api/v1/admin/companies?active=true&limit=100",
      onSuccess: (res) => setCompanies(res.companies || []),
      onFail: (err) => console.error("Failed to fetch companies", err),
    });
  }, []);

  useEffect(() => {
    getDepartments({
      url: "/api/v1/admin/departments?active=true&limit=100",
      onSuccess: (res) => setDepartments(res.departments || []),
      onFail: (err) => console.error("Failed to fetch departments", err),
    });
  }, []);

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
    [getSites]
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
    [getDesignations]
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
          setSelectedDepartment(departmentId);

          form.setFieldsValue({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            pan: userData.pan,
            company: companyId || undefined,
            site: siteId || undefined,
            department: departmentId || undefined,
            designation: designationId || undefined,
            grade: gradeId || undefined,
            skills: skillIds,
            aadhar: userData.aadhar,
            address: userData.address,
            esiCode: userData.esiCode,
            uan: userData.uan,
            pfNumber: userData.pfNumber,
            pfPercentage: userData.pfPercentage ?? undefined,
            esiPercentage: userData.esiPercentage ?? undefined,
            active: userData.active,
            permissions: {
              view: userData.permissions?.view || false,
              edit: userData.permissions?.edit || false,
              delete: userData.permissions?.delete || false,
              create: userData.permissions?.create || false,
            },
          });

          if (companyId) fetchSites(companyId);
          if (departmentId) fetchDesignations(departmentId);
        }
      },
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch user details");
      },
    });
  }, [id, getQuery, form, fetchSites, fetchDesignations]);

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const handleCompanyChange = (companyId) => {
    form.setFieldValue("site", undefined);
    setSites([]);
    if (companyId) {
      setHasCompany(true);
      fetchSites(companyId);
    } else {
      setHasCompany(false);
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

  const handleSubmit = (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      role: values.role,
      company: values.company || null,
      site: values.site || null,
      department: values.department || null,
      designation: values.designation || null,
      grade: values.grade || null,
      skills: values.skills || [],
      pan: values.pan,
      aadhar: values.aadhar,
      address: values.address,
      esiCode: values.esiCode,
      uan: values.uan,
      pfNumber: values.pfNumber,
      pfPercentage: values.pfPercentage ?? null,
      esiPercentage: values.esiPercentage ?? null,
      active: values.active,
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
          <Row gutter={16}>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
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
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
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
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
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
            <Col xs={24} md={6}>
              <Form.Item name="active" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
              <Form.Item name="department" label="Department">
                <Select
                  placeholder="Select department"
                  suffixIcon={<ClusterOutlined className="text-gray-400" />}
                  size="large"
                  loading={departmentsLoading}
                  showSearch
                  optionFilterProp="children"
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
                  const hra = Number(s.houseRentAllowance) || 0;
                  const other = Number(s.otherAllowance) || 0;
                  const leave = Number(s.leaveEarnings) || 0;
                  const bonus = Number(s.bonusEarnings) || 0;
                  const arrear = Number(s.arrear) || 0;
                  const hasAny =
                    basic || hra || other || leave || bonus || arrear;
                  const fmt = (n) => `₹${Number(n).toLocaleString()}`;
                  return (
                    <div key={s._id || idx} className="mb-3 last:mb-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">
                          {s.name || `Skill ${idx + 1}`}
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
                      {!hasAny ? (
                        <span className="text-gray-500 text-sm">
                          No salary configured
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-700 text-sm">
                          {basic > 0 && <span>Basic: {fmt(basic)}</span>}
                          {hra > 0 && <span>HRA: {fmt(hra)}</span>}
                          {other > 0 && <span>Other: {fmt(other)}</span>}
                          {leave > 0 && <span>Leave: {fmt(leave)}</span>}
                          {bonus > 0 && <span>Bonus: {fmt(bonus)}</span>}
                          {arrear > 0 && <span>Arrear: {fmt(arrear)}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

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

          <Typography.Title level={5} className="mt-6! mb-4!">
            Additional Information
          </Typography.Title>

          <Row gutter={16}>
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
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
            <Col xs={24} md={8}>
              <Form.Item name="address" label="Address">
                <Input placeholder="Enter address" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="esiCode" label="ESI Code">
                <Input placeholder="ESI Code" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="uan" label="UAN">
                <Input placeholder="UAN Number" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="pfNumber" label="PF Number">
                <Input placeholder="PF Number" size="large" />
              </Form.Item>
            </Col>
          </Row>

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
