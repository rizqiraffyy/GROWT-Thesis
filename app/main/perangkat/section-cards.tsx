import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDeviceStats } from "./data/logs"; // ⬅️ sesuaikan path kalau beda

// ---------- Helpers formatting ----------

function formatInt(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "–";
  return value.toLocaleString("id-ID");
}

// ---------- Component ----------

export async function SectionCards() {
  const { totalDevices, activeDevices, pendingDevices, totalLogs } =
    await getDeviceStats();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-1 sm:gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-6 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
            {/* 1) Total Perangkat */}
            <Card
              className="@container/card p-2 px-0 sm:p-4 sm:px-0"
              data-slot="card"
            >
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Total Perangkat
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatInt(totalDevices)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Jumlah seluruh perangkat penimbangan yang terdaftar di akun Anda.
              </CardFooter>
            </Card>

            {/* 2) Perangkat Aktif */}
            <Card
              className="@container/card p-2 px-0 sm:p-4 sm:px-0"
              data-slot="card"
            >
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Perangkat Aktif
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatInt(activeDevices)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Perangkat yang aktif dan diizinkan mengirim log penimbangan.
              </CardFooter>
            </Card>

            {/* 3) Menunggu Persetujuan */}
            <Card
              className="@container/card p-2 px-0 sm:p-4 sm:px-0"
              data-slot="card"
            >
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Menunggu Persetujuan
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatInt(pendingDevices)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Perangkat yang diajukan oleh Anda, namun masih menunggu peninjauan Admin.
              </CardFooter>
            </Card>

            {/* 4) Total Log Penimbangan */}
            <Card
              className="@container/card p-2 px-0 sm:p-4 sm:px-0"
              data-slot="card"
            >
              <CardHeader>
                <CardDescription className="text-xs sm:text-base">
                  Total Log Penimbangan
                </CardDescription>
                <CardTitle className="text-lg sm:text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {formatInt(totalLogs)}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-0.5 sm:gap-1 text-[10px] sm:text-sm font-medium">
                Total catatan berat yang dihasilkan oleh perangkat ternak terdaftar Anda.
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
