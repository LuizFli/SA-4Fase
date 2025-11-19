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
  brand?: string
  engine?: string
  transmission?: string
  wheels?: string
  suspension?: string
  status: OrderStatus
  progress: number
  createdAt: string
  createdAtIso?: string
  vehicleId?: number
  vehicleName?: string
  // extras vindos do backend
  valor?: string | number
  idfila?: string
}

export function StatusOrders() {
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all")
  const [movedOrders, setMovedOrders] = useState<{ id: string; data: Order }[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState<Record<string, boolean>>({})
  const [notice, setNotice] = useState("")

  useEffect(() => {
    loadFromBackend()
  }, [])

  const loadFromBackend = async () => {
    try {
      setLoading(true)
      const data = await getPedidos()
      const mapped: Order[] = data.map((p: Pedido) => {
        const pe = (p as any)
        const first = (pe.produto?.[0] || pe.produtosEmPedidos?.[0]?.produto) as any
        const bloco = (first?.bloco || {}) as Record<string, any>
        const derived = deriveFromBloco(bloco)
        return {
          id: String(p.id),
          // Informações do produto (ou derivadas do bloco)
          brand: first?.marca,
          model: first?.modelo,
          color: first?.cor || derived.colorName,
          engine: first?.motor || derived.engineName,
          transmission: first?.cambio || derived.transmissionName,
          wheels: derived.wheelsName,
          suspension: undefined,
          vehicleId: first?.id,
          vehicleName: first ? `${first?.marca ?? ''} ${first?.modelo ?? ''}`.trim() : undefined,
          // Status
          status: mapBackendStatus(p.status),
          progress: mapProgress(p.status),
          // Keep original ISO timestamp for ordering and a human-friendly date for display
          createdAtIso: p.createdAt,
          createdAt: new Date(p.createdAt).toISOString().split("T")[0],
          // Extras
          // @ts-ignore
          idfila: (p as any).idfila,
          // @ts-ignore
          valor: p.valor,
        }
      })
      // Sort orders so that: production -> pending (oldest first) -> completed (oldest first) -> errors
      const rank: Record<string, number> = { production: 0, pending: 1, completed: 2, error: 3 }
      mapped.sort((a, b) => {
        const ra = rank[a.status] ?? 99
        const rb = rank[b.status] ?? 99
        if (ra !== rb) return ra - rb
        const ta = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0
        const tb = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0
        return ta - tb
      })
      setOrders(mapped)
      setMovedOrders([])
      setNotice("")
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

  const handleCheckOne = async (order: Order) => {
    setNotice("")
    setChecking((prev) => ({ ...prev, [order.id]: true }))
    const oldStatus = order.status
    try {
      const idNum = Number(order.id)
      const data = await refreshPedidoStatus(idNum)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: mapBackendStatus(data.status), progress: mapProgress(data.status), /* @ts-ignore */ idfila: data.idfila } : o)),
      )
      const newStatus = mapBackendStatus(data.status)
      if (newStatus !== oldStatus) {
        setNotice(`Pedido #${order.id}: status atualizado de ${labelStatus(oldStatus)} para ${labelStatus(newStatus)}.`)
      } else {
        setNotice(`Pedido #${order.id}: status permanece ${labelStatus(newStatus)}.`)
      }
    } catch (e: any) {
      setNotice(`Pedido #${order.id}: ${e?.message || "Falha ao consultar status"}`)
    } finally {
      setChecking((prev) => {
        const { [order.id]: _omit, ...rest } = prev
        return rest
      })
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

      {/* Aviso/notice */}
      {notice && (
        <Card className="bg-[#f5f5f5] p-3 border-none text-xs text-[#1a1a1a]">{notice}</Card>
      )}

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
                  <span className="font-medium text-gray-900">{order.model || '—'}</span>
                </p>
                <p className="flex justify-between text-gray-600">
                  <span>Marca:</span>
                  <span className="font-medium text-gray-900">{order.brand || '—'}</span>
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
                {/* Dados do backend de Pedidos */}
                {/* @ts-ignore */}
                {order.valor !== undefined && (
                  <p className="flex justify-between text-gray-600">
                    <span>Valor:</span>
                    {/* @ts-ignore */}
                    <span className="font-medium text-gray-900">R$ {Number.parseFloat(String(order.valor || 0)).toFixed(2)}</span>
                  </p>
                )}
                {/* idfila intentionally hidden */}
                <p className="flex justify-between text-gray-600">
                  <span>Rodas:</span>
                  <span className="font-medium text-gray-900">{order.wheels || '—'}</span>
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
                <Button
                  onClick={() => handleCheckOne(order)}
                  size="sm"
                  className="flex-1 bg-[#ff5722] hover:bg-[#ff5722]/90 text-white text-xs font-medium"
                  // @ts-ignore
                  disabled={checking[order.id] || order.status === 'completed' || !order.idfila}
                >
                  {/* @ts-ignore */}
                  {checking[order.id] ? 'Checando…' : 'Checar status'}
                </Button>
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

function labelStatus(st: OrderStatus): string {
  switch (st) {
    case 'pending': return 'PENDENTE'
    case 'production': return 'EM_PROCESSO'
    case 'completed': return 'FINALIZADO'
    default: return 'ERRO'
  }
}

function deriveFromBloco(bloco: Record<string, any>) {
  const colorName = (() => {
    switch (bloco?.cor) {
      case 1: return 'Vermelho'
      case 2: return 'Preto'
      case 3: return 'Branco'
      case 4: return 'Azul'
      case 5: return 'Prata'
      default: return undefined
    }
  })()
  const engineName = (() => {
    switch (bloco?.lamina1) {
      case 1: return '1.0'
      case 2: return '1.6'
      case 3: return '2.0'
      case 4: return '2.5'
      case 5: return '3.0'
      default: return undefined
    }
  })()
  const transmissionName = (() => {
    switch (bloco?.lamina2) {
      case 1: return 'Manual'
      case 2: return 'Automático'
      case 3: return 'CVT'
      case 4: return 'Dual Clutch'
      case 5: return 'Elétrico'
      default: return undefined
    }
  })()
  const wheelsName = (() => {
    switch (bloco?.lamina3) {
      case 1: return 'Liga Leve'
      case 2: return 'Aço'
      case 3: return 'Esportiva'
      case 4: return 'Off-Road'
      case 5: return 'Premium'
      default: return undefined
    }
  })()
  return { colorName, engineName, transmissionName, wheelsName }
}
