import { SectionCards } from "./components/section-cards";
import { ChartAreaInteractive } from "./components/chart-area-interactive";
import DataTable from "./components/data-table";
import { getDashboardMonthlySeries } from "./components/data-table/data/logs";

export default async function Page() {
  const chartData = await getDashboardMonthlySeries("all");

  return (
    <div className="flex flex-1 flex-col" data-testid="dashboard-page">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div data-testid="dashboard-kpi">
            <SectionCards />
          </div>

          <div className="px-4 lg:px-6" data-testid="dashboard-chart">
            <ChartAreaInteractive data={chartData} />
          </div>

          <div className="flex-1 overflow-hidden" data-testid="dashboard-table">
            <DataTable />
          </div>
        </div>
      </div>
    </div>
  );
}
