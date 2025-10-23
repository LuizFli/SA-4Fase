"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import api from '../../../lib/api';

export default function VehicleDetail() {
  const params = useParams();
  const id = params.id;
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(()=>{
    async function load(){
      setLoading(true);
      const res = await api.get(`/vehicles/${id}`);
      if (!res.ok) { setError('Not found'); setLoading(false); return; }
      const data = await res.json();
      setVehicle(data);
      setLoading(false);
    }
    load();
  },[id]);

  async function handleBuy(){
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.post('/sales', { vehicleId: id, clientId: user.id, price: vehicle.price }, true);
      if (!res.ok) throw new Error('Purchase failed');
      router.push('/sales');
    } catch (err) { setError(err.message); }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!vehicle) return <div className="p-6">Vehicle not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-2">{vehicle.brand} {vehicle.model}</h1>
      <p>Year: {vehicle.year}</p>
      <p>Price: ${vehicle.price}</p>
      <p className="my-2">{vehicle.description}</p>
      <button onClick={handleBuy} className="p-2 bg-green-600 text-white rounded">Buy</button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
