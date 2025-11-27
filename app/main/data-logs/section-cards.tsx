import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDataLogStats } from "./data/logs";

// ---------- Helpers formatting ----------

function formatNumber(value: number | null, fractionDigits = 1) {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatInt(value: number | null) {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toLocaleString("en-US");
}

// ---------- Component ----------

export async function SectionCards() {
  const { totalLogs, highestWeight, stuckLossCount, logsThisMonth } =
    await getDataLogStats();

  return (
  <div className="flex flex-1 flex-col">
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          {/* 1) Total Logs */}
          <Card className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>
                Total Logs
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {formatInt(totalLogs)}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              Total weight records you have submitted for your livestock.
            </CardFooter>
          </Card>

          {/* 2) Highest Recorded Weight */}
          <Card className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>
                Highest Recorded Weight
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {highestWeight != null
                  ? `${formatNumber(highestWeight, 1)} kg`
                  : "–"}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              Heaviest body weight ever recorded across all of your livestock logs.
            </CardFooter>
          </Card>

          {/* 3) Stuck & Loss Weight */}
          <Card className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>
                Stuck &amp; Loss Weight
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {formatInt(stuckLossCount)}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              Animals whose latest weighing is stable or lower than their previous weighing.
            </CardFooter>
          </Card>

          {/* 4) Logs This Month */}
          <Card className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>
                Logs This Month
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {formatInt(logsThisMonth)}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              Weight logs recorded in the current calendar month.
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  </div>
  );
}
