import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getTasks } from "./data/logs";
import { SectionCards } from "./section-cards";

export default async function TaskPage() {
  const tasks = await getTasks();

  return (
  <div>
    {/* Cards */}
    <SectionCards />
    <div className="flex h-full flex-1 flex-col gap-4 p-4 pt-1">
      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex-1 flex-col gap-8 md:flex">
        <DataTable data={tasks} columns={columns} />
        </div>
      </div>
    </div>
  </div>
  );
}