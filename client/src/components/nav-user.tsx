import {
    IconDotsVertical,
    IconLogout,
    IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import { authClient } from "@/utils/auth";
import { Spinner } from "./ui/spinner";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function NavUser() {
    const { isMobile } = useSidebar();
    const { signOut, signOutError, signOutLoading } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const response = await authClient.getSession();
                if (response.data?.user) {
                    setUser(response.data.user);
                    setRole((response.data.user as any)?.role || "");
                } else {
                    setUser(null);
                    setRole("");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUser(null);
                setRole("");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (signOutError) {
            toast.error(signOutError.message || "Logout failed");
        }
    }, [signOutError]);

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case "admin":
                return "Administrator";
            case "employee":
                return "Employee";
            case "media-handler":
                return "Media Handler";
            default:
                return "User";
        }
    };

    if (!user || isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                        <Avatar className="h-8 w-8 rounded-lg grayscale">
                            <AvatarFallback className="rounded-lg">
                                U
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                                <Spinner /> Loading...
                            </span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback className="rounded-lg">
                                    {(user.name || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {user.name || "User"}
                                </span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {getRoleDisplayName(role)}
                                </span>
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        src={user.image}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {(user.name || "U")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.name || "User"}
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {user.email || "user@example.com"}
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs font-medium">
                                        {getRoleDisplayName(role)}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <IconUserCircle />
                            Account
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            disabled={signOutLoading}
                            onClick={signOut}
                        >
                            {signOutLoading ? <Spinner /> : <IconLogout />}
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
