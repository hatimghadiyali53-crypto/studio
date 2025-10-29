"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { employee: "Alice", tasks: 18, fill: "hsl(var(--chart-1))" },
  { employee: "Bob", tasks: 15, fill: "hsl(var(--chart-2))" },
  { employee: "Charlie", tasks: 20, fill: "hsl(var(--chart-3))" },
  { employee: "Diana", tasks: 12, fill: "hsl(var(--chart-4))" },
  { employee: "Eve", tasks: 10, fill: "hsl(var(--chart-1))" },
  { employee: "Frank", tasks: 17, fill: "hsl(var(--chart-2))" },
]

const chartConfig = {
  tasks: {
    label: "Tasks Completed",
  },
} satisfies ChartConfig

export function TasksChart() {
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
