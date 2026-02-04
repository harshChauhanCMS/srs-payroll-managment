"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Switch,
} from "antd";
import { PlusOutlined, EditOutlined, SettingOutlined } from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import useGetQuery from "@/hooks/getQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";
import Title from "@/components/Title/Title";

export default function TemplateManager() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/hr") ? "/hr" : "/admin";

  const { getQuery, loading } = useGetQuery();
  const { postQuery, loading: creating } = usePostQuery();
  const { patchQuery, loading: updating } = usePatchQuery();

  const [templates, setTemplates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form] = Form.useForm();
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    fetchTemplates();
    fetchCompanies();
  }, []);

  const fetchTemplates = useCallback(() => {
    getQuery({
      url: "/api/v1/admin/salary-sheet-templates",
      onSuccess: (res) => {
        setTemplates(res.templates || []);
      },
      onFail: () => toast.error("Failed to fetch templates"),
    });
  }, [getQuery]);

  const fetchCompanies = useCallback(() => {
    getQuery({
      url: "/api/v1/admin/companies?active=true",
      onSuccess: (res) => {
        setCompanies(res.companies || []);
      },
    });
  }, [getQuery]);

  const fetchSites = useCallback(
    (companyId) => {
      if (!companyId) {
        setSites([]);
        return;
      }
      getQuery({
        url: `/api/v1/admin/sites?company=${companyId}&active=true`,
        onSuccess: (res) => {
          setSites(res.sites || []);
        },
      });
    },
    [getQuery]
  );

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setSelectedCompany(null);
    setSites([]);
    setModalVisible(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      templateName: template.templateName,
      company: template.company?._id,
      site: template.site?._id || null,
      outputFilenamePattern: template.outputFilenamePattern,
      sheetName: template.sheetName,
      active: template.active,
    });
    setSelectedCompany(template.company?._id);
    if (template.company?._id) {
      fetchSites(template.company._id);
    }
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingTemplate) {
        // Update
        patchQuery({
          url: `/api/v1/admin/salary-sheet-templates/${editingTemplate._id}`,
          patchData: values,
          onSuccess: () => {
            toast.success("Template updated successfully");
            setModalVisible(false);
            fetchTemplates();
          },
          onFail: (err) => {
            toast.error(
              err?.response?.data?.message || "Failed to update template"
            );
          },
        });
      } else {
        // Create
        postQuery({
          url: "/api/v1/admin/salary-sheet-templates",
          postData: values,
          onSuccess: () => {
            toast.success("Template created successfully");
            setModalVisible(false);
            fetchTemplates();
          },
          onFail: (err) => {
            toast.error(
              err?.response?.data?.message || "Failed to create template"
            );
          },
        });
      }
    } catch (err) {
      console.error("Form validation error:", err);
    }
  };

  const handleCompanyChange = (companyId) => {
    setSelectedCompany(companyId);
    form.setFieldsValue({ site: null });
    if (companyId) {
      fetchSites(companyId);
    } else {
      setSites([]);
    }
  };

  const columns = [
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
      width: 200,
    },
    {
      title: "Client",
      dataIndex: ["company", "name"],
      key: "company",
      width: 150,
    },
    {
      title: "Site",
      key: "site",
      width: 150,
      render: (_, record) => record.site?.name || "All Sites",
    },
    {
      title: "Filename Pattern",
      dataIndex: "outputFilenamePattern",
      key: "outputFilenamePattern",
      width: 250,
    },
    {
      title: "Sheet Name",
      dataIndex: "sheetName",
      key: "sheetName",
      width: 150,
    },
    {
      title: "Status",
      key: "active",
      width: 100,
      render: (_, record) => (
        <Tag color={record.active ? "green" : "red"}>
          {record.active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditTemplate(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            icon={<SettingOutlined />}
            type="primary"
            onClick={() =>
              router.push(
                `${basePath}/salary-sheet-templates/${record._id}/columns`
              )
            }
          >
            Map Columns
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title
        title="Salary Sheet Templates"
        buttonText="Add Template"
        buttonIcon={<PlusOutlined />}
        destination="#"
        onClick={handleAddTemplate}
      />

      <Card>
        <Table
          dataSource={templates}
          columns={columns}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editingTemplate ? "Edit Template" : "Add Template"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={creating || updating}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Template Name"
            name="templateName"
            rules={[{ required: true, message: "Please enter template name" }]}
          >
            <Input placeholder="e.g., JBM Salary Sheet" />
          </Form.Item>

          <Form.Item
            label="Client"
            name="company"
            rules={[{ required: true, message: "Please select client" }]}
          >
            <Select
              placeholder="Select Client"
              onChange={handleCompanyChange}
              showSearch
              optionFilterProp="children"
            >
              {companies.map((c) => (
                <Select.Option key={c._id} value={c._id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Site" name="site">
            <Select
              placeholder="All Sites"
              allowClear
              showSearch
              optionFilterProp="children"
              disabled={!selectedCompany}
            >
              {sites.map((s) => (
                <Select.Option key={s._id} value={s._id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Output Filename Pattern"
            name="outputFilenamePattern"
            rules={[
              { required: true, message: "Please enter filename pattern" },
            ]}
            help="Use {MMM} for month, {YYYY} for year, {MM} for month number, {SITE} for site code"
          >
            <Input placeholder="e.g., JBM_1_SALARY_{MMM}_{YYYY}.xlsx" />
          </Form.Item>

          <Form.Item
            label="Sheet Name"
            name="sheetName"
            rules={[{ required: true, message: "Please enter sheet name" }]}
          >
            <Input placeholder="e.g., Salary Sheet" />
          </Form.Item>

          <Form.Item
            label="Active"
            name="active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
