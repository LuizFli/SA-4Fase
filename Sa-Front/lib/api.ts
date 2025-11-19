import { getCookie, setCookie, TOKENS, deleteCookie } from "./session"
// Allow using process.env in client-compiled code with type safety off
declare const process: any

const BASE_URL = (typeof process !== "undefined" && (process.env as any)?.NEXT_PUBLIC_API_BASE_URL) || "http://52.203.182.51:4000"

type Json = Record<string, any>

type FetchOptions = {
  method?: string
  body?: Json | FormData
  auth?: boolean
  headers?: HeadersInit
}

async function rawFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
  })
  return res
}

async function tryRefresh(): Promise<string | null> {
  try {
    const refreshToken = getCookie(TOKENS.refresh)
    if (!refreshToken) return null
    const res = await rawFetch("/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const newAccess = data?.accessToken
    if (newAccess) setCookie(TOKENS.access, newAccess)
    return newAccess || null
  } catch {
    return null
  }
}

export async function apiFetch<T = any>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = opts
  const hdrs: Record<string, string> = { ...(headers as Record<string, string>) }

  let sendBody: BodyInit | undefined
  if (!(body instanceof FormData)) {
    hdrs["Content-Type"] = hdrs["Content-Type"] || "application/json"
    if (body) sendBody = JSON.stringify(body)
  } else {
    sendBody = body
  }

  if (auth) {
    const token = getCookie(TOKENS.access)
    if (token) hdrs.Authorization = `Bearer ${token}`
  }

  let res = await rawFetch(path, { method, headers: hdrs, body: sendBody })

  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      hdrs.Authorization = `Bearer ${refreshed}`
      res = await rawFetch(path, { method, headers: hdrs, body: sendBody })
    } else {
      // Falha definitiva: limpar tokens e redirecionar para login no cliente
      deleteCookie(TOKENS.access)
      deleteCookie(TOKENS.refresh)
      if (typeof window !== 'undefined') {
        // Evita loops se já estiver em /login
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?expired=1'
        }
      }
      throw new Error('Token expirado. Faça login novamente.')
    }
  }

  if (!res.ok) {
    let errText = await res.text().catch(() => "")
    try {
      const asJson = JSON.parse(errText)
      throw new Error(asJson?.error || asJson?.message || res.statusText)
    } catch {
      throw new Error(errText || res.statusText)
    }
  }

  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return (await res.json()) as T
  }
  // @ts-ignore
  return (await res.text()) as T
}

// Auth
export async function loginApi(email: string, password: string) {
  const data = await apiFetch<{ accessToken: string; refreshToken: string; user: any }>("/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  })
  setCookie(TOKENS.access, data.accessToken)
  setCookie(TOKENS.refresh, data.refreshToken)
  return data
}

export async function logoutApi() {
  const refreshToken = getCookie(TOKENS.refresh)
  const res = await apiFetch("/logout", {
    method: "POST",
    body: { refreshToken },
  })
  return res
}

// User
export type User = {
  id: number
  name: string
  email: string
  cargo?: string | null
  fone?: string | null
}

export async function getMe(): Promise<User> {
  return apiFetch<User>("/me")
}

type ApiEnvelope<T> = { message?: string; data: T }

export async function updateUser(
  id: number,
  data: Partial<Pick<User, "name" | "email"> & { cargo?: string | null; fone?: string | null }>
): Promise<User> {
  const res = await apiFetch<ApiEnvelope<User>>(`/users/${id}`, { method: "PUT", body: data })
  return res.data
}

// Produtos
export type Produto = {
  id: number
  marca: string
  modelo: string
  ano: number
  cor: string
  motor: string
  cambio: string
  preco: string | number
  status: string
  bloco: any
  estoque: number
}

export async function getProdutos(): Promise<Produto[]> {
  return apiFetch<Produto[]>("/produtos")
}

export async function createProduto(p: Omit<Produto, "id">): Promise<Produto> {
  return apiFetch<Produto>("/produtos", { method: "POST", body: p })
}

export async function updateProduto(id: number, data: Partial<Omit<Produto, "id">>): Promise<Produto> {
  return apiFetch<Produto>(`/produtos/${id}`, { method: "PUT", body: data })
}

export async function deleteProduto(id: number): Promise<string> {
  return apiFetch<string>(`/produtos/${id}`, { method: "DELETE" })
}

// Pedidos - utilitário para finalizar rapidamente e atualizar estoque
export async function finalizePedido(id: number, status: string = "FINALIZADO") {
  // Usa rota autenticada POST /pedidos/:id com { status }
  return apiFetch(`/pedidos/${id}`, { method: "POST", body: { status } })
}

// Pedidos
export type Pedido = {
  id: number
  valor: string | number
  status: string
  idfila?: string | null
  createdAt: string
  updatedAt: string
  produto?: Produto[]
}

export async function getPedidos(): Promise<Pedido[]> {
  return apiFetch<Pedido[]>("/pedidos")
}

export async function createPedido(body: { valor: string | number; status: string; produtos: number[] }) {
  return apiFetch<Pedido>("/pedidos", { method: "POST", body })
}

export async function refreshPedidoStatus(id: number) {
  return apiFetch<{ status: string; idfila?: string }>(`/pedidos/${id}/status`, { method: "GET" })
}

export async function getSimuladorHealth() {
  // Request simulador health using current auth token so backend can allow access.
  // Do not force `auth: false` here because some deployments protect this route.
  return apiFetch<{ online: boolean; status: number | null; data: any }>(`/simulador/health`, { method: "GET" })
}
