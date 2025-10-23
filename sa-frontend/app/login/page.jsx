"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('access', data.access);
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
