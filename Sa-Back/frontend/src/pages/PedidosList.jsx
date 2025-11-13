import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios.js';
import './Pedidos.css';

const StatusBadge = ({ status }) => {
  const s = String(status || '').toUpperCase();
  const labelMap = {
    PENDENTE: 'Pendente',
    EM_PROCESSO: 'Em processamento',
    FINALIZADO: 'Finalizado',
  };
  const cls = s === 'FINALIZADO' ? 'finalizado' : s === 'EM_PROCESSO' ? 'em_processo' : 'pendente';
  const label = labelMap[s] || s;
  return <span className={`badge ${cls}`}>{label}</span>;
};


export const PedidosList = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('EM_ANDAMENTO'); // EM_ANDAMENTO | TODOS | PENDENTE | EM_PROCESSO | FINALIZADO

  const fetchPedidos = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/pedidos');
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data || 'Erro ao carregar pedidos';
      setError(typeof msg === 'string' ? msg : 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    if (filter === 'TODOS') return pedidos;
    if (filter === 'EM_ANDAMENTO') return pedidos.filter((p) => String(p.status).toUpperCase() !== 'FINALIZADO');
    return pedidos.filter((p) => String(p.status).toUpperCase() === filter);
  }, [pedidos, filter]);

  return (
    <div className="pedidos-container">
      <div className="pedidos-card">
        <div className="pedidos-header">
          <h1>Meus Pedidos</h1>
          <div className="pedidos-actions">
            <button className="button secondary" onClick={() => navigate('/pedidos/novo')}>Novo Pedido</button>
            <button className="button secondary" onClick={fetchPedidos} disabled={loading}>Atualizar</button>
            <button className="button" onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </div>

        <div className="filters">
          <label>Filtro:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="TODOS">Todos</option>
            <option value="PENDENTE">Pendente</option>
            <option value="EM_PROCESSO">Em processo</option>
            <option value="FINALIZADO">Finalizado</option>
          </select>
          <span style={{ color: '#9ca3af' }}>Total: {pedidosFiltrados.length}</span>
        </div>

        {loading ? (
          <div className="empty">Carregando pedidos...</div>
        ) : error ? (
          <div className="empty">{error}</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="empty">Nenhum pedido encontrado.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Criado em</th>
                <th>Status</th>
                <th>Valor</th>
                <th>Produtos</th>
                <th>ID Fila</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p) => {
                const created = p.createdAt ? new Date(p.createdAt) : null;
                const valor = p.valor ? Number.parseFloat(p.valor) : 0;
                const produtos = p.produto || [];
                return (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{created ? created.toLocaleString() : '-'}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>R$ {valor.toFixed(2)}</td>
                    <td>
                      {produtos.length === 0
                        ? '—'
                        : produtos.map((pr) => `${pr.marca} ${pr.modelo}`).join(', ')}
                    </td>
                    <td>{p.idfila || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PedidosList;
