
"use client";

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
import { inventory, tasks, employees } from "@/lib/data";

const inventoryConsumptionData = inventory
  .filter(item => item.category === "Ice Cream")
  .map(item => ({
    name: item.name,
    consumed: (20 - item.inStock) * 10, // Mock consumption
    fill: `hsl(var(--chart-${Math.floor(Math.random() * 5) + 1}))`
  }));

const inventoryChartConfig = {
  consumed: {
    label: "Units Consumed",
  },
} satisfies ChartConfig;

const taskStatusData = tasks.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
        acc[status] = { name: status, value: 0, fill: '' };
    }
    acc[status].value++;
    return acc;
}, {} as { [key: string]: { name: string; value: number, fill: string } });

const taskStatusChartData = Object.values(taskStatusData).map((item, index) => ({
    ...item,
    fill: item.name === 'Completed' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'
}));


const taskStatusChartConfig = {
  tasks: {
    label: "Tasks",
  },
} satisfies ChartConfig;


const employeeTaskData = employees.map(emp => ({
    name: emp.name,
    tasks: tasks.filter(t => t.assignedTo === emp.id).length,
    fill: `hsl(var(--chart-${Math.floor(Math.random() * 5) + 1}))`
}));

const employeeTaskChartConfig = {
  tasks: {
    label: "Assigned Tasks",
  },
} satisfies ChartConfig;


export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Analyze your shop's performance with these reports."
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Consumption</CardTitle>
            <CardDescription>
              Consumption of ice cream flavors in the last 30 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Rate</CardTitle>
              <CardDescription>
                Overview of pending vs. completed tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
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
                    data={taskStatusChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {taskStatusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-mt-4"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Employee Task Distribution</CardTitle>
              <CardDescription>
                Number of tasks assigned to each employee.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
