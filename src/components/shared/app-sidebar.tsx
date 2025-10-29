
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
  IceCream2,
  AreaChart,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/roster", label: "Roster", icon: CalendarDays },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/shift-swap", label: "Shift Swap", icon: ArrowRightLeft },
  { href: "/reports", label: "Reports", icon: AreaChart },
];

export function AppSidebar() {
  const pathname = usePathname();

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
