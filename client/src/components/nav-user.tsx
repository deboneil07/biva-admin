import { IconDotsVertical, IconLogout, IconUserCircle } from "@tabler/icons-react";

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
import { Spinner } from "./ui/spinner";
import { useEffect } from "react";
import { toast } from "sonner";

export function NavUser() {
  const { isMobile } = useSidebar();

  const {signOut, signOutError, signOutLoading, getSession, user, sessionLoading} = useAuth();

  useEffect(() => {
    getSession();
  }, []); 



  useEffect(() => {
    if (signOutError) {
      toast.error(signOutError.message || "Logout failed");
    }
  }, [signOutError]);

  if (!user || sessionLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Avatar className="h-8 w-8 rounded-lg grayscale">
              <AvatarFallback className="rounded-lg">U</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium"><Spinner/> Loading...</span>
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
                <AvatarImage src={user?.user?.image || user?.avatar} alt={user?.user?.name || user?.name} />
                <AvatarFallback className="rounded-lg">
                  {(user?.user?.name || user?.name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.user?.name || user?.name || 'User'}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.user?.email || user?.email || 'user@example.com'}
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
                  <AvatarImage src={user?.user?.image || user?.avatar} alt={user?.user?.name || user?.name} />
                  <AvatarFallback className="rounded-lg">
                    {(user?.user?.name || user?.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.user?.name || user?.name || 'User'}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.user?.email || user?.email || 'user@example.com'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator/>
              <DropdownMenuItem>
                <IconUserCircle/>
                  Account
              </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={signOutLoading}  onClick={signOut}>
             { signOutLoading ? <Spinner/> : <IconLogout /> }
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}



