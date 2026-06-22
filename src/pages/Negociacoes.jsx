import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Negociacoes() {
  const { usuarioLogado, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('comprador'); // 'comprador' ou 'vendedor'

  const todasNegociacoes = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('negociacoes') || '[]');
    } catch {
      return [];
    }
  }, []);

  const propostasEnviadas = useMemo(
    () => todasNegociacoes.filter((n) => n.compradorId === usuarioLogado?.id),
    [todasNegociacoes, usuarioLogado]
  );

  const propostasRecebidas = useMemo(
    () => todasNegociacoes.filter((n) => n.vendedorId === usuarioLogado?.id),
    [todasNegociacoes, usuarioLogado]
  );

  const handleAceitar = (p) => {
    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const index = negociacoes.findIndex(n => n.id === p.id);
    if (index !== -1) {
      negociacoes[index].status = 'ACEITA';
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
      alert('Proposta aceita com sucesso!');
      window.location.reload();
    }
  };

  const handleRecusar = (p) => {
    if (!window.confirm('Tem certeza de que deseja recusar esta proposta?')) return;
    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const index = negociacoes.findIndex(n => n.id === p.id);
    if (index !== -1) {
      negociacoes[index].status = 'RECUSADA';
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
      alert('Proposta recusada.');
      window.location.reload();
    }
  };

  const handleContrapropor = (p) => {
    const valorStr = window.prompt(`Digite o novo valor em VATs para a contraproposta (Valor atual: ${p.vatsPropostos ?? p.precoOriginal} VATs):`);
    if (valorStr === null) return;

    const valor = Number(valorStr);
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, insira um valor válido maior que 0.');
      return;
    }

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const index = negociacoes.findIndex(n => n.id === p.id);
    if (index !== -1) {
      negociacoes[index].vatsPropostos = valor;
      negociacoes[index].status = 'ABERTA';
      negociacoes[index].ultimaPropostaPor = usuarioLogado.id === p.compradorId ? 'comprador' : 'vendedor';
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
      alert('Contraproposta enviada com sucesso!');
      window.location.reload();
    }
  };

  const handleConcluir = (p) => {
    if (p.status !== 'ACEITA') {
      alert('Apenas negociações aceitas podem ser concluídas!');
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const compradorIndex = usuarios.findIndex(u => u.id === p.compradorId);
    const vendedorIndex = usuarios.findIndex(u => u.id === p.vendedorId);

    const valorTransacao = p.vatsPropostos ?? p.precoOriginal ?? 0;

    if (p.tipoProposta === 'COMPRA') {
      if (compradorIndex === -1 || vendedorIndex === -1) {
        alert('Erro ao localizar os participantes no sistema.');
        return;
      }

      const comprador = usuarios[compradorIndex];
      if ((comprador.vats || 0) < valorTransacao) {
        alert(`O comprador não possui saldo suficiente (${comprador.vats || 0} VATs disponíveis, necessário ${valorTransacao} VATs).`);
        return;
      }

      // Transferência de VATs
      usuarios[compradorIndex].vats = (usuarios[compradorIndex].vats || 0) - valorTransacao;
      usuarios[vendedorIndex].vats = (usuarios[vendedorIndex].vats || 0) + valorTransacao;

      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      // Atualiza estado do usuário logado
      if (usuarioLogado.id === p.compradorId) {
        updateProfile(p.compradorId, { vats: usuarios[compradorIndex].vats });
      } else if (usuarioLogado.id === p.vendedorId) {
        updateProfile(p.vendedorId, { vats: usuarios[vendedorIndex].vats });
      }
    }

    // Atualiza status do anúncio
    const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
    const anuncioIndex = anuncios.findIndex(a => a.id === p.anuncioId);
    if (anuncioIndex !== -1) {
      anuncios[anuncioIndex].status = p.tipoProposta === 'COMPRA' ? 'vendido' : 'trocado';
      localStorage.setItem('anuncios', JSON.stringify(anuncios));
    }

    // Atualiza status da negociação
    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const negociacaoIndex = negociacoes.findIndex(n => n.id === p.id);
    if (negociacaoIndex !== -1) {
      negociacoes[negociacaoIndex].status = 'CONCLUIDA';
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    alert('Negociação concluída com sucesso!');
    window.location.reload();
  };

  const listaExibida = abaAtiva === 'comprador' ? propostasEnviadas : propostasRecebidas;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'ABERTA':
        return { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
      case 'ACEITA':
        return { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'RECUSADA':
        return { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
      case 'CONCLUIDA':
        return { backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Painel de Negociações
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
          Gerencie e acompanhe o andamento das suas propostas de compra e troca.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '2rem' }}>
        <button
          onClick={() => setAbaAtiva('comprador')}
          style={{
            flex: 1,
            padding: '0.85rem',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            background: abaAtiva === 'comprador' ? '#ffffff' : 'transparent',
            color: abaAtiva === 'comprador' ? '#0f172a' : '#64748b',
            boxShadow: abaAtiva === 'comprador' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          🛍️ Como Comprador ({propostasEnviadas.length})
        </button>
        <button
          onClick={() => setAbaAtiva('vendedor')}
          style={{
            flex: 1,
            padding: '0.85rem',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            background: abaAtiva === 'vendedor' ? '#ffffff' : 'transparent',
            color: abaAtiva === 'vendedor' ? '#0f172a' : '#64748b',
            boxShadow: abaAtiva === 'vendedor' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          🏷️ Como Vendedor ({propostasRecebidas.length})
        </button>
      </div>

      {/* Grid List */}
      {listaExibida.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontStyle: 'italic' }}>
            Nenhuma negociação encontrada nesta categoria.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          {listaExibida.map((p) => {
            const foto = p.fotoAnuncio || 'https://via.placeholder.com/150?text=Sem+Foto';
            const valorVats = p.vatsPropostos ?? p.precoOriginal ?? 0;
            const participante = abaAtiva === 'comprador' ? p.vendedorNome || 'Vendedor' : p.compradorNome || 'Comprador';
            const dataProposta = p.criadoEm ? new Date(p.criadoEm).toLocaleDateString() : 'Não informada';
            const ultimaPropostaDele = (abaAtiva === 'comprador' && p.ultimaPropostaPor === 'vendedor') ||
                                       (abaAtiva === 'vendedor' && p.ultimaPropostaPor === 'comprador');

            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  flexWrap: 'wrap',
                  gap: '1.25rem'
                }}
                className="negociacao-card"
              >
                {/* Imagem do Produto */}
                <img
                  src={foto}
                  alt={p.tituloAnuncio}
                  style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                />

                {/* Detalhes da Negociação */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
                      {p.tituloAnuncio}
                    </h3>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: p.tipoProposta === 'COMPRA' ? '#e0f2fe' : '#fef3c7',
                        color: p.tipoProposta === 'COMPRA' ? '#0369a1' : '#d97706'
                      }}
                    >
                      {p.tipoProposta}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 0.3rem', fontSize: '0.92rem', color: '#64748b' }}>
                    {abaAtiva === 'comprador' ? 'Vendedor' : 'Comprador'}: <strong style={{ color: '#334155' }}>{participante}</strong>
                  </p>
                  <p style={{ margin: '0 0 0.3rem', fontSize: '0.92rem', color: '#64748b' }}>
                    Última proposta: <strong style={{ color: '#fc9003' }}>{valorVats} VATs</strong> {p.vatsPropostos !== p.precoOriginal && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>(Contraproposta)</span>}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                    Iniciada em: {dataProposta}
                  </p>
                </div>

                {/* Status e Ações */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', minWidth: '200px' }}>
                  {/* Status Badge */}
                  <span
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      letterSpacing: '0.02em',
                      ...getStatusBadgeStyle(p.status)
                    }}
                  >
                    {p.status}
                  </span>

                  {/* Ações Rápidas */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => navigate(`/anuncio/${p.anuncioId}?negociacaoId=${p.id}`)}
                      style={{
                        padding: '0.5rem 0.85rem',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#334155',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Abrir
                    </button>

                    {p.status === 'ABERTA' && (
                      <>
                        {ultimaPropostaDele && (
                          <button
                            onClick={() => handleAceitar(p)}
                            style={{
                              padding: '0.5rem 0.85rem',
                              background: '#22c55e',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            Aceitar
                          </button>
                        )}
                        <button
                          onClick={() => handleContrapropor(p)}
                          style={{
                            padding: '0.5rem 0.85rem',
                            background: '#fc9003',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Contrapropor
                        </button>
                        <button
                          onClick={() => handleRecusar(p)}
                          style={{
                            padding: '0.5rem 0.85rem',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Recusar
                        </button>
                      </>
                    )}

                    {p.status === 'ACEITA' && (
                      <button
                        onClick={() => handleConcluir(p)}
                        style={{
                          padding: '0.5rem 0.95rem',
                          background: '#0ea5e9',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        Concluir Negócio
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}