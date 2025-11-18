import { AppShell } from "@/components/app-shell"
import { OverviewCards } from "@/components/overview-cards"
import { RequestStatusWidget } from "@/components/request-status-widget"
import { VehiclesSummaryTable } from "@/components/vehicles-summary-table"

export default function Page() {
  return (
    <AppShell title="Dashboard">
      {/* Overview section */}
      <h2 className="text-base font-semibold shrink-0">Visão Geral</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">
        {/* Left column: 2 overview cards */}
        <div className="lg:col-span-2">
          <OverviewCards />
        </div>

        {/* Right column: Status widget */}
        <div className="lg:col-span-1">
          <RequestStatusWidget />
        </div>
      </div>

      {/* Vehicles summary - show only first 5 */}
      <div className="flex-1 min-h-0">
        <VehiclesSummaryTable limit={5} />
      </div>
    </AppShell>
  )
}
