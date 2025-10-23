"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/api';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      const res = await api.get('/vehicles');
      const data = await res.json();
      if (res.ok) setVehicles(data || []);
      setLoading(false);
    }
    load();
  },[]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Vehicles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map(v=> (
          <div key={v.id} className="p-4 border rounded">
            <h2 className="text-lg font-semibold">{v.brand} {v.model}</h2>
            <p>Year: {v.year} - Price: ${v.price}</p>
            <Link href={`/vehicles/${v.id}`} className="text-blue-600">View</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
