"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    let json = '';
    try {
      // try decode for unicode-safe content
      json = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch (e) {
      // fallback
      json = atob(base64);
    }
    const obj = JSON.parse(json);
    if (!obj.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return obj.exp > now;
  } catch (e) {
    return false;
  }
}

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // run only on client
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    if (isTokenValid(token)) {
      router.replace('/vehicles');
    } else {
      router.replace('/login');
    }
    setChecking(false);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-2xl font-medium">SA - Concessionária</h1>
        <p className="mt-6 text-gray-600">{checking ? 'Verificando sessão...' : 'Redirecionando...'}</p>
      </main>
    </div>
  );
}
