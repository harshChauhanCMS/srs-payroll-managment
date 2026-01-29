"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePutQuery from "@/hooks/putQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Switch,
  Transfer,
  Typography,
} from "antd";
import {
  BankOutlined,
  NumberOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const EditCompany = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();
  const { patchQuery, loading: assignLoading } = usePatchQuery();

  const [company, setCompany] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [assignedUserKeys, setAssignedUserKeys] = useState([]);
  const [originalAssignedKeys, setOriginalAssignedKeys] = useState([]);

  // Fetch company details
  const fetchCompany = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/companies/${id}`,
      onSuccess: (response) => {
        const companyData = response?.company || null;
        setCompany(companyData);
        if (companyData) {
          form.setFieldsValue({
            name: companyData.name,
            gstNumber: companyData.gstNumber,
            pan: companyData.pan,
            address: companyData.address,
            active: companyData.active,
          });
        }
      },
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch company details");
      },
    });
  }, [id, getQuery, form]);

  // Fetch users - only unassigned users OR users assigned to THIS company
  const fetchUsers = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/users?limit=1000`, // Fetch all users
      onSuccess: (response) => {
        const users = response?.users || [];

        // Filter: only include users who are:
        // 1. Unassigned (company is null/undefined)
        // 2. Assigned to THIS company
        const eligibleUsers = users.filter((user) => {
          const userCompanyId = user.company?._id || user.company;
          return !userCompanyId || userCompanyId === id;
        });

        // Format for Transfer component
        const formattedUsers = eligibleUsers.map((user) => ({
          key: user._id,
          title: `${user.name} (${user.email})`,
          description: user.role,
          companyId: user.company?._id || user.company || null,
        }));
        setAllUsers(formattedUsers);

        // Get IDs of users already assigned to this company
        const assigned = eligibleUsers
          .filter((user) => {
            const userCompanyId = user.company?._id || user.company;
            return userCompanyId === id;
          })
          .map((user) => user._id);
        setAssignedUserKeys(assigned);
        setOriginalAssignedKeys(assigned); // Track original for unassign logic
      },
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch users");
      },
    });
  }, [id, getQuery]);

  useEffect(() => {
    if (id) {
      fetchCompany();
      fetchUsers();
    }
  }, [id]);

  const handleSubmit = (values) => {
    putQuery({
      url: `/api/v1/admin/companies/${id}`,
      putData: values,
      onSuccess: () => {
        toast.success("Company updated successfully");
        router.push("/admin/company");
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to update company");
      },
    });
  };

  const handleUserAssignmentChange = (targetKeys) => {
    setAssignedUserKeys(targetKeys);
  };

  const handleSaveAssignments = async () => {
    // Users to assign (in targetKeys but not in original)
    const toAssign = assignedUserKeys.filter(
      (key) => !originalAssignedKeys.includes(key),
    );

    // Users to unassign (in original but not in targetKeys)
    const toUnassign = originalAssignedKeys.filter(
      (key) => !assignedUserKeys.includes(key),
    );

    try {
      // Assign new users to this company
      for (const userId of toAssign) {
        await new Promise((resolve, reject) => {
          patchQuery({
            url: `/api/v1/admin/users/${userId}`,
            patchData: { company: id },
            onSuccess: resolve,
            onFail: reject,
          });
        });
      }

      // Unassign users (set company to null)
      for (const userId of toUnassign) {
        await new Promise((resolve, reject) => {
          patchQuery({
            url: `/api/v1/admin/users/${userId}`,
            patchData: { company: null },
            onSuccess: resolve,
            onFail: reject,
          });
        });
      }

      toast.success("User assignments updated successfully");
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error("Failed to update some user assignments");
    }
  };

  if (fetchLoading) {
    return (
      <>
        <BackHeader label="Back" />
        <Title title="Edit Company" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <BackHeader label="Back" />
        <Title title="Edit Company" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Company not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader label="Back" />
      <Title title="Edit Company" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
              <Form.Item name="gstNumber" label="GST Number">
                <Input
                  prefix={<NumberOutlined className="text-gray-400" />}
                  placeholder="22AAAAA0000A1Z5"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="pan" label="PAN Number">
                <Input
                  prefix={<FileTextOutlined className="text-gray-400" />}
                  placeholder="ABCDE1234F"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="address" label="Address">
                <Input.TextArea
                  rows={1}
                  placeholder="123 Business St, City"
                  style={{ resize: "none" }}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="active" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
              Update Company
            </Button>
          </div>
        </Form>
      </Card>

      {/* User Assignment Section */}
      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Typography.Title level={5} className="mb-4!">
          Assign Users to Company
        </Typography.Title>
        <p className="text-gray-500 mb-4">
          Select users from the left panel to assign them to this company.
        </p>

        <Transfer
          dataSource={allUsers}
          titles={["Available Users", "Assigned Users"]}
          targetKeys={assignedUserKeys}
          onChange={handleUserAssignmentChange}
          render={(item) => item.title}
          listStyle={{
            width: "100%",
            height: 300,
          }}
          showSearch
          filterOption={(inputValue, option) =>
            option.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
          }
        />

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            type="primary"
            onClick={handleSaveAssignments}
            className="simple-button"
            size="large"
            style={{ borderRadius: "8px" }}
            loading={assignLoading}
          >
            Save Assignments
          </Button>
        </div>
      </Card>
    </>
  );
};

export default EditCompany;
