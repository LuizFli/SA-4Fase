"use client"

import { AppShell } from "@/components/app-shell"
import { VehiclesSummaryTable } from "@/components/vehicles-summary-table"

export default function EstoquePage() {
  return (
    <AppShell title="Estoque de Veículos">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Visualize todos os veículos em estoque</p>
        <VehiclesSummaryTable />
      </div>
    </AppShell>
  )
}
