import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Cadastro() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    endereco: '',
    avatar: ''
  });
  const [erro, setErro] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmeter = (e) => {
    e.preventDefault();
    setErro('');

    if (!formData.nome || !formData.email || !formData.senha || !formData.telefone || !formData.endereco) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const cadastradoComSucesso = cadastrar(formData);
    if (cadastradoComSucesso) {
      alert('Cadastro realizado com sucesso! Você recebeu 100 VATs de saldo inicial.');
      navigate('/login');
    } else {
      setErro('Falha ao registrar. Verifique se o e-mail já está em uso.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h1>Criar Nova Conta</h1>
          <p>Cadastre-se para começar a transacionar no brechó</p>
        </div>

        {erro && <div className="alert alert-danger">{erro}</div>}

        <form onSubmit={handleSubmeter} className="auth-form">
          <div className="form-group">
            <label>Nome Completo *</label>
            <input type="text" name="nome" placeholder="Ex: Maria Silva" value={formData.nome} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>E-mail de Acesso *</label>
            <input type="email" name="email" placeholder="nome@email.com" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Senha de Segurança *</label>
            <input type="password" name="senha" placeholder="Mínimo 6 caracteres" value={formData.senha} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Telefone de Contato *</label>
            <input type="text" name="telefone" placeholder="(88) 99999-0000" value={formData.telefone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Endereço de Entrega / Retirada *</label>
            <input type="text" name="endereco" placeholder="Rua, Número, Bairro - Cidade/CE" value={formData.endereco} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>URL do Avatar / Foto (Opcional)</label>
            <input type="text" name="avatar" placeholder="https://linkdafoto.com/imagem.jpg" value={formData.avatar} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-view" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}>
            Finalizar Registro
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          Já possui registro? <Link to="/login" style={{ color: '#06b6d4', fontWeight: '500', textDecoration: 'none' }}>Fazer Login</Link>
        </p>
      </div>
    </div>
  );
}