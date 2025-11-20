"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock } from 'lucide-react'
import { loginApi } from "@/lib/api"

export default function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const expired = search?.get('expired')
    if (expired) {
      setError('Token expirado. Faça login novamente.')
    }
  }, [search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) return
    try {
      setLoading(true)
      await loginApi(email, password)
      router.push("/")
    } catch (err: any) {
      setError(err?.message || "Falha no login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="/images/icone-salesview-20-281-29-202.png"
              alt="SaleSight"
              className="leading-10 w-24 h-24"
            />
            <span className="text-3xl font-bold text-[#1a1a1a]">SaleSight</span>
          </div>

          <p className="text-gray-600 mb-10 text-lg">Faça login na sua conta</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço de e-mail
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="admin@salesight.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-4 pr-14 bg-[#f5f5f5] border-none rounded-lg focus:ring-2 focus:ring-[#FD7401] text-base"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FD7401] rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-4 pr-14 bg-[#f5f5f5] border-none rounded-lg focus:ring-2 focus:ring-[#FD7401] text-base"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FD7401] rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-right mt-2">
                <a href="#" className="text-sm text-gray-600 hover:text-[#FD7401] underline">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#FD7401] hover:bg-[#e56a01] text-white font-semibold text-base rounded-lg disabled:opacity-70"
            >
              {loading ? "Entrando..." : "Entrar agora"}
            </Button>

          </form>
        </div>
      </div>
                
      {/* Right Side - Illustration */}
      <div className="hidden lg:flex w-1/2 bg-[#f8f9fa] items-center justify-center p-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#1e3a5f] rounded-full opacity-10"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#1e3a5f] rounded-full opacity-10"></div>
        
        <div className="relative">
              <img 
                src="/images/design-mode/Mobile%2520login-pana%25201%2520%25281%2529.png"
            alt="Mobile Login Illustration"
            className="w-full max-w-lg"
          />
        </div>
      </div>
    </div>
  )
}
