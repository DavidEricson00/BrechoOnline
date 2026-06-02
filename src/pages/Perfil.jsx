import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';

export function Perfil() {
  const { usuarioLogado, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const vatsUsuario = usuarioLogado?.vats ?? usuarioLogado?.saldoVats ?? 0;

  const [editMode, setEditMode] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [avatar, setAvatar] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const avaliacoes = useMemo(() => {
    const all = JSON.parse(localStorage.getItem('avaliacoes') || '[]');
    if (!usuarioLogado) return { média: null, total: 0 };
    const meuId = usuarioLogado.id;
    const minhas = all.filter(a => a.destinatarioId === meuId || a.avaliadoId === meuId || a.usuarioAvaliadoId === meuId);
    const soma = minhas.reduce((s, it) => {
      const nota = it.nota ?? it.rating ?? it.valor ?? 0;
      return s + Number(nota || 0);
    }, 0);
    const media = minhas.length ? +(soma / minhas.length).toFixed(2) : null;
    return { media, total: minhas.length };
  }, [usuarioLogado]);

  const negociacoesConcluidas = useMemo(() => {
    if (!usuarioLogado) return 0;
    const all = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const concluido = new Set(['ACEITA','ACEITO','CONCLUIDA','CONCLUIDO','FINALIZADA','FINALIZADO','VENDIDO','TROCADO','ACEPTA','ACEPTED']);
    return all.filter(n => (n.compradorId === usuarioLogado.id || n.vendedorId === usuarioLogado.id) && concluido.has((n.status || '').toUpperCase())).length;
  }, [usuarioLogado]);

  const handleSair = () => {
    logout();
    navigate('/login');
  };

  const handleAlternarEdicao = () => {
    if (!editMode) {
      setNome(usuarioLogado.nome || '');
      setEmail(usuarioLogado.email || '');
      setTelefone(usuarioLogado.telefone || '');
      setEndereco(usuarioLogado.endereco || '');
      setAvatar(usuarioLogado.avatar || '');
      setNovaSenha('');
      setConfirmaSenha('');
    }

    setEditMode((valorAtual) => !valorAtual);
  };

  if (!usuarioLogado) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados do perfil...</p>;
  }

  const handleSalvar = () => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    if (usuarios.some(u => u.email === email && u.id !== usuarioLogado.id)) {
      alert('Este e-mail já está em uso por outro usuário.');
      return;
    }

    if (novaSenha && novaSenha !== confirmaSenha) {
      alert('A senha e a confirmação não coincidem.');
      return;
    }

    const updates = {
      nome: nome || usuarioLogado.nome,
      email: email || usuarioLogado.email,
      telefone: telefone || usuarioLogado.telefone,
      endereco: endereco || usuarioLogado.endereco,
      avatar: avatar || usuarioLogado.avatar,
    };
    if (novaSenha) updates.senha = novaSenha;

    const ok = updateProfile(usuarioLogado.id, updates);
    if (ok) {
      alert('Perfil atualizado com sucesso.');
      setEditMode(false);
      setNovaSenha(''); setConfirmaSenha('');
    } else {
      alert('Erro ao atualizar perfil.');
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ padding: '1.25rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff7eb 0%, #ffffff 70%)', border: '1px solid #f0e2cd', borderRadius: '18px', boxShadow: '0 14px 40px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', alignItems: 'center' }}>
          <img
            src={avatar || usuarioLogado.avatar}
            alt={`Foto de ${usuarioLogado.nome}`}
            style={{ width: 112, height: 112, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fc9003', background: '#fff' }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=User'; }}
          />

          <div>
            <p style={{ margin: 0, color: '#9a6b22', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tela do usuário</p>
            <h2 style={{ margin: '0.35rem 0 0.5rem', fontSize: '2rem', lineHeight: 1.1, color: '#1f1f1f' }}>{usuarioLogado.nome}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', minWidth: 140, padding: '0.8rem 1rem', borderRadius: 12, background: '#111827', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Comprar VATs</a>
            <button onClick={handleAlternarEdicao} style={{ background: '#fff', border: '1px solid #ddd', padding: '0.8rem 1rem', cursor: 'pointer', borderRadius: 12, fontWeight: 700 }}>{editMode ? 'Fechar edição' : 'Editar perfil'}</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1rem', alignItems: 'start' }}>
        <section style={{ background: '#fff', border: '1px solid #ececec', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 10px 28px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Dados pessoais</h3>
              <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>Nome, contato e login do usuário.</p>
            </div>
            {!editMode ? <button onClick={handleSair} style={{ padding: '0.65rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700 }}>Sair</button> : null}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#666', fontSize: 13, marginBottom: 6 }}>Nome</label>
              {editMode ? <input className="field-control" value={nome} onChange={e => setNome(e.target.value)} /> : <div style={{ padding: '0.85rem 0.95rem', background: '#f8fafc', borderRadius: 12 }}>{usuarioLogado.nome}</div>}
            </div>

            <div>
              <label style={{ display: 'block', color: '#666', fontSize: 13, marginBottom: 6 }}>E-mail</label>
              {editMode ? <input className="field-control" value={email} onChange={e => setEmail(e.target.value)} /> : <div style={{ padding: '0.85rem 0.95rem', background: '#f8fafc', borderRadius: 12 }}>{usuarioLogado.email}</div>}
            </div>

            <div>
              <label style={{ display: 'block', color: '#666', fontSize: 13, marginBottom: 6 }}>Telefone</label>
              {editMode ? <input className="field-control" value={telefone} onChange={e => setTelefone(e.target.value)} /> : <div style={{ padding: '0.85rem 0.95rem', background: '#f8fafc', borderRadius: 12 }}>{usuarioLogado.telefone}</div>}
            </div>

            <div>
              <label style={{ display: 'block', color: '#666', fontSize: 13, marginBottom: 6 }}>Endereço</label>
              {editMode ? <input className="field-control" value={endereco} onChange={e => setEndereco(e.target.value)} /> : <div style={{ padding: '0.85rem 0.95rem', background: '#f8fafc', borderRadius: 12 }}>{usuarioLogado.endereco}</div>}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#666', fontSize: 13, marginBottom: 6 }}>Avatar (URL)</label>
              {editMode ? <input className="field-control" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." /> : <div style={{ padding: '0.85rem 0.95rem', background: '#f8fafc', borderRadius: 12, wordBreak: 'break-all' }}>{usuarioLogado.avatar || '-'}</div>}
            </div>
          </div>

          {editMode ? (
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: 13, marginBottom: 6 }}>Nova senha</label>
                <input className="field-control" type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: 13, marginBottom: 6 }}>Confirmar senha</label>
                <input className="field-control" type="password" value={confirmaSenha} onChange={e => setConfirmaSenha(e.target.value)} />
              </div>
            </div>
          ) : null}

          {editMode ? (
            <div style={{ display: 'flex', gap: 12, marginTop: '1.25rem' }}>
              <button onClick={handleSalvar} style={{ padding: '0.75rem 1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700 }}>Salvar alterações</button>
              <button onClick={() => setEditMode(false)} style={{ padding: '0.75rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, fontWeight: 700 }}>Cancelar</button>
            </div>
          ) : null}
        </section>

        <aside style={{ display: 'grid', gap: '1rem' }}>
          <section style={{ background: '#fff', border: '1px solid #ececec', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 10px 28px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Estatísticas</h3>
            <p style={{ margin: '0.25rem 0 1rem', color: '#6b7280' }}>Informações calculadas em tempo real.</p>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ padding: '0.95rem', borderRadius: 14, background: '#f8fafc' }}>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Média de avaliações</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{avaliacoes.media ?? 'Sem avaliações'}</div>
              </div>
              <div style={{ padding: '0.95rem', borderRadius: 14, background: '#f8fafc' }}>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Negociações concluídas</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{negociacoesConcluidas}</div>
              </div>
            </div>
          </section>

          <section style={{ background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)', color: '#fff', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 10px 28px rgba(0,0,0,0.12)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Minha carteira</h3>
            <p style={{ margin: '0.35rem 0 0.95rem', color: 'rgba(255,255,255,0.75)' }}>Seu saldo disponível para compras e propostas.</p>
            <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{vatsUsuario} VATs</div>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'inline-flex', marginTop: '1rem', padding: '0.75rem 1rem', background: '#fc9003', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 800 }}>Comprar VATs</a>
          </section>

          <button onClick={() => navigate('/garagem')} style={{ padding: '0.9rem 1rem', background: '#fff', border: '1px solid #ddd', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>Ir para Minha Garagem</button>
        </aside>
      </div>
    </div>
  );
}