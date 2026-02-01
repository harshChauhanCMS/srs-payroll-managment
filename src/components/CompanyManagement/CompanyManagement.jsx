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

import { useEffect, useState } from "react";
import { Modal, Form, Input, Row, Col, Button, Switch, Tag } from "antd";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import {
  BankOutlined,
  NumberOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

export default function CompanyManagement({
  basePath = "/admin",
  showAddButton = true,
  canEdit = true,
  canDelete = true,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { postQuery, loading: createLoading } = usePostQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();
  const { deleteQuery, loading: deleteLoading } = useDeleteQuery();

  const [tableData, setTableData] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [form] = Form.useForm();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const fetchData = () => {
    getQuery({
      url: `/api/v1/admin/companies?page=${page}&limit=${limit}`,
      onSuccess: (response) => {
        const dataList = Array.isArray(response?.companies)
          ? response.companies
          : [];
        setTotalDocuments(response.pagination?.total || 0);

        const mappedData = dataList.map((item) => ({
          name: item?.name || "N/A",
          gstNumber: item?.gstNumber || "N/A",
          pan: item?.pan || "N/A",
          status: item?.active ? "Active" : "Inactive",
          active: item?.active,
          createdAt: moment(item?.createdAt).format("DD-MM-YYYY"),
          _id: item?._id,
        }));

        setTableData(mappedData);
      },
      onFail: (err) => {
        console.log(err);
        toast.error("Failed to fetch companies");
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handleEditStart = (company) => {
    router.push(`${basePath}/company/edit/${company._id}`);
  };

  const handleModalFinish = (values) => {
    if (editingCompany) {
      putQuery({
        url: `/api/v1/admin/companies/${editingCompany._id}`,
        putData: values,
        onSuccess: () => {
          toast.success("Company updated successfully");
          setIsModalVisible(false);
          fetchData();
        },
        onFail: (err) => {
          toast.error(err?.message || "Failed to update company");
        },
      });
    } else {
      postQuery({
        url: "/api/v1/admin/companies",
        postData: values,
        onSuccess: () => {
          toast.success("Company created successfully");
          setIsModalVisible(false);
          fetchData();
        },
        onFail: (err) => {
          toast.error(err?.message || "Failed to create company");
        },
      });
    }
  };

  const handleDeleteClick = (company) => {
    setCompanyToDelete(company);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (!companyToDelete) return;

    deleteQuery({
      url: `/api/v1/admin/companies/${companyToDelete._id}`,
      onSuccess: () => {
        toast.success("Company deactivated successfully");
        setTableData((prevData) =>
          prevData.map((item) =>
            item._id === companyToDelete._id
              ? { ...item, active: false, status: "Inactive" }
              : item,
          ),
        );
        setDeleteModalVisible(false);
        setCompanyToDelete(null);
      },
      onFail: (err) => {
        toast.error("Failed to deactivate company");
        setDeleteModalVisible(false);
        setCompanyToDelete(null);
      },
    });
  };

  const columns = [
    {
      Header: "Company Name",
      accessor: "name",
      width: 200,
    },
    {
      Header: "GST Number",
      accessor: "gstNumber",
      width: 150,
    },
    {
      Header: "PAN",
      accessor: "pan",
      width: 150,
    },
    {
      Header: "Status",
      accessor: "status",
      width: 100,
      Cell: (value, record) => (
        <Tag color={record.active ? "success" : "default"}>{value}</Tag>
      ),
    },
    {
      Header: "Created At",
      accessor: "createdAt",
      width: 120,
    },
  ];

  const handlePageChange = (newPage) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", newPage);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleLimitChange = (newLimit) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("limit", newLimit);
    newSearchParams.set("page", 1);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <>
      <Title
        title={"Company Management"}
        showButton={showAddButton}
        buttonText="Add Company"
        destination={`${basePath}/company/add`}
      />

      {fetchLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="pt-4">
          <EnhancedTable
            columns={columns}
            data={tableData}
            showActions={true}
            onEdit={canEdit ? handleEditStart : undefined}
            onDelete={canDelete ? handleDeleteClick : undefined}
            entryText={`Total Companies: ${totalDocuments}`}
            currentPage={page}
            totalPages={Math.ceil(totalDocuments / limit)}
            pageLimit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            totalDocuments={totalDocuments}
          />
        </div>
      )}

      <Modal
        title={editingCompany ? "Edit Company" : "Add Company"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleModalFinish}
          className="pt-4"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Company Name"
                rules={[
                  { required: true, message: "Please enter company name" },
                ]}
              >
                <Input
                  prefix={<BankOutlined className="text-gray-400" />}
                  placeholder="Acme Corp"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gstNumber" label="GST Number">
                <Input
                  prefix={<NumberOutlined className="text-gray-400" />}
                  placeholder="22AAAAA0000A1Z5"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pan" label="PAN Number">
                <Input
                  prefix={<FileTextOutlined className="text-gray-400" />}
                  placeholder="ABCDE1234F"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="address" label="Address">
                <Input.TextArea
                  rows={3}
                  placeholder="123 Business St, City"
                  style={{ resize: "none" }}
                />
              </Form.Item>
            </Col>
          </Row>

          {editingCompany && (
            <Row>
              <Col span={24}>
                <Form.Item name="active" label="Status" valuePropName="checked">
                  <Switch
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <Button
              onClick={() => setIsModalVisible(false)}
              className="white-button"
              style={{ borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="simple-button"
              style={{ borderRadius: "8px" }}
              loading={createLoading || updateLoading}
            >
              {editingCompany ? "Update Company" : "Create Company"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Deactivate Company"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Deactivate"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
          className: "red-button",
          style: { borderRadius: "8px" },
        }}
        cancelButtonProps={{
          disabled: deleteLoading,
          className: "white-button",
          style: { borderRadius: "8px" },
        }}
        centered
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to deactivate this company? This may affect
            users assigned to it.
          </p>
          {companyToDelete && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800">Name:</p>
              <p className="text-gray-600">{companyToDelete.name}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
