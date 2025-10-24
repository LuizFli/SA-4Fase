"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./Header";
import Link from "next/link";
import AccessDenied from "./AccessDenied";

export default function Shell({ children }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    // Allow the login page without token
    if (pathname === "/login") {
      setChecking(false);
      return;
    }

    // check access token in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    const isTokenValid = (token) => {
      if (!token) return false;
      try {
        const payload = token.split('.')[1];
        if (!payload) return false;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        let json = '';
        try {
          json = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
        } catch (e) {
          json = atob(base64);
        }
        const obj = JSON.parse(json);
        if (!obj.exp) return false;
        const now = Math.floor(Date.now() / 1000);
        return obj.exp > now;
      } catch (e) {
        return false;
      }
    };

    if (!isTokenValid(token)) {
      // mark as denied instead of redirecting so we can show an error page
      setChecking(false);
      setDenied(true);
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  // while checking token, show a placeholder to avoid flashing content
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Verificando sessão...</div>
      </div>
    );
  }

  // If we're on the login page, render children only (no header/sidebar)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (denied) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      <header className="w-full bg-white dark:bg-gray-900 border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">SA - Concessionária</h1>
          <span className="text-sm text-gray-500">Painel</span>
        </div>
        <div>
          <Header />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-white dark:bg-gray-800 border-r p-4">
          <nav className="flex flex-col gap-2">
            <Link className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" href="/vehicles">Veículos</Link>
            <Link className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" href="/sales">Vendas</Link>
            <Link className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" href="/iot">IoT</Link>
            <Link className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" href="/register">Registrar</Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
