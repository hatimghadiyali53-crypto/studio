
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Warehouse,
  ClipboardList,
  ArrowRightLeft,
  IceCream2,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth, useUser } from "@/firebase";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/roster", label: "Roster", icon: CalendarDays },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/shift-swap", label: "Shift Swap", icon: ArrowRightLeft },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IceCream2 className="h-5 w-5" />
          </div>
          <span className="font-headline text-lg font-bold">ScoopSmart</span>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={{
                children: item.label,
                className: "bg-primary text-primary-foreground",
              }}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarSeparator />
      <SidebarFooter>
        {isUserLoading ? (
          <SidebarGroup>
            {/* You can add a skeleton loader here */}
          </SidebarGroup>
        ) : user ? (
          <SidebarGroup>
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip={{children: "User Profile"}} asChild>
                        <Link href="#">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={user.photoURL || undefined} alt="User" />
                                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{user.displayName || user.email}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        ) : null}
        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip={{
                  children: "Logout",
                  className: "bg-primary text-primary-foreground",
                }}
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                asChild
                tooltip={{
                  children: "Login",
                  className: "bg-primary text-primary-foreground",
                }}
              >
                <Link href="/login">
                  <LogIn />
                  <span>Login</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
