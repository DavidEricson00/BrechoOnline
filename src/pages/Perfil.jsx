import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Perfil() {
  const { usuarioLogado, logout } = useAuth();
  const navigate = useNavigate();

  const handleSair = () => {
    logout();
    navigate('/login');
  };


  if (!usuarioLogado) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados do perfil...</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>

        <img 
          src={usuarioLogado.avatar} 
          alt={`Foto de ${usuarioLogado.nome}`} 
          style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fc9003', marginBottom: '1rem' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }} 
        />
        <h2 style={{ margin: 0, color: '#333' }}>{usuarioLogado.nome}</h2>
        
        <div style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: 'rgba(252, 144, 3, 0.1)', color: '#fc9003', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.1rem' }}>
          Carteira: {usuarioLogado.saldoVats} VATs
        </div>
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '1.5rem 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <strong style={{ display: 'block', color: '#555', fontSize: '0.9rem' }}>E-mail de Acesso</strong>
          <span style={{ fontSize: '1.05rem', color: '#222' }}>{usuarioLogado.email}</span>
        </div>

        <div>
          <strong style={{ display: 'block', color: '#555', fontSize: '0.9rem' }}>Telefone de Contato</strong>
          <span style={{ fontSize: '1.05rem', color: '#222' }}>{usuarioLogado.telefone}</span>
        </div>

        <div>
          <strong style={{ display: 'block', color: '#555', fontSize: '0.9rem' }}>Endereço de Entrega / Retirada</strong>
          <span style={{ fontSize: '1.05rem', color: '#222' }}>{usuarioLogado.endereco}</span>
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => navigate('/garagem')}
          style={{ flex: 1, padding: '0.7rem', background: '#fc9003', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Ir para Minha Garagem
        </button>
        
        <button 
          onClick={handleSair}
          style={{ padding: '0.7rem 1.5rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Sair da Conta
        </button>
      </div>
    </div>
  );
}