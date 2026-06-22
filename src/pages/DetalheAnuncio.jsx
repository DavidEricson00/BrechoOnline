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

  const [showVendaModal, setShowVendaModal] = useState(false);
  const [showTrocaModal, setShowTrocaModal] = useState(false);
  const [vendaValor, setVendaValor] = useState(0);
  const [pecasSelecionadas, setPecasSelecionadas] = useState([]);
  const [complementoVatsVal, setComplementoVatsVal] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const [showContraModal, setShowContraModal] = useState(false);
  const [contraValor, setContraValor] = useState(0);
  const [contraPecas, setContraPecas] = useState([]);
  const [contraComplemento, setContraComplemento] = useState(0);
  const [contraNegociacao, setContraNegociacao] = useState(null);

  const anunciosSalvos = useMemo(() => JSON.parse(localStorage.getItem('anuncios') || '[]'), []);
  const anuncio = useMemo(() => {
    return (
      [...anunciosSalvos].find((item) => item.id === id) || {
        id: null
      }
    );
  }, [anunciosSalvos, id]);

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

  const todasPropostas = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('propostas') || '[]');
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    if (negociacaoIdQuery) {
      setExpandedId(negociacaoIdQuery);
      const contrapropostaQuery = searchParams.get('contraproposta');
      if (contrapropostaQuery && todasNegociacoes.length > 0 && todasPropostas.length > 0 && usuarioLogado) {
        const neg = todasNegociacoes.find(n => n.id === negociacaoIdQuery);
        if (neg && neg.status === 'em_andamento') {
          const activeProposal = todasPropostas.find(pr => pr.negociacaoId === neg.id && pr.status === 'pendente');
          if (activeProposal && activeProposal.autorId !== usuarioLogado.id) {
            setContraNegociacao(neg);
            if (neg.tipo === 'venda') {
              setContraValor(activeProposal.valorVats || (anuncio.vats ?? 0));
            } else {
              setContraPecas([]);
              setContraComplemento(activeProposal.complementoVats || 0);
            }
            setShowContraModal(true);
          }
        }
      }
    }
  }, [negociacaoIdQuery, searchParams, todasNegociacoes, todasPropostas, usuarioLogado, anuncio]);

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

  const handleAceitar = (p) => {
    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    const proposta = propostas.find(pr => pr.negociacaoId === p.id && pr.status === 'pendente');
    if (!proposta) {
      alert('Nenhuma proposta pendente encontrada para aceitar.');
      return;
    }

    proposta.status = 'aceita';
    localStorage.setItem('propostas', JSON.stringify(propostas));

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const nIndex = negociacoes.findIndex(n => n.id === p.id);
    if (nIndex !== -1) {
      negociacoes[nIndex].status = 'aceita';
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
    const aIndex = anuncios.findIndex(a => a.id === anuncio.id);
    if (aIndex !== -1) {
      anuncios[aIndex].status = 'em_negociacao';
      localStorage.setItem('anuncios', JSON.stringify(anuncios));
    }

    alert('Proposta aceita! O anúncio agora está em negociação.');
    window.location.reload();
  };

  const handleRecusar = (p) => {
    if (!window.confirm('Tem certeza de que deseja recusar esta proposta?')) return;
    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    const proposta = propostas.find(pr => pr.negociacaoId === p.id && pr.status === 'pendente');
    if (!proposta) {
      alert('Nenhuma proposta pendente encontrada para recusar.');
      return;
    }

    proposta.status = 'recusada';
    localStorage.setItem('propostas', JSON.stringify(propostas));

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const nIndex = negociacoes.findIndex(n => n.id === p.id);
    if (nIndex !== -1) {
      negociacoes[nIndex].status = 'em_andamento';
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    alert('Proposta recusada.');
    window.location.reload();
  };

  const handleCancelarProposta = (p) => {
    if (!window.confirm('Tem certeza de que deseja cancelar sua proposta pendente?')) return;
    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    const proposta = propostas.find(pr => pr.negociacaoId === p.id && pr.status === 'pendente');
    if (!proposta) {
      alert('Nenhuma proposta pendente para cancelar.');
      return;
    }

    proposta.status = 'cancelada';
    localStorage.setItem('propostas', JSON.stringify(propostas));

    const activeProposals = propostas.filter(pr => pr.negociacaoId === p.id && (pr.status === 'pendente' || pr.status === 'aceita'));
    if (activeProposals.length === 0) {
      const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
      const nIndex = negociacoes.findIndex(n => n.id === p.id);
      if (nIndex !== -1) {
        negociacoes[nIndex].status = 'cancelada';
        negociacoes[nIndex].expiradoEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
      }
    }

    alert('Proposta cancelada.');
    window.location.reload();
  };

  const handleCancelarNegociacao = (p) => {
    if (!window.confirm('Tem certeza de que deseja cancelar a negociação?')) return;

    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    propostas.forEach(pr => {
      if (pr.negociacaoId === p.id && pr.status === 'pendente') {
        pr.status = 'cancelada';
      }
    });
    localStorage.setItem('propostas', JSON.stringify(propostas));

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const nIndex = negociacoes.findIndex(n => n.id === p.id);
    if (nIndex !== -1) {
      negociacoes[nIndex].status = 'cancelada';
      negociacoes[nIndex].expiradoEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
    const aIndex = anuncios.findIndex(a => a.id === anuncio.id);
    if (aIndex !== -1) {
      anuncios[aIndex].status = 'disponivel';
      localStorage.setItem('anuncios', JSON.stringify(anuncios));
    }

    alert('Negociação cancelada.');
    window.location.reload();
  };

  const handleConcluir = (p) => {
    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    const propostaAceita = propostas.find(pr => pr.negociacaoId === p.id && pr.status === 'aceita');

    if (!propostaAceita) {
      alert('Nenhuma proposta aceita encontrada para concluir a negociação.');
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const compradorIndex = usuarios.findIndex(u => u.id === p.compradorId);
    const sellerIndex = usuarios.findIndex(u => u.id === p.vendedorId);

    if (p.tipo === 'venda') {
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

      if (usuarioLogado.id === p.compradorId) {
        updateProfile(p.compradorId, { vats: usuarios[compradorIndex].vats });
      } else if (usuarioLogado.id === p.vendedorId) {
        updateProfile(p.vendedorId, { vats: usuarios[sellerIndex].vats });
      }
    } else if (p.tipo === 'troca') {
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

        if (usuarioLogado.id === p.compradorId) {
          updateProfile(p.compradorId, { vats: usuarios[compradorIndex].vats });
        } else if (usuarioLogado.id === p.vendedorId) {
          updateProfile(p.vendedorId, { vats: usuarios[sellerIndex].vats });
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
    const anuncioIndex = anuncios.findIndex(a => a.id === p.anuncioId);
    if (anuncioIndex !== -1) {
      anuncios[anuncioIndex].status = p.tipo === 'venda' ? 'vendido' : 'trocado';
      localStorage.setItem('anuncios', JSON.stringify(anuncios));
    }

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const negociacaoIndex = negociacoes.findIndex(n => n.id === p.id);
    if (negociacaoIndex !== -1) {
      negociacoes[negociacaoIndex].status = 'concluida';
      negociacoes[negociacaoIndex].expiradoEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    alert('Negociação concluída com sucesso!');
    window.location.reload();
  };

  const handleContrapropostaSubmit = (n, tipoProposta, valorVats, pecas, complemento) => {
    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    propostas.forEach(pr => {
      if (pr.negociacaoId === n.id && pr.status === 'pendente') {
        pr.status = 'substituida';
      }
    });

    const novaContraproposta = {
      id: crypto.randomUUID(),
      negociacaoId: n.id,
      autorId: usuarioLogado.id,
      tipo: tipoProposta,
      valorVats: tipoProposta === 'venda' ? valorVats : undefined,
      pecasOferecidas: tipoProposta === 'troca' ? pecas : undefined,
      complementoVats: tipoProposta === 'troca' ? complemento : undefined,
      status: 'pendente',
      criadoEm: new Date().toISOString()
    };
    propostas.push(novaContraproposta);
    localStorage.setItem('propostas', JSON.stringify(propostas));

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    const nIdx = negociacoes.findIndex(neg => neg.id === n.id);
    if (nIdx !== -1) {
      negociacoes[nIdx].status = 'em_andamento';
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    alert('Contraproposta enviada com sucesso!');
    window.location.reload();
  };

  const handleCriarPropostaVenda = (e) => {
    e.preventDefault();
    if (!usuarioLogado) {
      alert('Você precisa estar logado!');
      navigate('/login');
      return;
    }

    const valor = Number(vendaValor);
    if (isNaN(valor) || valor <= 0 || valor > (anuncio.vats || 0)) {
      setErrorMsg(`Insira um valor maior que 0 e menor ou igual a ${anuncio.vats} VATs.`);
      return;
    }

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    let negociacao = negociacoes.find(n => n.anuncioId === anuncio.id && n.compradorId === usuarioLogado.id && n.status !== 'cancelada');

    if (!negociacao) {
      negociacao = {
        id: crypto.randomUUID(),
        anuncioId: anuncio.id,
        compradorId: usuarioLogado.id,
        vendedorId: donoId,
        tipo: 'venda',
        status: 'em_andamento',
        criadoEm: new Date().toISOString(),
        expiradoEm: null
      };
      negociacoes.push(negociacao);
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    propostas.forEach(pr => {
      if (pr.negociacaoId === negociacao.id && pr.status === 'pendente') {
        pr.status = 'substituida';
      }
    });

    const novaProposta = {
      id: crypto.randomUUID(),
      negociacaoId: negociacao.id,
      autorId: usuarioLogado.id,
      tipo: 'venda',
      valorVats: valor,
      status: 'pendente',
      criadoEm: new Date().toISOString()
    };
    propostas.push(novaProposta);
    localStorage.setItem('propostas', JSON.stringify(propostas));

    alert('Proposta de compra enviada com sucesso!');
    setShowVendaModal(false);
    window.location.reload();
  };

  const handleCriarPropostaTroca = (e) => {
    e.preventDefault();
    if (!usuarioLogado) {
      alert('Você precisa estar logado!');
      navigate('/login');
      return;
    }

    if (pecasSelecionadas.length < 1 || pecasSelecionadas.length > 5) {
      setErrorMsg('Selecione de 1 a 5 peças para propor a troca.');
      return;
    }

    const complemento = Number(complementoVatsVal);
    if (isNaN(complemento) || complemento < 0 || complemento > (usuarioLogado?.vats || 0)) {
      setErrorMsg(`O complemento em VATs deve ser maior ou igual a 0 e menor ou igual a seu saldo (${usuarioLogado?.vats || 0}).`);
      return;
    }

    const negociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    let negociacao = negociacoes.find(n => n.anuncioId === anuncio.id && n.compradorId === usuarioLogado.id && n.status !== 'cancelada');

    if (!negociacao) {
      negociacao = {
        id: crypto.randomUUID(),
        anuncioId: anuncio.id,
        compradorId: usuarioLogado.id,
        vendedorId: donoId,
        tipo: 'troca',
        status: 'em_andamento',
        criadoEm: new Date().toISOString(),
        expiradoEm: null
      };
      negociacoes.push(negociacao);
      localStorage.setItem('negociacoes', JSON.stringify(negociacoes));
    }

    const propostas = JSON.parse(localStorage.getItem('propostas') || '[]');
    propostas.forEach(pr => {
      if (pr.negociacaoId === negociacao.id && pr.status === 'pendente') {
        pr.status = 'substituida';
      }
    });

    const novaProposta = {
      id: crypto.randomUUID(),
      negociacaoId: negociacao.id,
      autorId: usuarioLogado.id,
      tipo: 'troca',
      pecasOferecidas: pecasSelecionadas,
      complementoVats: complemento,
      status: 'pendente',
      criadoEm: new Date().toISOString()
    };
    propostas.push(novaProposta);
    localStorage.setItem('propostas', JSON.stringify(propostas));

    alert('Proposta de troca enviada com sucesso!');
    setShowTrocaModal(false);
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

          const getPropostaStatusBadgeStyle = (status) => {
            switch (status) {
              case 'pendente':
                return { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.1rem 0.4rem', borderRadius: '4px' };
              case 'aceita':
                return { backgroundColor: '#dcfce7', color: '#15803d', padding: '0.1rem 0.4rem', borderRadius: '4px' };
              case 'recusada':
                return { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.1rem 0.4rem', borderRadius: '4px' };
              case 'substituida':
                return { backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.1rem 0.4rem', borderRadius: '4px' };
              case 'cancelada':
                return { backgroundColor: '#f3f4f6', color: '#4b5563', padding: '0.1rem 0.4rem', borderRadius: '4px' };
              default:
                return { backgroundColor: '#e2e8f0', color: '#334155', padding: '0.1rem 0.4rem', borderRadius: '4px' };
            }
          };

          const renderTimeline = (n) => {
            const propostasDaNegociacao = todasPropostas
              .filter((pr) => pr.negociacaoId === n.id)
              .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));

            return (
              <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <h5 style={{ margin: '0 0 0.75rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Linha do Tempo de Propostas
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {propostasDaNegociacao.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>Nenhuma proposta registrada.</p>
                  ) : (
                    propostasDaNegociacao.map((pr) => {
                      const isComprador = pr.autorId === n.compradorId;
                      const autorLabel = isComprador ? 'Comprador (Proposta)' : 'Vendedor (Contraproposta)';
                      const timestamp = new Date(pr.criadoEm).toLocaleString();
                      
                      const conteudoProposta = pr.tipo === 'venda'
                        ? `Valor: ${pr.valorVats} VATs`
                        : (() => {
                            const pecasList = pr.pecasOferecidas || [];
                            const titulos = pecasList.map(pId => {
                              const item = anunciosSalvos.find(a => a.id === pId);
                              return item ? item.titulo : 'Peça Indisponível';
                            }).join(', ');
                            return `Peças: [${titulos}] + Complemento: ${pr.complementoVats || 0} VATs`;
                          })();

                      return (
                        <div key={pr.id} style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0.75rem', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: '#64748b', fontSize: '0.8rem' }}>
                            <span><strong>{autorLabel}</strong> em {timestamp}</span>
                            <span style={{ fontWeight: 700, textTransform: 'uppercase', ...getPropostaStatusBadgeStyle(pr.status) }}>{pr.status}</span>
                          </div>
                          <div style={{ color: '#1e293b', fontWeight: 600 }}>{conteudoProposta}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          };

          if (usuarioLogado?.id !== donoId) {
            // COMPRADOR VIEW
            if (negociacaoComprador) {
              const activeProposal = todasPropostas.find(pr => pr.negociacaoId === negociacaoComprador.id && pr.status === 'pendente');
              const ultimaPropostaVendedor = activeProposal && activeProposal.autorId === donoId;
              const ultimaPropostaComprador = activeProposal && activeProposal.autorId === usuarioLogado.id;

              return (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    Sua Negociação para esta Peça
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.4rem', fontSize: '0.95rem' }}>
                        Modalidade: <strong>{negociacaoComprador.tipo === 'venda' ? 'Compra' : 'Troca'}</strong>
                      </p>
                      <p style={{ margin: '0 0 0.4rem', fontSize: '0.95rem' }}>
                        Status: <span style={{ fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px', ...getStatusBadgeStyle(negociacaoComprador.status) }}>{negociacaoComprador.status}</span>
                      </p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                        {negociacaoComprador.status === 'em_andamento' && (
                          ultimaPropostaComprador ? 'Aguardando resposta do vendedor...' : 'O vendedor enviou uma contraproposta.'
                        )}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {negociacaoComprador.status === 'em_andamento' && (
                        <>
                          {ultimaPropostaVendedor && (
                            <button
                              onClick={() => handleAceitar(negociacaoComprador)}
                              style={{ padding: '0.6rem 1rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Aceitar Contraproposta
                            </button>
                          )}
                          {ultimaPropostaComprador && (
                            <button
                              onClick={() => handleCancelarProposta(negociacaoComprador)}
                              style={{ padding: '0.6rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Cancelar Proposta
                            </button>
                          )}
                          {ultimaPropostaVendedor && (
                            <button
                              onClick={() => handleRecusar(negociacaoComprador)}
                              style={{ padding: '0.6rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Recusar Contraproposta
                            </button>
                          )}
                        </>
                      )}

                      {negociacaoComprador.status === 'aceita' && (
                        <button
                          onClick={() => handleConcluir(negociacaoComprador)}
                          style={{ padding: '0.7rem 1.2rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Concluir Negócio
                        </button>
                      )}

                      {negociacaoComprador.status !== 'concluida' && negociacaoComprador.status !== 'cancelada' && (
                        <button
                          onClick={() => handleCancelarNegociacao(negociacaoComprador)}
                          style={{ padding: '0.6rem 1rem', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Cancelar Negociação
                        </button>
                      )}
                    </div>
                  </div>

                  {renderTimeline(negociacaoComprador)}
                </div>
              );
            } else {
              return (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                  {anuncio.status === 'vendido' || anuncio.status === 'trocado' ? (
                    <div style={{ color: '#ef4444', fontWeight: 700, padding: '1rem', border: '1px solid #fca5a5', borderRadius: '8px', width: '100%', textAlign: 'center', background: '#fee2e2' }}>
                      🚫 Esta peça já foi vendida ou trocada.
                    </div>
                  ) : (
                    <>
                      {podeVender && (
                        <button
                          onClick={() => {
                            if (!usuarioLogado) {
                              alert('Você precisa estar logado para fazer uma proposta!');
                              navigate('/login');
                              return;
                            }
                            setVendaValor(anuncio.vats);
                            setErrorMsg('');
                            setShowVendaModal(true);
                          }}
                          style={{ flex: '1 1 220px', padding: '0.9rem 1.1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Propor compra
                        </button>
                      )}

                      {podeTrocar && (
                        <button
                          onClick={() => {
                            if (!usuarioLogado) {
                              alert('Você precisa estar logado para fazer uma proposta!');
                              navigate('/login');
                              return;
                            }
                            setPecasSelecionadas([]);
                            setComplementoVatsVal(0);
                            setErrorMsg('');
                            setShowTrocaModal(true);
                          }}
                          style={{ flex: '1 1 220px', padding: '0.9rem 1.1rem', background: '#fc9003', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Propor troca
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            }
          } else {
              // VENDEDOR (DONO) VIEW
              return (
                <div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={handleEditar}
                      style={{ flex: '1 1 180px', padding: '0.9rem 1.1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Editar Anúncio
                    </button>
                    <button
                      onClick={handleExcluir}
                      style={{ flex: '1 1 180px', padding: '0.9rem 1.1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Excluir Anúncio
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
                          const activeProposal = todasPropostas.find(pr => pr.negociacaoId === n.id && pr.status === 'pendente');
                          const valorVats = activeProposal
                            ? (activeProposal.valorVats ?? activeProposal.complementoVats ?? 0)
                            : (n.vatsPropostos ?? n.precoOriginal ?? 0);
                          const ultimaPropostaComprador = activeProposal && activeProposal.autorId === n.compradorId;

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
                                    Tipo: <span style={{ fontWeight: 700, color: n.tipo === 'venda' ? '#0369a1' : '#d97706' }}>{n.tipo}</span> | Último valor: <strong>{valorVats} VATs</strong>
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
                                    {n.status === 'em_andamento' && (
                                      <span style={{ fontWeight: 600, color: '#334155' }}>
                                        {ultimaPropostaComprador ? 'Aguardando sua decisão.' : 'Aguardando resposta do comprador.'}
                                      </span>
                                    )}
                                  </p>

                                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {n.status === 'em_andamento' && (
                                      <>
                                        {ultimaPropostaComprador && (
                                          <button
                                            onClick={() => handleAceitar(n)}
                                            style={{ padding: '0.55rem 1rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                          >
                                            Aceitar
                                          </button>
                                        )}
                                        {ultimaPropostaComprador && (
                                          <button
                                            onClick={() => {
                                              setContraNegociacao(n);
                                              if (n.tipo === 'venda') {
                                                setContraValor(activeProposal.valorVats || valorVat);
                                              } else {
                                                setContraPecas([]);
                                                setContraComplemento(activeProposal.complementoVats || 0);
                                              }
                                              setErrorMsg('');
                                              setShowContraModal(true);
                                            }}
                                            style={{ padding: '0.55rem 1rem', background: '#fc9003', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                          >
                                            Contrapropor
                                          </button>
                                        )}
                                        {ultimaPropostaComprador && (
                                          <button
                                            onClick={() => handleRecusar(n)}
                                            style={{ padding: '0.55rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                          >
                                            Recusar Proposta
                                          </button>
                                        )}
                                      </>
                                    )}

                                    {n.status === 'aceita' && (
                                      <button
                                        onClick={() => handleConcluir(n)}
                                        style={{ padding: '0.6rem 1.2rem', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                      >
                                        Concluir Negócio
                                      </button>
                                    )}

                                    {n.status !== 'concluida' && n.status !== 'cancelada' && (
                                      <button
                                        onClick={() => handleCancelarNegociacao(n)}
                                        style={{ padding: '0.55rem 1rem', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                      >
                                        Cancelar Negociação
                                      </button>
                                    )}
                                  </div>

                                  {renderTimeline(n)}
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

        {/* MODAL DE PROPOSTA DE COMPRA (VENDA) */}
        {showVendaModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 800 }}>Enviar Proposta de Compra</h3>
              <form onSubmit={handleCriarPropostaVenda}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 600 }}>Valor da Proposta (VATs)</label>
                  <input
                    type="number"
                    required
                    value={vendaValor}
                    onChange={(e) => setVendaValor(Number(e.target.value))}
                    min={1}
                    max={anuncio.vats}
                    className="field-control"
                  />
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    O valor máximo é de {anuncio.vats} VATs (Preço anunciado).
                  </p>
                </div>

                {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 1rem' }}>⚠️ {errorMsg}</p>}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowVendaModal(false)} className="btn-view btn-compact" style={{ background: '#cbd5e1', color: '#1e293b' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-view btn-compact" style={{ background: '#0f172a', color: '#fff' }}>
                    Enviar Oferta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE PROPOSTA DE TROCA */}
        {showTrocaModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 800 }}>Enviar Proposta de Troca</h3>
              <form onSubmit={handleCriarPropostaTroca}>
                
                {/* Seleção de peças */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 700 }}>
                    Selecione suas Peças (Mínimo 1, Máximo 5):
                  </label>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem' }}>
                    {anunciosSalvos.filter(a => a.usuarioId === usuarioLogado?.id && a.status === 'disponivel').length === 0 ? (
                      <p style={{ margin: 0, padding: '1rem', color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        Você não possui peças disponíveis para troca. Cadastre-as na Garagem primeiro!
                      </p>
                    ) : (
                      anunciosSalvos
                        .filter(a => a.usuarioId === usuarioLogado?.id && a.status === 'disponivel')
                        .map(a => (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
                            <input
                              type="checkbox"
                              id={`checkbox-peca-${a.id}`}
                              checked={pecasSelecionadas.includes(a.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (pecasSelecionadas.length >= 5) {
                                    alert('Você pode selecionar no máximo 5 peças.');
                                    return;
                                  }
                                  setPecasSelecionadas([...pecasSelecionadas, a.id]);
                                } else {
                                  setPecasSelecionadas(pecasSelecionadas.filter(id => id !== a.id));
                                }
                              }}
                            />
                            <label htmlFor={`checkbox-peca-${a.id}`} style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                              {a.titulo} ({a.vats} VATs)
                            </label>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Complemento VAT */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 700 }}>
                    Complemento em VATs (Opcional):
                  </label>
                  <input
                    type="number"
                    value={complementoVatsVal}
                    onChange={(e) => setComplementoVatsVal(Number(e.target.value))}
                    min={0}
                    max={usuarioLogado?.vats || 0}
                    className="field-control"
                  />
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Seu saldo disponível: {usuarioLogado?.vats || 0} VATs.
                  </p>
                </div>

                {/* Equivalência VAT e Aviso */}
                {(() => {
                  const valorPecas = pecasSelecionadas.reduce((sum, pId) => {
                    const item = anunciosSalvos.find(a => a.id === pId);
                    return sum + (item?.vats || 0);
                  }, 0);
                  const totalProposta = valorPecas + complementoVatsVal;
                  const diferenca = Math.abs(totalProposta - anuncio.vats) / anuncio.vats;
                  const desequilibrada = diferenca > 0.2;

                  return (
                    <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <p style={{ margin: '0 0 0.5rem' }}>Valor Total Oferecido: <strong>{totalProposta} VATs</strong> (Anúncio: {anuncio.vats} VATs)</p>
                      {desequilibrada && (
                        <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>
                          ⚠️ Troca desequilibrada (diferença de {(diferenca * 100).toFixed(0)}%). Sugerimos adicionar mais peças ou alterar o complemento de VATs para equilibrar a oferta.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 1rem' }}>⚠️ {errorMsg}</p>}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowTrocaModal(false)} className="btn-view btn-compact" style={{ background: '#cbd5e1', color: '#1e293b' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-view btn-compact" style={{ background: '#fc9003', color: '#fff' }}>
                    Enviar Oferta de Troca
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CONTRAPROPOSTA (VENDEDOR) */}
        {showContraModal && contraNegociacao && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 800 }}>Enviar Contraproposta</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (contraNegociacao.tipo === 'troca') {
                  if (contraPecas.length < 1 || contraPecas.length > 5) {
                    alert('Selecione de 1 a 5 peças para propor a troca.');
                    return;
                  }
                  const comp = Number(contraComplemento);
                  // O complemento é pago pelo COMPRADOR, então o vendedor está contrapropondo e pedindo 'comp' VATs adicionais.
                  // Precisamos validar se o comprador tem esse saldo, mas no momento do envio nós apenas validamos se comp >= 0.
                  if (isNaN(comp) || comp < 0) {
                    alert('Complemento deve ser maior ou igual a 0.');
                    return;
                  }
                  handleContrapropostaSubmit(contraNegociacao, 'troca', 0, contraPecas, comp);
                } else {
                  const val = Number(contraValor);
                  if (isNaN(val) || val <= 0) {
                    alert('O valor deve ser maior que 0.');
                    return;
                  }
                  handleContrapropostaSubmit(contraNegociacao, 'venda', val, [], 0);
                }
              }}>

                {contraNegociacao.tipo === 'venda' ? (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 700 }}>
                      Valor da Contraproposta (VATs):
                    </label>
                    <input
                      type="number"
                      required
                      value={contraValor}
                      onChange={(e) => setContraValor(Number(e.target.value))}
                      min={1}
                      className="field-control"
                    />
                  </div>
                ) : (
                  <>
                    {/* Seleção de peças do comprador */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 700 }}>
                        Selecione as Peças do Comprador (Mínimo 1, Máximo 5):
                      </label>
                      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem' }}>
                        {anunciosSalvos.filter(a => a.usuarioId === contraNegociacao.compradorId && a.status === 'disponivel').length === 0 ? (
                          <p style={{ margin: 0, padding: '1rem', color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            O comprador não possui outras peças disponíveis.
                          </p>
                        ) : (
                          anunciosSalvos
                            .filter(a => a.usuarioId === contraNegociacao.compradorId && a.status === 'disponivel')
                            .map(a => (
                              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
                                <input
                                  type="checkbox"
                                  id={`checkbox-contra-${a.id}`}
                                  checked={contraPecas.includes(a.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      if (contraPecas.length >= 5) {
                                        alert('Máximo de 5 peças.');
                                        return;
                                      }
                                      setContraPecas([...contraPecas, a.id]);
                                    } else {
                                      setContraPecas(contraPecas.filter(id => id !== a.id));
                                    }
                                  }}
                                />
                                <label htmlFor={`checkbox-contra-${a.id}`} style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                                  {a.titulo} ({a.vats} VATs)
                                </label>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Complemento VAT contraproposta */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontWeight: 700 }}>
                        Complemento em VATs a pedir do Comprador:
                      </label>
                      <input
                        type="number"
                        value={contraComplemento}
                        onChange={(e) => setContraComplemento(Number(e.target.value))}
                        min={0}
                        className="field-control"
                      />
                    </div>

                    {/* Equivalência VAT contraproposta */}
                    {(() => {
                      const valorPecas = contraPecas.reduce((sum, pId) => {
                        const item = anunciosSalvos.find(a => a.id === pId);
                        return sum + (item?.vats || 0);
                      }, 0);
                      const totalProposta = valorPecas + contraComplemento;
                      const diferenca = Math.abs(totalProposta - anuncio.vats) / anuncio.vats;
                      const desequilibrada = diferenca > 0.2;

                      return (
                        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.9rem' }}>
                          <p style={{ margin: '0 0 0.5rem' }}>Valor Total Proposto: <strong>{totalProposta} VATs</strong> (Seu anúncio original: {anuncio.vats} VATs)</p>
                          {desequilibrada && (
                            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 700 }}>
                              ⚠️ Contraproposta desequilibrada (diferenca de ${(diferenca * 100).toFixed(0)}%).
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowContraModal(false)} className="btn-view btn-compact" style={{ background: '#cbd5e1', color: '#1e293b' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-view btn-compact" style={{ background: '#fc9003', color: '#fff' }}>
                    Enviar Contraproposta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}