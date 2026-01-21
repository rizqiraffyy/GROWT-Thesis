// app/main/dashboard/[rfid]/details/page.tsx

import { notFound } from "next/navigation";
import { getTasks } from "./data/logs";

import LivestockShowCard from "./show-livestock";
import LivestockWeightChart from "./chart-area-interactive";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default async function DetailPage({
  params,
}: {
  // ⬅️ PARAMS HARUS PROMISE
  params: Promise<{ rfid: string }>;
}) {
  // ⬅️ WAJIB DI-AWAIT DULU (Next.js 15 rule)
  const { rfid } = await params;

  // Ambil semua log timbang RFID ini
  const tasks = await getTasks(rfid);

  if (!tasks || tasks.length === 0) {
    notFound();
  }

  // Log sudah disort ascending → entry terbaru adalah terakhir
  const latest = tasks[tasks.length - 1];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">

      {/* 1. SHOW LIVESTOCK PROFILE */}
      <LivestockShowCard initialData={latest} />

      {/* 2. WEIGHT TREND CHART */}
      <LivestockWeightChart data={tasks} />

      {/* 3. HISTORY TABLE */}
      <div className="flex-1 overflow-hidden">
        <DataTable data={tasks} columns={columns} />
      </div>
    </div>
  );
}
