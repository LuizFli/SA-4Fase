"use client"

import { AppShell } from "@/components/app-shell"
import { StatusOrders } from "@/components/status-orders"

export default function StatusPage() {
  return (
    <AppShell title="Status das Solicitações">
      <StatusOrders />
    </AppShell>
  )
}
