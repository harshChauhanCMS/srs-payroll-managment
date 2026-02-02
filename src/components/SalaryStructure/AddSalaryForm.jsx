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
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  Checkbox,
} from "antd";

const EARNINGS_OPTIONS = [
  { key: "basic", label: "Basic (Monthly Rate)" },
  { key: "houseRentAllowance", label: "HRA (Monthly Rate)" },
  { key: "otherAllowance", label: "Other Allowance" },
  { key: "leaveEarnings", label: "Leave Earnings" },
  { key: "bonusEarnings", label: "Bonus Earnings" },
  { key: "arrear", label: "Arrear" },
];

const DEDUCTIONS_OPTIONS = [
  { key: "labourWelfareFund", label: "Labour Welfare Fund" },
  { key: "haryanaWelfareFund", label: "Haryana Welfare Fund" },
  { key: "groupTermLifeInsurance", label: "Group Term Life Insurance" },
  { key: "miscellaneousDeduction", label: "Miscellaneous Deduction" },
  { key: "shoesDeduction", label: "Shoes Deduction" },
  { key: "jacketDeduction", label: "Jacket Deduction" },
  { key: "canteenDeduction", label: "Canteen Deduction" },
  { key: "iCardDeduction", label: "I Card Deduction" },
];

export default function AddSalaryForm({ basePath = "/admin", editId = null }) {
  const router = useRouter();
  const params = useParams();
  const id = editId ?? params?.id ?? null;
  const isEdit = !!id;

  const [form] = Form.useForm();
  const { postQuery, loading: postLoading } = usePostQuery();
  const { patchQuery, loading: patchLoading } = usePatchQuery();
  const { getQuery: getCompanies, loading: companiesLoading } = useGetQuery();
  const { getQuery: getSalaryComponent, loading: fetchLoading } = useGetQuery();

  const [companies, setCompanies] = useState([]);

  const [selectedEarnings, setSelectedEarnings] = useState(["basic"]);
  const [selectedDeductions, setSelectedDeductions] = useState([]);
  const [showDays, setShowDays] = useState(true);

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

  const fetchForEdit = useCallback(() => {
    if (!id) return;
    getSalaryComponent({
      url: `/api/v1/admin/salary-components/${id}`,
      onSuccess: (response) => {
        const sc = response?.salaryComponent;
        if (!sc) return;
        const companyId = sc.company?._id ?? sc.company;
        const deductions = DEDUCTIONS_OPTIONS.map((o) => o.key).filter(
          (key) => (Number(sc[key]) || 0) > 0
        );
        form.setFieldsValue({
          company: companyId,
          payrollMonth: sc.payrollMonth ?? currentMonth,
          payrollYear: sc.payrollYear ?? currentYear,
          presentDays: sc.presentDays ?? 0,
          nationalHoliday: sc.nationalHoliday ?? 0,
          payableDays: sc.payableDays ?? 0,
          overtimeDays: sc.overtimeDays ?? 0,
          labourWelfareFund: sc.labourWelfareFund ?? 0,
          haryanaWelfareFund: sc.haryanaWelfareFund ?? 0,
          groupTermLifeInsurance: sc.groupTermLifeInsurance ?? 0,
          miscellaneousDeduction: sc.miscellaneousDeduction ?? 0,
          shoesDeduction: sc.shoesDeduction ?? 0,
          jacketDeduction: sc.jacketDeduction ?? 0,
          canteenDeduction: sc.canteenDeduction ?? 0,
          iCardDeduction: sc.iCardDeduction ?? 0,
          totalDeductions: sc.totalDeductions ?? 0,
          bankAccountNumber: sc.bankAccountNumber ?? "",
          ifscCode: sc.ifscCode ?? "",
          bankName: sc.bankName ?? "",
          permanentAddress: sc.permanentAddress ?? "",
          aadharNumber: sc.aadharNumber ?? "",
          mobileNumber: sc.mobileNumber ?? "",
          remarks: sc.remarks ?? "",
        });
        setSelectedDeductions(deductions.length > 0 ? deductions : []);
        setShowDays(true);
      },
      onFail: () => {
        toast.error("Failed to fetch salary component");
      },
    });
  }, [id, getSalaryComponent, form, currentMonth, currentYear]);

  useEffect(() => {
    if (isEdit && id) fetchForEdit();
  }, [isEdit, id, fetchForEdit]);

  const recalcDeductions = () => {
    const values = form.getFieldsValue();
    const sum =
      (Number(values.labourWelfareFund) || 0) +
      (Number(values.haryanaWelfareFund) || 0) +
      (Number(values.groupTermLifeInsurance) || 0) +
      (Number(values.miscellaneousDeduction) || 0) +
      (Number(values.shoesDeduction) || 0) +
      (Number(values.jacketDeduction) || 0) +
      (Number(values.canteenDeduction) || 0) +
      (Number(values.iCardDeduction) || 0);
    form.setFieldValue("totalDeductions", sum);
  };

  const handleValuesChange = (changedValues) => {
    const deductionKeys = [
      "labourWelfareFund",
      "haryanaWelfareFund",
      "groupTermLifeInsurance",
      "miscellaneousDeduction",
      "shoesDeduction",
      "jacketDeduction",
      "canteenDeduction",
      "iCardDeduction",
    ];
    if (Object.keys(changedValues).some((k) => deductionKeys.includes(k))) {
      setTimeout(recalcDeductions, 0);
    }
  };

  const handleSubmit = (values) => {
    if (selectedEarnings.length === 0) {
      toast.error(
        "Select at least one earning (e.g. Basic) in salary components."
      );
      return;
    }
    const optionalEarningsAndDeductions = [
      ...EARNINGS_OPTIONS.map((o) => o.key),
      ...DEDUCTIONS_OPTIONS.map((o) => o.key),
    ];
    const defaults = {};
    optionalEarningsAndDeductions.forEach((k) => {
      defaults[k] = 0;
    });

    const payload = {
      ...defaults,
      ...values,
      company: values.company,
      payrollMonth: values.payrollMonth ?? currentMonth,
      payrollYear: values.payrollYear ?? currentYear,
      bankAccountNumber: (values.bankAccountNumber || "").trim(),
      ifscCode: (values.ifscCode || "").trim(),
      bankName: (values.bankName || "").trim(),
      permanentAddress: (values.permanentAddress || "").trim(),
      aadharNumber: (values.aadharNumber || "").trim(),
      mobileNumber: (values.mobileNumber || "").trim(),
    };

    // Ensure no NaN for numeric fields (API/Mongoose fail on NaN)
    const numericKeys = [
      "payrollMonth",
      "payrollYear",
      "presentDays",
      "nationalHoliday",
      "payableDays",
      "overtimeDays",
      "overtimeAmount",
      "labourWelfareFund",
      "haryanaWelfareFund",
      "groupTermLifeInsurance",
      "miscellaneousDeduction",
      "shoesDeduction",
      "jacketDeduction",
      "canteenDeduction",
      "iCardDeduction",
      "totalDeductions",
    ];
    numericKeys.forEach((k) => {
      if (payload[k] === undefined) return;
      const n = Number(payload[k]);
      if (Number.isNaN(n)) payload[k] = 0;
    });

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
          presentDays: 0,
          nationalHoliday: 0,
          payableDays: 0,
          overtimeDays: 0,
          overtimeAmount: 0,
          labourWelfareFund: 0,
          haryanaWelfareFund: 0,
          groupTermLifeInsurance: 0,
          miscellaneousDeduction: 0,
          shoesDeduction: 0,
          jacketDeduction: 0,
          canteenDeduction: 0,
          iCardDeduction: 0,
          totalDeductions: 0,
          bankAccountNumber: "",
          ifscCode: "",
          bankName: "",
          permanentAddress: "",
          aadharNumber: "",
          mobileNumber: "",
        }}
      >
        <Card
          title="Company & Period"
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12} className="mb-4 md:mb-0">
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
                  options={companies.map((c) => ({
                    value: c._id,
                    label: c.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6} className="mb-4 md:mb-0">
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
            <Col xs={24} md={6} className="mb-4 md:mb-0">
              <Form.Item
                name="payrollYear"
                label="Payroll Year"
                rules={[{ required: true }]}
                className="mb-4"
              >
                <InputNumber
                  min={currentYear - 5}
                  max={currentYear + 1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="Select salary components"
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
          extra={
            <span className="text-gray-500 text-sm">
              Earnings rates are defined per user via their assigned Skill.
            </span>
          }
        >
          <Row gutter={[32, 28]}>
            <Col xs={24} md={12} className="mb-6">
              <div className="font-medium mb-3">Earnings (structure only)</div>
              <p className="text-gray-500 text-sm mb-3">
                Select which earnings the company uses. Actual rates come from
                each user&apos;s assigned Skill.
              </p>
              <Checkbox.Group
                value={selectedEarnings}
                onChange={(vals) => setSelectedEarnings(vals)}
                className="flex flex-col gap-3"
              >
                {EARNINGS_OPTIONS.map(({ key, label }) => (
                  <Checkbox key={key} value={key} className="mb-1">
                    {label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Col>
            <Col xs={24} md={12} className="mb-6">
              <div className="font-medium mb-3">Deductions (optional)</div>
              <Checkbox.Group
                value={selectedDeductions}
                onChange={(vals) => setSelectedDeductions(vals)}
                className="flex flex-col gap-3"
              >
                {DEDUCTIONS_OPTIONS.map(({ key, label }) => (
                  <Checkbox key={key} value={key} className="mb-1">
                    {label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Col>
            <Col xs={24} md={12} className="mt-2 mb-2">
              <Checkbox
                checked={showDays}
                onChange={(e) => setShowDays(e.target.checked)}
              >
                Include Days (Present / Payable / OT)
              </Checkbox>
            </Col>
          </Row>
        </Card>

        {showDays && (
          <Card
            title="Days (Payable = Present + National Holiday if not set)"
            className="shadow-md"
            style={{ marginTop: "16px", marginBottom: "16px" }}
          >
            <Row gutter={[24, 20]}>
              <Col xs={24} md={6}>
                <Form.Item
                  name="presentDays"
                  label="Present Days (company default)"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="nationalHoliday"
                  label="National Holiday (company default)"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="payableDays"
                  label="Payable Days (auto or manual)"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="overtimeDays"
                  label="Overtime Days (company default)"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        <Card
          title="Deductions (company rates). PF and ESI vary per employee."
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        >
          <Row gutter={[24, 20]}>
            {selectedDeductions.includes("labourWelfareFund") && (
              <Col xs={24} md={8}>
                <Form.Item name="labourWelfareFund" label="Labour Welfare Fund">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            )}
            {selectedDeductions.includes("haryanaWelfareFund") && (
              <Col xs={24} md={8}>
                <Form.Item
                  name="haryanaWelfareFund"
                  label="Haryana Welfare Fund"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            )}
            {selectedDeductions.includes("groupTermLifeInsurance") && (
              <Col xs={24} md={8}>
                <Form.Item
                  name="groupTermLifeInsurance"
                  label="Group Term Life Insurance"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            )}
            {selectedDeductions.includes("miscellaneousDeduction") && (
              <Col xs={24} md={8}>
                <Form.Item
                  name="miscellaneousDeduction"
                  label="Misc. Deduction"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            )}
            {selectedDeductions.includes("shoesDeduction") && (
              <Col xs={24} md={8}>
                <Form.Item name="shoesDeduction" label="Shoes Deduction">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            )}
            {selectedDeductions.includes("jacketDeduction") && (
              <Col xs={24} md={8}>
                <Form.Item name="jacketDeduction" label="Jacket Deduction">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            )}
            {selectedDeductions.includes("canteenDeduction") && (
              <Col xs={24} md={8}>
                <Form.Item name="canteenDeduction" label="Canteen Deduction">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            )}
            {selectedDeductions.includes("iCardDeduction") && (
              <Col xs={24} md={8}>
                <Form.Item name="iCardDeduction" label="I Card Deduction">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            )}
            <Col xs={24} md={8}>
              <Form.Item
                name="totalDeductions"
                label="Total Deductions (sum of above)"
              >
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="Bank details (company default)"
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        >
          <Row gutter={[24, 20]}>
            <Col xs={24} md={8}>
              <Form.Item name="bankAccountNumber" label="Bank Account No.">
                <Input placeholder="Account number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="ifscCode" label="IFSC Code">
                <Input placeholder="IFSC" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="bankName" label="Bank Name">
                <Input placeholder="Bank name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="permanentAddress" label="Permanent Address">
                <Input placeholder="Address" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="aadharNumber" label="Aadhar No.">
                <Input placeholder="Aadhar" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="mobileNumber" label="Mobile No.">
                <Input placeholder="Mobile" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          className="shadow-md"
          style={{ marginTop: "16px", marginBottom: "16px" }}
        >
          <Form.Item name="remarks" label="Remarks" className="mb-4">
            <Input.TextArea rows={2} placeholder="Remarks" />
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
