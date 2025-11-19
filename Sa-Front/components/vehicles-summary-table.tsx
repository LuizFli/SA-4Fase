"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { CustomizationForm } from "./customization-form"
import type { Characteristics } from "./customization-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createPedido, createProduto, finalizePedido, getProdutos, updateProduto, type Produto } from "@/lib/api"

interface Vehicle {
  id: number
  productId: number
  name: string
  category: string
  price: string
  status: string
  statusColor: string
  quantity: number
  color: string
  model: string
  engine: string
  transmission: string
  wheels: string
  suspension: string
  year: string
}

// Use the exported Characteristics type from customization-form to avoid divergence

interface VehiclesSummaryTableProps {
  limit?: number
  showFilters?: boolean
}

const colors = [
  { id: "red", name: "Vermelho", hex: "#EF4444" },
  { id: "black", name: "Preto", hex: "#1F2937" },
  { id: "white", name: "Branco", hex: "#F3F4F6" },
  { id: "blue", name: "Azul", hex: "#3B82F6" },
  { id: "silver", name: "Prata", hex: "#D1D5DB" },
]

const engines = [
  { id: "1.0", name: "1.0" },
  { id: "1.6", name: "1.6" },
  { id: "2.0", name: "2.0" },
  { id: "2.5", name: "2.5" },
  { id: "3.0", name: "3.0" },
]

const transmissions = [
  { id: "manual", name: "Manual" },
  { id: "automatic", name: "Automático" },
  { id: "cvt", name: "CVT" },
  { id: "dual", name: "Dual Clutch" },
  { id: "electric", name: "Elétrico" },
]

const wheels = [
  { id: "alloy", name: "Liga Leve" },
  { id: "steel", name: "Aço" },
  { id: "sport", name: "Esportiva" },
  { id: "offroad", name: "Off-Road" },
  { id: "premium", name: "Premium" },
]

const suspensions = [
  { id: "independent", name: "Independente" },
  { id: "macpherson", name: "MacPherson" },
  { id: "multilink", name: "Multi-link" },
  { id: "air", name: "Ar Comprimido" },
  { id: "adaptive", name: "Adaptativa" },
]

