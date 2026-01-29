import { MenuItem } from "@/types";

export const leftMenuItems: MenuItem[] = [
  {
    id: "home",
    icon: "NiHome",
    label: "menu-home",
    description: "menu-home-description",
    color: "text-primary",
    href: "/home",
  },
  {
    id: "members",
    icon: "NiUsers",
    label: "menu-members",
    description: "menu-members-description",
    color: "text-primary",
    href: "/members",
    children: [
      {
        id: "members-list",
        label: "menu-members-list",
        href: "/members/list",
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
        id: "tools",
        label: "menu-tools",
        href: "/products/tools",
        description: "menu-tools-description",
      },
      {
        id: "products-list",
        label: "menu-products-list",
        href: "/products/list",
        description: "menu-products-list-description",
      },
    ],
  },
  {
    id: "admins",
    icon: "NiShield",
    label: "menu-admins",
    description: "menu-admins-description",
    color: "text-primary",
    href: "/admins",
    children: [
      {
        id: "admins-list",
        label: "menu-admins-list",
        href: "/admins/list",
      },
      {
        id: "admins-log",
        label: "menu-admins-log",
        href: "/admins/log",
      },
    ],
  },
  {
    id: "notices",
    icon: "NiAnnouncement",
    label: "menu-notices",
    description: "menu-notices-description",
    color: "text-primary",
    href: "/notices",
    children: [
      {
        id: "notices-list",
        label: "menu-notices-list",
        href: "/notices/list",
      },
    ],
  },
  {
    id: "events",
    icon: "NiCalendar",
    label: "menu-events",
    description: "menu-events-description",
    color: "text-primary",
    href: "/events",
    children: [
      {
        id: "events-banner",
        label: "menu-events-banner",
        href: "/events/banner",
      },
      {
        id: "events-video",
        label: "menu-events-video",
        href: "/events/video",
      },
    ],
  },
  {
    id: "invites",
    icon: "NiUserPlus",
    label: "menu-invites",
    description: "menu-invites-description",
    color: "text-primary",
    href: "/invites",
    children: [
      {
        id: "invites-list",
        label: "menu-invites-list",
        href: "/invites/list",
      },
    ],
  },
  {
    id: "settlements",
    icon: "NiChartBar",
    label: "menu-settlements",
    description: "menu-settlements-description",
    color: "text-primary",
    href: "/settlements",
    isExternalLink: true,
  },
  {
    id: "cs",
    icon: "NiHeadset",
    label: "menu-cs",
    description: "menu-cs-description",
    color: "text-primary",
    href: "/cs",
    isExternalLink: true,
  },
];

export const leftMenuBottomItems: MenuItem[] = [
  { id: "settings", label: "menu-settings", href: "/settings", icon: "NiSettings" },
];
