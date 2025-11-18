"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Lock, User, Building2, Database, Shield } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import { getMe, updateUser } from "@/lib/api"

export function SettingsPanel() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    vendas: true,
  })

  const [profile, setProfile] = useState({
    nome: "",
    email: "",
    cargo: "",
    telefone: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const user = await getMe()
        if (!mounted) return
        setUserId(user.id)
        setProfile({
          nome: user.name || "",
          email: user.email || "",
          cargo: (user.cargo as string) || "",
          telefone: (user.fone as string) || "",
        })
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || "Falha ao carregar usuário")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  async function handleSave() {
    if (!userId) return
    setError(null)
    setSavedMsg(null)
    try {
      setSaving(true)
      const payload: any = {
        name: profile.nome,
        email: profile.email,
      }
      if (profile.cargo !== undefined) payload.cargo = profile.cargo
      if (profile.telefone !== undefined) payload.fone = profile.telefone
      const updated = await updateUser(userId, payload)
      setSavedMsg("Alterações salvas!")
      setProfile({
        nome: updated.name || "",
        email: updated.email || "",
        cargo: (updated.cargo as any) || "",
        telefone: (updated.fone as any) || "",
      })
    } catch (e: any) {
      setError(e?.message || "Erro ao salvar alterações")
    } finally {
      setSaving(false)
      setTimeout(() => setSavedMsg(null), 2500)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Tabs defaultValue="geral" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-white w-fit shrink-0">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="geral" className="space-y-4 m-0">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <CardTitle>Informações da Empresa</CardTitle>
                </div>
                <CardDescription>Configure as informações básicas da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa-nome">Nome da Empresa</Label>
                  <Input id="empresa-nome" defaultValue="SaleSight Automóveis" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-cnpj">CNPJ</Label>
                  <Input id="empresa-cnpj" defaultValue="12.345.678/0001-90" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-endereco">Endereço</Label>
                  <Input id="empresa-endereco" defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa-telefone">Telefone</Label>
                  <Input id="empresa-telefone" defaultValue="(11) 3000-0000" />
                </div>
                <Button className="bg-primary hover:bg-primary/90">Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-4 m-0">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <CardTitle>Informações Pessoais</CardTitle>
                </div>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={profile.nome}
                    onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={profile.cargo}
                    onChange={(e) => setProfile({ ...profile, cargo: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={profile.telefone}
                    onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                    disabled={loading}
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {savedMsg && <p className="text-sm text-green-600">{savedMsg}</p>}
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" disabled={loading || saving || !userId}>
                  {loading ? "Carregando..." : saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-4 m-0">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <CardTitle>Preferências de Notificações</CardTitle>
                </div>
                <CardDescription>Gerencie como você recebe notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">Receber atualizações por email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Vendas</Label>
                    <p className="text-sm text-muted-foreground">Notificar sobre novas vendas</p>
                  </div>
                  <Switch
                    checked={notifications.vendas}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, vendas: checked })}
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90">Salvar Preferências</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca" className="space-y-4 m-0">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <CardTitle>Alterar Senha</CardTitle>
                </div>
                <CardDescription>Atualize sua senha de acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input id="senha-atual" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nova-senha">Nova Senha</Label>
                  <Input id="nova-senha" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                  <Input id="confirmar-senha" type="password" />
                </div>
                <Button className="bg-primary hover:bg-primary/90">Alterar Senha</Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle>Autenticação em Dois Fatores</CardTitle>
                </div>
                <CardDescription>Adicione uma camada extra de segurança</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Ativar 2FA</Label>
                    <p className="text-sm text-muted-foreground">Requer código adicional no login</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <CardTitle>Dados e Privacidade</CardTitle>
                </div>
                <CardDescription>Gerencie seus dados pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full bg-transparent">
                  Exportar Meus Dados
                </Button>
                <Button variant="destructive" className="w-full">
                  Excluir Minha Conta
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
