import {
  AppstoreOutlined,
  TeamOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ClusterOutlined,
  UserOutlined,
  DollarOutlined,
  ToolOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import { ROLES } from "./roles";

export const sidebarHeading = "SRS Payroll";

/**
 * Generate sidebar items with role-specific path prefixes
 * Management items (User & Roles, Company, Site, Department) are only for Admin/HR
 * Employees only see Dashboard and My Profile
 *
 * @param {string} role - User role
 * @returns {Array} Sidebar items with correct path prefixes
 */
export const getSidebarItems = (role) => {
  // Determine the base path based on role
  let basePath = "/employee";

  if (role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
    basePath = "/admin";
  } else if (role === ROLES.HR) {
    basePath = "/hr";
  }

  // Return role-specific sidebar items
  return [
    {
      name: "Dashboard",
      link: `${basePath}/dashboard`,
      icon: AppstoreOutlined,
      alwaysVisible: true, // Dashboard is always visible
    },
    {
      name: "User & Roles",
      link: `${basePath}/user-and-role-management`,
      icon: TeamOutlined,
      requiresPermission: "view", // Requires view permission to see
    },
    {
      name: "Company",
      link: `${basePath}/company`,
      icon: BankOutlined,
      requiresPermission: "view",
    },
    {
      name: "Site",
      link: `${basePath}/site`,
      icon: EnvironmentOutlined,
      requiresPermission: "view",
    },
    {
      name: "Department",
      link: `${basePath}/department`,
      icon: ClusterOutlined,
      requiresPermission: "view",
    },
    {
      name: "Skills",
      link: `${basePath}/skills`,
      icon: ToolOutlined,
      requiresPermission: "view",
    },
    {
      name: "Salary Component",
      link: `${basePath}/salary-component`,
      icon: DollarOutlined,
      requiresPermission: "view",
    },
    {
      name: "Payroll",
      link: `${basePath}/payroll`,
      icon: CalculatorOutlined,
      requiresPermission: "view",
      children: [
        { name: "Attendance Import", link: `${basePath}/payroll/attendance-import` },
        { name: "Attendance Review", link: `${basePath}/payroll/attendance-review` },
        { name: "Exceptions", link: `${basePath}/payroll/exceptions` },
        { name: "Run Payroll", link: `${basePath}/payroll/run` },
        { name: "Approval", link: `${basePath}/payroll/approval` },
      ],
      matchRoutes: [`${basePath}/payroll`],
    },
    {
      name: "My Profile",
      link: `${basePath}/profile/view`,
      icon: UserOutlined,
      alwaysVisible: true, // Profile is always visible
      showForRoles: [ROLES.EMPLOYEE], // Only show for employees
    },
  ];
};

// Legacy exports for backward compatibility
export const adminSidebarItems = getSidebarItems(ROLES.ADMIN);
export const hrSidebarItems = getSidebarItems(ROLES.HR);
export const employeeSidebarItems = getSidebarItems(ROLES.EMPLOYEE);
export const sidebarNavItems = adminSidebarItems;
