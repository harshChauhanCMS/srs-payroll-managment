"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useGetQuery from "@/hooks/getQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

const DATA_TYPES = ["TEXT", "NUMBER"];
const SOURCE_TYPES = [
  "EMPLOYEE",
  "PAYROLL_COMPONENT",
  "PAYROLL_SUMMARY",
  "FORMULA",
];
const ROUND_TO_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "NEAREST_1", label: "Nearest 1" },
  { value: "NEAREST_10", label: "Nearest 10" },
];

export default function ColumnMapping() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const basePath = "/admin";

  const { getQuery, loading } = useGetQuery();
  const { postQuery, loading: saving } = usePostQuery();

  const [template, setTemplate] = useState(null);
  const [columns, setColumns] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form] = Form.useForm();

  const fetchTemplate = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/salary-sheet-templates/${id}`,
      onSuccess: (res) => {
        setTemplate(res.template);
      },
      onFail: () => toast.error("Failed to fetch template"),
    });
  }, [id, getQuery]);

  const fetchColumns = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/salary-sheet-templates/${id}/columns`,
      onSuccess: (res) => {
        setColumns(res.columns || []);
      },
      onFail: () => toast.error("Failed to fetch column mappings"),
    });
  }, [id, getQuery]);

  useEffect(() => {
    fetchTemplate();
    fetchColumns();
  }, []);

  const handleAddColumn = () => {
    setEditingColumn(null);
    setEditingIndex(null);
    form.resetFields();
    form.setFieldsValue({
      order: columns.length + 1,
      dataType: "TEXT",
      roundTo: "NONE",
    });
    setModalVisible(true);
  };

  const handleEditColumn = (column, index) => {
    setEditingColumn(column);
    setEditingIndex(index);
    form.setFieldsValue(column);
    setModalVisible(true);
  };

  const handleDeleteColumn = (index) => {
    const newColumns = columns.filter((_, idx) => idx !== index);
    setColumns(newColumns);
    toast.success("Column removed. Click 'Save Mapping' to persist changes.");
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingIndex !== null) {
        // Edit existing
        const newColumns = [...columns];
        newColumns[editingIndex] = values;
        setColumns(newColumns);
      } else {
        // Add new
        setColumns([...columns, values]);
      }

      setModalVisible(false);
      toast.success("Column updated. Click 'Save Mapping' to persist changes.");
    } catch (err) {
      console.error("Form validation error:", err);
    }
  };

  const handleSaveMapping = async () => {
    postQuery({
      url: `/api/v1/admin/salary-sheet-templates/${id}/columns`,
      postData: { columns },
      onSuccess: () => {
        toast.success("Column mappings saved successfully");
        fetchColumns();
      },
      onFail: (err) => {
        toast.error(err?.response?.data?.message || "Failed to save mappings");
      },
    });
  };

  const tableColumns = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 80,
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: "Excel Column Header",
      dataIndex: "excelColumnHeader",
      key: "excelColumnHeader",
      width: 180,
    },
    {
      title: "Data Type",
      dataIndex: "dataType",
      key: "dataType",
      width: 100,
      render: (val) => (
        <Tag color={val === "NUMBER" ? "blue" : "default"}>{val}</Tag>
      ),
    },
    {
      title: "Source Type",
      dataIndex: "sourceType",
      key: "sourceType",
      width: 150,
      render: (val) => <Tag>{val}</Tag>,
    },
    {
      title: "Source Key/Formula",
      dataIndex: "sourceKey",
      key: "sourceKey",
      width: 200,
    },
    {
      title: "Round To",
      dataIndex: "roundTo",
      key: "roundTo",
      width: 120,
    },
    {
      title: "Default Value",
      dataIndex: "defaultValue",
      key: "defaultValue",
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record, index) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditColumn(record, index)}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteColumn(index)}
          />
        </Space>
      ),
    },
  ];

  if (loading && !template) {
    return (
      <>
        <BackHeader
          label="Back to Templates"
          href={`${basePath}/salary-sheet-templates`}
        />
        <Card loading />
      </>
    );
  }

  return (
    <div>
      <BackHeader
        label="Back to Templates"
        href={`${basePath}/salary-sheet-templates`}
      />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <h3>
            Template: {template?.templateName} | Client:{" "}
            {template?.company?.name} | Site:{" "}
            {template?.site?.name || "All Sites"}
          </h3>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddColumn}
          >
            Add Column
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveMapping}
            loading={saving}
            disabled={columns.length === 0}
          >
            Save Mapping
          </Button>
        </Space>

        <Table
          dataSource={columns}
          columns={tableColumns}
          rowKey={(_, index) => index}
          scroll={{ x: 1200 }}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingColumn ? "Edit Column Mapping" : "Add Column Mapping"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Order"
            name="order"
            rules={[{ required: true, message: "Please enter order" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Excel Column Header"
            name="excelColumnHeader"
            rules={[{ required: true, message: "Please enter column header" }]}
          >
            <Input placeholder="e.g., Employee Code" />
          </Form.Item>

          <Form.Item
            label="Data Type"
            name="dataType"
            rules={[{ required: true }]}
          >
            <Select>
              {DATA_TYPES.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Source Type"
            name="sourceType"
            rules={[{ required: true }]}
          >
            <Select>
              {SOURCE_TYPES.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Source Key/Formula"
            name="sourceKey"
            rules={[{ required: true, message: "Please enter source key" }]}
            help="Examples: employee.employeeCode, component:basic, summary:netPay, ={B}+{C}"
          >
            <Input placeholder="e.g., employee.employeeCode" />
          </Form.Item>

          <Form.Item label="Round To" name="roundTo">
            <Select>
              {ROUND_TO_OPTIONS.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Default Value" name="defaultValue">
            <Input placeholder="e.g., 0 or N/A" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
