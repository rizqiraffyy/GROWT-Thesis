// app/main/dashboard/[rfid]/details/page.tsx
import { notFound } from "next/navigation";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getTasks } from "./data/logs";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ rfid: string }>;
}) {
  // ⬇️ WAJIB: await dulu
  const { rfid } = await params;

  const tasks = await getTasks(rfid);

  if (!tasks.length) {
    notFound();
  }

  return (
      <div className="flex-1 overflow-hidden">
        <DataTable data={tasks} columns={columns} />
      </div>
  );
}