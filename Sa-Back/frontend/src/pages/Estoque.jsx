import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios.js';
import { useAuth } from '../hooks/useAuth.js';
import './Pedidos.css';

export const Estoque = () => {
  const navigate = useNavigate();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('TODOS'); // TODOS | ATIVO | INATIVO etc. (livre)

  const fetchProdutos = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/produtos');
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data || 'Erro ao carregar produtos';
      setError(typeof msg === 'string' ? msg : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Só busca após auth carregado e usuário autenticado
    if (!authLoading && isAuthenticated) {
      fetchProdutos();
    }
  }, [authLoading, isAuthenticated]);

  const produtosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return produtos.filter((p) => {
      const statusOk = status === 'TODOS' || String(p.status || '').toUpperCase() === status;
      const texto = `${p.marca || ''} ${p.modelo || ''} ${p.motor || ''} ${p.cambio || ''} ${p.cor || ''}`.toLowerCase();
      const buscaOk = !q || texto.includes(q);
      return statusOk && buscaOk;
    });
  }, [produtos, busca, status]);

  return (
    <div className="pedidos-container">
      <div className="pedidos-card">
        <div className="pedidos-header">
          <h1>Estoque</h1>
          <div className="pedidos-actions">
            <button className="button secondary" onClick={fetchProdutos} disabled={loading}>Atualizar</button>
            <button className="button" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="button secondary" onClick={() => navigate('/pedidos')}>Pedidos</button>
          </div>
        </div>

        <div className="filters">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por marca, modelo, cor..."
            style={{
              background: '#0b1220',
              color: '#e5e7eb',
              border: '1px solid #374151',
              borderRadius: 8,
              padding: 8,
              flex: 1,
            }}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="TODOS">Todos</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="EM_ESTOQUE">Em estoque</option>
            <option value="SEM_ESTOQUE">Sem estoque</option>
          </select>
          <span style={{ color: '#9ca3af' }}>Total: {produtosFiltrados.length}</span>
        </div>

        {authLoading ? (
          <div className="empty">Verificando autenticação...</div>
        ) : loading ? (
          <div className="empty">Carregando produtos...</div>
        ) : error ? (
          <div className="empty">{error}</div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="empty">Nenhum produto encontrado.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Ano</th>
                <th>Cor</th>
                <th>Motor</th>
                <th>Câmbio</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{p.marca}</td>
                  <td>{p.modelo}</td>
                  <td>{p.ano ?? '-'}</td>
                  <td>{p.cor ?? '-'}</td>
                  <td>{p.motor ?? '-'}</td>
                  <td>{p.cambio ?? '-'}</td>
                  <td>R$ {Number(p.preco || 0).toFixed(2)}</td>
                  <td>{p.estoque ?? 0}</td>
                  <td>{p.status ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Estoque;
