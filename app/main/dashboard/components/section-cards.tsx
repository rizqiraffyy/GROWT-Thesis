import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardStats } from "./data-table/data/logs";

// ---------- Helpers formatting ----------

function formatNumber(value: number | null, fractionDigits = 1) {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatInt(value: number | null) {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toLocaleString("id-ID");
}

function formatDelta(value: number | null, suffix = "") {
  if (value == null || value === 0) return `0${suffix}`;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${suffix}`;
}

function formatPercent(value: number | null) {
  if (value == null || Number.isNaN(value)) return "0%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function getTrendIcon(value: number | null) {
  if (value == null || value === 0) return null;
  return value > 0 ? (
    <IconTrendingUp className="size-3.5" />
  ) : (
    <IconTrendingDown className="size-3.5" />
  );
}

// + hijau, - merah, 0/null kuning
function getDeltaColorClasses(value: number | null) {
  if (value == null || value === 0) {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }
  if (value > 0) {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
  return "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400";
}

// ---------- Component ----------

export async function SectionCards() {
  const {
    totalLivestock,
    totalLivestockDiff,
    totalLivestockPct,

    avgWeight,
    avgWeightDiff,
    avgWeightPct,

    stuckLossCount,
    stuckLossDiff,
    stuckLossPct,

    healthScoreCurrent,
    healthScorePrev,
  } = await getDashboardStats();

  const healthDelta =
    healthScoreCurrent != null && healthScorePrev != null
      ? healthScoreCurrent - healthScorePrev
      : null;

  return (
    <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-1 sm:gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-6 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      {/* 1) Total Ternak */}
      <Card className="@container/card p-2 px-0 sm:p-4 sm:px-0" data-slot="card">
        <CardHeader>
          <CardDescription className="text-xs sm:text-base">
            Total Ternak
          </CardDescription>
          <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatInt(totalLivestock)}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 border px-1.5 py-0.5 text-[10px] sm:text-xs font-medium tabular-nums",
                getDeltaColorClasses(totalLivestockPct)
              )}
            >
              {getTrendIcon(totalLivestockPct)}
              <span>{formatPercent(totalLivestockPct)}</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium tabular-nums">
          <div className="flex items-center gap-1 font-medium">
            Perubahan vs bulan lalu:
            <span className="tabular-nums text-xs text-muted-foreground">
              {formatDelta(totalLivestockDiff)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Jumlah ternak Anda dengan RFID yang teregistrasi di database.
          </div>
        </CardFooter>
      </Card>

      {/* 2) Rata-rata Berat */}
      <Card className="@container/card p-2 px-0 sm:p-4 sm:px-0" data-slot="card">
        <CardHeader>
          <CardDescription className="text-xs sm:text-base">
            Rata-rata Berat
          </CardDescription>
          <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {avgWeight != null ? `${formatNumber(avgWeight, 1)} kg` : "–"}
          </CardTitle>
          <CardAction>
            {avgWeightPct != null ? (
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-1 border px-1.5 py-0.5 text-[10px] sm:text-xs font-medium tabular-nums",
                  getDeltaColorClasses(avgWeightPct)
                )}
              >
                {getTrendIcon(avgWeightPct)}
                <span>{formatPercent(avgWeightPct)}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="flex items-center gap-1 border px-1.5 py-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground"
              >
                <span>-</span>
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium tabular-nums">
          <div className="flex items-center gap-1 font-medium">
            Perubahan vs bulan lalu:
            <span className="tabular-nums text-xs text-muted-foreground">
              {avgWeightDiff != null
                ? formatDelta(Number(avgWeightDiff.toFixed(1)), " kg")
                : "–"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Rata-rata berat ternak yang tercatat pada bulan terbaru.
          </div>
        </CardFooter>
      </Card>

      {/* 3) Berat Stagnan & Turun */}
      <Card className="@container/card p-2 px-0 sm:p-4 sm:px-0" data-slot="card">
        <CardHeader>
          <CardDescription className="text-xs sm:text-base">
            Berat Stagnan &amp; Turun
          </CardDescription>
          <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatInt(stuckLossCount)}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 border px-1.5 py-0.5 text-[10px] sm:text-xs font-medium tabular-nums",
                getDeltaColorClasses(stuckLossPct)
              )}
            >
              {getTrendIcon(stuckLossPct)}
              <span>{formatPercent(stuckLossPct)}</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium tabular-nums">
          <div className="flex items-center gap-1 font-medium">
            Perubahan vs bulan lalu:
            <span className="tabular-nums text-xs text-muted-foreground">
              {formatDelta(stuckLossDiff)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Jumlah ternak dengan berat stagnan dan turun dibanding penimbangan sebelumnya.
          </div>
        </CardFooter>
      </Card>

      {/* 4) Skor Kesehatan */}
      <Card className="@container/card p-2 px-0 sm:p-4 sm:px-0" data-slot="card">
        <CardHeader>
          <CardDescription className="text-xs sm:text-base">
            Skor Pertumbuhan
          </CardDescription>
          <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {healthScoreCurrent != null ? healthScoreCurrent : "–"}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 border px-1.5 py-0.5 text-[10px] sm:text-xs font-medium tabular-nums",
                getDeltaColorClasses(healthDelta)
              )}
            >
              {getTrendIcon(healthDelta)}
              <span>{formatDelta(healthDelta, "%")}</span>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium tabular-nums">
          <div className="flex items-center gap-1 font-medium">
            Kondisi pertumbuhan peternakan
          </div>
          <div className="text-xs text-muted-foreground">
            Skor 0–100 berdasarkan proporsi pertumbuhan dan
            penurunan ternak.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
