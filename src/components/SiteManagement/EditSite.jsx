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
  Select,
  Transfer,
  Typography,
  InputNumber,
} from "antd";
import {
  BankOutlined,
  EnvironmentOutlined,
  NumberOutlined,
  RadiusSettingOutlined,
  BorderOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export default function EditSite({ basePath = "/admin" }) {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form] = Form.useForm();
  const { getQuery, loading: fetchLoading } = useGetQuery();
  const { putQuery, loading: updateLoading } = usePutQuery();
  const { patchQuery, loading: assignLoading } = usePatchQuery();

  const [site, setSite] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [assignedUserKeys, setAssignedUserKeys] = useState([]);
  const [originalAssignedKeys, setOriginalAssignedKeys] = useState([]);

  useEffect(() => {
    getQuery({
      url: "/api/v1/admin/companies?active=true&limit=100",
      onSuccess: (res) => setCompanies(res.companies || []),
      onFail: (err) => console.error("Failed to fetch companies", err),
    });
  }, []);

  const fetchSite = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/sites/${id}`,
      onSuccess: (response) => {
        const siteData = response?.site || null;
        setSite(siteData);
        if (siteData) {
          form.setFieldsValue({
            name: siteData.name,
            siteCode: siteData.siteCode,
            company: siteData.company?._id || siteData.company,
            address: siteData.address,
            geofencingRadius: siteData.geofencingRadius || 100,
            fenceType: siteData.fenceType || "circular",
            active: siteData.active,
          });
        }
      },
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch site details");
      },
    });
  }, [id, getQuery, form]);

  const fetchUsers = useCallback(
    (companyId) => {
      if (!companyId) return;
      getQuery({
        url: `/api/v1/admin/users?limit=1000&excludeRole=admin&company=${companyId}`,
        onSuccess: (response) => {
          const users = response?.users || [];
          const eligibleUsers = users.filter((user) => {
            const userSiteId = user.site?._id || user.site;
            return !userSiteId || userSiteId === id;
          });
          const formattedUsers = eligibleUsers.map((user) => ({
            key: user._id,
            title: `${user.name} (${user.email})`,
            description: user.role,
          }));
          setAllUsers(formattedUsers);
          const assigned = eligibleUsers
            .filter((user) => (user.site?._id || user.site) === id)
            .map((user) => user._id);
          setAssignedUserKeys(assigned);
          setOriginalAssignedKeys(assigned);
        },
        onFail: (err) => {
          console.error(err);
          toast.error("Failed to fetch users");
        },
      });
    },
    [id, getQuery],
  );

  useEffect(() => {
    if (id) fetchSite();
  }, [id]);

  useEffect(() => {
    if (site?.company) {
      const companyId = site.company._id || site.company;
      fetchUsers(companyId);
    }
  }, [site]);

  const handleSubmit = (values) => {
    putQuery({
      url: `/api/v1/admin/sites/${id}`,
      putData: values,
      onSuccess: () => {
        toast.success("Site updated successfully");
        router.push(`${basePath}/site`);
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to update site");
      },
    });
  };

  const handleUserAssignmentChange = (targetKeys) => {
    setAssignedUserKeys(targetKeys);
  };

  const handleSaveAssignments = async () => {
    const toAssign = assignedUserKeys.filter(
      (key) => !originalAssignedKeys.includes(key),
    );
    const toUnassign = originalAssignedKeys.filter(
      (key) => !assignedUserKeys.includes(key),
    );
    try {
      for (const userId of toAssign) {
        await new Promise((resolve, reject) => {
          patchQuery({
            url: `/api/v1/admin/users/${userId}`,
            patchData: { site: id },
            onSuccess: resolve,
            onFail: reject,
          });
        });
      }
      for (const userId of toUnassign) {
        await new Promise((resolve, reject) => {
          patchQuery({
            url: `/api/v1/admin/users/${userId}`,
            patchData: { site: null },
            onSuccess: resolve,
            onFail: reject,
          });
        });
      }
      toast.success("User assignments updated successfully");
      const companyId = site?.company?._id || site?.company;
      if (companyId) fetchUsers(companyId);
    } catch (error) {
      toast.error("Failed to update some user assignments");
    }
  };

  if (fetchLoading) {
    return (
      <>
        <BackHeader label="Back" href={`${basePath}/site`} />
        <Title title="Edit Site" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!site) {
    return (
      <>
        <BackHeader label="Back" href={`${basePath}/site`} />
        <Title title="Edit Site" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Site not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader label="Back" href={`${basePath}/site`} />
      <Title title="Edit Site" />

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Site Name"
                rules={[{ required: true, message: "Please enter site name" }]}
              >
                <Input
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                  placeholder="Kolkata Office"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="siteCode"
                label="Site Code"
                rules={[{ required: true, message: "Please enter site code" }]}
              >
                <Input
                  prefix={<NumberOutlined className="text-gray-400" />}
                  placeholder="KOL-01"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="company"
                label="Parent Company"
                rules={[{ required: true, message: "Please select a company" }]}
              >
                <Select
                  placeholder="Select company"
                  suffixIcon={<BankOutlined className="text-gray-400" />}
                  size="large"
                  showSearch
                  optionFilterProp="children"
                >
                  {companies.map((company) => (
                    <Option key={company._id} value={company._id}>
                      {company.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="address" label="Address">
                <Input.TextArea
                  rows={1}
                  placeholder="123 Business Park, City"
                  style={{ resize: "none" }}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="geofencingRadius"
                label="Geofencing Radius (meters)"
                rules={[
                  {
                    required: false,
                    message: "Please enter geofencing radius",
                  },
                  {
                    type: "number",
                    min: 0,
                    message: "Radius must be a positive number",
                  },
                ]}
              >
                <InputNumber
                  prefix={<RadiusSettingOutlined className="text-gray-400" />}
                  placeholder="100"
                  size="large"
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="meters"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fenceType" label="Fence Type">
                <Select
                  placeholder="Select fence type"
                  suffixIcon={<BorderOutlined className="text-gray-400" />}
                  size="large"
                >
                  <Option value="circular">Circular</Option>
                  <Option value="rectangle">Rectangle</Option>
                  <Option value="polygon">Polygon</Option>
                </Select>
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
              Update Site
            </Button>
          </div>
        </Form>
      </Card>

      <Card className="shadow-md" style={{ marginTop: "20px" }}>
        <Typography.Title level={5} className="mb-4!">
          Assign Users to Site
        </Typography.Title>
        <p className="text-gray-500 mb-4">
          Select users from the left panel to assign them to this site.
        </p>

        <Transfer
          dataSource={allUsers}
          titles={["Available Users", "Assigned Users"]}
          targetKeys={assignedUserKeys}
          onChange={handleUserAssignmentChange}
          render={(item) => item.title}
          listStyle={{ width: "100%", height: 300 }}
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
}
