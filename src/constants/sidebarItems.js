import {
  AppstoreOutlined,
  ContactsOutlined,
  HomeOutlined,
  ProjectOutlined,
  CrownOutlined,
  ShopOutlined,
  FileTextOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import {
  Camera,
  ClipboardCheck,
  LayoutDashboard,
  Rss,
  Scale,
  User,
  Users,
  Bell,
} from "lucide-react";

export const sidebarHeading = "VAKEEL AT HOME";

// Admin Sidebar Items
export const adminSidebarItems = [
  {
    name: "Dashboard",
    link: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "All Users",
    link: "/admin/all",
    icon: Users,
  },
  {
    name: "Lawyers",
    link: "/admin/lawyers-list",
    icon: Scale,
  },
  {
    name: "Clerks",
    link: "/admin/clerks-list",
    icon: Scale,
  },
  {
    name: "Public",
    link: "/admin/public-list",
    icon: User,
  },
  {
    name: "Blogs",
    link: "/admin/blogs",
    icon: Rss,
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
  {
    name: "Ask Me Anything",
    link: "/admin/ask-me-anything",
    icon: ClipboardCheck,
  },
  {
    name: "VAH Gram",
    link: "/admin/vah-gram",
    icon: Camera,
  },
  {
    name: "Send Notification",
    link: "/admin/send-notification",
    icon: Bell,
  },
  // {
  //   name: "Reviews Management",
  //   link: "/admin/reviews-management",
  //   icon: ProjectOutlined,
  // },
  // {
  //   name: "Customer Management",
  //   link: "/admin/customer-management",
  //   icon: CrownOutlined,
  // },
];

// Vendor Sidebar Items
export const vendorSidebarItems = [
  {
    name: "Dashboard",
    link: "/vendor/dashboard",
    icon: AppstoreOutlined,
  },
  {
    name: "Businesses",
    link: "/vendor/businesses",
    icon: ShopOutlined,
    children: [
      { name: "Business 1", link: "/vendor/businesses/businesses-details" },
      { name: "Add Business", link: "/vendor/businesses/add-businesses" },
    ],
  },
  {
    name: "My RFQ Request",
    link: "/vendor/rfq-requests",
    icon: FileTextOutlined,
  },
  {
    name: "View Quotations",
    link: "/vendor/view-quotations",
    icon: FileSearchOutlined,
  },
  {
    name: "Projects",
    link: "/vendor/projects",
    icon: ProjectOutlined,
  },
  {
    name: "Reviews",
    link: "/vendor/reviews",
    icon: ProjectOutlined,
  },
];

// Buyer / User Sidebar Items
export const buyerSidebarItems = [
  // {
  //   name: "Dashboard",
  //   link: "/user/dashboard",
  //   icon: AppstoreOutlined,
  // },
  {
    name: "Directory",
    link: "/user/directory",
    icon: ContactsOutlined,
  },
  {
    name: "My Properties",
    link: "/user/my-properties",
    icon: HomeOutlined,
    children: [
      { name: "All Properties", link: "/user/my-properties/all-properties" },
      { name: "Add Property", link: "/user/my-properties/add-property" },
      {
        name: "Add Organization",
        link: "/user/my-properties/add-organization",
      },
    ],
  },
  {
    name: "Projects",
    link: "/user/projects",
    icon: ProjectOutlined,
    children: [
      { name: "All Projects", link: "/user/projects" },
      { name: "Create Project", link: "/user/projects/create-project" },
    ],
  },
  {
    name: "My Subscriptions",
    link: "/user/my-subscriptions",
    icon: CrownOutlined,
    children: [
      { name: "All Subscriptions", link: "/user/my-subscriptions" },
      {
        name: "Subscription Details",
        link: "/user/my-subscriptions/subscriptions",
      },
    ],
  },
  {
    name: "Businesses",
    link: "/user/businesses",
    icon: ShopOutlined,
  },
  {
    name: "View Quotations",
    link: "/user/view-quotations",
    icon: FileSearchOutlined,
  },
  // {
  //   name: "Wishlist",
  //   link: "/user/wishlist",
  //   icon: HeartOutlined,
  // },
  // {
  //   name: "Purchase History",
  //   link: "/user/purchase-history",
  //   icon: HistoryOutlined,
  // },
  // {
  //   name: "Saved Searches",
  //   link: "/user/saved-searches",
  //   icon: SearchOutlined,
  // },
];

export const getSidebarItems = (userType) => {
  switch (userType) {
    case "admin":
      return adminSidebarItems;
    case "vendor":
      return vendorSidebarItems;
    case "customer":
      return buyerSidebarItems;
    default:
      return adminSidebarItems;
  }
};

export const sidebarNavItems = adminSidebarItems;
