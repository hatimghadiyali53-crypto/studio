
"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
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
} from "lucide-react";
import type { Task, InventoryItem, Employee } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const employeesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'employees');
  }, [firestore, user]);
  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'tasks');
  }, [firestore, user]);
  const inventoryQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'inventoryItems');
  }, [firestore, user]);

  const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesQuery);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);
  const { data: inventory, isLoading: inventoryLoading } = useCollection<InventoryItem>(inventoryQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const kpiData = useMemo(() => {
    const totalEmployees = employees?.length ?? 0;
    const completedTasks = tasks?.filter(t => t.status === 'Completed').length ?? 0;
    const totalTasks = tasks?.length ?? 0;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const lowStockItemsCount = inventory?.filter(i => i.inStock <= i.lowThreshold).length ?? 0;

    return [
      {
        title: "Total Employees",
        value: totalEmployees.toString(),
        icon: <Users className="h-6 w-6 text-muted-foreground" />,
        description: "From the start of time",
        isLoading: employeesLoading,
      },
      {
        title: "Tasks Completed",
        value: `${completionPercentage}%`,
        icon: <ClipboardCheck className="h-6 w-6 text-muted-foreground" />,
        description: `Completed: ${completedTasks} of ${totalTasks}`,
        isLoading: tasksLoading,
      },
      {
        title: "Low Stock Items",
        value: lowStockItemsCount.toString(),
        icon: <Package className="h-6 w-6 text-muted-foreground" />,
        description: "Items needing reorder",
        isLoading: inventoryLoading,
      },
    ];
  }, [employees, tasks, inventory, employeesLoading, tasksLoading, inventoryLoading]);

  const lowStockItems = useMemo(() => {
    if (!inventory) return [];
    return inventory.filter(i => i.inStock <= i.lowThreshold);
  }, [inventory]);

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
              {kpi.isLoading ? (
                <>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="mt-1 h-4 w-3/4" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {kpi.description}
                  </p>
                </>
              )}
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
            {(tasksLoading || employeesLoading) ? <Skeleton className="h-[250px] w-full" /> : <TasksChart tasks={tasks} employees={employees} />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
            <CardDescription>Items that are currently low in stock.</CardDescription>
          </CardHeader>
          <CardContent>
             {inventoryLoading ? (
               <div className="space-y-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
               </div>
             ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flavor</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">{`${item.inStock} ${item.unit}`}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                     {lowStockItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No low stock items.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
             )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
