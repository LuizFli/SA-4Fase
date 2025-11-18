"use client"

import {
  Bell,
  Search,
  ChevronDown,
  LayoutDashboard,
  Car,
  ShoppingCart,
  Activity,
  Users,
  Settings,
  Gauge,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OverviewCards } from "@/components/overview-cards"
import { VehiclesSummaryTable } from "@/components/vehicles-summary-table"
import Image from "next/image"

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-[#cdb8a5] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[165px] bg-[#1a1a1a] text-white flex flex-col">
        <div className="p-4 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
            <Image src="/images/design-mode/Icone_SalesView%2520%25281%2529%25202.png" alt="SaleSight" width={32} height={32} className="w-8 h-8" />
          </div>
          <span className="font-semibold text-sm">SaleSight</span>
        </div>

        <nav className="flex-1 px-2 py-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-9 bg-white text-black hover:bg-white/90 rounded-lg"
            >
              <LayoutDashboard className="w-4 h-4 mr-2 text-[#ff5722]" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-9 text-white hover:bg-white/10 rounded-lg"
            >
              <Car className="w-4 h-4 mr-2" />
              Veículos
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-9 text-white hover:bg-white/10 rounded-lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Vendas
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-9 text-white hover:bg-white/10 rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Funcionários
            </Button>
        
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-9 text-white hover:bg-white/10 rounded-lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </nav>

        {/* Bottom icon */}
        <div className="p-4">
          <Button size="icon" className="w-10 h-10 rounded-full bg-[#ff5722] hover:bg-[#ff5722]/90">
            <Activity className="w-5 h-5 text-white" />
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#cdb8a5] border-b border-[#b5a394] px-6 py-3 flex items-center justify-between flex-srhrink-0">
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Dashboard</h1>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar veículos, vendas..."
                className="pl-9 w-[300px] bg-white border-none h-9 text-sm"
              />
            </div>

            {/* Notifications */}
            <Button size="icon" variant="ghost" className="relative h-9 w-9">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff5722] rounded-full" />
            </Button>

            {/* User profile */}
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-medium">Admin</span>
                <span className="text-[10px] text-gray-600">Gerente de vendas</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="flex-1 p-4 space-y-3 overflow-hidden flex flex-col">
          {/* Overview section */}
          <div className="flex items-center justify-between flex-srhrink-0">
            <h2 className="text-base font-semibold">Visão Geral</h2>
            <Button variant="outline" size="sm" className="bg-white text-xs h-8">
              Últimos 30 dias
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </div>

          <div className="flex-srhrink-0">
            <OverviewCards />
          </div>

          {/* Vehicles summary and Sales progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
            <div className="lg:col-span-2 min-h-0">
              <VehiclesSummaryTable />
            </div>
            <div className="min-h-0">
              
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
