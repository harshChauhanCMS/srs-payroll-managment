import { Dashboard, People } from "@mui/icons-material";

export const sidebarHeading = "SRS";

export const adminSidebarItems = [
  {
    name: "Dashboard",
    link: "/admin/dashboard",
    icon: Dashboard,
  },
  {
    name: "All Users",
    link: "/admin/all",
    icon: People,
  },
  // {
  //   name: "Subscription Management",
  //   link: "/admin/subscription-management",
  //   icon: ProjectOutlined,
  //   children: [
  //     {
  //       name: "Subscriptions",
  //       link: "/admin/subscription-management/subscriptions",
  //     },
  //     {
  //       name: "User Subscriptions",
  //       link: "/admin/subscription-management/user-subscriptions",
  //     },
  //   ],
  // },
];

export const getSidebarItems = (userType) => {
  switch (userType) {
    case "admin":
      return adminSidebarItems;
    default:
      return adminSidebarItems;
  }
};

export const sidebarNavItems = adminSidebarItems;
