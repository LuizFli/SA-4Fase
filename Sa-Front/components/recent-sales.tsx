"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export function RecentSales() {
  const sales = [
    {
      id: 1,
      customer: "João Silva",
      vehicle: "Toyota Corolla 2024",
      value: "R$ 125.000",
      status: "Concluída",
      statusColor: "bg-green-100 text-green-700",
      completed: true,
    },
    {
      id: 2,
      customer: "Maria Santos",
      vehicle: "Honda Civic 2023",
      value: "R$ 145.000",
      status: "Em andamento",
      statusColor: "bg-orange-100 text-orange-700",
      completed: false,
    },
    {
      id: 3,
      customer: "Pedro Oliveira",
      vehicle: "Ford Ranger 2024",
      value: "R$ 235.000",
      status: "Aguardando docs",
      statusColor: "bg-yellow-100 text-yellow-700",
      completed: false,
    },
    {
      id: 4,
      customer: "Ana Costa",
      vehicle: "Jeep Compass 2023",
      value: "R$ 185.000",
      status: "Concluída",
      statusColor: "bg-green-100 text-green-700",
      completed: true,
    },
    {
      id: 5,
      customer: "Carlos Mendes",
      vehicle: "Volkswagen T-Cross 2024",
      value: "R$ 135.000",
      status: "Concluída",
      statusColor: "bg-green-100 text-green-700",
      completed: true,
    },
  ]

  const tabs = [
    { name: "Todas", count: 15 },
    { name: "Importantes", count: 0 },
    { name: "Notas", count: 3 },
    { name: "Links", count: 0 },
  ]

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Vendas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-4 mb-4 border-b border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`pb-2 text-xs font-medium ${
                index === 0 ? "text-[#ff5722] border-b-2 border-[#ff5722]" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
              {tab.count > 0 && <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Sales list */}
        <div className="space-y-3">
          {sales.map((sale) => (
            <div key={sale.id} className="flex items-start gap-3">
              <Checkbox checked={sale.completed} className="mt-1" />
              <div className="flex-1">
                <div className="text-sm font-medium">{sale.customer}</div>
                <div className="text-xs text-gray-500">{sale.vehicle}</div>
                <div className="text-xs font-semibold text-gray-700 mt-1">{sale.value}</div>
              </div>
              <Badge className={`${sale.statusColor} text-xs font-normal border-none`}>{sale.status}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
