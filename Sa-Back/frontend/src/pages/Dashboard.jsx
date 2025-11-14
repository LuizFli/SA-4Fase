import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="logout-button"
          >
            {loading ? 'Saindo...' : 'Sair'}
          </button>
        </div>

        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>Bem-vindo, {user?.name || user?.email}!</h2>
            <p>Você está autenticado e esta é uma rota protegida.</p>
          </div>

          <div className="user-info">
            <h3>Informações do Usuário</h3>
            <div className="info-item">
              <strong>ID:</strong> {user?.id}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {user?.email}
            </div>
            <div className="info-item">
              <strong>Nome:</strong> {user?.name || 'Não informado'}
            </div>
            <div className="info-item" style={{ marginTop: 16 }}>
              <button className="logout-button" onClick={() => navigate('/pedidos/novo')}>
                Novo Pedido
              </button>
            </div>
            <div className="info-item" style={{ marginTop: 8 }}>
              <button className="logout-button" onClick={() => navigate('/pedidos')}>
                Meus Pedidos
              </button>
            </div>
            <div className="info-item" style={{ marginTop: 8 }}>
              <button className="logout-button" onClick={() => navigate('/estoque')}>
                Estoque
              </button>
            </div>
          </div>

          <div className="token-info">
            <h3>Tokens JWT</h3>
            <p>
              O access token é enviado automaticamente em todas as requisições
              através do header Authorization.
            </p>
            <p>
              Quando o access token expira, o axios interceptor tenta renovar
              automaticamente usando o refresh token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
