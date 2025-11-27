import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getLatestLivestock } from "./data/logs"; // ⬅️ ganti import-nya
import { GlobalSectionCards } from "./section-cards";

export default async function TaskPage() {
  const tasks = await getLatestLivestock(); // ⬅️ pakai latest per RFID

  return (
  <div>
    {/* Cards */}
    <GlobalSectionCards />
    <div className="flex h-full flex-1 flex-col gap-4 p-4 pt-1">
      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <DataTable data={tasks} columns={columns} />
      </div>
    </div>
  </div>
  );
}