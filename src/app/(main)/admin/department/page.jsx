"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import useDeleteQuery from "@/hooks/deleteQuery.hook";
import EnhancedTable from "@/components/Table/EnhancedTable";

import { usePermissions } from "@/hooks/usePermissions";
import { useEffect, useState, useCallback } from "react";
import {
  Tabs,
  Modal,
  Tag,
  Form,
  Input,
  Button,
  InputNumber,
  Select,
  Typography,
  Row,
  Col,
  Switch,
} from "antd";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

const { Option } = Select;

const DepartmentMastersPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canView, canEdit, canDelete, canCreate } = usePermissions();

  const [activeTab, setActiveTab] = useState("departments");

  // Common state
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { postQuery, loading: createLoading } = usePostQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  // Data states
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [grades, setGrades] = useState([]);
  const [skills, setSkills] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);

  // Dropdown options
  const [companyOptions, setCompanyOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedDepartmentForForm, setSelectedDepartmentForForm] = useState(null);
  const [selectedDesignationForForm, setSelectedDesignationForForm] = useState(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();

  // Fetch companies
  const fetchCompanies = useCallback(() => {
    getQuery({
      url: "/api/v1/admin/companies?active=true&limit=100",
      onSuccess: (res) => setCompanyOptions(res.companies || []),
      onFail: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch sites based on company
  const fetchSites = useCallback(
    (companyId) => {
      if (!companyId) {
        setSiteOptions([]);
        return;
      }
      getQuery({
        url: `/api/v1/admin/sites?company=${companyId}&active=true&limit=100`,
        onSuccess: (res) => setSiteOptions(res.sites || []),
        onFail: () => {},
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Fetch departments for designation/grade/skill dropdown
  const fetchDepartmentOptions = useCallback(() => {
    getQuery({
      url: "/api/v1/admin/departments?active=true&limit=100",
      onSuccess: (res) => setDepartmentOptions(res.departments || []),
      onFail: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch designations for grade/skill dropdown
  const fetchDesignationOptions = useCallback(
    (departmentId) => {
      if (!departmentId) {
        setDesignationOptions([]);
        return;
      }
      getQuery({
        url: `/api/v1/admin/designations?department=${departmentId}&active=true&limit=100`,
        onSuccess: (res) => setDesignationOptions(res.designations || []),
        onFail: () => {},
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Fetch grades for skill dropdown
  const fetchGradeOptions = useCallback(
    (designationId) => {
      if (!designationId) {
        setGradeOptions([]);
        return;
      }
      getQuery({
        url: `/api/v1/admin/grades?designation=${designationId}&active=true&limit=100`,
        onSuccess: (res) => setGradeOptions(res.grades || []),
        onFail: () => {},
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Fetch data based on active tab
  const fetchData = useCallback(() => {
    let url = "";
    let key = "";

    switch (activeTab) {
      case "departments":
        url = `/api/v1/admin/departments?page=${page}&limit=${limit}`;
        key = "departments";
        break;
      case "designations":
        url = `/api/v1/admin/designations?page=${page}&limit=${limit}`;
        key = "designations";
        break;
      case "grades":
        url = `/api/v1/admin/grades?page=${page}&limit=${limit}`;
        key = "grades";
        break;
      case "skills":
        url = `/api/v1/admin/skills?page=${page}&limit=${limit}`;
        key = "skills";
        break;
    }

    getQuery({
      url,
      onSuccess: (response) => {
        const dataList = response?.[key] || [];
        setTotalDocuments(response.pagination?.total || 0);

        switch (activeTab) {
          case "departments":
            setDepartments(dataList);
            break;
          case "designations":
            setDesignations(dataList);
            break;
          case "grades":
            setGrades(dataList);
            break;
          case "skills":
            setSkills(dataList);
            break;
        }
      },
      onFail: (err) => {
        console.log(err);
        toast.error(`Failed to fetch ${activeTab}`);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, limit]);

  useEffect(() => {
    fetchData();
    if (activeTab === "designations" || activeTab === "grades" || activeTab === "skills") {
      fetchDepartmentOptions();
    }
  }, [fetchData, fetchDepartmentOptions, activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (newLimit) => {
    const params = new URLSearchParams(searchParams);
    params.set("limit", newLimit.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle company change in form
  const handleFormCompanyChange = (companyId) => {
    setSelectedCompany(companyId);
    form.setFieldValue("site", undefined);
    setSiteOptions([]);
    if (companyId) {
      fetchSites(companyId);
    }
  };

  // Form cascading handlers for grade/skill tabs
  const handleFormDepartmentChange = (departmentId) => {
    setSelectedDepartmentForForm(departmentId);
    setSelectedDesignationForForm(null);
    form.setFieldValue("designation", undefined);
    form.setFieldValue("grade", undefined);
    setDesignationOptions([]);
    setGradeOptions([]);
    if (departmentId) {
      fetchDesignationOptions(departmentId);
    }
  };

  const handleFormDesignationChange = (designationId) => {
    setSelectedDesignationForForm(designationId);
    form.setFieldValue("grade", undefined);
    setGradeOptions([]);
    if (designationId) {
      fetchGradeOptions(designationId);
    }
  };

  // Add handlers
  const handleAddClick = () => {
    form.resetFields();
    setSelectedCompany(null);
    setSelectedDepartmentForForm(null);
    setSelectedDesignationForForm(null);
    setSiteOptions([]);
    setDesignationOptions([]);
    setGradeOptions([]);
    setAddModalOpen(true);

    if (activeTab === "departments") {
      fetchCompanies();
    }
    if (activeTab === "designations" || activeTab === "grades" || activeTab === "skills") {
      fetchDepartmentOptions();
    }
  };

  const handleAddSubmit = (values) => {
    let url = "";
    switch (activeTab) {
      case "departments":
        url = "/api/v1/admin/departments";
        break;
      case "designations":
        url = "/api/v1/admin/designations";
        break;
      case "grades":
        url = "/api/v1/admin/grades";
        break;
      case "skills":
        url = "/api/v1/admin/skills";
        break;
    }

    postQuery({
      url,
      postData: values,
      onSuccess: () => {
        toast.success(`${activeTab.slice(0, -1)} created successfully`);
        setAddModalOpen(false);
        form.resetFields();
        fetchData();
      },
      onFail: (err) => {
        toast.error(
          err?.message || `Failed to create ${activeTab.slice(0, -1)}`
        );
      },
    });
  };

  // Edit handlers
  const handleEditClick = (row) => {
    setSelectedItem(row);
    setEditModalOpen(true);

    if (activeTab === "departments") {
      fetchCompanies();
      const companyId = row.company?._id || row.company;
      if (companyId) {
        setSelectedCompany(companyId);
        fetchSites(companyId);
      }
      form.setFieldsValue({
        ...row,
        company: companyId,
        site: row.site?._id || row.site,
      });
    } else if (activeTab === "designations") {
      fetchDepartmentOptions();
      form.setFieldsValue({
        ...row,
        department: row.department?._id || row.department,
      });
    } else if (activeTab === "grades") {
      fetchDepartmentOptions();
      const departmentId = row.department?._id || row.department;
      const designationId = row.designation?._id || row.designation;
      setSelectedDepartmentForForm(departmentId);
      setSelectedDesignationForForm(designationId);
      if (departmentId) fetchDesignationOptions(departmentId);
      form.setFieldsValue({
        ...row,
        department: departmentId,
        designation: designationId,
      });
    } else if (activeTab === "skills") {
      fetchDepartmentOptions();
      const departmentId = row.department?._id || row.department;
      const designationId = row.designation?._id || row.designation;
      const gradeId = row.grade?._id || row.grade;
      setSelectedDepartmentForForm(departmentId);
      setSelectedDesignationForForm(designationId);
      if (departmentId) fetchDesignationOptions(departmentId);
      if (designationId) fetchGradeOptions(designationId);
      form.setFieldsValue({
        ...row,
        department: departmentId,
        designation: designationId,
        grade: gradeId,
      });
    }
  };

  const handleEditSubmit = (values) => {
    let url = "";
    switch (activeTab) {
      case "departments":
        url = `/api/v1/admin/departments/${selectedItem._id}`;
        break;
      case "designations":
        url = `/api/v1/admin/designations/${selectedItem._id}`;
        break;
      case "grades":
        url = `/api/v1/admin/grades/${selectedItem._id}`;
        break;
      case "skills":
        url = `/api/v1/admin/skills/${selectedItem._id}`;
        break;
    }

    putQuery({
      url,
      putData: values,
      onSuccess: () => {
        toast.success(`${activeTab.slice(0, -1)} updated successfully`);
        setEditModalOpen(false);
        setSelectedItem(null);
        form.resetFields();
        fetchData();
      },
      onFail: (err) => {
        toast.error(
          err?.message || `Failed to update ${activeTab.slice(0, -1)}`
        );
      },
    });
  };

  // Delete handlers
  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    let url = "";
    switch (activeTab) {
      case "departments":
        url = `/api/v1/admin/departments/${selectedItem._id}`;
        break;
      case "designations":
        url = `/api/v1/admin/designations/${selectedItem._id}`;
        break;
      case "grades":
        url = `/api/v1/admin/grades/${selectedItem._id}`;
        break;
      case "skills":
        url = `/api/v1/admin/skills/${selectedItem._id}`;
        break;
    }

    deleteQuery({
      url,
      onSuccess: () => {
        toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
        setDeleteModalOpen(false);
        setSelectedItem(null);
        fetchData();
      },
      onFail: (err) => {
        toast.error(
          err?.message || `Failed to delete ${activeTab.slice(0, -1)}`
        );
      },
    });
  };

  // Column definitions for each tab
  const departmentColumns = [
    { Header: "Name", accessor: "name", width: 180 },
    { Header: "Code", accessor: "code", width: 100 },
    {
      Header: "Company",
      accessor: "company",
      width: 150,
      Cell: (value) => value?.name || "N/A",
    },
    {
      Header: "Site",
      accessor: "site",
      width: 150,
      Cell: (value) => value?.name || "N/A",
    },
    {
      Header: "Status",
      accessor: "active",
      width: 100,
      Cell: (value) => (
        <Tag color={value ? "green" : "red"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      Header: "Created",
      accessor: "createdAt",
      width: 120,
      Cell: (value) => moment(value).format("DD-MM-YYYY"),
    },
  ];

  const designationColumns = [
    { Header: "Name", accessor: "name", width: 200 },
    { Header: "Code", accessor: "code", width: 120 },
    {
      Header: "Department",
      accessor: "department",
      width: 150,
      Cell: (value) => value?.name || "N/A",
    },
    { Header: "Level", accessor: "level", width: 80 },
    {
      Header: "Status",
      accessor: "active",
      width: 100,
      Cell: (value) => (
        <Tag color={value ? "green" : "red"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  const gradeColumns = [
    { Header: "Name", accessor: "name", width: 200 },
    { Header: "Code", accessor: "code", width: 120 },
    {
      Header: "Department",
      accessor: "department",
      width: 150,
      Cell: (value) => value?.name || "N/A",
    },
    {
      Header: "Designation",
      accessor: "designation",
      width: 150,
      Cell: (value) => value?.name || "N/A",
    },
    {
      Header: "Status",
      accessor: "active",
      width: 100,
      Cell: (value) => (
        <Tag color={value ? "green" : "red"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  const skillColumns = [
    { Header: "Name", accessor: "name", width: 150 },
    { Header: "Skill Code", accessor: "skillCode", width: 120 },
    { Header: "Category", accessor: "category", width: 120 },
    {
      Header: "Department",
      accessor: "department",
      width: 130,
      Cell: (value) => value?.name || "N/A",
    },
    {
      Header: "Designation",
      accessor: "designation",
      width: 130,
      Cell: (value) => value?.name || "N/A",
    },
    {
      Header: "Grade",
      accessor: "grade",
      width: 120,
      Cell: (value) => value?.name || "N/A",
    },
    {
      Header: "Basic (₹)",
      accessor: "basic",
      width: 100,
      Cell: (value) =>
        value != null ? `₹${Number(value).toLocaleString()}` : "—",
    },
    {
      Header: "Status",
      accessor: "active",
      width: 80,
      Cell: (value) => (
        <Tag color={value ? "green" : "red"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  const getColumns = () => {
    switch (activeTab) {
      case "departments":
        return departmentColumns;
      case "designations":
        return designationColumns;
      case "grades":
        return gradeColumns;
      case "skills":
        return skillColumns;
      default:
        return [];
    }
  };

  const getData = () => {
    switch (activeTab) {
      case "departments":
        return departments;
      case "designations":
        return designations;
      case "grades":
        return grades;
      case "skills":
        return skills;
      default:
        return [];
    }
  };

  // Render form fields based on active tab
  const renderFormFields = () => {
    switch (activeTab) {
      case "departments":
        return (
          <>
            <Form.Item
              name="name"
              label="Department Name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input placeholder="e.g., Production" size="large" />
            </Form.Item>
            <Form.Item
              name="code"
              label="Department Code"
              rules={[{ required: true, message: "Please enter code" }]}
            >
              <Input placeholder="e.g., PROD" size="large" />
            </Form.Item>
            <Form.Item
              name="company"
              label="Company"
              rules={[{ required: true, message: "Please select company" }]}
            >
              <Select
                placeholder="Select company"
                size="large"
                showSearch
                optionFilterProp="children"
                onChange={handleFormCompanyChange}
              >
                {companyOptions.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="site"
              label="Site"
              rules={[{ required: true, message: "Please select site" }]}
            >
              <Select
                placeholder={
                  selectedCompany ? "Select site" : "Select company first"
                }
                size="large"
                showSearch
                optionFilterProp="children"
                disabled={!selectedCompany}
              >
                {siteOptions.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name} ({s.siteCode})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={2} placeholder="Description..." />
            </Form.Item>
          </>
        );

      case "designations":
        return (
          <>
            <Form.Item
              name="name"
              label="Designation Name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input placeholder="e.g., Supervisor" size="large" />
            </Form.Item>
            <Form.Item
              name="code"
              label="Designation Code"
              rules={[{ required: true, message: "Please enter code" }]}
            >
              <Input placeholder="e.g., SUP" size="large" />
            </Form.Item>
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select
                placeholder="Select department"
                size="large"
                showSearch
                optionFilterProp="children"
              >
                {departmentOptions.map((d) => (
                  <Option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="level" label="Level">
              <InputNumber
                min={1}
                max={10}
                placeholder="1"
                size="large"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </>
        );

      case "grades":
        return (
          <>
            <Form.Item
              name="name"
              label="Grade Name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input placeholder="e.g., Grade B" size="large" />
            </Form.Item>
            <Form.Item
              name="code"
              label="Grade Code"
              rules={[{ required: true, message: "Please enter code" }]}
            >
              <Input placeholder="e.g., GB" size="large" />
            </Form.Item>
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select
                placeholder="Select department"
                size="large"
                showSearch
                optionFilterProp="children"
                onChange={handleFormDepartmentChange}
              >
                {departmentOptions.map((d) => (
                  <Option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="designation"
              label="Designation"
              rules={[{ required: true, message: "Please select designation" }]}
            >
              <Select
                placeholder={selectedDepartmentForForm ? "Select designation" : "Select department first"}
                size="large"
                showSearch
                optionFilterProp="children"
                disabled={!selectedDepartmentForForm}
              >
                {designationOptions.map((d) => (
                  <Option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </>
        );

      case "skills":
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Skill Name"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input placeholder="e.g., Welding" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="skillCode"
                  label="Skill Code"
                  rules={[{ required: true, message: "Please enter skill code" }]}
                >
                  <Input placeholder="e.g., WLD" size="large" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="category" label="Category">
              <Input placeholder="e.g., Technical" size="large" />
            </Form.Item>
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select
                placeholder="Select department"
                size="large"
                showSearch
                optionFilterProp="children"
                onChange={handleFormDepartmentChange}
              >
                {departmentOptions.map((d) => (
                  <Option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="designation"
              label="Designation"
              rules={[{ required: true, message: "Please select designation" }]}
            >
              <Select
                placeholder={selectedDepartmentForForm ? "Select designation" : "Select department first"}
                size="large"
                showSearch
                optionFilterProp="children"
                disabled={!selectedDepartmentForForm}
                onChange={handleFormDesignationChange}
              >
                {designationOptions.map((d) => (
                  <Option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="grade"
              label="Grade"
              rules={[{ required: true, message: "Please select grade" }]}
            >
              <Select
                placeholder={selectedDesignationForForm ? "Select grade" : "Select designation first"}
                size="large"
                showSearch
                optionFilterProp="children"
                disabled={!selectedDesignationForForm}
              >
                {gradeOptions.map((g) => (
                  <Option key={g._id} value={g._id}>
                    {g.name} ({g.code})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="basic" label="Basic (₹)" initialValue={0}>
                  <InputNumber
                    min={0}
                    placeholder="0"
                    size="large"
                    style={{ width: "100%" }}
                    prefix="₹"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="active"
                  label="Active"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      default:
        return null;
    }
  };

  const tabItems = [
    { key: "departments", label: "Departments" },
    { key: "designations", label: "Designations" },
    { key: "grades", label: "Grades" },
    { key: "skills", label: "Skills" },
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case "departments":
        return "Department";
      case "designations":
        return "Designation";
      case "grades":
        return "Grade";
      case "skills":
        return "Skill";
      default:
        return "";
    }
  };

  return (
    <>
      <Title
        title="Department & Masters"
        showButton={canCreate()}
        buttonText={`Add ${getTabTitle()}`}
        onButtonClick={handleAddClick}
      />

      <div className="pt-4">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
        />

        {fetchLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <EnhancedTable
            columns={getColumns()}
            data={getData()}
            showActions={true}
            // onView={canView() ? (row) => `#` : undefined}
            onEdit={canEdit() ? handleEditClick : undefined}
            onDelete={canDelete() ? handleDeleteClick : undefined}
            entryText={`Total: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        )}
      </div>

      {/* Add Modal */}
      <Modal
        title={`Add ${getTabTitle()}`}
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleAddSubmit}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setAddModalOpen(false)}
              className="red-button"
              style={{ borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="simple-button"
              style={{ borderRadius: "8px" }}
              loading={createLoading}
            >
              Create
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit ${getTabTitle()}`}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          {renderFormFields()}
          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setEditModalOpen(false)}
              className="red-button"
              style={{ borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="simple-button"
              style={{ borderRadius: "8px" }}
              loading={updateLoading}
            >
              Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title={`Delete ${getTabTitle()}`}
        open={deleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        confirmLoading={deleteLoading}
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
          className: "red-button",
          style: { borderRadius: "8px" },
        }}
        cancelButtonProps={{
          className: "white-button",
          style: { borderRadius: "8px" },
        }}
        okText="Delete"
      >
        <p className="text-red-600 font-semibold mb-2">
          ⚠️ Warning: This action cannot be undone!
        </p>
        <p>
          Are you sure you want to <strong>delete</strong> `{selectedItem?.name}
          `?
        </p>
      </Modal>
    </>
  );
};

export default DepartmentMastersPage;
