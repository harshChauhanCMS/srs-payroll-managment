import {
  AppstoreOutlined,
  DashboardOutlined,
  TeamOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ClusterOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const sidebarHeading = "SRS Payroll";

// Admin Sidebar Items (with List / Add / Edit / View where applicable)
export const adminSidebarItems = [
  {
    name: "Dashboard",
    link: "/admin/dashboard",
    icon: AppstoreOutlined,
  },
  {
    name: "User & Roles",
    link: "/admin/user-and-role-management",
    icon: TeamOutlined,
    children: [
      { name: "List", link: "/admin/user-and-role-management" },
      { name: "Add", link: "/admin/user-and-role-management/add" },
    ],
  },
  {
    name: "Company",
    link: "/admin/company",
    icon: BankOutlined,
    children: [
      { name: "List", link: "/admin/company" },
      { name: "Add", link: "/admin/company/add" },
    ],
  },
  {
    name: "Site",
    link: "/admin/site",
    icon: EnvironmentOutlined,
    children: [
      { name: "List", link: "/admin/site" },
      { name: "Add", link: "/admin/site/add" },
    ],
  },
  {
    name: "Department",
    link: "/admin/department",
    icon: ClusterOutlined,
    children: [
      { name: "List", link: "/admin/department" },
      { name: "Add", link: "/admin/department/add" },
    ],
  },
];

// HR Sidebar Items (List, Add, Edit, View under /hr)
export const hrSidebarItems = [
  {
    name: "Dashboard",
    link: "/hr/dashboard",
    icon: DashboardOutlined,
  },
  {
    name: "User & Roles",
    link: "/hr/user-and-role-management",
    icon: TeamOutlined,
    children: [
      { name: "List", link: "/hr/user-and-role-management" },
      { name: "Add", link: "/hr/user-and-role-management/add" },
    ],
  },
  {
    name: "Company",
    link: "/hr/company",
    icon: BankOutlined,
    children: [
      { name: "List", link: "/hr/company" },
      { name: "Add", link: "/hr/company/add" },
    ],
  },
  {
    name: "Site",
    link: "/hr/site",
    icon: EnvironmentOutlined,
    children: [
      { name: "List", link: "/hr/site" },
      { name: "Add", link: "/hr/site/add" },
    ],
  },
  {
    name: "Department",
    link: "/hr/department",
    icon: ClusterOutlined,
    children: [
      { name: "List", link: "/hr/department" },
      { name: "Add", link: "/hr/department/add" },
    ],
  },
];

// Employee Sidebar Items (Dashboard + Profile view/edit)
export const employeeSidebarItems = [
  {
    name: "Dashboard",
    link: "/employee/dashboard",
    icon: DashboardOutlined,
  },
  {
    name: "My Profile",
    link: "/employee/profile",
    icon: UserOutlined,
    children: [
      { name: "View", link: "/employee/profile/view" },
      { name: "Edit", link: "/employee/profile/edit" },
    ],
  },
];

export const getSidebarItems = (role) => {
  switch (role) {
    case "admin":
    case "super_admin":
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
