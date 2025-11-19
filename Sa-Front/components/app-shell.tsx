"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { Bell, Search, LayoutDashboard, Car, Settings, Clock, LogOut, Package } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type * as React from "react"
import { useRouter } from 'next/navigation'
import { logoutApi } from '@/lib/api'
import { deleteCookie, TOKENS } from '@/lib/session'

type AppShellProps = {
  title?: string
  children: React.ReactNode
}

export function AppShell({ title = "Dashboard", children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isDashboard = pathname === "/"
  const isEstoque = pathname.startsWith("/estoque")
  const isStatus = pathname.startsWith("/status")
  const isPedidos = pathname.startsWith("/pedidos")
  const isConfiguracoes = pathname.startsWith("/configuracoes")

  const navBtnBase = "w-full justify-start text-sm h-11 rounded-lg font-medium"

  return (
    <div className="flex h-screen bg-[#cdb8a5] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#1a1a1a] text-white flex flex-col">
        <div className="p-4 flex flex-col items-center gap-3 pt-6">
          <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center p-3">
            <img 
              src="/images/design-mode/Icone_SalesView%2520%25281%2529%25202.png"
              alt="SaleSight"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-lg">SaleSight</span>
        </div>

        <nav className="flex-1 px-2 py-4 flex flex-col justify-between">
          <div className="space-y-2">
            <Button
              asChild
              variant="ghost"
              className={cn(
                navBtnBase,
                isDashboard ? "bg-white text-black hover:bg-white hover:text-[#ff5722]" : "text-white hover:bg-white/10",
              )}
            >
              <Link href="/">
                <LayoutDashboard className={cn("w-5 h-5 mr-2", isDashboard ? "text-[#ff5722]" : "text-white")} />
                Dashboard
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={cn(
                navBtnBase,
                isEstoque ? "bg-white text-black hover:bg-white hover:text-[#ff5722]" : "text-white hover:bg-white/10",
              )}
            >
              <Link href="/estoque">
                <Car className={cn("w-5 h-5 mr-2", isEstoque ? "text-[#ff5722]" : "text-white")} />
                Estoque
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={cn(
                navBtnBase,
                isStatus ? "bg-white text-black hover:bg-white hover:text-[#ff5722]" : "text-white hover:bg-white/10",
              )}
            >
              <Link href="/status">
                <Clock className={cn("w-5 h-5 mr-2", isStatus ? "text-[#ff5722]" : "text-white")} />
                Status
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className={cn(
                navBtnBase,
                isPedidos ? "bg-white text-black hover:bg-white hover:text-[#ff5722]" : "text-white hover:bg-white/10",
              )}
            >
              <Link href="/pedidos">
                <Package className={cn("w-5 h-5 mr-2", isPedidos ? "text-[#ff5722]" : "text-white")} />
                Pedidos
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            <Button
              asChild
              variant="ghost"
              className={cn(
                navBtnBase,
                isConfiguracoes ? "bg-white text-black hover:bg-white hover:text-[#ff5722]" : "text-white hover:bg-white/10",
              )}
            >
              <Link href="/configuracoes">
                <Settings className={cn("w-5 h-5 mr-2", isConfiguracoes ? "text-[#ff5722]" : "text-white")} />
                Configurações
              </Link>
            </Button>

            <Button
              variant="ghost"
              onClick={async () => {
                try {
                  await logoutApi()
                } catch {}
                deleteCookie(TOKENS.access)
                deleteCookie(TOKENS.refresh)
                router.push('/login')
              }}
              className={cn(navBtnBase, "text-white hover:bg-white/10 justify-start")}
            >
              <LogOut className="w-5 h-5 mr-2 text-white" />
              Sair
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#cdb8a5] border-b border-[#b5a394] px-6 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-semibold text-[#1a1a1a]">{title}</h1>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar..." className="pl-9 w-[300px] bg-white border-none h-9 text-sm" />
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
                <span className="text-[10px] text-gray-600">Gerente de produção</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 space-y-3 overflow-auto flex flex-col">{children}</div>
      </main>
    </div>
  )
}
