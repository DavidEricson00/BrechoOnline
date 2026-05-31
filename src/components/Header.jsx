import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { usuarioLogado, logout } = useAuth();
  const navigate = useNavigate();

  const handleSair = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">Memória<span>de Armário</span></Link>
        </div>

        <nav className="main-nav">
          <Link to="/" className="nav-link">Home</Link>
          
          {usuarioLogado ? (
            <>
              <Link to="/garagem" className="nav-link">Minha Garagem</Link>
              <Link to="/minhas-negociacoes" className="nav-link">Negociações</Link>
              <Link to="/perfil" className="nav-link">Meu Perfil</Link>
              

              <span className="vats-badge">
                {usuarioLogado.vats} VATs
              </span>

              <button 
                onClick={handleSair} 
                className="btn-view btn-danger" 
                style={{ padding: '0.4rem 1rem' }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" style={{ fontWeight: '600' }}>Entrar</Link>
              <Link to="/cadastro" className="btn-view" style={{ padding: '0.4rem 1rem' }}>Cadastrar</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}