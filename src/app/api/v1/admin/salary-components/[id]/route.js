import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SalaryComponent from "@/models/SalaryComponent";
import { ROLES } from "@/constants/roles";
import {
  requireViewPermission,
  requireEditPermission,
  requireDeletePermission,
} from "@/lib/apiAuth";

const DAY_KEYS = [
  "totalDays",
  "workingDays",
  "nationalHoliday",
  "overtimeDays",
  "presentDays",
  "payableDays",
  "halfDayPresent",
];
const ALLOWANCE_KEYS = [
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
];
const DEDUCTION_KEYS = [
  "pfPercentage",
  "esiDeduction",
  "haryanaWelfareFund",
  "labourWelfareFund",
  "groupTermLifeInsurance",
  "miscellaneousDeduction",
  "shoesDeduction",
  "jacketDeduction",
  "canteenDeduction",
  "iCardDeduction",
  "totalDeductions",
];
const ALLOWED_PATCH_KEYS = new Set([
  "company",
  "payrollMonth",
  "payrollYear",
  "active",
  ...DAY_KEYS,
  ...ALLOWANCE_KEYS,
  ...DEDUCTION_KEYS,
]);

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

/**
 * GET /api/v1/admin/salary-components/[id]
 */
export async function GET(request, { params }) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const { id } = await params;
    await connectDB();

    const salaryComponent = await SalaryComponent.findById(id)
      .populate("company", "name")
      .lean();

    if (!salaryComponent) {
      return NextResponse.json(
        { message: "Salary component not found" },
        { status: 404 },
      );
    }

    if (
      auth.user.role === ROLES.HR &&
      String(salaryComponent.company?._id) !== String(auth.user.company)
    ) {
      return NextResponse.json(
        {
          message:
            "Forbidden. You can only view salary components of your company.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ salaryComponent });
  } catch (err) {
    console.error("Get salary component error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch salary component" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/v1/admin/salary-components/[id]
 */
export async function PATCH(request, { params }) {
  try {
    const auth = await requireEditPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.edit) {
      return NextResponse.json(
        {
          message:
            "Forbidden. You do not have permission to edit salary components.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    await connectDB();

    const doc = await SalaryComponent.findById(id);
    if (!doc) {
      return NextResponse.json(
        { message: "Salary component not found" },
        { status: 404 },
      );
    }

    if (
      currentUser.role === ROLES.HR &&
      String(doc.company) !== String(currentUser.company)
    ) {
      return NextResponse.json(
        {
          message:
            "Forbidden. You can only edit salary components of your company.",
        },
        { status: 403 },
      );
    }

    const updates = {};
    for (const key of ALLOWED_PATCH_KEYS) {
      if (!(key in body)) continue;
      if (
        DAY_KEYS.includes(key) ||
        ALLOWANCE_KEYS.includes(key) ||
        DEDUCTION_KEYS.includes(key)
      ) {
        updates[key] = safeNum(body[key]);
      } else if (
        key === "company" ||
        key === "payrollMonth" ||
        key === "payrollYear"
      ) {
        updates[key] = body[key];
      } else if (key === "active") {
        updates[key] = body[key] !== false;
      }
    }
    Object.assign(doc, updates);
    await doc.save();

    const salaryComponent = await SalaryComponent.findById(id)
      .populate("company", "name")
      .lean();

    return NextResponse.json({
      message: "Salary component updated successfully",
      salaryComponent,
    });
  } catch (err) {
    console.error("Update salary component error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to update salary component" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/admin/salary-components/[id]
 * Delete a salary component
 */
export async function DELETE(request, { params }) {
  try {
    const auth = await requireDeletePermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    if (currentUser.role === ROLES.HR && !currentUser.permissions?.delete) {
      return NextResponse.json(
        {
          message:
            "Forbidden. You do not have permission to delete salary components.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;
    await connectDB();

    const doc = await SalaryComponent.findById(id);
    if (!doc) {
      return NextResponse.json(
        { message: "Salary component not found" },
        { status: 404 },
      );
    }

    if (
      currentUser.role === ROLES.HR &&
      String(doc.company) !== String(currentUser.company)
    ) {
      return NextResponse.json(
        {
          message:
            "Forbidden. You can only delete salary components of your company.",
        },
        { status: 403 },
      );
    }

    await SalaryComponent.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Salary component deleted successfully",
    });
  } catch (err) {
    console.error("Delete salary component error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to delete salary component" },
      { status: 500 },
    );
  }
}
