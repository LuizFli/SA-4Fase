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

      // normalize backend produto -> frontend vehicle shape
      // backend returns: { id, nome, descricao, preco, estoque, ... }
      const normalized = {
        id: data.id,
        // try to split nome into brand/model when possible (e.g. "Toyota Corolla")
        name: data.nome || `${data.brand || ''} ${data.model || ''}`.trim(),
        description: data.descricao || data.description || '',
        price: data.preco || data.price || 0,
        estoque: data.estoque || null,
        raw: data,
      };

      setVehicle(normalized);
      setLoading(false);
    }
    load();
  },[id]);

  async function handleBuy(){
    try {
      // create a pedido using the backend contract: { produtos: [ids], valor, status }
      const body = { produtos: [Number(id)], valor: vehicle.price, status: 'PENDENTE' };
      const res = await api.post('/sales/pedidos', body, true);
      if (!res.ok) {
        const errText = await res.text().catch(()=>res.statusText || 'Purchase failed');
        throw new Error(errText || 'Purchase failed');
      }
      router.push('/sales');
    } catch (err) { setError(err.message); }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!vehicle) return <div className="p-6">Vehicle not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-2">{vehicle.name}</h1>
      {vehicle.estoque !== null && <p>Stock: {vehicle.estoque}</p>}
      <p>Price: ${vehicle.price}</p>
      <p className="my-2">{vehicle.description}</p>
      <button onClick={handleBuy} className="p-2 bg-green-600 text-white rounded">Buy</button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
