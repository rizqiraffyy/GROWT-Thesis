import { notFound } from "next/navigation";
import { getTasks } from "./data/logs";

import LivestockShowCard from "./update-livestock";
import LivestockWeightChart from "./chart-area-interactive";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default async function DetailPage({
  params,
}: {
  // ⬅️ di Next 15, params datang sebagai Promise
  params: Promise<{ rfid: string }>;
}) {
  // ⬅️ WAJIB: await dulu sebelum di-destructure
  const { rfid } = await params;

  const tasks = await getTasks(rfid);

  if (!tasks || tasks.length === 0) {
    notFound();
  }

  const latest = tasks[tasks.length - 1];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
      {/* SHOW LIVESTOCK PROFILE */}
      <LivestockShowCard initialData={latest} />

      {/* WEIGHT TREND CHART */}
      <LivestockWeightChart data={tasks} />

      {/* HISTORY TABLE */}
      <div className="flex-1 overflow-hidden">
        <DataTable data={tasks} columns={columns} />
      </div>
    </div>
  );
}
