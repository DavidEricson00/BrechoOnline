import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmeter = (e) => {
    e.preventDefault();
    setErro('');

    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    const logadoComSucesso = login(email, senha);
    if (logadoComSucesso) {
      navigate('/perfil');
    } else {
      setErro('E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>Bem-vindo de volta!</h1>
          <p>Insira suas credenciais para acessar a plataforma</p>
        </div>

        {erro && <div className="alert alert-danger">{erro}</div>}

        <form onSubmit={handleSubmeter} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail corporativo / pessoal</label>
            <input 
              type="email" 
              id="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Chave de acesso (Senha)</label>
            <input 
              type="password" 
              id="senha"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-view" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}>
            Autenticar no Sistema
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          Não possui uma chave? <Link to="/cadastro" style={{ color: '#06b6d4', fontWeight: '500', textDecoration: 'none' }}>Cadastre-se aqui</Link>
        </p>
      </div>
    </div>
  );
}