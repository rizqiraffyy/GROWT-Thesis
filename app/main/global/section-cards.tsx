import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGlobalStats } from "./data/logs";

// ---------- Helpers ----------

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

export async function GlobalSectionCards() {
  const {
    totalSharedLivestock,
    globalAvgWeight,
    highestRecordedWeight,
    totalLogs,
  } = await getGlobalStats();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-1 sm:gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-6 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
            {/* 1) Total Shared Livestock */}
            <Card className="@container/card p-2 px-0 sm:p-4 sm:px-0" data-slot="card">
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Total Shared Livestock
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatInt(totalSharedLivestock)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Livestock that farmers have chosen to share publicly on the platform.
              </CardFooter>
            </Card>

            {/* 2) Global Average Weight */}
            <Card className="@container/card p-2 px-0 sm:p-4 sm:px-0" data-slot="card">
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Global Average Weight
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {globalAvgWeight != null
                    ? `${formatNumber(globalAvgWeight, 1)} kg`
                    : "–"}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Overall average weight across all shared livestock.
              </CardFooter>
            </Card>

            {/* 3) Highest Recorded Weight */}
            <Card className="@container/card p-2 px-0 sm:p-4 sm:px-0" data-slot="card">
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Highest Recorded Weight
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {highestRecordedWeight != null
                    ? `${formatNumber(highestRecordedWeight, 1)} kg`
                    : "–"}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Heaviest body weight ever recorded in shared livestock data.
              </CardFooter>
            </Card>

            {/* 4) Total Logs Submitted */}
            <Card className="@container/card p-2 px-0 sm:p-4 sm:px-0" data-slot="card">
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Total Logs Submitted
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatInt(totalLogs)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                All weight records recorded for shared livestock.
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
