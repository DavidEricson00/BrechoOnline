import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const lerStorage = (chave, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(chave) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const salvarStorage = (chave, valor) => {
  localStorage.setItem(chave, JSON.stringify(valor));
};

const formatarData = (data) => {
  if (!data) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(data));
};

export function Avaliacoes() {
  const { id } = useParams();
  const { usuarioLogado } = useAuth();
  const [estrelas, setEstrelas] = useState(10);
  const [comentario, setComentario] = useState('');
  const [, setAtualizacao] = useState(0);

  const dados = (() => {
    const negociacoes = lerStorage('negociacoes');
    const anuncios = lerStorage('anuncios');
    const usuarios = lerStorage('usuarios');
    const avaliacoes = lerStorage('avaliacoes');

    const negociacao = negociacoes.find((n) => n.id === id);
    const anuncio = negociacao ? anuncios.find((a) => a.id === negociacao.anuncioId) : null;
    const comprador = negociacao ? usuarios.find((u) => u.id === negociacao.compradorId) : null;
    const vendedor = negociacao ? usuarios.find((u) => u.id === negociacao.vendedorId) : null;
    const avaliacoesDaNegociacao = avaliacoes.filter((a) => a.negociacaoId === id);

    return { negociacao, anuncio, comprador, vendedor, avaliacoesDaNegociacao };
  })();

  const { negociacao, anuncio, comprador, vendedor, avaliacoesDaNegociacao } = dados;

  if (!negociacao) {
    return (
      <section className="page-card page-card--narrow negotiation-state">
        <h1 className="page-title">Avaliações não encontradas</h1>
        <p className="page-subtitle">Essa negociação não existe ou foi removida.</p>
        <Link className="btn-view" to="/minhas-negociacoes">Voltar</Link>
      </section>
    );
  }

  const usuarioParticipa = [negociacao.compradorId, negociacao.vendedorId].includes(usuarioLogado?.id);
  const avaliadoId = usuarioLogado?.id === negociacao.compradorId ? negociacao.vendedorId : negociacao.compradorId;
  const avaliado = avaliadoId === vendedor?.id ? vendedor : comprador;
  const minhaAvaliacao = avaliacoesDaNegociacao.find((a) => a.autorId === usuarioLogado?.id);
  const podeAvaliar = usuarioParticipa && negociacao.status === 'concluida' && !minhaAvaliacao;

  const nomeUsuario = (usuarioId) => {
    if (usuarioId === comprador?.id) return comprador?.nome || 'Comprador';
    if (usuarioId === vendedor?.id) return vendedor?.nome || 'Vendedor';
    return 'Participante';
  };

  const enviarAvaliacao = (evento) => {
    evento.preventDefault();
    if (!podeAvaliar) return;

    const avaliacoes = lerStorage('avaliacoes');
    if (avaliacoes.some((a) => a.negociacaoId === negociacao.id && a.autorId === usuarioLogado.id)) {
      alert('Você já avaliou esta negociação.');
      setAtualizacao((valor) => valor + 1);
      return;
    }

    avaliacoes.push({
      id: `avl_${crypto.randomUUID().substring(0, 8)}`,
      negociacaoId: negociacao.id,
      autorId: usuarioLogado.id,
      avaliadoId,
      estrelas: Number(estrelas),
      comentario: comentario.trim() || null,
      criadoEm: new Date().toISOString()
    });

    salvarStorage('avaliacoes', avaliacoes);
    setComentario('');
    setEstrelas(10);
    setAtualizacao((valor) => valor + 1);
    alert('Avaliação registrada.');
  };

  return (
    <div className="ratings-page">
      <section className="chat-header">
        <div>
          <Link className="nav-link" to="/minhas-negociacoes">Voltar para negociações</Link>
          <h1 className="page-title">Avaliação da negociação</h1>
          <p className="page-subtitle">
            {anuncio?.titulo || 'Peça removida'} · avaliação dupla entre comprador e vendedor.
          </p>
        </div>
        <Link className="btn-view" to={`/chat/${negociacao.id}`}>Abrir chat</Link>
      </section>

      {negociacao.status !== 'concluida' ? (
        <section className="page-card page-card--narrow negotiation-state">
          <h2 className="page-section-title">Avaliação bloqueada</h2>
          <p className="page-subtitle">As avaliações só são liberadas depois que a negociação é concluída.</p>
        </section>
      ) : (
        <section className="ratings-grid">
          <form className="page-card ratings-form" onSubmit={enviarAvaliacao}>
            <h2 className="page-section-title">Sua avaliação</h2>
            {minhaAvaliacao ? (
              <div className="rating-done">
                <strong>Você já avaliou {nomeUsuario(minhaAvaliacao.avaliadoId)}.</strong>
                <span>{minhaAvaliacao.estrelas}/10 estrelas</span>
              </div>
            ) : (
              <>
                <p className="page-subtitle">Você está avaliando {avaliado?.nome || 'o outro participante'}.</p>

                <label className="rating-label" htmlFor="estrelas">
                  Estrelas: <strong>{estrelas}/10</strong>
                </label>
                <input
                  id="estrelas"
                  className="rating-range"
                  max="10"
                  min="1"
                  onChange={(evento) => setEstrelas(evento.target.value)}
                  type="range"
                  value={estrelas}
                />
                <div className="rating-stars" aria-hidden="true">
                  {Array.from({ length: 10 }, (_, index) => (
                    <span className={index < estrelas ? 'is-filled' : ''} key={index}>★</span>
                  ))}
                </div>

                <textarea
                  className="field-control field-control--textarea"
                  onChange={(evento) => setComentario(evento.target.value)}
                  placeholder="Comentário opcional"
                  value={comentario}
                  maxLength={500}
                />
                <button className="btn-view" disabled={!podeAvaliar} type="submit">
                  Registrar avaliação
                </button>
              </>
            )}
          </form>

          <div className="page-card ratings-list">
            <h2 className="page-section-title">Avaliações registradas</h2>
            {avaliacoesDaNegociacao.length === 0 ? (
              <p className="page-subtitle">Ainda não há avaliações para esta negociação.</p>
            ) : (
              avaliacoesDaNegociacao.map((avaliacao) => (
                <article className="rating-card" key={avaliacao.id}>
                  <div>
                    <strong>{nomeUsuario(avaliacao.autorId)}</strong>
                    <span>avaliou {nomeUsuario(avaliacao.avaliadoId)}</span>
                  </div>
                  <strong className="rating-score">{avaliacao.estrelas}/10</strong>
                  {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
                  <time>{formatarData(avaliacao.criadoEm)}</time>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
