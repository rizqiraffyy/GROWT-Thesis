import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { getDevices } from "./data/logs";      // ⬅️ ganti sumber data
import { SectionCards } from "./section-cards";  // ⬅️ versi device cards

export default async function DevicePage() {
  const devices = await getDevices();

  return (
    <div>
      {/* Cards */}
      <SectionCards />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-1">
        {/* Table */}
        <div className="flex flex-1 flex-col gap-8 md:flex">
          <DataTable data={devices} columns={columns} />
        </div>
      </div>
    </div>
  );
}
