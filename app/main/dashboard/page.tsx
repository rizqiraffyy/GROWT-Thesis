import { SectionCards } from "./components/section-cards";
import { ChartAreaInteractive } from "./components/chart-area-interactive";
import DataTable from "./components/data-table";
import { getDashboardMonthlySeries } from "./components/data-table/data/logs";

export default async function Page() {
  const chartData = await getDashboardMonthlySeries(12); // 12 bulan untuk chart

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* KPI cards */}
          <SectionCards />

          {/* Chart MoM */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive data={chartData} />
          </div>

          {/* Data Logs Table */}
          <div className="flex-1 overflow-hidden">
            <DataTable/>
          </div>
        </div>
      </div>
    </div>
  );
}