export function VehiclesSummaryTable({ limit, showFilters = true }: VehiclesSummaryTableProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadProdutos = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await getProdutos()
      const mapped: Vehicle[] = data.map((p: Produto, idx) => ({
        id: idx + 1,
        productId: p.id,
        name: `${p.marca} ${p.modelo} ${p.ano}`,
        category: p.modelo,
        price: formatCurrency(p.preco),
        status: "Disponível",
        statusColor: "bg-green-100 text-green-700",
        quantity: p.estoque ?? 0,
        color: p.cor,
        model: p.modelo,
        engine: p.motor,
        transmission: p.cambio,
        wheels: "",
        suspension: "",
        year: String(p.ano),
      }))
      setVehicles(mapped)
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProdutos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editData, setEditData] = useState<Vehicle | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [customizationData, setCustomizationData] = useState<Characteristics | undefined>()
  const [showMovementModal, setShowMovementModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [movementType, setMovementType] = useState<"increase" | "decrease" | "edit" | null>(null)
  const [movementQuantity, setMovementQuantity] = useState("")

  const sortedVehicles = useMemo(() => [...vehicles].sort((a, b) => b.quantity - a.quantity), [vehicles])
  const displayVehicles = limit ? sortedVehicles.slice(0, limit) : sortedVehicles

  const handleMovement = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowMovementModal(true)
    setMovementType(null)
    setMovementQuantity("")
  }

  const handleMovementSubmit = async () => {
    if (!selectedVehicle || !movementType) return

    if (movementType === "increase") {
      try {
        const quantity = Number.parseInt(movementQuantity) || 1
        const valor = parsePrice(String(selectedVehicle.price))
        for (let i = 0; i < quantity; i++) {
          await createPedido({ valor, status: "PENDENTE", produtos: [selectedVehicle.productId] })
        }
        // Pedido criado não atualiza estoque imediatamente; manter UI atual
      } catch (e: any) {
        setError(e?.message || "Falha ao aumentar estoque")
      } finally {
        setShowMovementModal(false)
        setMovementQuantity("")
      }
    } else if (movementType === "decrease") {
      try {
        const quantity = Number.parseInt(movementQuantity) || 1
        const newQty = Math.max(0, selectedVehicle.quantity - quantity)
        await updateProduto(selectedVehicle.productId, { estoque: newQty })
        await loadProdutos()
      } catch (e: any) {
        setError(e?.message || "Falha ao diminuir estoque (verifique permissão)")
      } finally {
        setShowMovementModal(false)
        setMovementQuantity("")
      }
    } else if (movementType === "edit") {
      setEditData({ ...selectedVehicle })
      setEditingId(selectedVehicle.id)
      setShowMovementModal(false)
      setShowEditModal(true)
    }
  }

  

  const handleCustomizationSubmit = async (characteristics: Characteristics) => {
    // Build produto payload
    const colorName = colors.find((c) => c.id === characteristics.color)?.name || characteristics.color
    const transmissionName = transmissions.find((t) => t.id === characteristics.transmission)?.name || characteristics.transmission
    const precoNum = parsePrice(characteristics.price)

    // Mapear blocos técnicos esperados pelo simulador
    const corCode = (() => {
      switch (characteristics.color) {
        case 'red': return 1
        case 'black': return 2
        case 'white': return 3
        case 'blue': return 4
        case 'silver': return 5
        default: return undefined
      }
    })()
    const lamina1 = (() => {
      switch (characteristics.engine) {
        case '1.0': return 1
        case '1.6': return 2
        case '2.0': return 3
        case '2.5': return 4
        case '3.0': return 5
        default: return undefined
      }
    })()
    const lamina2 = (() => {
      switch (characteristics.transmission) {
        case 'manual': return 1
        case 'automatic': return 2
        case 'cvt': return 3
        case 'dual': return 4
        case 'electric': return 5
        default: return undefined
      }
    })()
    const lamina3 = (() => {
      switch (characteristics.wheels) {
        case 'alloy': return 1
        case 'steel': return 2
        case 'sport': return 3
        case 'offroad': return 4
        case 'premium': return 5
        default: return undefined
      }
    })()

    const bloco = {
      cor: corCode,
      lamina1,
      lamina2,
      lamina3,
      padrao1: 'M2',
      padrao2: 'N2',
      padrao3: 'O2',
    }

    const produtoPayload = {
      marca: (characteristics.name?.split(" ")?.[0] || characteristics.brandModel || "") as string,
      modelo: characteristics.brandModel,
      ano: Number(characteristics.year) || new Date().getFullYear(),
      cor: colorName,
      motor: characteristics.engine,
      cambio: transmissionName,
      preco: precoNum,
      status: "ATIVO",
      bloco,
      estoque: 0,
    }

    try {
      const produto = await createProduto(produtoPayload)
      const qty = Math.max(1, Number(characteristics.quantity) || 1)
      for (let i = 0; i < qty; i++) {
        await createPedido({ valor: precoNum, status: "PENDENTE", produtos: [produto.id] })
      }
      await loadProdutos()
    } catch (_) {
      // Optionally show toast
    } finally {
      setShowCustomization(false)
      setCustomizationData(undefined)
    }
  }

  const handleSave = async () => {
    if (!editData) return
    try {
      // Mapear campos visuais para o schema de Produto no backend
      const [marca, ...resto] = (editData.name || "").split(" ")
      const modelo = editData.model || resto.join(" ") || editData.category
      const ano = Number.parseInt(String(editData.year)) || new Date().getFullYear()
      const cor = editData.color
      const motor = editData.engine
      const cambio = editData.transmission
      const preco = parsePrice(String(editData.price))

      await updateProduto(editData.productId, { marca, modelo, ano, cor, motor, cambio, preco })
      await loadProdutos()
    } catch (e: any) {
      setError(e?.message || "Falha ao salvar alterações do produto")
    } finally {
      setShowEditModal(false)
      setEditingId(null)
    }
  }

  const getStockStatus = (quantity: number) => {
    if (quantity > 7) {
      return { label: "Alto", color: "bg-green-100 text-green-700" }
    } else if (quantity >= 4 && quantity <= 7) {
      return { label: "Médio", color: "bg-yellow-100 text-yellow-700" }
    } else {
      return { label: "Baixo", color: "bg-red-100 text-red-700" }
    }
  }

  return (
    <>
      <Card className="bg-white border-none shadow-sm h-full flex flex-col">
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {limit ? "Resumo de Veículos" : "Estoque de Veículos"}
            </CardTitle>
            {!limit && showFilters && (
              <Button
                onClick={() => {
                  setCustomizationData(undefined)
                  setShowCustomization(true)
                }}
                className="bg-[#ff5722] hover:bg-[#ff5722]/90 text-white text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Pedir Produto
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-2">{error}</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-2">Nome</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-2">Categoria</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-2">Preço</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-2">Quantidade</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-2">Status</th>
                  {!limit && <th className="text-left text-xs font-medium text-gray-600 pb-2">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {displayVehicles.map((vehicle) => {
                  const stockStatus = getStockStatus(vehicle.quantity)
                  return (
                    <tr key={vehicle.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm font-medium">{vehicle.name}</td>
                      <td className="py-3 text-sm text-gray-600">{vehicle.category}</td>
                      <td className="py-3 text-sm text-gray-600">{vehicle.price}</td>
                      <td className="py-3 text-sm font-medium text-gray-700">{vehicle.quantity}</td>
                      <td className="py-3">
                        <Badge className={`${stockStatus.color} text-xs font-normal border-none`}>
                          {stockStatus.label}
                        </Badge>
                      </td>
                      {!limit && (
                        <td className="py-3 flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleMovement(vehicle)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs h-7"
                          >
                            Movimentações
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customization Modal */}
      <CustomizationForm
        isOpen={showCustomization}
        onClose={() => setShowCustomization(false)}
        onSubmit={handleCustomizationSubmit}
        initialData={customizationData}
      />

      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white border-none shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <CardHeader>
              <CardTitle className="text-sm">Editar Veículo</CardTitle>
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Nome</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Preço</label>
                  <input
                    type="text"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Modelo</label>
                  <input
                    type="text"
                    value={editData.model}
                    onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Ano</label>
                  <input
                    type="text"
                    value={editData.year}
                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Cor</label>
                  <select
                    value={editData.color}
                    onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  >
                    <option value="">Selecione</option>
                    {colors.map((color) => (
                      <option key={color.id} value={color.name}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Motor</label>
                  <select
                    value={editData.engine}
                    onChange={(e) => setEditData({ ...editData, engine: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  >
                    <option value="">Selecione</option>
                    {engines.map((engine) => (
                      <option key={engine.id} value={engine.name}>
                        {engine.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Câmbio</label>
                  <select
                    value={editData.transmission}
                    onChange={(e) => setEditData({ ...editData, transmission: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  >
                    <option value="">Selecione</option>
                    {transmissions.map((transmission) => (
                      <option key={transmission.id} value={transmission.name}>
                        {transmission.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Rodas</label>
                  <select
                    value={editData.wheels}
                    onChange={(e) => setEditData({ ...editData, wheels: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  >
                    <option value="">Selecione</option>
                    {wheels.map((wheel) => (
                      <option key={wheel.id} value={wheel.name}>
                        {wheel.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Suspensão</label>
                  <select
                    value={editData.suspension}
                    onChange={(e) => setEditData({ ...editData, suspension: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                  >
                    <option value="">Selecione</option>
                    {suspensions.map((suspension) => (
                      <option key={suspension.id} value={suspension.name}>
                        {suspension.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1 text-xs h-7">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-[#ff5722] hover:bg-[#ff5722]/90 text-white text-xs h-7"
                >
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showMovementModal && selectedVehicle && (
        <Dialog open={showMovementModal} onOpenChange={setShowMovementModal}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-sm">Movimentações - {selectedVehicle.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {!movementType ? (
                <div className="flex gap-6 justify-center items-center py-6">
                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition"
                    onClick={() => setMovementType("increase")}
                  >
                    <div className="flex items-center justify-center w-20 h-20 bg-green-500 rounded-lg">
                      <img
                        src="/images/design-mode/Carro-up.png"
                        alt="Aumentar Estoque"
                        className="w-14 h-14"
                      />
                    </div>
                  </div>

                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition"
                    onClick={() => setMovementType("decrease")}
                  >
                    <div className="flex items-center justify-center w-20 h-20 bg-red-500 rounded-lg">
                      <img
                        src="/images/design-mode/Carro-(1).png"
                        alt="Diminuir Estoque"
                        className="w-14 h-14"
                      />
                    </div>
                  </div>

                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition"
                    onClick={() => setMovementType("edit")}
                  >
                    <div className="flex items-center justify-center w-20 h-20 bg-[#ff5722] rounded-lg">
                      <img
                        src="/images/design-mode/Carro-Edit.png"
                        alt="Editar Produto"
                        className="w-14 h-14"
                      />
                    </div>
                  </div>
                </div>
              ) : movementType === "increase" || movementType === "decrease" ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    {movementType === "increase" ? "Quantidade a pedir:" : "Quantidade a remover:"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={movementQuantity}
                    onChange={(e) => setMovementQuantity(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                    placeholder="Ex: 2"
                  />
                </div>
              ) : null}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (movementType) {
                      setMovementType(null)
                      setMovementQuantity("")
                    } else {
                      setShowMovementModal(false)
                    }
                  }}
                  className="flex-1 text-xs h-7"
                >
                  {movementType ? "Voltar" : "Cancelar"}
                </Button>
                {movementType && (
                  <Button
                    onClick={handleMovementSubmit}
                    className="flex-1 bg-[#ff5722] hover:bg-[#ff5722]/90 text-white text-xs h-7"
                  >
                    Confirmar
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function parsePrice(input: string): number {
  if (!input) return 0
  // Remove currency and spaces, convert comma decimal to dot
  const cleaned = input.replace(/[^0-9,\.]/g, "").replace(/\./g, "").replace(",", ".")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

function formatCurrency(v: string | number): string {
  const n = typeof v === "string" ? Number(v) : v
  if (!Number.isFinite(n)) return String(v)
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
