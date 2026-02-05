import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SalarySheetTemplate from "@/models/SalarySheetTemplate";
import { requireViewPermission, requireCreatePermission } from "@/lib/apiAuth";
import { ROLES } from "@/constants/roles";

/**
 * GET /api/v1/admin/salary-sheet-templates
 * List all templates (filtered by user's company/site)
 */
export async function GET(request) {
  try {
    const auth = await requireViewPermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company");
    const siteId = searchParams.get("site");
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query = {};

    // Admin/Super Admin can see all templates
    if (
      currentUser.role === ROLES.ADMIN ||
      currentUser.role === ROLES.SUPER_ADMIN
    ) {
      if (companyId) query.company = companyId;
      if (siteId) query.site = siteId;
    } else if (currentUser.role === ROLES.HR) {
      // HR can only see their company's templates (their site OR "All Sites")
      query.company = currentUser.company;
      query.$or = [{ site: currentUser.site }, { site: null }];
    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (active !== null && active !== undefined) {
      query.active = active === "true";
    }

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      SalarySheetTemplate.find(query)
        .populate("company", "name")
        .populate("site", "name siteCode")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SalarySheetTemplate.countDocuments(query),
    ]);

    return NextResponse.json({
      templates,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET salary sheet templates error:", err);
    return NextResponse.json(
      { message: err.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/salary-sheet-templates
 * Create a new template
 */
export async function POST(request) {
  try {
    const auth = await requireCreatePermission(request);
    if (auth.error) return auth.error;

    const currentUser = auth.user;
    const body = await request.json();
    const { templateName, company, site, outputFilenamePattern, sheetName } =
      body;

    if (!templateName || !company || !outputFilenamePattern) {
      return NextResponse.json(
        { message: "Missing required fields: templateName, company, outputFilenamePattern" },
        { status: 400 }
      );
    }

    await connectDB();

    // HR can only create templates for their company/site
    if (currentUser.role === ROLES.HR) {
      if (String(company) !== String(currentUser.company)) {
        return NextResponse.json(
          { message: "You can only create templates for your company" },
          { status: 403 }
        );
      }
      if (site && String(site) !== String(currentUser.site)) {
        return NextResponse.json(
          { message: "You can only create templates for your site" },
          { status: 403 }
        );
      }
    }

    // Check for duplicate template name within company
    const existing = await SalarySheetTemplate.findOne({
      company,
      templateName: templateName.trim(),
    });

    if (existing) {
      return NextResponse.json(
        { message: "Template name already exists for this company" },
        { status: 409 }
      );
    }

    const template = await SalarySheetTemplate.create({
      templateName: templateName.trim(),
      company,
      site: site || null,
      outputFilenamePattern: outputFilenamePattern.trim(),
      sheetName: (sheetName || "Salary Sheet").trim(),
      columnMappings: [],
      active: body.active !== false,
      createdBy: currentUser._id,
    });

    const populated = await SalarySheetTemplate.findById(template._id)
      .populate("company", "name")
      .populate("site", "name siteCode")
      .lean();

    return NextResponse.json(
      { message: "Template created successfully", template: populated },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST salary sheet template error:", err);
    if (err.code === 11000) {
      return NextResponse.json(
        { message: "Template name already exists for this company" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: err.message || "Failed to create template" },
      { status: 500 }
    );
  }
}
