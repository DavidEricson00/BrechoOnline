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
        <div className="header-brand">
          <Link to="/" className="logo-link">Memória<span>de Armário</span></Link>
        </div>

        <nav className="main-nav">
          <div className="nav-group nav-primary">
            <Link to="/" className="nav-link">Home</Link>

            {usuarioLogado && (
              <>
                <Link to="/garagem" className="nav-link">Minha Garagem</Link>
                <Link to="/minhas-negociacoes" className="nav-link">Negociações</Link>
                <Link to="/perfil" className="nav-link">Meu Perfil</Link>
              </>
            )}
          </div>

          <div className="nav-group nav-actions">
            {usuarioLogado ? (
              <>
                <span className="vats-badge">
                  {usuarioLogado.vats} VATs
                </span>

                <button
                  onClick={handleSair}
                  className="btn-view btn-danger btn-compact"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link nav-link-strong">Entrar</Link>
                <Link to="/cadastro" className="btn-view btn-compact">Cadastrar</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}