import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axios.js';
import './Pedido.css';

export const PedidoCreate = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [error, setError] = useState('');

  const [selectedIds, setSelectedIds] = useState([]);
  const [status, setStatus] = useState('PENDENTE');

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoadingProdutos(true);
      setError('');
      try {
        const { data } = await api.get('/produtos');
        setProdutos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data || 'Erro ao carregar produtos');
      } finally {
        setLoadingProdutos(false);
      }
    };
    fetchProdutos();
  }, []);

  const total = useMemo(() => {
    const selected = new Set(selectedIds);
    return produtos
      .filter((p) => selected.has(p.id))
      .reduce((acc, p) => acc + parseFloat(p.preco), 0);
  }, [selectedIds, produtos]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (selectedIds.length === 0) {
      setError('Selecione ao menos um produto');
      return;
    }
    setLoading(true);
    try {
      await api.post('/pedidos', {
        produtos: selectedIds,
        valor: total,
        status,
      });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data || 'Erro ao criar pedido';
      setError(typeof msg === 'string' ? msg : 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pedido-container">
      <div className="pedido-card">
        <div className="pedido-header">
          <h1>Novo Pedido</h1>
          <button className="back-button" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pedido-form">
          <div className="form-section">
            <h3>Produtos</h3>
            {loadingProdutos ? (
              <p>Carregando produtos...</p>
            ) : produtos.length === 0 ? (
              <p>Nenhum produto disponível.</p>
            ) : (
              <ul className="produtos-list">
                {produtos.map((p) => (
                  <li key={p.id} className="produto-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelection(p.id)}
                      />
                      <span>
                        {p.marca} {p.modelo} • Ano {p.ano} • Estoque {p.estoque}
                        {' '}• R$ {Number.parseFloat(p.preco).toFixed(2)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-section inline">
            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PENDENTE">PENDENTE</option>
                <option value="EM_PROCESSO">EM_PROCESSO</option>
                <option value="FINALIZADO">FINALIZADO</option>
              </select>
            </div>

            <div className="field">
              <label>Total</label>
              <input type="text" value={`R$ ${total.toFixed(2)}`} readOnly />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Pedido'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PedidoCreate;
