
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { TasksChart } from "@/components/dashboard/tasks-chart";
import {
  Users,
  ClipboardCheck,
  Package,
  ArrowRightLeft,
  UserPlus,
} from "lucide-react";

const kpiData = [
  {
    title: "Total Employees",
    value: "12",
    icon: <Users className="h-6 w-6 text-muted-foreground" />,
    description: "2 new employees joined this month",
  },
  {
    title: "Tasks Completed",
    value: "86%",
    icon: <ClipboardCheck className="h-6 w-6 text-muted-foreground" />,
    description: "Highest completion rate this quarter",
  },
  {
    title: "Low Stock Items",
    value: "3",
    icon: <Package className="h-6 w-6 text-muted-foreground" />,
    description: "Vanilla, Chocolate, Strawberry",
  },
];

const lowStockItems = [
  { name: "Vanilla Bean", stock: 8, unit: "Tubs" },
  { name: "Chocolate Fudge", stock: 5, unit: "Tubs" },
  { name: "Strawberry Bliss", stock: 9, unit: "Tubs" },
];

const recentActivities = [
  {
    icon: <ArrowRightLeft className="h-5 w-5" />,
    description: "Shift swap approved: Alice for Bob on 2024-08-05",
    time: "15m ago",
  },
  {
    icon: <ClipboardCheck className="h-5 w-5" />,
    description: "Task completed: 'Deep clean freezers' by Charlie",
    time: "1h ago",
  },
  {
    icon: <UserPlus className="h-5 w-5" />,
    description: "New employee onboarded: Diana",
    time: "3h ago",
  },
    {
    icon: <Package className="h-5 w-5" />,
    description: "New stock added: 20 tubs of 'Mint Chip'",
    time: "1d ago",
  },
];

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    )
  }

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Task Completion Overview</CardTitle>
            <CardDescription>
              Weekly completed tasks by employees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TasksChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
            <CardDescription>Items that are currently low in stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flavor</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">{`${item.stock} ${item.unit}`}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
       <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </>
  );
}
