"use client";

import moment from "moment";
import toast from "react-hot-toast";
import Title from "@/components/Title/Title";
import Loader from "@/components/Loader/Loader";
import useGetQuery from "@/hooks/getQuery.hook";
import BackHeader from "@/components/BackHeader/BackHeader";
import { calcPfDeduction, calcEsiDeduction } from "@/utils/salaryCalculations";

import { useParams } from "next/navigation";
import { Card, Tag, Descriptions, Divider } from "antd";
import { useEffect, useState, useCallback } from "react";
import {
  UserOutlined,
  MailOutlined,
  SafetyOutlined,
  IdcardOutlined,
  HomeOutlined,
  CalendarOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ClusterOutlined,
  StarOutlined,
  ToolOutlined,
  DollarOutlined,
} from "@ant-design/icons";

export default function ViewUser({ basePath = "/admin" }) {
  const params = useParams();
  const { id } = params;

  const { getQuery, loading } = useGetQuery();
  const [user, setUser] = useState(null);
  const [salaryComponent, setSalaryComponent] = useState(null);

  const fetchUser = useCallback(() => {
    getQuery({
      url: `/api/v1/admin/users/${id}`,
      onSuccess: (response) => {
        setUser(response?.user || null);
        setSalaryComponent(response?.salaryComponent || null);
      },
      onFail: (err) => {
        console.error(err);
        toast.error("Failed to fetch user details");
      },
    });
  }, [id, getQuery]);

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
      case "super_admin":
        return "red";
      case "hr":
        return "blue";
      case "employee":
        return "green";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <>
        <BackHeader
          label="Back"
          href={`${basePath}/user-and-role-management`}
        />
        <Title title="User Details" />
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <BackHeader
          label="Back"
          href={`${basePath}/user-and-role-management`}
        />
        <Title title="User Details" />
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">User not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <BackHeader label="Back" href={`${basePath}/user-and-role-management`} />
      <Title
        title="User Details"
        buttonText={user.softDelete ? undefined : "Edit User"}
        destination={
          user.softDelete
            ? undefined
            : `${basePath}/user-and-role-management/edit/${id}`
        }
      />

      <Card className="shadow-md" style={{ marginTop: "8px" }}>
        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <UserOutlined /> Basic Information
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <UserOutlined /> Name
              </span>
            }
          >
            {user.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <MailOutlined /> Email
              </span>
            }
          >
            {user.email || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <SafetyOutlined /> Role
              </span>
            }
          >
            <Tag color={getRoleColor(user.role)}>
              {user.role?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                user.softDelete
                  ? "default"
                  : user.active
                  ? "success"
                  : "default"
              }
            >
              {user.softDelete
                ? "Deleted"
                : user.active
                ? "Active"
                : "Inactive"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <CalendarOutlined /> Created At
              </span>
            }
          >
            {user.createdAt
              ? moment(user.createdAt).format("DD-MM-YYYY hh:mm A")
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <CalendarOutlined /> Updated At
              </span>
            }
          >
            {user.updatedAt
              ? moment(user.updatedAt).format("DD-MM-YYYY hh:mm A")
              : "N/A"}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <BankOutlined /> Organization Details
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <BankOutlined /> Company
              </span>
            }
          >
            {user.company?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <EnvironmentOutlined /> Site
              </span>
            }
          >
            {user.site ? `${user.site.name} (${user.site.siteCode})` : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <ClusterOutlined /> Department
              </span>
            }
          >
            {user.department?.name
              ? `${user.department.name} (${user.department.code || ""})`
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> Designation
              </span>
            }
          >
            {user.designation?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <StarOutlined /> Grade
              </span>
            }
          >
            {user.grade?.name ? user.grade.name : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <ToolOutlined /> Skills
              </span>
            }
          >
            {user.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {user.skills.map((skill) => (
                  <Tag key={skill._id || skill} color="blue">
                    {skill.name}
                  </Tag>
                ))}
              </div>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <DollarOutlined /> Salary (from assigned skills)
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          {!user.skills?.length ? (
            <Descriptions.Item label="Earnings" span={3}>
              No skills assigned. Salary is determined by assigned skills.
            </Descriptions.Item>
          ) : (
            user.skills.map((skill, idx) => {
              const s = skill && typeof skill === "object" ? skill : {};
              const basic = Number(s.basic) || 0;
              const hra = Number(s.houseRentAllowance) || 0;
              const other = Number(s.otherAllowance) || 0;
              const leave = Number(s.leaveEarnings) || 0;
              const bonus = Number(s.bonusEarnings) || 0;
              const arrear = Number(s.arrear) || 0;
              const hasAny = basic || hra || other || leave || bonus || arrear;
              const fmt = (n) => `₹${Number(n).toLocaleString()}`;
              return (
                <Descriptions.Item
                  key={s._id || idx}
                  label={s.name || `Skill ${idx + 1}`}
                  span={3}
                >
                  {!hasAny ? (
                    "No salary configured"
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-gray-700">
                      {basic > 0 && <span>Basic: {fmt(basic)}</span>}
                      {hra > 0 && <span>HRA: {fmt(hra)}</span>}
                      {other > 0 && <span>Other Allowance: {fmt(other)}</span>}
                      {leave > 0 && <span>Leave Earnings: {fmt(leave)}</span>}
                      {bonus > 0 && <span>Bonus Earnings: {fmt(bonus)}</span>}
                      {arrear > 0 && <span>Arrear: {fmt(arrear)}</span>}
                    </div>
                  )}
                </Descriptions.Item>
              );
            })
          )}
        </Descriptions>

        <Divider />

        {salaryComponent ? (
          <>
            <Descriptions
              title={
                <span className="flex items-center gap-2">
                  <DollarOutlined /> Company Salary Structure (
                  {salaryComponent.payrollMonth}/{salaryComponent.payrollYear})
                </span>
              }
              bordered
              column={{ xs: 1, sm: 2, md: 4 }}
            >
              <Descriptions.Item label="Total Days">
                {salaryComponent.totalDays ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="Working Days">
                {salaryComponent.workingDays ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="Present Days">
                {salaryComponent.presentDays ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="National Holiday">
                {salaryComponent.nationalHoliday ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="Payable Days">
                {salaryComponent.payableDays ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="Overtime Days">
                {salaryComponent.overtimeDays ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="Half Day Present">
                {salaryComponent.halfDayPresent ?? 0}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions
              title={
                <span className="flex items-center gap-2">
                  <DollarOutlined /> Allowances (from salary structure)
                </span>
              }
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              {[
                { key: "houseRentAllowance", label: "HRA" },
                { key: "overtimeAmount", label: "Overtime Amount" },
                { key: "incentive", label: "Incentive" },
                { key: "exportAllowance", label: "Export Allowance" },
                {
                  key: "basicSpecialAllowance",
                  label: "Basic Special Allowance",
                },
                {
                  key: "citySpecialAllowance",
                  label: "City Special Allowance",
                },
                { key: "conveyanceAllowance", label: "Conveyance Allowance" },
                { key: "bonusAllowance", label: "Bonus Allowance" },
                {
                  key: "specialHeadConveyanceAllowance",
                  label: "Special Head Conveyance",
                },
                { key: "arrear", label: "Arrear" },
                { key: "medicalAllowance", label: "Medical Allowance" },
                { key: "leavePayment", label: "Leave Payment" },
                { key: "specialAllowance", label: "Special Allowance" },
                {
                  key: "uniformMaintenanceAllowance",
                  label: "Uniform Maintenance",
                },
                { key: "otherAllowance", label: "Other Allowance" },
                { key: "leaveEarnings", label: "Leave Earnings" },
                { key: "bonusEarnings", label: "Bonus Earnings" },
              ]
                .filter((o) => (Number(salaryComponent[o.key]) || 0) > 0)
                .map(({ key, label }) => (
                  <Descriptions.Item key={key} label={label}>
                    ₹{Number(salaryComponent[key]).toLocaleString()}
                  </Descriptions.Item>
                ))}
              {[
                "houseRentAllowance",
                "overtimeAmount",
                "incentive",
                "exportAllowance",
                "basicSpecialAllowance",
                "citySpecialAllowance",
                "conveyanceAllowance",
                "bonusAllowance",
                "specialHeadConveyanceAllowance",
                "arrear",
                "medicalAllowance",
                "leavePayment",
                "specialAllowance",
                "uniformMaintenanceAllowance",
                "otherAllowance",
                "leaveEarnings",
                "bonusEarnings",
              ].every((k) => !(Number(salaryComponent[k]) || 0)) && (
                <Descriptions.Item span={3}>
                  No allowances configured.
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            {/* <Descriptions
              title={
                <span className="flex items-center gap-2">
                  <DollarOutlined /> Deductions (from salary structure)
                </span>
              }
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              {[
                { key: "pfPercentage", label: "PF" },
                { key: "esiDeduction", label: "ESI" },
                { key: "haryanaWelfareFund", label: "Haryana Welfare Fund" },
                { key: "labourWelfareFund", label: "Labour Welfare Fund" },
                { key: "groupTermLifeInsurance", label: "Group Term Life Insurance" },
                { key: "miscellaneousDeduction", label: "Miscellaneous" },
                { key: "shoesDeduction", label: "Shoes" },
                { key: "jacketDeduction", label: "Jacket" },
                { key: "canteenDeduction", label: "Canteen" },
                { key: "iCardDeduction", label: "I Card" },
              ]
                .filter((o) => (Number(salaryComponent[o.key]) || 0) > 0)
                .map(({ key, label }) => (
                  <Descriptions.Item key={key} label={label}>
                    ₹{Number(salaryComponent[key]).toLocaleString()}
                  </Descriptions.Item>
                ))}
              <Descriptions.Item label="Total Deductions">
                ₹{(Number(salaryComponent.totalDeductions) || 0).toLocaleString()}
              </Descriptions.Item>
            </Descriptions> */}

            <Divider />
          </>
        ) : (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Company Salary Structure">
                {user.company
                  ? "No salary structure defined for this company yet."
                  : "No company assigned."}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
          </>
        )}

        {(() => {
          const skillTotals = (user.skills || []).reduce(
            (acc, s) => {
              if (!s || typeof s !== "object") return acc;
              return {
                basic: acc.basic + (Number(s.basic) || 0),
                hra: acc.hra + (Number(s.houseRentAllowance) || 0),
                other: acc.other + (Number(s.otherAllowance) || 0),
                leave: acc.leave + (Number(s.leaveEarnings) || 0),
                bonus: acc.bonus + (Number(s.bonusEarnings) || 0),
                arrear: acc.arrear + (Number(s.arrear) || 0),
              };
            },
            { basic: 0, hra: 0, other: 0, leave: 0, bonus: 0, arrear: 0 }
          );
          const grossEarnings =
            skillTotals.basic +
            skillTotals.hra +
            skillTotals.other +
            skillTotals.leave +
            skillTotals.bonus +
            skillTotals.arrear;

          // Priority: user-defined > salary component > hardcoded default
          const pfFromUser = user.pfPercentage != null;
          const esiFromUser = user.esiPercentage != null;
          const pfRate = pfFromUser
            ? user.pfPercentage / 100
            : salaryComponent?.pfPercentage != null
            ? salaryComponent.pfPercentage / 100
            : 0.12;
          const esiRate = esiFromUser
            ? user.esiPercentage / 100
            : salaryComponent?.esiDeduction != null
            ? salaryComponent.esiDeduction / 100
            : 0.0075;

          const pfAmount = calcPfDeduction(skillTotals.basic, pfRate);
          const esiAmount = calcEsiDeduction(grossEarnings, esiRate);

          // Other deductions from salary component
          const otherDeductionItems = salaryComponent
            ? [
                { key: "haryanaWelfareFund", label: "Haryana Welfare Fund" },
                { key: "labourWelfareFund", label: "Labour Welfare Fund" },
                {
                  key: "groupTermLifeInsurance",
                  label: "Group Term Life Insurance",
                },
                { key: "miscellaneousDeduction", label: "Miscellaneous" },
                { key: "shoesDeduction", label: "Shoes" },
                { key: "jacketDeduction", label: "Jacket" },
                { key: "canteenDeduction", label: "Canteen" },
                { key: "iCardDeduction", label: "I Card" },
              ].filter((d) => (Number(salaryComponent[d.key]) || 0) > 0)
            : [];
          const otherDeductionsTotal = otherDeductionItems.reduce(
            (sum, d) => sum + (Number(salaryComponent[d.key]) || 0),
            0
          );

          const totalDeductions = pfAmount + esiAmount + otherDeductionsTotal;
          const netSalary = grossEarnings - totalDeductions;
          const fmt = (n) => `₹${Number(n).toLocaleString()}`;
          const pfLabel = pfFromUser
            ? "from user"
            : salaryComponent?.pfPercentage != null
            ? "from salary structure"
            : "default";
          const esiLabel = esiFromUser
            ? "from user"
            : salaryComponent?.esiDeduction != null
            ? "from salary structure"
            : "default";

          return (
            <Descriptions
              title={
                <span className="flex items-center gap-2">
                  <DollarOutlined /> Deductions & Net Salary
                </span>
              }
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              <Descriptions.Item label="PF Rate">
                {pfRate * 100}%{" "}
                <Tag color={pfFromUser ? "blue" : "default"}>{pfLabel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ESI Rate">
                {esiRate * 100}%{" "}
                <Tag color={esiFromUser ? "blue" : "default"}>{esiLabel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Gross Earnings">
                {fmt(grossEarnings)}
              </Descriptions.Item>
              <Descriptions.Item label="PF Deduction">
                {fmt(pfAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="ESI Deduction">
                {grossEarnings >= 21000
                  ? `${fmt(0)} (Gross >= ₹21,000)`
                  : fmt(esiAmount)}
              </Descriptions.Item>
              {otherDeductionItems.map(({ key, label }) => (
                <Descriptions.Item key={key} label={label}>
                  {fmt(Number(salaryComponent[key]) || 0)}
                </Descriptions.Item>
              ))}
              {otherDeductionsTotal > 0 && (
                <Descriptions.Item label="Other Deductions Total">
                  {fmt(otherDeductionsTotal)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Total Deductions">
                <span className="font-semibold text-red-600">
                  {fmt(totalDeductions)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Net Salary">
                <span className="font-semibold text-green-700">
                  {fmt(netSalary)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          );
        })()}

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <SafetyOutlined /> Permissions
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 4 }}
        >
          <Descriptions.Item label="View">
            <Tag color={user.permissions?.view ? "cyan" : "default"}>
              {user.permissions?.view ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Edit">
            <Tag color={user.permissions?.edit ? "orange" : "default"}>
              {user.permissions?.edit ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Delete">
            <Tag color={user.permissions?.delete ? "red" : "default"}>
              {user.permissions?.delete ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Create">
            <Tag color={user.permissions?.create ? "green" : "default"}>
              {user.permissions?.create ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions
          title={
            <span className="flex items-center gap-2">
              <IdcardOutlined /> Additional Information
            </span>
          }
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> PAN Number
              </span>
            }
          >
            {user.pan || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> Aadhar Number
              </span>
            }
          >
            {user.aadhar || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <HomeOutlined /> Address
              </span>
            }
          >
            {user.address || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> ESI Code
              </span>
            }
          >
            {user.esiCode || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> UAN
              </span>
            }
          >
            {user.uan || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <IdcardOutlined /> PF Number
              </span>
            }
          >
            {user.pfNumber || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
}
