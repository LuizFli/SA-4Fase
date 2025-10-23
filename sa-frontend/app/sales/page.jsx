"use client";
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function SalesPage(){
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      const res = await api.get('/sales');
      const data = await res.json();
      if (res.ok) setSales(data || []);
      setLoading(false);
    }
    load();
  },[]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Sales</h1>
      <div className="space-y-3">
        {sales.map(s=> (
          <div key={s.id} className="p-3 border rounded">
            <div>Vehicle: {s.vehicle?.brand} {s.vehicle?.model}</div>
            <div>Price: ${s.price}</div>
            <div>Client: {s.client?.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
