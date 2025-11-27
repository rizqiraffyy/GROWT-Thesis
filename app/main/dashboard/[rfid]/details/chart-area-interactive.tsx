"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { Task } from "./data/schema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";

type LivestockWeightChartProps = {
  data: Task[]; // hasil getTasks(rfid)
};

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function LivestockWeightChart({ data }: LivestockWeightChartProps) {
  const isMobile = useIsMobile();

  // map Task[] → data untuk chart
  const chartData = React.useMemo(
    () =>
      (data ?? []).map((item) => {
        const date = item.weight_created_at
          ? new Date(item.weight_created_at)
          : null;

        return {
          // contoh label: "05 Jan"
          label: date
            ? date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })
            : "",
          weight: item.weight ?? null,
        };
      }),
    [data]
  );

  const hasData = chartData.length > 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
          <div>
            <CardTitle>Weight Trend</CardTitle>
            <CardDescription>
              Recorded body weight over time for this livestock.
            </CardDescription>
          </div>
          <CardAction className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center text-xs text-muted-foreground">
            {isMobile ? "Swipe the chart to explore" : "Hover a point to see details"}
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {!hasData ? (
          <div className="flex h-[220px] items-center justify-center text-xs text-muted-foreground">
            No weight records available for this livestock yet.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[260px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-weight)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-weight)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={isMobile ? 40 : 60}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />

              <Area
                dataKey="weight"
                name="Weight (kg)"
                type="natural"
                fill="url(#fillWeight)"
                stroke="var(--color-weight)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
