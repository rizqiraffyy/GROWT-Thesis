"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardMonthlyPoint } from "./data-table/data/logs";

type TimeRange = "3m" | "6m" | "12m" | "18m" | "24m" | "all";
type ValueMode = "percent" | "raw";

const chartConfig = {
  totalLivestockPct: {
    label: "Total ternak",
    color: "var(--chart-1)",
  },
  avgWeightPct: {
    label: "Rata-rata berat",
    color: "var(--chart-2)",
  },
  stuckLossPct: {
    label: "Stagnan & turun",
    color: "var(--chart-3)",
  },
  healthScoreDelta: {
    label: "Skor kesehatan",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export const description = "Tren KPI ternak dari bulan ke bulan";

interface ChartAreaInteractiveProps {
  data: DashboardMonthlyPoint[];
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<TimeRange>("12m");
  const [valueMode, setValueMode] = React.useState<ValueMode>("percent");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("6m");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    if (timeRange === "all") return data;

    const months = Number(timeRange.replace("m", ""));
    if (!Number.isFinite(months) || months <= 0) return data;

    if (data.length <= months) return data;
    return data.slice(data.length - months);
  }, [data, timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
          <div>
            <CardTitle>Performa Peternakan</CardTitle>
            <CardDescription>
              Tren bulanan untuk total ternak, perkembangan berat dan skor pertumbuhan.
            </CardDescription>
          </div>

          <CardAction className="flex flex-row flex-wrap items-center justify-end gap-2">
            {/* Select: rentang waktu */}
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRange)}
            >
              <SelectTrigger
                size="sm"
                className="min-w-[130px] w-[130px] text-xs @[540px]/card:w-40 @[540px]/card:text-sm"
              >
                <SelectValue placeholder="Rentang waktu" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs @[540px]/card:text-sm">
                <SelectItem value="3m">3 bulan terakhir</SelectItem>
                <SelectItem value="6m">6 bulan terakhir</SelectItem>
                <SelectItem value="12m">12 bulan terakhir</SelectItem>
                <SelectItem value="18m">1,5 tahun terakhir</SelectItem>
                <SelectItem value="24m">2 tahun terakhir</SelectItem>
                <SelectItem value="all">Semua</SelectItem>
              </SelectContent>
            </Select>

            {/* Select: tipe nilai (nilai asli / %) */}
            <Select
              value={valueMode}
              onValueChange={(value) => setValueMode(value as ValueMode)}
            >
              <SelectTrigger
                size="sm"
                className="min-w-[130px] w-[130px] text-xs @[540px]/card:w-40 @[540px]/card:text-sm"
              >
                <SelectValue placeholder="Tipe nilai" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs @[540px]/card:text-sm">
                <SelectItem value="percent">Persentase</SelectItem>
                <SelectItem value="raw">Nilai asli</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-xs text-muted-foreground">
            Belum ada data untuk periode yang dipilih.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-totalLivestockPct)"
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-totalLivestockPct)"
                    stopOpacity={0.1}
                  />
                </linearGradient>

                <linearGradient id="fillAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-avgWeightPct)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-avgWeightPct)"
                    stopOpacity={0.1}
                  />
                </linearGradient>

                <linearGradient id="fillStuck" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-stuckLossPct)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-stuckLossPct)"
                    stopOpacity={0.1}
                  />
                </linearGradient>

                <linearGradient id="fillHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-healthScoreDelta)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-healthScoreDelta)"
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
                minTickGap={24}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) => {
                  if (valueMode === "percent") return `${Number(val).toFixed(0)}%`;
                  return Number(val).toFixed(0);
                }}
              />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />

              <Area
                dataKey={valueMode === "percent" ? "totalLivestockPct" : "totalLivestock"}
                name="Total ternak"
                type="natural"
                fill="url(#fillTotal)"
                stroke="var(--color-totalLivestockPct)"
                strokeWidth={2}
              />
              <Area
                dataKey={valueMode === "percent" ? "avgWeightPct" : "avgWeight"}
                name="Rata-rata berat"
                type="natural"
                fill="url(#fillAvg)"
                stroke="var(--color-avgWeightPct)"
                strokeWidth={2}
              />
              <Area
                dataKey={valueMode === "percent" ? "stuckLossPct" : "stuckLossCount"}
                name="Stagnan & turun"
                type="natural"
                fill="url(#fillStuck)"
                stroke="var(--color-stuckLossPct)"
                strokeWidth={2}
              />
              <Area
                dataKey={valueMode === "percent" ? "healthScoreDelta" : "healthScore"}
                name="Skor kesehatan"
                type="natural"
                fill="url(#fillHealth)"
                stroke="var(--color-healthScoreDelta)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
