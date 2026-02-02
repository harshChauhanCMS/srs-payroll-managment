"use client";

import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import useGetQuery from "@/hooks/getQuery.hook";
import usePostQuery from "@/hooks/postQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { runAllCalculations } from "@/utils/salaryCalculations";
import { BankOutlined, UserOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  DatePicker,
} from "antd";

const STANDARD_WORKING_DAYS = 26;

export default function AddSalaryForm({ basePath = "/admin" }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { postQuery, loading } = usePostQuery();
  const { getQuery: getCompanies, loading: companiesLoading } = useGetQuery();
  const { getQuery: getSites, loading: sitesLoading } = useGetQuery();
  const { getQuery: getDepartments, loading: deptLoading } = useGetQuery();
  const { getQuery: getDesignations, loading: desigLoading } = useGetQuery();
  const { getQuery: getGrades, loading: gradesLoading } = useGetQuery();
  const { getQuery: getUsers, loading: usersLoading } = useGetQuery();

  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [grades, setGrades] = useState([]);
  const [users, setUsers] = useState([]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    getCompanies({
      url: "/api/v1/admin/companies?active=true&limit=500",
      onSuccess: (res) => setCompanies(res.companies || []),
      onFail: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const selectedCompany = Form.useWatch("company", form);

  // Only fetch when company is selected; when no company, use empty options in render (no setState in effect)
  useEffect(() => {
    if (!selectedCompany) return;

    getSites({
      url: `/api/v1/admin/sites?company=${selectedCompany}&limit=500`,
      onSuccess: (res) => setSites(res.sites || []),
      onFail: () => {},
    });
    getDepartments({
      url: `/api/v1/admin/departments?company=${selectedCompany}&limit=500`,
      onSuccess: (res) => setDepartments(res.departments || []),
      onFail: () => {},
    });
    getDesignations({
      url: "/api/v1/admin/designations?limit=500",
      onSuccess: (res) => setDesignations(res.designations || []),
      onFail: () => {},
    });
    getGrades({
      url: "/api/v1/admin/grades?limit=500",
      onSuccess: (res) => setGrades(res.grades || []),
      onFail: () => {},
    });
    getUsers({
      url: `/api/v1/admin/users?company=${selectedCompany}&limit=500`,
      onSuccess: (res) => setUsers(res.users || []),
      onFail: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-fetch when selectedCompany changes
  }, [selectedCompany]);

  // Derive options: when no company selected, show empty lists (avoids setState in effect)
  const sitesForCompany = selectedCompany ? sites : [];
  const departmentsForCompany = selectedCompany ? departments : [];
  const usersForCompany = selectedCompany ? users : [];

  const recalcAndSet = () => {
    const values = form.getFieldsValue();
    const payable =
      values.payableDays > 0
        ? values.payableDays
        : (Number(values.presentDays) || 0) +
          (Number(values.nationalHoliday) || 0);
    const calculated = runAllCalculations({
      ...values,
      payableDays: payable,
    });
    form.setFieldsValue({
      payableDays: calculated.payableDays,
      basicEarned: calculated.basicEarned,
      hraEarned: calculated.hraEarned,
      totalEarning: calculated.totalEarning,
      incentive: calculated.incentive,
      gross: calculated.gross,
      esiApplicableGross: calculated.esiApplicableGross,
      pfDeduction: calculated.pfDeduction,
      esiDeduction: calculated.esiDeduction,
      totalDeductions: calculated.totalDeductions,
      netPayment: calculated.netPayment,
      roundedAmount: calculated.roundedAmount,
      totalPayable: calculated.totalPayable,
      amount: calculated.amount,
    });
  };

  const handleValuesChange = (changedValues, allValues) => {
    const keysThatTriggerRecalc = [
      "basic",
      "houseRentAllowance",
      "otherAllowance",
      "leaveEarnings",
      "bonusEarnings",
      "presentDays",
      "nationalHoliday",
      "payableDays",
      "overtimeDays",
      "labourWelfareFund",
      "haryanaWelfareFund",
      "groupTermLifeInsurance",
      "miscellaneousDeduction",
      "shoesDeduction",
      "jacketDeduction",
      "canteenDeduction",
      "iCardDeduction",
    ];
    if (
      Object.keys(changedValues).some((k) => keysThatTriggerRecalc.includes(k))
    ) {
      setTimeout(recalcAndSet, 0);
    }
  };

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      company: values.company,
      payrollMonth: values.payrollMonth ?? currentMonth,
      payrollYear: values.payrollYear ?? currentYear,
      employee: values.employee || undefined,
      site: values.site || undefined,
      department: values.department || undefined,
      designation: values.designation || undefined,
      grade: values.grade || undefined,
      skills: Array.isArray(values.skills) ? values.skills : [],
      dateOfBirth: values.dateOfBirth
        ? values.dateOfBirth?.toISOString?.() ??
          values.dateOfBirth?.format?.("YYYY-MM-DD") ??
          String(values.dateOfBirth)
        : undefined,
      dateOfJoining: values.dateOfJoining
        ? values.dateOfJoining?.toISOString?.() ??
          values.dateOfJoining?.format?.("YYYY-MM-DD") ??
          String(values.dateOfJoining)
        : undefined,
      dateOfConfirmation: values.dateOfConfirmation
        ? values.dateOfConfirmation?.toISOString?.() ??
          values.dateOfConfirmation?.format?.("YYYY-MM-DD") ??
          String(values.dateOfConfirmation)
        : undefined,
    };

    postQuery({
      url: "/api/v1/admin/salary-structures",
      postData: payload,
      onSuccess: () => {
        toast.success("Salary record created successfully");
        router.push(`${basePath}/salary-structure`);
      },
      onFail: (err) => {
        toast.error(err?.message || "Failed to create salary record");
      },
    });
  };

  const initialCalculated = useMemo(() => {
    return runAllCalculations({
      basic: 0,
      houseRentAllowance: 0,
      otherAllowance: 0,
      leaveEarnings: 0,
      bonusEarnings: 0,
      presentDays: 0,
      nationalHoliday: 0,
      payableDays: 0,
      overtimeDays: 0,
      labourWelfareFund: 0,
      haryanaWelfareFund: 0,
      groupTermLifeInsurance: 0,
      miscellaneousDeduction: 0,
      shoesDeduction: 0,
      jacketDeduction: 0,
      canteenDeduction: 0,
      iCardDeduction: 0,
    });
  }, []);

  return (
    <PermissionGuard
      permission="create"
      fallback={
        <div className="p-4 text-gray-500">
          You do not have permission to add salary records.
        </div>
      }
    >
      <BackHeader label="Back" href={`${basePath}/salary-structure`} />
      <Title title="Add Salary Record" />

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
          basic: 0,
          houseRentAllowance: 0,
          otherAllowance: 0,
          leaveEarnings: 0,
          bonusEarnings: 0,
          basicEarned: initialCalculated.basicEarned,
          hraEarned: initialCalculated.hraEarned,
          totalEarning: initialCalculated.totalEarning,
          incentive: initialCalculated.incentive,
          gross: initialCalculated.gross,
          esiApplicableGross: initialCalculated.esiApplicableGross,
          pfDeduction: initialCalculated.pfDeduction,
          esiDeduction: initialCalculated.esiDeduction,
          totalDeductions: initialCalculated.totalDeductions,
          netPayment: initialCalculated.netPayment,
          roundedAmount: initialCalculated.roundedAmount,
          totalPayable: initialCalculated.totalPayable,
          amount: initialCalculated.amount,
          labourWelfareFund: 0,
          haryanaWelfareFund: 0,
          groupTermLifeInsurance: 0,
          miscellaneousDeduction: 0,
          shoesDeduction: 0,
          jacketDeduction: 0,
          canteenDeduction: 0,
          iCardDeduction: 0,
        }}
      >
        <Card title="Company & Period" className="shadow-md mb-4">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="company"
                label="Company"
                rules={[{ required: true, message: "Select company" }]}
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
            <Col xs={24} md={6}>
              <Form.Item
                name="payrollMonth"
                label="Payroll Month"
                rules={[{ required: true }]}
              >
                <Select
                  options={Array.from({ length: 12 }, (_, i) => ({
                    value: i + 1,
                    label: `${i + 1}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="payrollYear"
                label="Payroll Year"
                rules={[{ required: true }]}
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

        <Card title="Employee" className="shadow-md mb-4">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="employeeName"
                label="Employee Name"
                rules={[{ required: true, message: "Enter employee name" }]}
              >
                <Input placeholder="Full name" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="cardId" label="Card ID">
                <Input placeholder="Card ID" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="payCode" label="Pay Code">
                <Input placeholder="Pay Code" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="employee" label="Link to User (optional)">
                <Select
                  placeholder="Select user"
                  allowClear
                  loading={usersLoading}
                  showSearch
                  optionFilterProp="label"
                  options={usersForCompany.map((u) => ({
                    value: u._id,
                    label: `${u.name} (${u.email})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="fathersName" label="Father's Name">
                <Input placeholder="Father's name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="site" label="Site / Location">
                <Select
                  placeholder="Select site"
                  allowClear
                  loading={sitesLoading}
                  showSearch
                  optionFilterProp="label"
                  options={sitesForCompany.map((s) => ({
                    value: s._id,
                    label: s.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="department" label="Department">
                <Select
                  placeholder="Select department"
                  allowClear
                  loading={deptLoading}
                  showSearch
                  optionFilterProp="label"
                  options={departmentsForCompany.map((d) => ({
                    value: d._id,
                    label: d.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="designation" label="Designation">
                <Select
                  placeholder="Select designation"
                  allowClear
                  loading={desigLoading}
                  showSearch
                  optionFilterProp="label"
                  options={designations.map((d) => ({
                    value: d._id,
                    label: d.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="grade" label="Grade">
                <Select
                  placeholder="Select grade"
                  allowClear
                  loading={gradesLoading}
                  showSearch
                  optionFilterProp="label"
                  options={grades.map((g) => ({
                    value: g._id,
                    label: g.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="area" label="Area">
                <Input placeholder="Area" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="departmentId" label="Department ID">
                <Input placeholder="Dept ID" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="Bank & Statutory" className="shadow-md mb-4">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="bankAccountNumber" label="Bank Account No.">
                <Input prefix={<BankOutlined />} placeholder="Account number" />
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
              <Form.Item name="esiCode" label="ESI Code">
                <Input placeholder="ESI" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="uan" label="UAN">
                <Input placeholder="UAN" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="pfNumber" label="PF Number">
                <Input placeholder="PF" />
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
            <Col xs={24} md={8}>
              <Form.Item name="dateOfBirth" label="DOB">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="dateOfJoining" label="DOJ">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="dateOfConfirmation" label="DOC">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="Days (Payable = Present + National Holiday if not set)"
          className="shadow-md mb-4"
        >
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="presentDays" label="Present Days">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="nationalHoliday" label="National Holiday">
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
              <Form.Item name="overtimeDays" label="Overtime Days">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="Earnings (Monthly rates; earned = rate/26 × payable days)"
          className="shadow-md mb-4"
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="basic" label="Basic (Monthly Rate)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="houseRentAllowance" label="HRA (Monthly Rate)">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="otherAllowance"
                label="Other Allowance (Monthly)"
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="leaveEarnings" label="Leave Earnings">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="bonusEarnings" label="Bonus Earnings">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8} />
            <Col xs={24} md={8}>
              <Form.Item name="basicEarned" label="Basic Earned (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="hraEarned" label="HRA Earned (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="totalEarning" label="Total Earning (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="incentive" label="Incentive Amt. (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="gross" label="Gross (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#e6f7ff" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="Deductions (PF 12%, ESI 0.75% if Gross &lt; 21000)"
          className="shadow-md mb-4"
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="pfDeduction" label="PF @12% (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="esiDeduction" label="ESI 0.75% (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="labourWelfareFund" label="LWF">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="haryanaWelfareFund" label="HWF">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="miscellaneousDeduction" label="Misc. Deduction">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="totalDeductions" label="Total Deductions (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f5f5f5" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="netPayment" label="Net Payment (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f6ffed" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="amount" label="Amount / Rounded (calc)">
                <InputNumber
                  readOnly
                  style={{ width: "100%", background: "#f6ffed" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card className="shadow-md mb-4">
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={2} placeholder="Remarks" />
          </Form.Item>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="primary"
              htmlType="submit"
              className="simple-button"
              size="large"
              style={{ borderRadius: "8px" }}
              loading={loading}
            >
              Create Salary Record
            </Button>
          </div>
        </Card>
      </Form>
    </PermissionGuard>
  );
}
