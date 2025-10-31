"use client";
import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function PedidosPage(){
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  // campos para pedido customizado
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  const [ano, setAno] = useState('');
  const [kilometragem, setKilometragem] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      // buscar pedidos do usuário e lista de produtos para escolha
      const [rPed, rProd] = await Promise.all([api.get('/pedidos'), api.get('/produtos')]);
      const dPed = await rPed.json().catch(()=>[]);
      const dProd = await rProd.json().catch(()=>[]);
      if (rPed.ok) setPedidos(dPed || []);
      else setPedidos([]);
      if (rProd.ok) setProdutos(dProd || []);
      else setProdutos([]);
      setLoading(false);
    }
    load();
  },[]);

  async function handleCreate(e){
    e.preventDefault();
    setMessage(null);
    setCreating(true);
    let body = {};
    if (selectedProduct) {
      body = { produtos: [Number(selectedProduct)] };
    } else {
      // pedido customizado via configuracao (marca, modelo, cor, ano, kilometragem)
      if (!marca || !modelo || !cor || !ano || !kilometragem) {
        setMessage({ type: 'error', text: 'Preencha marca, modelo, cor, ano e kilometragem ou selecione um produto.' });
        setCreating(false);
        return;
      }
      body = { configuracao: { marca, modelo, cor, ano: Number(ano), kilometragem: Number(kilometragem) } };
    }
    const res = await api.post('/pedidos', body, true);
    const data = await res.json().catch(()=>null);
    if (res.ok) {
      setMessage({ type: 'success', text: 'Pedido criado com sucesso.' });
      // atualizar lista de pedidos
      const r = await api.get('/pedidos');
      const d = await r.json().catch(()=>[]);
      if (r.ok) setPedidos(d || []);
  setSelectedProduct(''); setMarca(''); setModelo(''); setCor(''); setAno(''); setKilometragem('');
    } else {
      const text = (data && data.error) ? data.error : (data && data.message) ? data.message : `Erro: ${res.status}`;
      setMessage({ type: 'error', text });
    }
    setCreating(false);
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Fazer Pedido</h1>

      <form onSubmit={handleCreate} className="mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Produto</label>
          <select value={selectedProduct} onChange={(e)=>setSelectedProduct(e.target.value)} className="border p-2 rounded w-full">
            <option value="">-- selecione --</option>
            {produtos.map(p=> (
              <option key={p.id} value={p.id}>{p.nome} — R$ {Number(p.preco).toFixed(2)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Marca</label>
            <input value={marca} onChange={e=>setMarca(e.target.value)} placeholder="Ex: Toyota" className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Modelo</label>
            <input value={modelo} onChange={e=>setModelo(e.target.value)} placeholder="Ex: Corolla" className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input value={cor} onChange={e=>setCor(e.target.value)} placeholder="Ex: Branco" className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ano</label>
            <input value={ano} onChange={e=>setAno(e.target.value)} placeholder="Ex: 2022" className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kilometragem</label>
            <input value={kilometragem} onChange={e=>setKilometragem(e.target.value)} placeholder="Ex: 15000" className="border p-2 rounded w-full" />
          </div>
        </div>

        <div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={creating}>{creating ? 'Enviando...' : 'Fazer pedido'}</button>
        </div>
        {message && <div className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>{message.text}</div>}
      </form>

      <h2 className="text-xl mb-3">Meus Pedidos</h2>
      <div className="space-y-3">
        {pedidos.length === 0 && <div className="text-sm text-muted">Nenhum pedido encontrado.</div>}
        {pedidos.map(p => (
          <div key={p.id} className="p-3 border rounded">
            <div className="font-medium">Pedido #{p.id} — {p.status}</div>
            <div className="text-sm text-gray-600">Criado em: {new Date(p.createdAt).toLocaleString()}</div>
            {p.configuracao && (
              <div className="mt-2 text-sm">
                <div className="font-semibold">Configuração:</div>
                <div>Marca: {p.configuracao.marca} | Modelo: {p.configuracao.modelo} | Cor: {p.configuracao.cor} | Ano: {p.configuracao.ano} | Kilometragem: {p.configuracao.kilometragem}</div>
              </div>
            )}
            <div className="mt-2">
              <div className="font-semibold">Produtos:</div>
              <ul className="list-disc ml-5">
                {(p.pedidosProdutos || []).map(pp => (
                  <li key={pp.id}>{pp.produto?.nome || pp.produtoId} — R$ {pp.precoUnitario ?? (pp.produto?.preco ?? '0')}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
