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

  const anunciosSalvos = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('anuncios') || '[]');
    } catch {
      return [];
    }
  }, []);

  const usuariosSalvos = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('usuarios') || '[]');
    } catch {
      return [];
    }
  }, []);

  const todasPropostas = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('propostas') || '[]');
    } catch {
      return [];
    }
  }, []);

  // Enrich negotiations with anuncio, participant profiles, and latest proposals
  const negociacoesEnriquecidas = useMemo(() => {
    return todasNegociacoes.map((n) => {
      const anuncio = anunciosSalvos.find((a) => a.id === n.anuncioId) || {};
      const comprador = usuariosSalvos.find((u) => u.id === n.compradorId) || {};
      const vendedor = usuariosSalvos.find((u) => u.id === n.vendedorId) || {};
      
      const propostasNegoc = todasPropostas
        .filter((p) => p.negociacaoId === n.id)
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
      
      const ultimaProposta = propostasNegoc[0] || null;
      
      return {
        ...n,
        anuncio,
        comprador,
        vendedor,
        propostas: propostasNegoc,
        ultimaProposta
      };
    });
  }, [todasNegociacoes, anunciosSalvos, usuariosSalvos, todasPropostas]);

  const propostasEnviadas = useMemo(
    () => negociacoesEnriquecidas.filter((n) => n.compradorId === usuarioLogado?.id),
    [negociacoesEnriquecidas, usuarioLogado]
  );

  const propostasRecebidas = useMemo(
    () => negociacoesEnriquecidas.filter((n) => n.vendedorId === usuarioLogado?.id),
    [negociacoesEnriquecidas, usuarioLogado]
  );

  const handleAceitar = (n) => {
    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    const proposta = propostas.find(pr => pr.negociacaoId === n.id && pr.status === 'pendente');
    if (!proposta) {
      alert('Nenhuma proposta pendente encontrada para aceitar.');
      return;
    }

    proposta.status = 'aceita';
    localStorage.setItem('propostas', JSON.stringify(propostas));

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const nIndex = negociacoes.findIndex(neg => neg.id === n.id);
    if (nIndex !== -1) {
      negociacoes[nIndex].status = 'aceita';
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
    const aIndex = anuncios.findIndex(a => a.id === n.anuncioId);
    if (aIndex !== -1) {
      anuncios[aIndex].status = 'em_negociacao';
      localStorage.setItem('anuncios', JSON.stringify(anuncios));
    }

    alert('Proposta aceita! A negociação está aceita e o anúncio está reservado.');
    window.location.reload();
  };

  const handleRecusar = (n) => {
    if (!window.confirm('Tem certeza de que deseja recusar esta proposta?')) return;
    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    const proposta = propostas.find(pr => pr.negociacaoId === n.id && pr.status === 'pendente');
    if (!proposta) {
      alert('Nenhuma proposta pendente encontrada para recusar.');
      return;
    }

    proposta.status = 'recusada';
    localStorage.setItem('propostas', JSON.stringify(propostas));

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const nIndex = negociacoes.findIndex(neg => neg.id === n.id);
    if (nIndex !== -1) {
      negociacoes[nIndex].status = 'em_andamento';
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    alert('Proposta recusada.');
    window.location.reload();
  };

  const handleCancelarProposta = (n) => {
    if (!window.confirm('Tem certeza de que deseja cancelar sua proposta pendente?')) return;
    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    const proposta = propostas.find(pr => pr.negociacaoId === n.id && pr.status === 'pendente');
    if (!proposta) {
      alert('Nenhuma proposta pendente para cancelar.');
      return;
    }

    proposta.status = 'cancelada';
    localStorage.setItem('propostas', JSON.stringify(propostas));

    const activeProposals = propostas.filter(pr => pr.negociacaoId === n.id && (pr.status === 'pendente' || pr.status === 'aceita'));
    if (activeProposals.length === 0) {
      const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
      const nIndex = negociacoes.findIndex(neg => neg.id === n.id);
      if (nIndex !== -1) {
        negociacoes[nIndex].status = 'cancelada';
        negociacoes[nIndex].expiradoEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
      }
    }

    alert('Proposta cancelada.');
    window.location.reload();
  };

  const handleCancelarNegociacao = (n) => {
    if (!window.confirm('Tem certeza de que deseja cancelar a negociação?')) return;

    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    propostas.forEach(pr => {
      if (pr.negociacaoId === n.id && pr.status === 'pendente') {
        pr.status = 'cancelada';
      }
    });
    localStorage.setItem('propostas', JSON.stringify(propostas));

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const nIndex = negociacoes.findIndex(neg => neg.id === n.id);
    if (nIndex !== -1) {
      negociacoes[nIndex].status = 'cancelada';
      negociacoes[nIndex].expiradoEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
    const aIndex = anuncios.findIndex(a => a.id === n.anuncioId);
    if (aIndex !== -1) {
      anuncios[aIndex].status = 'disponivel';
      localStorage.setItem('anuncios', JSON.stringify(anuncios));
    }

    alert('Negociação cancelada.');
    window.location.reload();
  };

  const handleConcluir = (n) => {
    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    const propostaAceita = propostas.find(pr => pr.negociacaoId === n.id && pr.status === 'aceita');

    if (!propostaAceita) {
      alert('Nenhuma proposta aceita encontrada para concluir a negociação.');
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const compradorIndex = usuarios.findIndex(u => u.id === n.compradorId);
    const sellerIndex = usuarios.findIndex(u => u.id === n.vendedorId);

    if (n.tipo === 'venda') {
      const valorTransacao = propostaAceita.valorVats || 0;
      if (compradorIndex === -1 || sellerIndex === -1) {
        alert('Erro ao localizar participantes.');
        return;
      }

      const comprador = usuarios[compradorIndex];
      if ((comprador.vats || 0) < valorTransacao) {
        alert(`O comprador não possui saldo suficiente (${comprador.vats || 0} VATs disponíveis, necessário ${valorTransacao} VATs).`);
        return;
      }

      usuarios[compradorIndex].vats = (usuarios[compradorIndex].vats || 0) - valorTransacao;
      usuarios[sellerIndex].vats = (usuarios[sellerIndex].vats || 0) + valorTransacao;

      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      if (usuarioLogado.id === n.compradorId) {
        updateProfile(n.compradorId, { vats: usuarios[compradorIndex].vats });
      } else if (usuarioLogado.id === n.vendedorId) {
        updateProfile(n.vendedorId, { vats: usuarios[sellerIndex].vats });
      }
    } else if (n.tipo === 'troca') {
      const complemento = propostaAceita.complementoVats || 0;
      if (complemento > 0) {
        if (compradorIndex === -1 || sellerIndex === -1) {
          alert('Erro ao localizar participantes.');
          return;
        }

        const comprador = usuarios[compradorIndex];
        if ((comprador.vats || 0) < complemento) {
          alert(`O comprador não possui saldo de VATs suficiente para pagar o complemento (${comprador.vats || 0} VATs disponíveis, necessário ${complemento} VATs).`);
          return;
        }

        usuarios[compradorIndex].vats = (usuarios[compradorIndex].vats || 0) - complemento;
        usuarios[sellerIndex].vats = (usuarios[sellerIndex].vats || 0) + complemento;

        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        if (usuarioLogado.id === n.compradorId) {
          updateProfile(n.compradorId, { vats: usuarios[compradorIndex].vats });
        } else if (usuarioLogado.id === n.vendedorId) {
          updateProfile(n.vendedorId, { vats: usuarios[sellerIndex].vats });
        }
      }

      const offeredItemIds = propostaAceita.pecasOferecidas || [];
      if (offeredItemIds.length > 0) {
        const anunciosList = JSON.parse(localStorage.getItem('anuncios') || '[]');
        offeredItemIds.forEach(itemId => {
          const idx = anunciosList.findIndex(a => a.id === itemId);
          if (idx !== -1) {
            anunciosList[idx].status = 'trocado';
          }
        });
        localStorage.setItem('anuncios', JSON.stringify(anunciosList));
      }
    }

    const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
    const anuncioIndex = anuncios.findIndex(a => a.id === n.anuncioId);
    if (anuncioIndex !== -1) {
      anuncios[anuncioIndex].status = n.tipo === 'venda' ? 'vendido' : 'trocado';
      localStorage.setItem('anuncios', JSON.stringify(anuncios));
    }

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const negociacaoIndex = negociacoes.findIndex(neg => neg.id === n.id);
    if (negociacaoIndex !== -1) {
      negociacoes[negociacaoIndex].status = 'concluida';
      negociacoes[negociacaoIndex].expiradoEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    alert('Negociação concluída com sucesso!');
    window.location.reload();
  };

  const listaExibida = abaAtiva === 'comprador' ? propostasEnviadas : propostasRecebidas;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'em_andamento':
        return { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
      case 'aceita':
        return { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'recusada':
        return { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
      case 'concluida':
        return { backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
      case 'cancelada':
        return { backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'aceita':
        return 'Aceita';
      case 'recusada':
        return 'Recusada';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Minhas Negociações
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
          Gerencie e acompanhe de forma centralizada todas as suas propostas de compra e troca.
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
            Nenhuma negociação encontrada nesta aba.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {listaExibida.map((n) => {
            const foto = n.anuncio?.foto || 'https://via.placeholder.com/150?text=Sem+Foto';
            const titulo = n.anuncio?.titulo || 'Peça Removida';
            const participante = abaAtiva === 'comprador' 
              ? n.vendedor?.nome || 'Dono da Peça' 
              : n.comprador?.nome || 'Comprador Interessado';
            
            const dataUltimaAtualizacao = n.ultimaProposta?.criadoEm 
              ? new Date(n.ultimaProposta.criadoEm).toLocaleDateString() 
              : new Date(n.criadoEm).toLocaleDateString();

            // Calculate proposal text details
            const propostasDetalhes = n.ultimaProposta
              ? (n.ultimaProposta.tipo === 'venda'
                  ? `Oferta de compra: ${n.ultimaProposta.valorVats} VATs`
                  : (() => {
                      const pecasOferecidas = n.ultimaProposta.pecasOferecidas || [];
                      const titulosPecas = pecasOferecidas.map(pId => {
                        const item = anunciosSalvos.find(a => a.id === pId);
                        return item ? item.titulo : 'Peça Indisponível';
                      }).join(', ');
                      return `Troca: [${titulosPecas}]${n.ultimaProposta.complementoVats ? ` + ${n.ultimaProposta.complementoVats} VATs` : ''}`;
                    })()
                )
              : `Sem proposta pendente (Valor original: ${n.anuncio?.vats || 0} VATs)`;

            const activeProposal = n.ultimaProposta && n.ultimaProposta.status === 'pendente' ? n.ultimaProposta : null;
            const isMyProposal = activeProposal && activeProposal.autorId === usuarioLogado?.id;
            const isReceivedProposal = activeProposal && activeProposal.autorId !== usuarioLogado?.id;

            return (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.2s ease',
                  flexWrap: 'wrap',
                  gap: '1.25rem'
                }}
                className="negociacao-card"
              >
                {/* Imagem do Produto */}
                <img
                  src={foto}
                  alt={titulo}
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                />

                {/* Detalhes da Negociação */}
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                      {titulo}
                    </h3>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: n.tipo === 'venda' ? '#e0f2fe' : '#fef3c7',
                        color: n.tipo === 'venda' ? '#0369a1' : '#d97706'
                      }}
                    >
                      {n.tipo === 'venda' ? 'Venda' : 'Troca'}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 0.3rem', fontSize: '0.92rem', color: '#64748b' }}>
                    {abaAtiva === 'comprador' ? 'Vendedor' : 'Comprador'}: <strong style={{ color: '#334155' }}>{participante}</strong>
                  </p>
                  
                  <p style={{ margin: '0 0 0.3rem', fontSize: '0.95rem', color: '#334155', fontWeight: 600 }}>
                    Última Proposta: <span style={{ color: '#fc9003' }}>{propostasDetalhes}</span>
                  </p>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                    Última atividade: {dataUltimaAtualizacao}
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
                      ...getStatusBadgeStyle(n.status)
                    }}
                  >
                    {getStatusLabel(n.status)}
                  </span>

                  {/* Ações Rápidas */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => navigate(`/anuncio/${n.anuncioId}?negociacaoId=${n.id}`)}
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
                      Abrir Área de Negociação
                    </button>

                    {n.status === 'em_andamento' && (
                      <>
                        {isReceivedProposal && (
                          <button
                            onClick={() => handleAceitar(n)}
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
                        {isReceivedProposal && (
                          <button
                            onClick={() => navigate(`/anuncio/${n.anuncioId}?negociacaoId=${n.id}&contraproposta=true`)}
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
                        )}
                        {isReceivedProposal && (
                          <button
                            onClick={() => handleRecusar(n)}
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
                        )}
                        {isMyProposal && (
                          <button
                            onClick={() => handleCancelarProposta(n)}
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
                            Cancelar Proposta
                          </button>
                        )}
                      </>
                    )}

                    {n.status === 'aceita' && (
                      <>
                        <button
                          onClick={() => navigate(`/chat/${n.id}`)}
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
                          Abrir Chat
                        </button>
                        <button
                          onClick={() => handleConcluir(n)}
                          style={{
                            padding: '0.5rem 0.95rem',
                            background: '#0f172a',
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
                      </>
                    )}

                    {n.status === 'concluida' && (
                      <>
                        <button
                          onClick={() => navigate(`/chat/${n.id}`)}
                          style={{
                            padding: '0.5rem 0.95rem',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Ver Chat
                        </button>
                        <button
                          onClick={() => navigate(`/avaliacoes/${n.id}`)}
                          style={{
                            padding: '0.5rem 0.95rem',
                            background: '#06b6d4',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Avaliar
                        </button>
                      </>
                    )}

                    {n.status !== 'concluida' && n.status !== 'cancelada' && (
                      <button
                        onClick={() => handleCancelarNegociacao(n)}
                        style={{
                          padding: '0.5rem 0.85rem',
                          background: '#4b5563',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar Negociação
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
