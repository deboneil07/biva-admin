import * as React from "react";
import {
    IconChartBar,
    IconDashboard,
    IconFolder,
    IconInnerShadowTop,
    IconUsers,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { authClient } from "@/utils/auth";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const getNavItems = (role: string) => {
    const baseItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
    ];

    if (role === "admin") {
        return [
            ...baseItems,
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
                ],
            },
        ];
    }

    if (role === "employee") {
        return [
            ...baseItems,
            {
                title: "Hotel",
                url: "#",
                icon: IconChartBar,
                items: [
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
                        title: "Food Court Bookings",
                        url: "/foodcourt/bookings",
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
                ],
            },
        ];
    }

    if (role === "media-handler") {
        return [
            ...baseItems,
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
        ];
    }

    return baseItems;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [role, setRole] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUserRole = async () => {
            try {
                setIsLoading(true);
                const response = await authClient.getSession();
                const userRole = (response.data?.user as any)?.role || "";
                setRole(userRole);
            } catch (error) {
                console.error("Error fetching user role:", error);
                setRole("");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    const navItems = getNavItems(role);

    if (isLoading) {
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
                                    <span className="text-base font-semibold">
                                        The Biva
                                    </span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <div className="flex items-center justify-center p-4">
                        Loading...
                    </div>
                </SidebarContent>
                <SidebarFooter>
                    <NavUser />
                </SidebarFooter>
            </Sidebar>
        );
    }

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
                                <span className="text-base font-semibold">
                                    The Biva
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
