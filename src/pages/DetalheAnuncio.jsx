import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
//import { anunciosMock } from '../mocks/anuncios';

export function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const negociacaoIdQuery = searchParams.get('negociacaoId');
  const { usuarioLogado, updateProfile } = useAuth();

  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (negociacaoIdQuery) {
      setExpandedId(negociacaoIdQuery);
    }
  }, [negociacaoIdQuery]);

  const anunciosSalvos = useMemo(() => JSON.parse(localStorage.getItem('anuncios') || '[]'), []);
  const anuncio = useMemo(() => {
    return (
      [...anunciosSalvos].find((item) => item.id === id) || {
        id: null
      }
    );
  }, [anunciosSalvos, id]);

  if (!anuncio?.id) {
    return (
      <div className="page-stack">
        <div className="page-card page-card--narrow" style={{ textAlign: 'center' }}>
          <h2 className="page-title" style={{ fontSize: '1.7rem' }}>Anúncio não encontrado</h2>
          <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>
            Esse anúncio não existe mais ou foi removido.
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '0.7rem 1.2rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const valorVat = anuncio.vats ?? anuncio.precoVats ?? 0;
  const donoId = anuncio.donoId ?? anuncio.usuarioId ?? '';
  const donoNome = anuncio.donoNome ?? 'Usuário da plataforma';
  const modalidade = anuncio.modalidade ?? 'Venda';
  const categoria = anuncio.categoria ?? 'Não informado';
  const tamanho = anuncio.tamanho ?? 'Não informado';
  const conservacao = anuncio.conservacao ?? 'Não informado';
  const podeVender = modalidade === 'Venda' || modalidade === 'Ambos';
  const podeTrocar = modalidade === 'Troca' || modalidade === 'Ambos';

  const salvarProposta = (tipoProposta) => {
    if (!usuarioLogado) {
      alert('Você precisa estar logado para fazer uma proposta!');
      navigate('/login');
      return;
    }

    if (donoId === usuarioLogado.id) {
      alert('Você não pode fazer uma proposta no seu próprio desapego!');
      return;
    }

    const negociacoesAtuais = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const novaProposta = {
      id: crypto.randomUUID(),
      anuncioId: anuncio.id,
      tituloAnuncio: anuncio.titulo,
      fotoAnuncio: anuncio.foto || '',
      tipoProposta,
      precoOriginal: valorVat,
      vatsPropostos: valorVat,
      compradorId: usuarioLogado.id,
      compradorNome: usuarioLogado.nome,
      vendedorId: donoId,
      vendedorNome: donoNome,
      status: 'ABERTA',
      ultimaPropostaPor: 'comprador',
      criadoEm: new Date().toISOString()
    };

    negociacoesAtuais.push(novaProposta);
    localStorage.setItem('negociacoes', JSON.stringify(negociacoesAtuais));

    alert('Proposta enviada com sucesso! Você pode acompanhar em "Minhas Negociações".');
    navigate('/minhas-negociacoes');
  };

  const handleEditar = () => {
    localStorage.setItem('editarAnuncioId', anuncio.id);
    navigate('/garagem');
  };

  const handleExcluir = () => {
    if (!window.confirm('Tem certeza que deseja excluir este anúncio?')) {
      return;
    }

    const anunciosAtualizados = anunciosSalvos.filter((item) => item.id !== anuncio.id);
    localStorage.setItem('anuncios', JSON.stringify(anunciosAtualizados));
    navigate('/garagem');
  };

  const todasNegociacoes = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('negociacoes') || '[]');
    } catch {
      return [];
    }
  }, []);

  const negociacoesDesteAnuncio = useMemo(
    () => todasNegociacoes.filter((n) => n.anuncioId === id),
    [todasNegociacoes, id]
  );

  const negociacaoComprador = useMemo(
    () => usuarioLogado ? negociacoesDesteAnuncio.find((n) => n.compradorId === usuarioLogado.id) : null,
    [negociacoesDesteAnuncio, usuarioLogado]
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
    const sellerIndex = usuarios.findIndex(u => u.id === p.vendedorId);

    const valorTransacao = p.vatsPropostos ?? p.precoOriginal ?? 0;

    if (p.tipoProposta === 'COMPRA') {
      if (compradorIndex === -1 || sellerIndex === -1) {
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
      usuarios[sellerIndex].vats = (usuarios[sellerIndex].vats || 0) + valorTransacao;

      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      // Atualiza estado do usuário logado
      if (usuarioLogado.id === p.compradorId) {
        updateProfile(p.compradorId, { vats: usuarios[compradorIndex].vats });
      } else if (usuarioLogado.id === p.vendedorId) {
        updateProfile(p.vendedorId, { vats: usuarios[sellerIndex].vats });
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

  return (
    <div className="page-stack">
      <div className="page-card page-card--wide" style={{ maxWidth: '760px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fc9003', cursor: 'pointer', fontWeight: 700, marginBottom: '1rem' }}>
          ← Voltar
        </button>

        <img src={anuncio.foto} alt={anuncio.titulo} style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '12px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{anuncio.titulo}</h2>
            <p className="page-subtitle">Desapego de: <strong>{donoNome}</strong></p>
          </div>

          <div className="vats-badge" style={{ fontSize: '1rem' }}>{valorVat} VATs</div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
          {[
            ['Categoria', categoria],
            ['Tamanho', tamanho],
            ['Conservação', conservacao],
            ['Modalidade', modalidade]
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '0.7rem 0.9rem', borderRadius: '999px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '0.92rem' }}>
              <strong style={{ marginRight: '0.35rem' }}>{label}:</strong>{value}
            </div>
          ))}
        </div>

        <p style={{ lineHeight: '1.7', color: '#334155', margin: '1.25rem 0 1.5rem' }}>{anuncio.descricao}</p>

        {(() => {
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

          if (usuarioLogado?.id !== donoId) {
            return negociacaoComprador ? (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                  Sua Negociação para esta Peça
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.95rem' }}>
                      Modalidade: <strong>{negociacaoComprador.tipoProposta}</strong>
                    </p>
                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.95rem' }}>
                      Último valor proposto: <strong style={{ color: '#fc9003' }}>{negociacaoComprador.vatsPropostos ?? negociacaoComprador.precoOriginal} VATs</strong>
                    </p>
                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.95rem' }}>
                      Status da negociação: <span style={{ fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px', ...getStatusBadgeStyle(negociacaoComprador.status) }}>{negociacaoComprador.status}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      {negociacaoComprador.status === 'ABERTA' && (
                        negociacaoComprador.ultimaPropostaPor === 'comprador' ? 'Aguardando resposta do vendedor...' : 'O vendedor fez uma contraproposta.'
                      )}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {negociacaoComprador.status === 'ABERTA' && (
                      <>
                        {negociacaoComprador.ultimaPropostaPor === 'vendedor' && (
                          <button
                            onClick={() => handleAceitar(negociacaoComprador)}
                            style={{ padding: '0.6rem 1rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Aceitar
                          </button>
                        )}
                        <button
                          onClick={() => handleContrapropor(negociacaoComprador)}
                          style={{ padding: '0.6rem 1rem', background: '#fc9003', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Contrapropor
                        </button>
                        <button
                          onClick={() => handleRecusar(negociacaoComprador)}
                          style={{ padding: '0.6rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Recusar
                        </button>
                      </>
                    )}

                    {negociacaoComprador.status === 'ACEITA' && (
                      <button
                        onClick={() => handleConcluir(negociacaoComprador)}
                        style={{ padding: '0.7rem 1.2rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Concluir Negócio
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {podeVender && (
                  <button
                    onClick={() => salvarProposta('COMPRA')}
                    style={{ flex: '1 1 220px', padding: '0.9rem 1.1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Propor compra
                  </button>
                )}

                {podeTrocar && (
                  <button
                    onClick={() => salvarProposta('TROCA')}
                    style={{ flex: '1 1 220px', padding: '0.9rem 1.1rem', background: '#fc9003', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Propor troca
                  </button>
                )}
              </div>
            );
          } else {
            return (
              <div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  <button
                    onClick={handleEditar}
                    style={{ flex: '1 1 180px', padding: '0.9rem 1.1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleExcluir}
                    style={{ flex: '1 1 180px', padding: '0.9rem 1.1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Excluir
                  </button>
                </div>

                {negociacoesDesteAnuncio.length > 0 && (
                  <div style={{ marginTop: '2.5rem', borderTop: '2px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800, marginBottom: '1.25rem' }}>
                      📥 Propostas Recebidas para esta Peça ({negociacoesDesteAnuncio.length})
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {negociacoesDesteAnuncio.map((n) => {
                        const estaExpandido = expandedId === n.id;
                        const valorVats = n.vatsPropostos ?? n.precoOriginal ?? 0;
                        const ultimaPropostaComprador = n.ultimaPropostaPor === 'comprador';

                        return (
                          <div
                            key={n.id}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              padding: '1.25rem',
                              background: '#ffffff',
                              boxShadow: estaExpandido ? '0 10px 15px -3px rgba(0,0,0,0.05)' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div
                              onClick={() => setExpandedId(estaExpandido ? null : n.id)}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <div>
                                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', color: '#334155' }}>
                                  Proposta de: <strong>{n.compradorNome || 'Interessado'}</strong>
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                                  Tipo: <span style={{ fontWeight: 700, color: n.tipoProposta === 'COMPRA' ? '#0369a1' : '#d97706' }}>{n.tipoProposta}</span> | Valor: <strong>{valorVats} VATs</strong>
                                </p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800, ...getStatusBadgeStyle(n.status) }}>
                                  {n.status}
                                </span>
                                <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                                  {estaExpandido ? '▼' : '▶'}
                                </span>
                              </div>
                            </div>

                            {estaExpandido && (
                              <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                <p style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: '#64748b' }}>
                                  Data de início: {n.criadoEm ? new Date(n.criadoEm).toLocaleDateString() : 'Não informada'} <br />
                                  {n.status === 'ABERTA' && (
                                    <span style={{ fontWeight: 600, color: '#334155' }}>
                                      {ultimaPropostaComprador ? 'Aguardando sua decisão.' : 'Aguardando resposta do comprador.'}
                                    </span>
                                  )}
                                </p>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  {n.status === 'ABERTA' && (
                                    <>
                                      {ultimaPropostaComprador && (
                                        <button
                                          onClick={() => handleAceitar(n)}
                                          style={{ padding: '0.55rem 1rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                        >
                                          Aceitar
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleContrapropor(n)}
                                        style={{ padding: '0.55rem 1rem', background: '#fc9003', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                      >
                                        Contrapropor
                                      </button>
                                      <button
                                        onClick={() => handleRecusar(n)}
                                        style={{ padding: '0.55rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                      >
                                        Recusar
                                      </button>
                                    </>
                                  )}

                                  {n.status === 'ACEITA' && (
                                    <button
                                      onClick={() => handleConcluir(n)}
                                      style={{ padding: '0.6rem 1.2rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                    >
                                      Concluir Negócio
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
}