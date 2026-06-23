import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DIAS_EXPIRACAO_CHAT = 7;
const MS_DIA = 24 * 60 * 60 * 1000;

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

const estaExpirado = (negociacao) => {
  if (!['concluida', 'cancelada'].includes(negociacao.status)) return false;

  const dataBase = negociacao.finalizadoEm || negociacao.expiradoEm || negociacao.criadoEm;
  if (!dataBase) return false;

  if (negociacao.expiradoEm) {
    return Date.now() > new Date(negociacao.expiradoEm).getTime();
  }

  return Date.now() - new Date(dataBase).getTime() > DIAS_EXPIRACAO_CHAT * MS_DIA;
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

export function ChatNegociacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuarioLogado, updateProfile } = useAuth();
  const [texto, setTexto] = useState('');
  const [, setAtualizacao] = useState(0);

  const dados = (() => {
    const negociacoes = lerStorage('negociacoes');
    const anuncios = lerStorage('anuncios');
    const usuarios = lerStorage('usuarios');
    const propostas = lerStorage('propostas');
    const mensagens = lerStorage('mensagens');

    const negociacao = negociacoes.find((n) => n.id === id);
    const anuncio = negociacao ? anuncios.find((a) => a.id === negociacao.anuncioId) : null;
    const comprador = negociacao ? usuarios.find((u) => u.id === negociacao.compradorId) : null;
    const vendedor = negociacao ? usuarios.find((u) => u.id === negociacao.vendedorId) : null;
    const mensagensDaNegociacao = mensagens
      .filter((m) => m.negociacaoId === id)
      .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
    const propostaAceita = propostas.find((p) => p.negociacaoId === id && p.status === 'aceita');

    return { negociacao, anuncio, comprador, vendedor, mensagensDaNegociacao, propostaAceita };
  })();

  const { negociacao, anuncio, comprador, vendedor, mensagensDaNegociacao, propostaAceita } = dados;

  if (!negociacao) {
    return (
      <section className="page-card page-card--narrow negotiation-state">
        <h1 className="page-title">Chat não encontrado</h1>
        <p className="page-subtitle">Essa negociação não existe ou foi removida.</p>
        <Link className="btn-view" to="/minhas-negociacoes">Voltar</Link>
      </section>
    );
  }

  const usuarioParticipa = [negociacao.compradorId, negociacao.vendedorId].includes(usuarioLogado?.id);
  const chatDisponivel = ['aceita', 'concluida', 'cancelada'].includes(negociacao.status) && !estaExpirado(negociacao);
  const podeEnviar = negociacao.status === 'aceita' && usuarioParticipa;
  const ehVendedor = usuarioLogado?.id === negociacao.vendedorId;

  if (!usuarioParticipa || !chatDisponivel) {
    return (
      <section className="page-card page-card--narrow negotiation-state">
        <h1 className="page-title">Chat indisponível</h1>
        <p className="page-subtitle">
          O chat só fica disponível para participantes de negociações aceitas e sai do ar 7 dias após o encerramento.
        </p>
        <Link className="btn-view" to="/minhas-negociacoes">Voltar</Link>
      </section>
    );
  }

  const concluirNegociacao = () => {
    if (!ehVendedor) return;
    if (!window.confirm('Concluir esta negociação?')) return;
    if (!propostaAceita) {
      alert('Nenhuma proposta aceita foi encontrada para concluir.');
      return;
    }

    const usuarios = lerStorage('usuarios');
    const compradorIndex = usuarios.findIndex((u) => u.id === negociacao.compradorId);
    const vendedorIndex = usuarios.findIndex((u) => u.id === negociacao.vendedorId);

    if (vendedorIndex === -1) {
      alert('Erro ao localizar o vendedor. Entre novamente ou recrie a negociação com um anúncio seu.');
      return;
    }

    if (negociacao.tipo === 'venda') {
      const valorTransacao = propostaAceita.valorVats || 0;
      if (compradorIndex === -1) {
        alert('Erro ao localizar o comprador. Para testar venda com saldo, use uma negociação criada por outro usuário cadastrado.');
        return;
      }

      if ((usuarios[compradorIndex].vats || 0) < valorTransacao) {
        alert(`O comprador não possui saldo suficiente para pagar ${valorTransacao} VATs.`);
        return;
      }

      usuarios[compradorIndex].vats = (usuarios[compradorIndex].vats || 0) - valorTransacao;
      usuarios[vendedorIndex].vats = (usuarios[vendedorIndex].vats || 0) + valorTransacao;
    }

    if (negociacao.tipo === 'troca') {
      const complemento = propostaAceita.complementoVats || 0;
      if (complemento > 0) {
        if (compradorIndex === -1) {
          alert('Erro ao localizar o comprador. Para testar troca com complemento, use uma negociação criada por outro usuário cadastrado.');
          return;
        }

        if ((usuarios[compradorIndex].vats || 0) < complemento) {
          alert(`O comprador não possui saldo suficiente para pagar o complemento de ${complemento} VATs.`);
          return;
        }

        usuarios[compradorIndex].vats = (usuarios[compradorIndex].vats || 0) - complemento;
        usuarios[vendedorIndex].vats = (usuarios[vendedorIndex].vats || 0) + complemento;
      }

      const anunciosTroca = lerStorage('anuncios');
      (propostaAceita.pecasOferecidas || []).forEach((itemId) => {
        const indice = anunciosTroca.findIndex((a) => a.id === itemId);
        if (indice !== -1) anunciosTroca[indice].status = 'trocado';
      });
      salvarStorage('anuncios', anunciosTroca);
    }

    salvarStorage('usuarios', usuarios);

    if (compradorIndex !== -1 && usuarioLogado.id === negociacao.compradorId) {
      updateProfile(negociacao.compradorId, { vats: usuarios[compradorIndex].vats });
    }

    if (vendedorIndex !== -1 && usuarioLogado.id === negociacao.vendedorId) {
      updateProfile(negociacao.vendedorId, { vats: usuarios[vendedorIndex].vats });
    }

    const anuncios = lerStorage('anuncios');
    const anuncioIndex = anuncios.findIndex((a) => a.id === negociacao.anuncioId);
    if (anuncioIndex !== -1) {
      anuncios[anuncioIndex].status = negociacao.tipo === 'venda' ? 'vendido' : 'trocado';
      salvarStorage('anuncios', anuncios);
    }

    encerrarNegociacao('concluida');
    alert('Negociação concluída. As avaliações já estão liberadas.');
    navigate(`/avaliacoes/${negociacao.id}`);
  };

  const cancelarNegociacao = () => {
    if (!ehVendedor) return;
    if (!window.confirm('Cancelar esta negociação?')) return;

    const anuncios = lerStorage('anuncios');
    const anuncioIndex = anuncios.findIndex((a) => a.id === negociacao.anuncioId);
    if (anuncioIndex !== -1) {
      anuncios[anuncioIndex].status = 'disponivel';
      salvarStorage('anuncios', anuncios);
    }

    encerrarNegociacao('cancelada');
    alert('Negociação cancelada.');
    setAtualizacao((valor) => valor + 1);
  };

  const encerrarNegociacao = (status) => {
    const negociacoes = lerStorage('negociacoes');
    const index = negociacoes.findIndex((n) => n.id === negociacao.id);
    if (index === -1) return;

    const finalizadoEm = new Date();

    negociacoes[index].status = status;
    negociacoes[index].finalizadoEm = finalizadoEm.toISOString();
    negociacoes[index].expiradoEm = new Date(finalizadoEm.getTime() + DIAS_EXPIRACAO_CHAT * MS_DIA).toISOString();
    salvarStorage('negociacoes', negociacoes);
  };

  const enviarMensagem = (evento) => {
    evento.preventDefault();
    const textoLimpo = texto.trim();
    if (!textoLimpo || !podeEnviar) return;

    const mensagens = lerStorage('mensagens');
    mensagens.push({
      id: `msg_${crypto.randomUUID().substring(0, 8)}`,
      negociacaoId: negociacao.id,
      autorId: usuarioLogado.id,
      texto: textoLimpo,
      criadoEm: new Date().toISOString()
    });

    salvarStorage('mensagens', mensagens);
    setTexto('');
    setAtualizacao((valor) => valor + 1);
  };

  const nomeAutor = (autorId) => {
    if (autorId === comprador?.id) return comprador?.nome || 'Comprador';
    if (autorId === vendedor?.id) return vendedor?.nome || 'Vendedor';
    return 'Participante';
  };

  return (
    <div className="chat-page">
      <section className="chat-header">
        <div>
          <Link className="nav-link" to="/minhas-negociacoes">Voltar para negociações</Link>
          <h1 className="page-title">Chat da negociação</h1>
          <p className="page-subtitle">
            {anuncio?.titulo || 'Peça removida'} · {comprador?.nome || 'Comprador'} com {vendedor?.nome || 'Vendedor'}
          </p>
        </div>

        <span className={`chat-status chat-status--${negociacao.status}`}>
          {negociacao.status.replace('_', ' ')}
        </span>
      </section>

      <section className="chat-layout">
        <div className="chat-panel">
          <div className="chat-messages" aria-live="polite">
            {mensagensDaNegociacao.length === 0 ? (
              <div className="chat-empty">
                <strong>Nenhuma mensagem ainda.</strong>
                <span>Comece combinando retirada, entrega ou os últimos detalhes da troca.</span>
              </div>
            ) : (
              mensagensDaNegociacao.map((mensagem) => {
                const minha = mensagem.autorId === usuarioLogado?.id;

                return (
                  <article
                    className={`chat-message ${minha ? 'chat-message--mine' : ''}`}
                    key={mensagem.id}
                  >
                    <div className="chat-message__meta">
                      <strong>{nomeAutor(mensagem.autorId)}</strong>
                      <time>{formatarData(mensagem.criadoEm)}</time>
                    </div>
                    <p>{mensagem.texto}</p>
                  </article>
                );
              })
            )}
          </div>

          <form className="chat-form" onSubmit={enviarMensagem}>
            <textarea
              className="field-control field-control--textarea"
              disabled={!podeEnviar}
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder={podeEnviar ? 'Escreva uma mensagem...' : 'Mensagens bloqueadas após conclusão ou cancelamento.'}
              maxLength={600}
            />
            <button className="btn-view" disabled={!podeEnviar || !texto.trim()} type="submit">
              Enviar mensagem
            </button>
          </form>
        </div>

        <aside className="chat-side">
          <div className="page-card">
            <h2 className="page-section-title">Resumo</h2>
            <p><strong>Tipo:</strong> {negociacao.tipo === 'venda' ? 'Venda' : 'Troca'}</p>
            <p><strong>Criada em:</strong> {formatarData(negociacao.criadoEm)}</p>
            {negociacao.expiradoEm && (
              <p><strong>Chat visível até:</strong> {formatarData(negociacao.expiradoEm)}</p>
            )}
          </div>

          {ehVendedor && negociacao.status === 'aceita' && (
            <div className="page-card">
              <h2 className="page-section-title">Encerrar negociação</h2>
              <div className="chat-actions">
                <button className="btn-view" onClick={concluirNegociacao} type="button">
                  Concluir
                </button>
                <button className="btn-view btn-danger" onClick={cancelarNegociacao} type="button">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {negociacao.status === 'concluida' && (
            <Link className="btn-view chat-full-button" to={`/avaliacoes/${negociacao.id}`}>
              Avaliar negociação
            </Link>
          )}
        </aside>
      </section>
    </div>
  );
}
