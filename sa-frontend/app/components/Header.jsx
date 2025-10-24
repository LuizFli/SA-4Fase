"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      setUser(null);
    }
  }, []);

  function handleLogout() {
    try {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
    } catch (e) {
      // ignore
    }
    // replace to login and refresh client state
    router.replace('/login');
    // also reload to ensure any stateful libs are cleared
    try { window.location.href = '/login'; } catch (e) { /* noop */ }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600">{user ? user.name : 'Convidado'}</div>
      <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Sair</button>
    </div>
  );
}
