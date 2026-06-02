import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { anunciosMock } from '../mocks/anuncios';

export function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuarioLogado } = useAuth();
  const anunciosSalvos = useMemo(() => JSON.parse(localStorage.getItem('anuncios') || '[]'), []);
  const anuncio = useMemo(() => {
    return (
      [...anunciosSalvos, ...anunciosMock].find((item) => item.id === id) || {
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
      tipoProposta,
      precoOriginal: valorVat,
      compradorId: usuarioLogado.id,
      compradorNome: usuarioLogado.nome,
      vendedorId: donoId,
      status: 'ABERTA'
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

        {usuarioLogado?.id !== donoId ? (
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
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
        )}
      </div>
    </div>
  );
}