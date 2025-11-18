"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, Zap, CheckCircle, ArrowRight } from "lucide-react"
import { getPedidos, type Pedido } from "@/lib/api"

interface StatusSummary {
  status: "pending" | "production" | "completed"
  count: number
  icon: React.ReactNode
  label: string
  color: string
}

export function RequestStatusWidget() {
  const [summary, setSummary] = useState({ pending: 0, production: 0, completed: 0 })

  useEffect(() => {
    let ignore = false
    getPedidos()
      .then((pedidos: Pedido[]) => {
        if (ignore) return
        const map = { pending: 0, production: 0, completed: 0 }
        for (const p of pedidos) {
          const s = String(p.status).toUpperCase()
          if (s === "PENDENTE") map.pending++
          else if (s === "EM_PROCESSO") map.production++
          else if (s === "FINALIZADO") map.completed++
        }
        setSummary(map)
      })
      .catch(() => setSummary({ pending: 0, production: 0, completed: 0 }))
    return () => {
      ignore = true
    }
  }, [])

  const statusSummary: StatusSummary[] = [
    { status: "pending", count: summary.pending, icon: <Clock className="w-5 h-5" />, label: "Pendentes", color: "#ef4444" },
    { status: "production", count: summary.production, icon: <Zap className="w-5 h-5" />, label: "Em Produção", color: "#eab308" },
    { status: "completed", count: summary.completed, icon: <CheckCircle className="w-5 h-5" />, label: "Concluído", color: "#22c55e" },
  ]

  return (
    <Card className="bg-white p-4 border-none shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Status das Solicitações</h3>
        <Link href="/status">
          <Button variant="ghost" size="sm" className="text-[#ff5722] hover:bg-[#ff5722]/10">
            Ver Tudo
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {statusSummary.map((item) => (
          <div
            key={item.status}
            className="p-3 rounded-lg bg-linear-to-br from-white to-gray-50 border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <div style={{ color: item.color }}>{item.icon}</div>
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: item.color }}>
              {item.count}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
