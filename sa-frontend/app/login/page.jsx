"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // if token exists and is valid, redirect to vehicles
    const isTokenValid = (token) => {
      if (!token) return false;
      try {
        const payload = token.split('.')[1];
        if (!payload) return false;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        let json = '';
        try { json = decodeURIComponent(atob(base64).split('').map(function(c){ return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')); } catch (e) { json = atob(base64); }
        const obj = JSON.parse(json);
        if (!obj.exp) return false;
        const now = Math.floor(Date.now() / 1000);
        return obj.exp > now;
      } catch (e) {
        return false;
      }
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
    if (isTokenValid(token)) {
      router.replace('/vehicles');
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  // backend returns accessToken/refreshToken; save accessToken to localStorage
  localStorage.setItem('access', data.accessToken || data.access);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/vehicles');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="p-2 border" />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" className="p-2 border" />
        <button className="p-2 bg-blue-600 text-white rounded">Login</button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
