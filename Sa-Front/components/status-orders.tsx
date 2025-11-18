"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Zap, CheckCircle, Filter, RefreshCw } from "lucide-react"
import { getPedidos, refreshPedidoStatus, type Pedido } from "@/lib/api"

type OrderStatus = "pending" | "production" | "completed" | "error"

interface Order {
  id: string
  color?: string
  model?: string
  engine?: string
  transmission?: string
  wheels?: string
  suspension?: string
  status: OrderStatus
  progress: number
  createdAt: string
  vehicleId?: number
  vehicleName?: string
}

export function StatusOrders() {
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all")
  const [movedOrders, setMovedOrders] = useState<{ id: string; data: Order }[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFromBackend()
  }, [])

  const loadFromBackend = async () => {
    try {
      setLoading(true)
      const data = await getPedidos()
      const mapped: Order[] = data.map((p: Pedido) => ({
        id: String(p.id),
        // When include produto: true, may be array
        model: p.produto?.[0]?.modelo,
        color: p.produto?.[0]?.cor,
        engine: p.produto?.[0]?.motor,
        transmission: p.produto?.[0]?.cambio,
        status: mapBackendStatus(p.status),
        progress: mapProgress(p.status),
        createdAt: new Date(p.createdAt).toISOString().split("T")[0],
      }))
      setOrders(mapped)
      setMovedOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders =
    filterStatus === "all"
      ? orders.filter((o) => !movedOrders.some((m) => m.id === o.id))
      : orders.filter((order) => order.status === filterStatus && !movedOrders.some((m) => m.id === order.id))

  const handleMoveToEstoque = (order: Order) => {
    setMovedOrders([...movedOrders, { id: order.id, data: order }])
  }

  const handleRefresh = async () => {
    // Ask backend to update current status from queue for each pedido
    try {
      await Promise.all(
        orders.map((o) => {
          const id = Number(o.id)
          if (!Number.isFinite(id)) return Promise.resolve()
          return refreshPedidoStatus(id).catch(() => {})
        }),
      )
    } finally {
      await loadFromBackend()
    }
  }

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return { icon: Clock, label: "Pendente", color: "#ef4444", bgColor: "#fee2e2" }
      case "production":
        return { icon: Zap, label: "Em Produção", color: "#eab308", bgColor: "#fef3c7" }
      case "completed":
        return { icon: CheckCircle, label: "Concluído", color: "#22c55e", bgColor: "#dcfce7" }
      case "error":
        return { icon: Clock, label: "Erro", color: "#ef4444", bgColor: "#fee2e2" }
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <Card className="bg-white p-4 border-none shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[#ff5722]" />
          <span className="text-sm font-semibold">Filtrar:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "production", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as "all" | OrderStatus)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                filterStatus === status ? "bg-[#ff5722] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "all"
                ? "Todos"
                : status === "pending"
                  ? "Pendentes"
                  : status === "production"
                    ? "Em Produção"
                    : "Concluídos"}
            </button>
          ))}
        </div>
      </Card>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status)
          const StatusIcon = statusConfig.icon

          return (
            <Card key={order.id} className="bg-white p-4 border-none shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                  {order.vehicleName && <p className="text-xs text-gray-600 font-medium">{order.vehicleName}</p>}
                  <p className="text-xs text-gray-500">{order.createdAt}</p>
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full"
                  style={{ backgroundColor: statusConfig.bgColor }}
                >
                  <StatusIcon className="w-3 h-3" style={{ color: statusConfig.color }} />
                  <span className="text-xs font-medium" style={{ color: statusConfig.color }}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-2 mb-4 text-xs">
                <p className="flex justify-between text-gray-600">
                  <span>Modelo:</span>
                  <span className="font-medium text-gray-900">{order.model}</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>Cor:</span>
                  <span className="font-medium text-gray-900">{order.color}</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>Motor:</span>
                  <span className="font-medium text-gray-900">{order.engine}</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>Câmbio:</span>
                  <span className="font-medium text-gray-900">{order.transmission}</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>Rodas:</span>
                  <span className="font-medium text-gray-900">{order.wheels}</span>
                </p>
                {order.suspension && (
                  <p className="flex justify-between text-gray-600">
                    <span>Suspensão:</span>
                    <span className="font-medium text-gray-900">{order.suspension}</span>
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 items-center justify-between">
                <Button onClick={handleRefresh} className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                {order.status === "completed" && (
                  <Button
                    onClick={() => handleMoveToEstoque(order)}
                    className="flex-1 bg-[#ff5722] hover:bg-[#ff5722]/90 text-white text-xs font-medium"
                  >
                    Mover para Estoque
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="bg-white p-8 border-none shadow-sm text-center">
          <p className="text-gray-500 text-sm">Nenhum pedido encontrado nesta categoria</p>
        </Card>
      )}
    </div>
  )
}

function mapBackendStatus(s: string): OrderStatus {
  const up = String(s || "").toUpperCase()
  if (up === "PENDENTE") return "pending"
  if (up === "EM_PROCESSO") return "production"
  if (up === "FINALIZADO") return "completed"
  return "error"
}

function mapProgress(s: string): number {
  const up = String(s || "").toUpperCase()
  if (up === "PENDENTE") return 10
  if (up === "EM_PROCESSO") return 60
  if (up === "FINALIZADO") return 100
  return 0
}
