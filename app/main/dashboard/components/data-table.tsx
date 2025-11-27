import { columns } from "./data-table/components/columns";
import { DataTable } from "./data-table/components/data-table";
import { getLatestLivestock } from "./data-table/data/logs"; 

export default async function TaskPage() {
  const tasks = await getLatestLivestock();

  return (
    <div className="h-full flex-1 flex-col gap-2 p-4 pt-1">
      <DataTable data={tasks} columns={columns} />
    </div>
  );
}