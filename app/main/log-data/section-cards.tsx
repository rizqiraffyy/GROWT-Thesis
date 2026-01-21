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
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatInt(value: number | null) {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toLocaleString("id-ID");
}

// ---------- Component ----------

export async function SectionCards() {
  const { totalLogs, highestWeight, stuckLossCount, logsThisMonth } =
    await getDataLogStats();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-1 sm:gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-6 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
            {/* 1) Total Log */}
            <Card
              className="@container/card p-2 px-0 sm:p-4 sm:px-0"
              data-slot="card"
            >
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Total Catatan Penimbangan
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatInt(totalLogs)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Jumlah catatan penimbangan yang masuk untuk ternak Anda.
              </CardFooter>
            </Card>

            {/* 2) Berat Tertinggi Tercatat */}
            <Card
              className="@container/card p-2 px-0 sm:p-4 sm:px-0"
              data-slot="card"
            >
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Berat Tertinggi Tercatat
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {highestWeight != null
                    ? `${formatNumber(highestWeight, 1)} kg`
                    : "–"}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Rekor berat tertinggi yang tercatat dari seluruh log ternak Anda.
              </CardFooter>
            </Card>

            {/* 3) Berat Stagnan & Turun */}
            <Card
              className="@container/card p-2 px-0 sm:p-4 sm:px-0"
              data-slot="card"
            >
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Berat Stagnan &amp; Turun
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatInt(stuckLossCount)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Log dengan penimbangan stagnan dan menurun dibanding penimbangan sebelumnya.
              </CardFooter>
            </Card>

            {/* 4) Log Bulan Ini */}
            <Card
              className="@container/card p-2 px-0 sm:p-4 sm:px-0"
              data-slot="card"
            >
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Log Bulan Terbaru
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatInt(logsThisMonth)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Jumlah log berat yang tercatat pada bulan kalender berjalan.
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
