
"use client";

import { usePathname } from "next/navigation";
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Warehouse,
  ClipboardList,
  ArrowRightLeft,
  AreaChart,
  CalendarCheck,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/roster", label: "Roster", icon: CalendarDays },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/shift-swap", label: "Shift Swap", icon: ArrowRightLeft },
  { href: "/reports", label: "Reports", icon: AreaChart },
];

const BaskinRobbinsLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#0073C0"/>
        <path d="M25 30H45V45C35 45 30 50 30 55V70H25V30Z" fill="#D81B60"/>
        <path d="M55 30H75V70H55V60C55 55 60 50 65 45C70 40 65 35 60 35H55V30Z" fill="#D81B60"/>
        <path d="M35 50C40 45 45 45 50 50V70H35V50Z" fill="#FFFFFF"/>
        <path d="M65 50C60 45 55 45 50 50V70H65V50Z" fill="#FFFFFF"/>
    </svg>
)

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <BaskinRobbinsLogo />
          <span className="font-headline text-lg font-bold">ScoopSmart</span>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
             <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                    as="a"
                    isActive={pathname === item.href}
                    tooltip={{
                    children: item.label,
                    className: "bg-primary text-primary-foreground",
                    }}
                >
                    <item.icon />
                    <span>{item.label}</span>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </Sidebar>
  );
}
