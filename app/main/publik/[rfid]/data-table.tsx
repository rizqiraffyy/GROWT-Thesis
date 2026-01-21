// app/main/dashboard/[rfid]/details/page.tsx
import { notFound } from "next/navigation";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getTasks } from "./data/logs";

interface PageProps {
  params: {
    rfid: string;
  };
}

export default async function TaskPage({ params }: PageProps) {
  const { rfid } = params;

  const tasks = await getTasks(rfid);

  if (!tasks.length) {
    // RFID bukan punya user (atau belum ada log sama sekali)
    notFound();
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
          Data Logs – RFID {rfid}
        </h1>
        <p className="max-w-2xl text-xs text-muted-foreground sm:text-sm md:text-base">
          Detailed weighing history for this livestock.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <DataTable data={tasks} columns={columns} />
      </div>
    </div>
  );
}
