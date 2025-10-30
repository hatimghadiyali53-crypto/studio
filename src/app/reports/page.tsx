
"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Employee, Task, InventoryItem } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";


export default function ReportsPage() {
  const firestore = useFirestore();

  const employeesQuery = useMemoFirebase(() => collection(firestore, 'employees'), [firestore]);
  const tasksQuery = useMemoFirebase(() => collection(firestore, 'tasks'), [firestore]);
  const inventoryQuery = useMemoFirebase(() => collection(firestore, 'inventoryItems'), [firestore]);

  const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesQuery);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);
  const { data: inventory, isLoading: inventoryLoading } = useCollection<InventoryItem>(inventoryQuery);

  const inventoryConsumptionData = useMemo(() => {
    if (!inventory) return [];
    return inventory
        .filter(item => item.category === "Ice Cream")
        .map(item => ({
            name: item.name,
            consumed: Math.max(0, 20 - item.inStock) * 10, // Mock consumption
            fill: `hsl(var(--chart-${(item.name.length % 5) + 1}))`
        }));
  }, [inventory]);

  const taskStatusData = useMemo(() => {
    if(!tasks) return [];
    const statusCounts = tasks.reduce((acc, task) => {
        const status = task.status;
        if (!acc[status]) {
            acc[status] = { name: status, value: 0, fill: '' };
        }
        acc[status].value++;
        return acc;
    }, {} as { [key: string]: { name: string; value: number, fill: string } });

    return Object.values(statusCounts).map((item, index) => ({
        ...item,
        fill: item.name === 'Completed' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'
    }));
  }, [tasks]);

  const employeeTaskData = useMemo(() => {
    if (!employees || !tasks) return [];
    return employees.map(emp => ({
        name: emp.name,
        tasks: tasks.filter(t => t.assignedTo === emp.id).length,
        fill: `hsl(var(--chart-${(emp.name.length % 5) + 1}))`
    }));
  }, [employees, tasks]);


  const inventoryChartConfig = {
    consumed: {
      label: "Units Consumed",
    },
  } satisfies ChartConfig;

  const taskStatusChartConfig = {
    tasks: {
      label: "Tasks",
    },
  } satisfies ChartConfig;

  const employeeTaskChartConfig = {
    tasks: {
      label: "Assigned Tasks",
    },
  } satisfies ChartConfig;

  const handleExport = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
      return;
    }
    const dataToExport = data.map(({ fill, ...rest }) => rest);
    
    const headers = Object.keys(dataToExport[0]);
    const csvRows = [headers.join(",")];

    dataToExport.forEach(item => {
      const row = headers.map(header => {
        let value = item[header];
        if (typeof value === 'string') {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <PageHeader
        title="Reports"
        description="Analyze your shop's performance with these reports."
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Inventory Consumption</CardTitle>
                <CardDescription>
                Consumption of ice cream flavors in the last 30 days.
                </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => handleExport(inventoryConsumptionData, "inventory-consumption")}>
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? <Skeleton className="h-[300px] w-full" /> : (
                <ChartContainer config={inventoryChartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={inventoryConsumptionData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="consumed" radius={8} />
                </BarChart>
                </ChartContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Task Completion Rate</CardTitle>
                    <CardDescription>
                        Overview of pending vs. completed tasks.
                    </CardDescription>
                </div>
                 <Button variant="outline" size="sm" onClick={() => handleExport(taskStatusData, "task-completion-rate")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </CardHeader>
            <CardContent className="flex justify-center">
              {tasksLoading ? <Skeleton className="h-[250px] w-[250px] rounded-full" /> : (
                <ChartContainer
                    config={taskStatusChartConfig}
                    className="h-[250px] w-full"
                >
                    <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={taskStatusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                        {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-mt-4"
                    />
                    </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Employee Task Distribution</CardTitle>
                    <CardDescription>
                        Number of tasks assigned to each employee.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport(employeeTaskData, "employee-task-distribution")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </CardHeader>
            <CardContent>
                {(employeesLoading || tasksLoading) ? <Skeleton className="h-[250px] w-full" /> : (
                    <ChartContainer config={employeeTaskChartConfig} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={employeeTaskData} layout="vertical">
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                            />
                        <Bar dataKey="tasks" radius={5} layout="vertical" />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
