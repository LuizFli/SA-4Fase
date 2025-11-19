"use client"

import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { getProdutos, createPedido, getPedidos, refreshPedidoStatus, Produto, Pedido } from '@/lib/api'
import { cn } from '@/lib/utils'

type PedidoFilter = 'EM_ANDAMENTO' | 'TODOS' | 'PENDENTE' | 'EM_PROCESSO' | 'FINALIZADO'

export default function PedidosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [loadingPedidos, setLoadingPedidos] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [status, setStatus] = useState('PENDENTE')
  const [errorCreate, setErrorCreate] = useState('')
  const [filter, setFilter] = useState<PedidoFilter>('EM_ANDAMENTO')
  const [checking, setChecking] = useState<Record<number, boolean>>({})
  const [notice, setNotice] = useState('')

  const loadProdutos = async () => {
    setLoadingProdutos(true)
    try {
      const data = await getProdutos()
      setProdutos(Array.isArray(data) ? data : [])
    } catch (e: any) {
      // silencioso
    } finally {
      setLoadingProdutos(false)
    }
  }

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

  useEffect(() => {
    loadProdutos()
    loadPedidos()
  }, [])

  const total = useMemo(() => {
    const sel = new Set(selectedIds)
    return produtos.filter(p => sel.has(p.id)).reduce((acc, p) => acc + parseFloat(String(p.preco)), 0)
  }, [selectedIds, produtos])

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const pedidosFiltrados = useMemo(() => {
    if (filter === 'TODOS') return pedidos
    if (filter === 'EM_ANDAMENTO') return pedidos.filter(p => String(p.status).toUpperCase() !== 'FINALIZADO')
    return pedidos.filter(p => String(p.status).toUpperCase() === filter)
  }, [pedidos, filter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorCreate('')
    if (selectedIds.length === 0) {
      setErrorCreate('Selecione ao menos um produto')
      return
    }
    setCreating(true)
    try {
      await createPedido({ produtos: selectedIds, valor: total, status })
      setSelectedIds([])
      setStatus('PENDENTE')
      await loadPedidos()
    } catch (err: any) {
      setErrorCreate(err?.message || 'Erro ao criar pedido')
    } finally {
      setCreating(false)
    }
  }

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
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Criar Pedido */}
        <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-3">Novo Pedido</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="h-52 overflow-auto border rounded-md p-2 space-y-2 bg-[#f5f5f5]">
              {loadingProdutos ? (
                <p className="text-sm text-gray-500">Carregando produtos...</p>
              ) : produtos.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum produto disponível.</p>
              ) : (
                produtos.map(p => {
                  const checked = selectedIds.includes(p.id)
                  return (
                    <label key={p.id} className={cn("flex items-start gap-2 text-sm cursor-pointer", checked && "text-[#ff5722]")}> 
                      <Checkbox checked={checked} onCheckedChange={() => toggleSelect(p.id)} />
                      <span>{p.marca} {p.modelo} • Ano {p.ano} • Estoque {p.estoque} • R$ {Number.parseFloat(String(p.preco)).toFixed(2)}</span>
                    </label>
                  )
                })
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="h-10 rounded-md border bg-white text-sm px-2"
                >
                  <option value="PENDENTE">PENDENTE</option>
                  <option value="EM_PROCESSO">EM_PROCESSO</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium">Total</label>
                <Input readOnly value={`R$ ${total.toFixed(2)}`} className="h-10" />
              </div>
            </div>
            {errorCreate && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{errorCreate}</div>}
            <Button type="submit" disabled={creating} className="bg-[#ff5722] hover:bg-[#e65b1b]">{creating ? 'Criando...' : 'Criar Pedido'}</Button>
          </form>
        </div>

        {/* Lista de Pedidos */}
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
                        <td className="px-2 py-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => checkStatus(p)}
                            disabled={isChecking || isFinalizado || !p.idfila}
                            className="text-xs h-7"
                          >
                            {isChecking ? 'Checando…' : 'Checar'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
