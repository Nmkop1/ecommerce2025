import { DashboardSidebarMenuInterface } from "@/lib/types";

export const adminDashboardSidebarOptions: DashboardSidebarMenuInterface[] = [
  // {
  //   label: "Dashboard",
  //   icon: "dashboard",
  //   link: "/dashboard/admin",
  // },
  // {
  //   label: "Stores",
  //   icon: "store",
  //   link: "/dashboard/admin/stores",
  // },
  {
    label: "Orders",
    icon: "box-list",
    link: "orders",
  },
  {
    label: "Categories",
    icon: "categories",
    link: "categories",
  },
  {
    label: "Sub-Categories",
    icon: "categories",
    link: "subCategories",
  },
  {
    label: "Offer Tags",
    icon: "offer",
    link: "offer-tags",
  },
  {
    label: "Coupons",
    icon: "coupon",
    link: "coupons",
  },
];

export const SellerDashboardSidebarOptions: DashboardSidebarMenuInterface[] = [
  {
    label: "Categories",
    icon: "categories",
    link: "categories",
  },
  {
    label: "Sub-Categories",
    icon: "categories",
    link: "subCategories",
  },
  {
    label: "Offer Tags",
    icon: "offer",
    link: "offer-tags",
  },
  {
    label: "Products",
    icon: "products",
    link: "products",
  },
  {
    label: "Orders",
    icon: "box-list",
    link: "orders",
  },
  {
    label: "Inventory",
    icon: "inventory",
    link: "inventory",
  },
  {
    label: "Coupons",
    icon: "coupon",
    link: "coupons",
  },
  {
    label: "Shipping",
    icon: "shipping",
    link: "shipping",
  },
  {
    label: "Settings",
    icon: "settings",
    link: "settings",
  },
];
