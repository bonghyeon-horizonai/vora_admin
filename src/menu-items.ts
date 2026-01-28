import { MenuItem } from "@/types";

export const leftMenuItems: MenuItem[] = [
  {
    id: "home",
    icon: "NiHome",
    label: "menu-home",
    description: "menu-home-description",
    color: "text-primary",
    href: "/home",
    children: [
      {
        id: "home-sub",
        icon: "NiChartPie",
        label: "menu-home-sub",
        href: "/home/sub",
        description: "menu-home-sub-description",
      },
    ],
  },
  {
    id: "products",
    icon: "NiInbox",
    label: "menu-products",
    description: "menu-products-description",
    color: "text-primary",
    href: "/products",
    children: [
      {
        id: "products-list",
        icon: "NiList",
        label: "menu-products-list",
        href: "/products/list",
        description: "menu-products-list-description",
      },
      {
        id: "tools",
        icon: "NiSettings",
        label: "menu-tools",
        href: "/products/tools",
        description: "menu-tools-description",
      },
    ],
  },
  {
    id: "single-menu",
    icon: "NiDocumentFull",
    label: "menu-single-menu",
    color: "text-primary",
    href: "/single-menu",
  },
  {
    id: "external-link",
    icon: "NiArrowUpRightSquare",
    label: "menu-external-link",
    color: "text-primary",
    href: "http://themeforest.net/item/gogo-next/23160320",
    isExternalLink: true,
  },
];

export const leftMenuBottomItems: MenuItem[] = [
  { id: "settings", label: "menu-settings", href: "/settings", icon: "NiSettings" },
];
