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
  params: { rfid: string };
}) {
  const { rfid } = params;

  // ambil semua log timbang untuk RFID ini
  const tasks = await getTasks(rfid);

  if (!tasks || tasks.length === 0) {
    notFound();
  }

  // Log timbang sudah di-sort ascending di attachStatusAndAge()
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