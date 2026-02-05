"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import usePatchQuery from "@/hooks/patchQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Form,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  Checkbox,
} from "antd";

const ALLOWANCE_OPTIONS = [
  { key: "houseRentAllowance", label: "House Rent Allowance", short: "HRA" },
  { key: "overtimeAmount", label: "Overtime Amount", short: "OT" },
  { key: "incentive", label: "Incentive", short: "Incentive" },
  { key: "exportAllowance", label: "Export Allowance", short: "Export" },
  {
    key: "basicSpecialAllowance",
    label: "Basic Special Allowance",
    short: "BSA",
  },
  {
    key: "citySpecialAllowance",
    label: "City Special Allowance",
    short: "CSA",
  },
  { key: "conveyanceAllowance", label: "Conveyance Allowance", short: "Conv" },
  { key: "bonusAllowance", label: "Bonus Allowance", short: "Bonus" },
  {
    key: "specialHeadConveyanceAllowance",
    label: "Special Head Conveyance Allowance",
    short: "SHCA",
  },
  { key: "arrear", label: "Arrear", short: "Arrear" },
  { key: "medicalAllowance", label: "Medical Allowance", short: "Medical" },
  { key: "leavePayment", label: "Leave Payment", short: "Leave Pay" },
  { key: "specialAllowance", label: "Special Allowance", short: "Special" },
  {
    key: "uniformMaintenanceAllowance",
    label: "Uniform Maintenance Allowance",
    short: "UMA",
  },
  { key: "otherAllowance", label: "Other Allowance", short: "Other" },
  { key: "leaveEarnings", label: "Leave Earnings", short: "Leave Earn" },
  { key: "bonusEarnings", label: "Bonus Earnings", short: "Bonus Earn" },
];

const DEDUCTION_OPTIONS = [
  { key: "pfPercentage", label: "PF (%)", short: "PF%" },
  { key: "esiDeduction", label: "ESI Deduction", short: "ESI" },
  { key: "haryanaWelfareFund", label: "Haryana Welfare Fund", short: "HWF" },
  { key: "labourWelfareFund", label: "Labour Welfare Fund", short: "LWF" },
  {
    key: "groupTermLifeInsurance",
    label: "Group Term Life Insurance",
    short: "GTLI",
  },
  {
    key: "miscellaneousDeduction",
    label: "Miscellaneous Deduction",
    short: "Misc",
  },
  { key: "shoesDeduction", label: "Shoes Deduction", short: "Shoes" },
  { key: "jacketDeduction", label: "Jacket Deduction", short: "Jacket" },
  { key: "canteenDeduction", label: "Canteen Deduction", short: "Canteen" },
  { key: "iCardDeduction", label: "I Card Deduction", short: "I Card" },
];

const DAY_KEYS = [
  "totalDays",
  "workingDays",
  "nationalHoliday",
  "overtimeDays",
  "presentDays",
  "payableDays",
  "halfDayPresent",
];

