"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(()=>{
    async function load(){
      setLoading(true);

      // verify token exists and not expired
      const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
      function isTokenValid(token){
        if (!token) return false;
        try{
          const payload = token.split('.')[1];
          if (!payload) return false;
          const base64 = payload.replace(/-/g,'+').replace(/_/g,'/');
          let json = '';
          try{ json = decodeURIComponent(atob(base64).split('').map(c=> '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')); } catch(e){ json = atob(base64); }
          const obj = JSON.parse(json);
          if (!obj.exp) return false;
          return obj.exp > Math.floor(Date.now()/1000);
        }catch(e){ return false; }
      }

      if (!isTokenValid(token)){
        // redirect to login if not authenticated
        router.push('/login');
        return;
      }

      const res = await api.get('/vehicles');
      const data = await res.json();
      if (res.ok) setVehicles(data || []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
