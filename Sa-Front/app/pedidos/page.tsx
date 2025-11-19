"use client"

import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { getPedidos, refreshPedidoStatus, Pedido } from '@/lib/api'
import { cn } from '@/lib/utils'

type PedidoFilter = 'EM_ANDAMENTO' | 'TODOS' | 'PENDENTE' | 'EM_PROCESSO' | 'FINALIZADO'

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loadingPedidos, setLoadingPedidos] = useState(false)
  const [filter, setFilter] = useState<PedidoFilter>('EM_ANDAMENTO')
  const [checking, setChecking] = useState<Record<number, boolean>>({})
  const [notice, setNotice] = useState('')
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const loadPedidos = async () => {
    setLoadingPedidos(true)
    try {
      const data = await getPedidos()
      setPedidos(Array.isArray(data) ? data : [])
    } catch (e: any) {
      // silencioso
    } finally {
      setLoadingPedidos(false)
    }
  }
  const pedidosFiltrados = useMemo(() => {
    // Determine base list according to filter.
    // Per request: show concluded orders as well; treat 'EM_ANDAMENTO' similar to 'TODOS'
    let list = [] as Pedido[]
    if (filter === 'TODOS' || filter === 'EM_ANDAMENTO') {
      list = [...pedidos]
    } else {
      list = pedidos.filter(p => String(p.status).toUpperCase() === filter)
    }

    // Sort: production -> pending (oldest first) -> completed (oldest first) -> others
    const rank: Record<string, number> = {
      'EM_PROCESSO': 0,
      'EM PROCESSO': 0,
      'PENDENTE': 1,
      'FINALIZADO': 2,
    }
    list.sort((a, b) => {
      const sa = String(a.status || '').toUpperCase()
      const sb = String(b.status || '').toUpperCase()
      const ra = rank[sa] ?? 99
      const rb = rank[sb] ?? 99
      if (ra !== rb) return ra - rb
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return ta - tb
    })
    return list
  }, [pedidos, filter])
  const checkStatus = async (pedido: Pedido) => {
    const id = pedido.id
    setNotice('')
    setChecking(prev => ({ ...prev, [id]: true }))
    const oldStatus = String(pedido.status || '').toUpperCase()
    try {
      const data = await refreshPedidoStatus(id)
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: data.status, idfila: data.idfila } : p))
      const newStatus = String(data.status || '').toUpperCase()
      if (newStatus && newStatus !== oldStatus) {
        setNotice(`Pedido #${id}: status atualizado de ${oldStatus || '-'} para ${newStatus}.`)
      } else {
        setNotice(`Pedido #${id}: status permanece ${newStatus || oldStatus || '-'}.`)
      }
    } catch (err: any) {
      setNotice(`Pedido #${id}: ${err?.message || 'Falha ao consultar status'}`)
    } finally {
      setChecking(prev => {
        const { [id]: _, ...rest } = prev
        return rest
      })
    }
  }
  return (
    <AppShell title="Pedidos">
      <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Meus Pedidos</h2>
            <div className="flex gap-2">
              <select value={filter} onChange={e => setFilter(e.target.value as PedidoFilter)} className="h-9 rounded-md border text-sm px-2">
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="TODOS">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_PROCESSO">Em processo</option>
                <option value="FINALIZADO">Finalizado</option>
              </select>
              <Button variant="secondary" onClick={loadPedidos} disabled={loadingPedidos}>Atualizar</Button>
            </div>
          </div>
          {notice && <div className="text-xs mb-2 text-[#1a1a1a] bg-[#f5f5f5] border rounded p-2">{notice}</div>}
          <div className="overflow-auto max-h-[380px] border rounded-md">
            {loadingPedidos ? (
              <div className="p-4 text-sm text-gray-500">Carregando pedidos...</div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Nenhum pedido encontrado.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#cdb8a5] text-[#1a1a1a]">
                  <tr>
                    <th className="text-left px-2 py-1">ID</th>
                    <th className="text-left px-2 py-1">Criado</th>
                    <th className="text-left px-2 py-1">Status</th>
                    <th className="text-left px-2 py-1">Valor</th>
                    <th className="text-left px-2 py-1">Produtos</th>
                    <th className="text-left px-2 py-1">Fila</th>
                    <th className="text-left px-2 py-1">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosFiltrados.map(p => {
                    const created = p.createdAt ? new Date(p.createdAt) : null
                    const valor = p.valor ? parseFloat(String(p.valor)) : 0
                    const produtosLinha = (p.produto || []).map(pr => `${pr.marca} ${pr.modelo}`).join(', ')
                    const st = String(p.status || '').toUpperCase()
                    const isFinalizado = st === 'FINALIZADO'
                    const isChecking = !!checking[p.id]
                    return (
                      <>
                      <tr key={p.id} className="odd:bg-white even:bg-[#f9f7f6]">
                        <td className="px-2 py-1">#{p.id}</td>
                        <td className="px-2 py-1">{created ? created.toLocaleString() : '-'}</td>
                        <td className="px-2 py-1">
                          <span className={cn('px-2 py-0.5 rounded text-xs font-medium',
                            st === 'FINALIZADO' && 'bg-green-100 text-green-700',
                            st === 'EM_PROCESSO' && 'bg-blue-100 text-blue-700',
                            st === 'PENDENTE' && 'bg-yellow-100 text-yellow-700',
                            st === 'ERRO' && 'bg-red-100 text-red-700'
                          )}>{st}</span>
                        </td>
                        <td className="px-2 py-1">R$ {valor.toFixed(2)}</td>
                        <td className="px-2 py-1 truncate max-w-40" title={produtosLinha}>{produtosLinha || '—'}</td>
                        <td className="px-2 py-1">{p.idfila || '—'}</td>
                        <td className="px-2 py-1 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => checkStatus(p)}
                            disabled={isChecking || isFinalizado || !p.idfila}
                            className="text-xs h-7"
                          >
                            {isChecking ? 'Checando…' : 'Checar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpanded(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                            className="text-xs h-7"
                          >
                            {expanded[p.id] ? 'Fechar' : 'Detalhes'}
                          </Button>
                        </td>
                      </tr>
                      {expanded[p.id] && (
                        <tr key={`details-${p.id}`} className="bg-gray-50">
                          <td colSpan={7} className="px-4 py-2 text-xs">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(p, null, 2)}</pre>
                          </td>
                        </tr>
                      )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
    </AppShell>
  )
}
