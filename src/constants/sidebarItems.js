import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

export const sidebarHeading = "SRS Payroll";

// Admin Sidebar Items
export const adminSidebarItems = [
  {
    name: "Dashboard",
    link: "/admin/dashboard",
    icon: DashboardOutlined,
  },
  {
    name: "User & Roles",
    link: "/admin/user-and-role-management",
    icon: TeamOutlined,
  },
];

// HR Sidebar Items
export const hrSidebarItems = [
  {
    name: "Dashboard",
    link: "/hr/dashboard",
    icon: DashboardOutlined,
  },
  {
    name: "Employees",
    link: "/hr/employees",
    icon: TeamOutlined,
  },
  {
    name: "Attendance",
    link: "/hr/attendance",
    icon: ClockCircleOutlined,
  },
  {
    name: "Payroll",
    link: "/hr/payroll",
    icon: DollarOutlined,
  },
];

// Employee Sidebar Items
export const employeeSidebarItems = [
  {
    name: "Dashboard",
    link: "/employee/dashboard",
    icon: DashboardOutlined,
  },
  {
    name: "My Attendance",
    link: "/employee/attendance",
    icon: ClockCircleOutlined,
  },
  {
    name: "My Payslips",
    link: "/employee/payslips",
    icon: FileTextOutlined,
  },
];

export const getSidebarItems = (role) => {
  switch (role) {
    case "admin":
      return adminSidebarItems;
    case "hr":
      return hrSidebarItems;
    case "employee":
      return employeeSidebarItems;
    default:
      return adminSidebarItems;
  }
};

export const sidebarNavItems = adminSidebarItems;
