"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      const res = await api.get("/dashboard/summary");
      const data = await res.json();
      if (!active) return;
      if (!res.ok) {
        setError(data?.error || "Falha ao carregar o dashboard");
      } else {
        setSummary(data);
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded border">
              <div className="text-sm text-gray-500">Veículos em estoque</div>
              <div className="text-3xl font-bold">{summary.totalProdutos}</div>
            </div>
            <div className="p-4 bg-white rounded border">
              <div className="text-sm text-gray-500">Pedidos em andamento</div>
              <div className="text-3xl font-bold">{summary.totalPedidosEmAndamento}</div>
            </div>
            <div className="p-4 bg-white rounded border">
              <div className="text-sm text-gray-500">Atualizado</div>
              <div className="text-lg">{new Date().toLocaleString()}</div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Últimos pedidos em andamento</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded border">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-3">ID</th>
                    <th className="p-3">Usuário (autor)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Quantidade</th>
                    <th className="p-3">Itens / Configuração</th>
                    <th className="p-3">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.pedidosEmAndamento?.map((p) => {
                    let quantidade = (p.pedidosProdutos || []).reduce((sum, pp) => sum + (pp.quantidade || 0), 0);
                    if ((!p.pedidosProdutos || p.pedidosProdutos.length === 0) && p.configuracao) {
                      quantidade = p.quantidade || 1;
                    }
                    let itens = '-';
                    if (p.configuracao) {
                      const cfg = p.configuracao;
                      const cfgPieces = [];
                      if (cfg.marca) cfgPieces.push(`Marca: ${cfg.marca}`);
                      if (cfg.modelo) cfgPieces.push(`Modelo: ${cfg.modelo}`);
                      if (cfg.cor) cfgPieces.push(`Cor: ${cfg.cor}`);
                      if (cfg.ano !== undefined) cfgPieces.push(`Ano: ${cfg.ano}`);
                      if (cfg.kilometragem !== undefined) cfgPieces.push(`Kilometragem: ${cfg.kilometragem}`);
                      itens = cfgPieces.length > 0 ? cfgPieces.join(', ') : '-';
                    } else if (p.pedidosProdutos && p.pedidosProdutos.length > 0) {
                      const grouped = new Map();
                      for (const pp of p.pedidosProdutos) {
                        const key = pp.produto?.id ?? pp.produtoId ?? pp.produto?.nome ?? Math.random();
                        const nome = pp.produto?.nome || `Produto ${pp.produtoId}`;
                        const preco = pp.produto?.preco ?? pp.precoUnitario ?? 0;
                        const q = pp.quantidade || 1;
                        const current = grouped.get(key) || { nome, quantidade: 0, preco };
                        current.quantidade += q;
                        if (current.preco === 0 && preco) current.preco = preco;
                        grouped.set(key, current);
                      }
                      itens = Array.from(grouped.values())
                        .map(e => `${e.nome}${e.quantidade > 1 ? ` x${e.quantidade}` : ''} (${(e.preco||0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`)
                        .join(', ');
                    }
                    return (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{p.id}</td>
                        <td className="p-3">{p.user?.name || '-'}</td>
                        <td className="p-3 capitalize">{p.status}</td>
                        <td className="p-3">{quantidade}</td>
                        <td className="p-3">{itens}</td>
                        <td className="p-3">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                      </tr>
                    );
                  })}
                  {(!summary.pedidosEmAndamento || summary.pedidosEmAndamento.length === 0) && (
                    <tr>
                      <td className="p-3 text-center text-gray-500" colSpan={6}>Nenhum pedido em andamento.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
