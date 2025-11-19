"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle } from 'lucide-react'
import { useEffect } from "react"
import { getSimuladorHealth } from '@/lib/api'

export type Characteristics = {
  name: string
  brandModel: string
  color: string
  engine: string
  transmission: string
  wheels: string
  year: string
  price: string
  suspension: string
  quantity: number
}

const colors = [
  { id: "red", name: "Vermelho", hex: "#EF4444", cor: 1 },
  { id: "black", name: "Preto", hex: "#1F2937" , cor: 2},
  { id: "white", name: "Branco", hex: "#F3F4F6" , cor: 3},
  { id: "blue", name: "Azul", hex: "#3B82F6" , cor: 4},
  { id: "silver", name: "Prata", hex: "#D1D5DB", cor: 5 },
]
const engines = [
  { id: "1.0", name: "1.0" ,lamina1: 1},
  { id: "1.6", name: "1.6" ,lamina1: 2},
  { id: "2.0", name: "2.0" ,lamina1: 3},
  { id: "2.5", name: "2.5" ,lamina1: 4},
  { id: "3.0", name: "3.0" ,lamina1: 5 },
]

const transmissions = [
  { id: "manual", name: "Manual",lamina2: 1 },
  { id: "automatic", name: "Automático", lamina2: 2 },
  { id: "cvt", name: "CVT" , lamina2: 3 },
  { id: "dual", name: "Dual Clutch", lamina2: 4 },
  { id: "electric", name: "Elétrico", lamina2: 5 },
]

const wheels = [
  { id: "alloy", name: "Liga Leve",lamina3: 1 },
  { id: "steel", name: "Aço" ,lamina3: 2 },
  { id: "sport", name: "Esportiva" ,lamina3: 3 },
  { id: "offroad", name: "Off-Road" ,lamina3: 4 },
  { id: "premium", name: "Premium" ,lamina3: 5 },
]

const suspensions = [
  { id: "independent", name: "Independente", },
  { id: "macpherson", name: "MacPherson" },
  { id: "multilink", name: "Multi-link" },
  { id: "air", name: "Ar Comprimido" },
  { id: "adaptive", name: "Adaptativa" },
]

interface CustomizationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (characteristics: Characteristics) => void
  initialData?: Characteristics
}

export function CustomizationForm({ isOpen, onClose, onSubmit, initialData }: CustomizationFormProps) {
  const [characteristics, setCharacteristics] = useState<Characteristics>(
    initialData || {
      name: "",
      brandModel: "",
      color: "",
      engine: "",
      transmission: "",
      wheels: "",
      year: String(new Date().getFullYear()),
      price: "",
      suspension: "",
      quantity: 1,
    },
  )

  const [showConfirm, setShowConfirm] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [simOnline, setSimOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getSimuladorHealth()
        if (!mounted) return
        setSimOnline(Boolean(res?.online))
      } catch (e) {
        if (!mounted) return
        setSimOnline(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const isComplete = Object.values(characteristics).every((v) => v !== "")

  const handleSubmit = () => {
    if (!isComplete) {
      setSubmitError("Preencha todos os campos antes de enviar")
      return
    }
    setShowConfirm(true)
    setSubmitError("")
  }

  const confirmSubmit = () => {
    onSubmit(characteristics)
    setShowConfirm(false)
    setCharacteristics({
      name: "",
      brandModel: "",
      color: "",
      engine: "",
      transmission: "",
      wheels: "",
      year: String(new Date().getFullYear()),
      price: "",
      suspension: "",
      quantity: 1,
    })
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Pedir Produto
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${simOnline === null ? 'bg-gray-300 animate-pulse' : simOnline ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}
                ></span>
                <span className={`text-xs font-normal ${simOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {simOnline === null ? 'Verificando...' : simOnline ? 'Online' : 'Offline'}
                </span>
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            {/* Nome */}
            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Nome</label>
              <input
                type="text"
                placeholder="ex: Toyota Corolla"
                value={characteristics.name}
                onChange={(e) => setCharacteristics({ ...characteristics, name: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
              />
            </div>

            {/* Modelo */}
            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Modelo</label>
              <input
                type="text"
                placeholder="ex: Corolla, Civic"
                value={characteristics.brandModel}
                onChange={(e) => setCharacteristics({ ...characteristics, brandModel: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
              />
            </div>

            {/* Ano */}
            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Ano</label>
              <input
                type="number"
                placeholder="ex: 2024"
                value={characteristics.year}
                onChange={(e) => setCharacteristics({ ...characteristics, year: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
              />
            </div>

            {/* Preço */}
            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Preço</label>
              <input
                type="text"
                placeholder="ex: R$ 125.000"
                value={characteristics.price}
                onChange={(e) => setCharacteristics({ ...characteristics, price: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Cor</label>
              <select
                value={characteristics.color}
                onChange={(e) => setCharacteristics({ ...characteristics, color: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
              >
                <option value="">Selecione</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Motor */}
            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Motor</label>
              <select
                value={characteristics.engine}
                onChange={(e) => setCharacteristics({ ...characteristics, engine: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
              >
                <option value="">Selecione</option>
                {engines.map((engine) => (
                  <option key={engine.id} value={engine.id}>
                    {engine.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Câmbio */}
            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Câmbio</label>
              <select
                value={characteristics.transmission}
                onChange={(e) => setCharacteristics({ ...characteristics, transmission: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
              >
                <option value="">Selecione</option>
                {transmissions.map((transmission) => (
                  <option key={transmission.id} value={transmission.id}>
                    {transmission.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rodas */}
            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Rodas</label>
              <select
                value={characteristics.wheels}
                onChange={(e) => setCharacteristics({ ...characteristics, wheels: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
              >
                <option value="">Selecione</option>
                {wheels.map((wheel) => (
                  <option key={wheel.id} value={wheel.id}>
                    {wheel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Suspensão */}
            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Suspensão</label>
              <select
                value={characteristics.suspension}
                onChange={(e) => setCharacteristics({ ...characteristics, suspension: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
              >
                <option value="">Selecione</option>
                {suspensions.map((suspension) => (
                  <option key={suspension.id} value={suspension.id}>
                    {suspension.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <p className="text-red-600">{submitError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 text-xs h-8 bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isComplete}
              className="flex-1 h-8 bg-[#ff5722] hover:bg-[#ff5722]/90 text-white text-xs"
            >
              Enviar para Produção
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>Confirmar Pedido</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2 text-xs border-b pb-3">
              <p className="flex justify-between">
                <span className="text-gray-600">Nome:</span>
                <span className="font-medium">{characteristics.name}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Modelo:</span>
                <span className="font-medium">{characteristics.brandModel}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Ano:</span>
                <span className="font-medium">{characteristics.year}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Preço:</span>
                <span className="font-medium">{characteristics.price}</span>
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold mb-2 block text-gray-700">Quantidade a pedir:</label>
              <input
                type="number"
                min="1"
                defaultValue="1"
                onChange={(e) => setCharacteristics({ ...characteristics, quantity: Number.parseInt(e.target.value) })}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
                placeholder="Ex: 5"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1 text-xs h-8">
              Cancelar
            </Button>
            <Button
              onClick={confirmSubmit}
              className="flex-1 h-8 bg-[#ff5722] hover:bg-[#ff5722]/90 text-white text-xs"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
