
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Task, Employee } from "@/lib/types";

const chartConfig = {
  tasks: {
    label: "Tasks Completed",
  },
} satisfies ChartConfig

interface TasksChartProps {
  tasks: Task[] | null;
  employees: Employee[] | null;
}

export function TasksChart({ tasks, employees }: TasksChartProps) {
  const chartData = useMemo(() => {
    if (!tasks || !employees) return [];

    const employeeMap = new Map(employees.map(emp => [emp.id, emp.name]));
    const tasksPerEmployee = tasks.reduce((acc, task) => {
      if (task.status === 'Completed') {
        const employeeName = employeeMap.get(task.assignedTo);
        if (employeeName) {
          if (!acc[employeeName]) {
            acc[employeeName] = 0;
          }
          acc[employeeName]++;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tasksPerEmployee).map(([employee, taskCount], index) => ({
      employee,
      tasks: taskCount,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }));

  }, [tasks, employees]);

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0}}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="employee"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="tasks" radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