export default function AddSalaryForm({ basePath = "/admin", editId = null }) {
  const router = useRouter();
  const params = useParams();
  const id = editId ?? params?.id ?? null;
  const isEdit = !!id;

  const [form] = Form.useForm();
  const { postQuery, loading: postLoading } = usePostQuery();
  const { patchQuery, loading: patchLoading } = usePatchQuery();
  const { getQuery: getCompanies, loading: companiesLoading} = useGetQuery();
  const { getQuery: getSites, loading: sitesLoading } = useGetQuery();
  const { getQuery: getSalaryComponent, loading: fetchLoading } = useGetQuery();

  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDays, setShowDays] = useState(true);
  const [enabledAllowances, setEnabledAllowances] = useState([]);
  const [enabledDeductions, setEnabledDeductions] = useState([]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const loading = isEdit ? patchLoading : postLoading;

  useEffect(() => {
    getCompanies({
      url: "/api/v1/admin/companies?active=true&limit=500",
      onSuccess: (res) => setCompanies(res.companies || []),
      onFail: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      getSites({
        url: `/api/v1/admin/sites?company=${selectedCompany}&active=true&limit=500`,
        onSuccess: (res) => setSites(res.sites || []),
        onFail: () => {},
      });
    } else {
      setSites([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch sites when company changes
  }, [selectedCompany]);

  const fetchForEdit = useCallback(() => {
    if (!id) return;
    getSalaryComponent({
      url: `/api/v1/admin/salary-components/${id}`,
      onSuccess: (response) => {
        const sc = response?.salaryComponent;
        if (!sc) return;
        const companyId = sc.site?.company?._id || sc.site?.company || sc.company?._id || sc.company;
        const siteId = sc.site?._id || sc.site;
        const toNum = (v) => {
          if (v === undefined || v === null || v === "") return undefined;
          const n = Number(v);
          if (Number.isNaN(n) || n === 0) return undefined;
          return n;
        };
        const values = {
          company: companyId,
          site: siteId,
          payrollMonth: sc.payrollMonth ?? currentMonth,
          payrollYear: sc.payrollYear ?? currentYear,
          totalDays: toNum(sc.totalDays),
          workingDays: toNum(sc.workingDays),
          nationalHoliday: toNum(sc.nationalHoliday),
          overtimeDays: toNum(sc.overtimeDays),
          presentDays: toNum(sc.presentDays),
          payableDays: toNum(sc.payableDays),
          presentDays: toNum(sc.presentDays),
          payableDays: toNum(sc.payableDays),
          halfDayPresent: toNum(sc.halfDayPresent),
        };
        const enabledAllowancesNext = [];
        ALLOWANCE_OPTIONS.forEach((o) => {
          const v = toNum(sc[o.key]);
          values[o.key] = v;
          if (v !== undefined) enabledAllowancesNext.push(o.key);
        });
        const enabledDeductionsNext = [];
        DEDUCTION_OPTIONS.forEach((o) => {
          const v = toNum(sc[o.key]);
          values[o.key] = v;
          if (o.key !== "totalDeductions" && v !== undefined)
            enabledDeductionsNext.push(o.key);
        });
        values.active = sc.active !== false;
        form.setFieldsValue(values);
        setEnabledAllowances(enabledAllowancesNext);
        setEnabledDeductions(enabledDeductionsNext);
        setShowDays(true);
        if (companyId) {
          setSelectedCompany(companyId);
        }
      },
      onFail: () => {
        toast.error("Failed to fetch salary component");
      },
    });
  }, [id, getSalaryComponent, form, currentMonth, currentYear]);

  useEffect(() => {
    if (isEdit && id) fetchForEdit();
  }, []);

  const recalcDeductions = () => {
    const values = form.getFieldsValue();
    const sum = DEDUCTION_OPTIONS.filter(
      (o) => o.key !== "totalDeductions"
    ).reduce((acc, o) => acc + (Number(values[o.key]) || 0), 0);
    form.setFieldValue("totalDeductions", sum);
  };

  const handleValuesChange = (changedValues) => {
    const deductionKeys = DEDUCTION_OPTIONS.map((o) => o.key).filter(
      (k) => k !== "totalDeductions"
    );
    if (Object.keys(changedValues).some((k) => deductionKeys.includes(k))) {
      setTimeout(recalcDeductions, 0);
    }
  };

  const handleSubmit = (values) => {
    const toNum = (v) => {
      if (v === undefined || v === null || v === "") return 0;
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    };
    const payload = {
      site: values.site,
      payrollMonth: values.payrollMonth ?? currentMonth,
      payrollYear: values.payrollYear ?? currentYear,
      active: values.active !== false,
    };
    DAY_KEYS.forEach((k) => {
      payload[k] = toNum(values[k]);
    });
    const enabledAllowancesSet = new Set(enabledAllowances);
    ALLOWANCE_OPTIONS.forEach((o) => {
      const raw = enabledAllowancesSet.has(o.key) ? values[o.key] : 0;
      payload[o.key] = toNum(raw);
    });
    const enabledDeductionsSet = new Set(enabledDeductions);
    DEDUCTION_OPTIONS.filter((o) => o.key !== "totalDeductions").forEach(
      (o) => {
        const raw = enabledDeductionsSet.has(o.key) ? values[o.key] : 0;
        payload[o.key] = toNum(raw);
      }
    );
    payload.totalDeductions = DEDUCTION_OPTIONS.filter(
      (o) => o.key !== "totalDeductions"
    ).reduce((acc, o) => acc + (Number(payload[o.key]) || 0), 0);

    if (isEdit) {
      patchQuery({
        url: `/api/v1/admin/salary-components/${id}`,
        patchData: payload,
        onSuccess: () => {
          toast.success("Salary component updated successfully");
          router.push(`${basePath}/salary-component`);
        },
        onFail: (err) => {
          toast.error(err?.message || "Failed to update salary component");
        },
      });
    } else {
      postQuery({
        url: "/api/v1/admin/salary-components",
        postData: payload,
        onSuccess: () => {
          toast.success("Salary component created successfully");
          router.push(`${basePath}/salary-component`);
        },
        onFail: (err) => {
          toast.error(err?.message || "Failed to create salary component");
        },
      });
    }
  };

  if (isEdit && fetchLoading) {
    return (
      <PermissionGuard
        permission="edit"
        fallback={
          <div className="p-4 text-gray-500">
            You do not have permission to edit.
          </div>
        }
      >
        <BackHeader label="Back" href={`${basePath}/salary-component`} />
        <Title title="Edit Salary Component" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard
      permission={isEdit ? "edit" : "create"}
      fallback={
        <div className="p-4 text-gray-500">
          You do not have permission to {isEdit ? "edit" : "add"} salary
          components.
        </div>
      }
    >
      <BackHeader label="Back" href={`${basePath}/salary-component`} />
      <Title
        title={isEdit ? "Edit Salary Component" : "Add Salary Component"}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        initialValues={{
          payrollMonth: currentMonth,
          payrollYear: currentYear,
          showDays: true,
          active: true,
        }}
      >
        <Card
          title="Company & Period"
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8} className="mb-4 md:mb-0">
              <Form.Item
                name="company"
                label="Company"
                rules={[{ required: true, message: "Select company" }]}
                className="mb-4"
              >
                <Select
                  placeholder="Select company"
                  loading={companiesLoading}
                  showSearch
                  optionFilterProp="label"
                  onChange={(value) => {
                    setSelectedCompany(value);
                    form.setFieldValue("site", null);
                  }}
                  options={companies.map((c) => ({
                    value: c._id,
                    label: c.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} className="mb-4 md:mb-0">
              <Form.Item
                name="site"
                label="Site/Location"
                rules={[{ required: true, message: "Select site" }]}
                className="mb-4"
              >
                <Select
                  placeholder="Select site"
                  loading={sitesLoading}
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedCompany}
                  options={sites.map((s) => ({
                    value: s._id,
                    label: `${s.name} (${s.siteCode})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4} className="mb-4 md:mb-0">
              <Form.Item
                name="payrollMonth"
                label="Payroll Month"
                rules={[{ required: true }]}
                className="mb-4"
              >
                <Select
                  options={Array.from({ length: 12 }, (_, i) => ({
                    value: i + 1,
                    label: `${i + 1}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4} className="mb-4 md:mb-0">
              <Form.Item
                name="payrollYear"
                label="Payroll Year"
                rules={[{ required: true }]}
                className="mb-4"
              >
                <InputNumber
                  min={currentYear - 5}
                  max={currentYear + 1}
                  controls={false}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        >
          <Checkbox
            checked={showDays}
            onChange={(e) => setShowDays(e.target.checked)}
          >
            Include Days (Present / Payable / OT)
          </Checkbox>
        </Card>

        {showDays && (
          <Card
            title="Days (Payable = Present + National Holiday if not set)"
            className="shadow-md"
            style={{ marginTop: "16px", marginBottom: "16px" }}
          >
            <Row gutter={[24, 20]}>
              <Col xs={24} md={6}>
                <Form.Item name="totalDays" label="Total Days">
                  <InputNumber
                    min={0}
                    controls={false}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="workingDays" label="Working Days">
                  <InputNumber
                    min={0}
                    controls={false}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="presentDays"
                  label="Present Days (company default)"
                >
                  <InputNumber
                    min={0}
                    controls={false}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="nationalHoliday"
                  label="National Holiday (company default)"
                >
                  <InputNumber
                    min={0}
                    controls={false}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="payableDays"
                  label="Payable Days (auto or manual)"
                >
                  <InputNumber
                    min={0}
                    controls={false}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="overtimeDays"
                  label="Overtime Days (company default)"
                >
                  <InputNumber
                    min={0}
                    controls={false}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="halfDayPresent" label="Half Day Present">
                  <InputNumber
                    min={0}
                    controls={false}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        <Card
          title="Allowances (prices)"
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        >
          <Row gutter={[24, 20]}>
            {ALLOWANCE_OPTIONS.map(({ key, label, short }) => {
              const checked = enabledAllowances.includes(key);
              return (
                <Col xs={24} md={8} key={key}>
                  <div className="flex items-center gap-2 mb-1">
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setEnabledAllowances((prev) =>
                          isChecked
                            ? [...prev, key]
                            : prev.filter((k) => k !== key)
                        );
                      }}
                    >
                      {label} ({short})
                    </Checkbox>
                  </div>
                  <Form.Item name={key}>
                    <InputNumber
                      min={0}
                      controls={false}
                      style={{ width: "100%" }}
                      placeholder="0"
                      disabled={!checked}
                    />
                  </Form.Item>
                </Col>
              );
            })}
          </Row>
        </Card>

        <Card
          title="Deductions (company rates)"
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        >
          <Row gutter={[24, 20]}>
            {DEDUCTION_OPTIONS.filter((o) => o.key !== "totalDeductions").map(
              ({ key, label, short }) => {
                const checked = enabledDeductions.includes(key);
                return (
                  <Col xs={24} md={8} key={key}>
                    <div className="flex items-center gap-2 mb-1">
                      <Checkbox
                        checked={checked}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setEnabledDeductions((prev) =>
                            isChecked
                              ? [...prev, key]
                              : prev.filter((k) => k !== key)
                          );
                        }}
                      >
                        {label} ({short})
                      </Checkbox>
                    </div>
                    <Form.Item name={key}>
                      <InputNumber
                        min={0}
                        controls={false}
                        style={{ width: "100%" }}
                        placeholder="0"
                        disabled={!checked}
                      />
                    </Form.Item>
                  </Col>
                );
              }
            )}
            <Col xs={24} md={8}>
              <Form.Item
                name="totalDeductions"
                label="Total Deductions (sum of above)"
              >
                <InputNumber
                  readOnly
                  controls={false}
                  style={{ width: "100%", background: "#f5f5f5" }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        >
          <Form.Item
            name="active"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>
          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button
              type="primary"
              htmlType="submit"
              className="simple-button"
              size="large"
              style={{ borderRadius: "8px" }}
              loading={loading}
            >
              {isEdit ? "Update Salary Component" : "Create Salary Component"}
            </Button>
          </div>
        </Card>
      </Form>
    </PermissionGuard>
  );
}
