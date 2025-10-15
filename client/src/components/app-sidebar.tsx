import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Team",
      url: "/team",
      icon: IconUsers,
    },
    {
      title: "Gallery",
      url: "/gallery",
      icon: IconFolder,
    },
    {
      title: "Hotel",
      url: "#",
      icon: IconChartBar,
      items: [
        {
          title: "Hotel Media",
          url: "/hotel/media",
        },
        {
          title: "Add Room",
          url: "/hotel/rooms",
        },
        {
          title: "Bookings",
          url: "/hotel/bookings",
        },
      ],
    },
    {
      title: "Food Court",
      url: "#",
      icon: IconChartBar,
      items: [
        {
          title: "Food Court Media",
          url: "/foodcourt/media",
        },
        {
          title: "Food Court Bookings",
          url: "/foodcourt/bookings",
        },
      ],
    },
    {
      title: "Bakery",
      url: "#",
      icon: IconFolder,
      items: [
        {
          title: "Bakery Media",
          url: "/bakery/media",
        },
      ],
    },
    {
      title: "Events",
      url: "#",
      icon: IconFolder,
      items: [
        {
          title: "Add Event",
          url: "/events",
        },
        {
          title: "Bookings",
          url: "/foodcourt/event/bookings",
        },
      ]

    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">The Biva</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
