"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";
import PermissionGuard from "@/components/PermissionGuard/PermissionGuard";

import { useParams, usePathname } from "next/navigation";
import { Card, Descriptions, Divider } from "antd";
import { useEffect, useState, useCallback } from "react";
import {
  BankOutlined,
  CalendarOutlined,
  DollarOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const ALLOWANCE_LABELS = [
  { key: "houseRentAllowance", label: "House Rent Allowance (HRA)" },
  { key: "overtimeAmount", label: "Overtime Amount (OT)" },
  { key: "incentive", label: "Incentive" },
  { key: "exportAllowance", label: "Export Allowance" },
  { key: "basicSpecialAllowance", label: "Basic Special Allowance (BSA)" },
  { key: "citySpecialAllowance", label: "City Special Allowance (CSA)" },
  { key: "conveyanceAllowance", label: "Conveyance Allowance" },
  { key: "bonusAllowance", label: "Bonus Allowance" },
  {
    key: "specialHeadConveyanceAllowance",
    label: "Special Head Conveyance (SHCA)",
  },
  { key: "arrear", label: "Arrear" },
  { key: "medicalAllowance", label: "Medical Allowance" },
  { key: "leavePayment", label: "Leave Payment" },
  { key: "specialAllowance", label: "Special Allowance" },
  { key: "uniformMaintenanceAllowance", label: "Uniform Maintenance (UMA)" },
  { key: "otherAllowance", label: "Other Allowance" },
  { key: "leaveEarnings", label: "Leave Earnings" },
  { key: "bonusEarnings", label: "Bonus Earnings" },
];

const DEDUCTION_LABELS = [
  { key: "pfPercentage", label: "PF (%)" },
  { key: "esiDeduction", label: "ESI Deduction (ESI)" },
  { key: "haryanaWelfareFund", label: "Haryana Welfare Fund (HWF)" },
  { key: "labourWelfareFund", label: "Labour Welfare Fund (LWF)" },
  { key: "groupTermLifeInsurance", label: "Group Term Life Insurance (GTLI)" },
  { key: "miscellaneousDeduction", label: "Miscellaneous (Misc)" },
  { key: "shoesDeduction", label: "Shoes Deduction" },
  { key: "jacketDeduction", label: "Jacket Deduction" },
  { key: "canteenDeduction", label: "Canteen Deduction" },
  { key: "iCardDeduction", label: "I Card Deduction" },
];

export default function ViewSalaryComponent({ basePath: basePathProp }) {
  const params = useParams();
  const pathname = usePathname();
  const { id } = params;
  const basePath =
    basePathProp ??
    (pathname?.startsWith("/hr")
      ? "/hr"
      : pathname?.startsWith("/employee")
      ? "/employee"
      : "/admin");

  const { getQuery, loading } = useGetQuery();
  const [data, setData] = useState(null);

  const fetchData = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/salary-components/${id}`,
      onSuccess: (response) => {
        setData(response?.salaryComponent ?? null);
      },
      onFail: () => {
        toast.error("Failed to fetch salary component");
      },
    });
  }, [id, getQuery]);

  useEffect(() => {
    if (id) fetchData();
  }, []);

  if (loading) {
    return (
      <PermissionGuard
        permission="view"
        fallback={
          <div className="p-4 text-gray-500">
            You do not have permission to view.
          </div>
        }
      >
        <BackHeader label="Back" href={`${basePath}/salary-component`} />
        <Title title="Salary Component Details" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </PermissionGuard>
    );
  }

  if (!data) {
    return (
      <PermissionGuard
        permission="view"
        fallback={
          <div className="p-4 text-gray-500">
            You do not have permission to view.
          </div>
        }
      >
        <BackHeader label="Back" href={`${basePath}/salary-component`} />
        <Title title="Salary Component Details" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Salary component not found.</p>
        </div>
      </PermissionGuard>
    );
  }

  const companyName = data.company?.name ?? (data.company ? "—" : "—");
  const allowanceEntries = ALLOWANCE_LABELS.filter(
    (o) => (Number(data[o.key]) || 0) > 0
  );
  const deductionEntries = DEDUCTION_LABELS.filter(
    (o) => (Number(data[o.key]) || 0) > 0
  );

  return (
    <PermissionGuard
      permission="view"
      fallback={
        <div className="p-4 text-gray-500">
          You do not have permission to view.
        </div>
      }
    >
      <BackHeader label="Back" href={`${basePath}/salary-component`} />
      <Title
        title="Salary Component Details"
        buttonText="Edit"
        destination={`${basePath}/salary-component/edit/${id}`}
      />

      <Card className="shadow-md" style={{ marginTop: "8px" }}>
        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <BankOutlined /> Company & Period
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          <Descriptions.Item label="Company">{companyName}</Descriptions.Item>
          <Descriptions.Item label="Payroll Month">
            {data.payrollMonth ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Payroll Year">
            {data.payrollYear ?? "—"}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <CalendarOutlined /> Days
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 4 }}
        >
          <Descriptions.Item label="Total Days">
            {data.totalDays ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Working Days">
            {data.workingDays ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Present Days">
            {data.presentDays ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="National Holiday">
            {data.nationalHoliday ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Payable Days">
            {data.payableDays ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Overtime Days">
            {data.overtimeDays ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Half Day Present">
            {data.halfDayPresent ?? 0}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <DollarOutlined /> Allowances
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          {allowanceEntries.length > 0 ? (
            allowanceEntries.map(({ key, label }) => (
              <Descriptions.Item key={key} label={label}>
                ₹{Number(data[key]).toLocaleString()}
              </Descriptions.Item>
            ))
          ) : (
            <Descriptions.Item span={3}>
              No allowances configured.
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <IdcardOutlined /> Deductions
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          {deductionEntries.length > 0 ? (
            deductionEntries.map(({ key, label }) => (
              <Descriptions.Item key={key} label={label}>
                ₹{Number(data[key]).toLocaleString()}
              </Descriptions.Item>
            ))
          ) : (
            <Descriptions.Item span={3}>
              No deductions configured.
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Total Deductions">
            ₹{(Number(data.totalDeductions) || 0).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {data.createdAt && (
          <>
            <Divider />
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Created">
                {moment(data.createdAt).format("DD-MM-YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    </PermissionGuard>
  );
}
