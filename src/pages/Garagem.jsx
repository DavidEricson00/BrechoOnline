import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnuncioCard } from '../components/AnuncioCard';

export function Garagem() {
  const { usuarioLogado } = useAuth();
  const navigate = useNavigate();
  const anunciosPersistidos = JSON.parse(localStorage.getItem('anuncios') || '[]');
  const anuncioIdEdicao = localStorage.getItem('editarAnuncioId');
  const anuncioParaEdicaoInicial = anuncioIdEdicao
    ? anunciosPersistidos.find((item) => item.id === anuncioIdEdicao && item.usuarioId === usuarioLogado.id)
    : null;
  const [anuncios, setAnuncios] = useState(() => anunciosPersistidos);
  const [idEdicao, setIdEdicao] = useState(() => anuncioParaEdicaoInicial?.id || null);
  const [titulo, setTitulo] = useState(() => anuncioParaEdicaoInicial?.titulo || '');
  const [descricao, setDescricao] = useState(() => anuncioParaEdicaoInicial?.descricao || '');
  const [categoria, setCategoria] = useState(() => anuncioParaEdicaoInicial?.categoria || 'camisa');
  const [tamanho, setTamanho] = useState(() => anuncioParaEdicaoInicial?.tamanho || 'M');
  const [conservacao, setConservacao] = useState(() => anuncioParaEdicaoInicial?.conservacao || 'Bom');
  const [foto, setFoto] = useState(() => anuncioParaEdicaoInicial?.foto || '');
  const [modalidade, setModalidade] = useState(() => anuncioParaEdicaoInicial?.modalidade || 'Venda');
  const [vats, setVats] = useState(() => (anuncioParaEdicaoInicial ? anuncioParaEdicaoInicial.vats.toString() : ''));

  const salvarNoStorage = (novaLista) => {
    setAnuncios(novaLista);
    localStorage.setItem('anuncios', JSON.stringify(novaLista));
  };

  const limparFormulario = () => {
    setIdEdicao(null);
    setTitulo('');
    setDescricao('');
    setCategoria('camisa');
    setTamanho('M');
    setConservacao('Bom');
    setFoto('');
    setModalidade('Venda');
    setVats('');
  };

  const handleSalvarAnuncio = (e) => {
    e.preventDefault();
    const valorVat = Number(vats);

    if (!vats || valorVat <= 0) {
      alert('O valor em VATs deve ser maior que 0!');
      return;
    }

    if (idEdicao) {
      const novaLista = anuncios.map((anuncio) => {
        if (anuncio.id === idEdicao) {
          if (anuncio.usuarioId !== usuarioLogado.id) return anuncio;
          if (anuncio.status !== 'Disponível') {
            alert('Você só pode editar anúncios que estão na lista Disponível!');
            return anuncio;
          }
          return {
            ...anuncio,
            titulo,
            descricao,
            categoria,
            tamanho,
            conservacao,
            foto,
            modalidade,
            vats: valorVat
          };
        }
        return anuncio;
      });

      salvarNoStorage(novaLista);
      alert('Anúncio atualizado com sucesso!');
    } else {
      const novoAnuncio = {
        id: crypto.randomUUID(),
        usuarioId: usuarioLogado.id,
        titulo,
        descricao,
        categoria,
        tamanho,
        conservacao,
        foto: foto || 'https://via.placeholder.com/600x800?text=Sem+Foto',
        modalidade,
        vats: valorVat,
        status: 'Disponível',
        criadoEm: new Date().toISOString()
      };

      salvarNoStorage([...anuncios, novoAnuncio]);
      alert('Peça anunciada na sua Garagem!');
    }

    limparFormulario();
  };

  const handleIniciarEdicao = (anuncio) => {
    setIdEdicao(anuncio.id);
    setTitulo(anuncio.titulo);
    setDescricao(anuncio.descricao);
    setCategoria(anuncio.categoria);
    setTamanho(anuncio.tamanho);
    setConservacao(anuncio.conservacao);
    setFoto(anuncio.foto);
    setModalidade(anuncio.modalidade);
    setVats(anuncio.vats.toString());
  };

  useEffect(() => {
    if (anuncioParaEdicaoInicial) {
      localStorage.removeItem('editarAnuncioId');
    }
  }, [anuncioParaEdicaoInicial]);

  const handleExcluirAnuncio = (id) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente este anúncio?')) {
      const novaLista = anuncios.filter((a) => a.id !== id);
      salvarNoStorage(novaLista);
    }
  };

  const handleMudarStatus = (id, novoStatus) => {
    const novaLista = anuncios.map((a) => (a.id === id ? { ...a, status: novoStatus } : a));
    salvarNoStorage(novaLista);
  };

  const meusAnuncios = anuncios.filter((a) => a.usuarioId === usuarioLogado.id);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Minha Garagem Virtual</h2>
      <p>Gerencie suas peças, mude os estados das negociações e cadastre novos desapegos.</p>

      <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #ddd' }}>
        <h3>{idEdicao ? 'Editar Anúncio' : 'Anunciar Nova Peça'}</h3>
        <form onSubmit={handleSalvarAnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" placeholder="Título do anúncio" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="field-control" />
          <textarea placeholder="Descrição da roupa/acessório" required value={descricao} onChange={(e) => setDescricao(e.target.value)} className="field-control field-control--textarea" />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="field-control field-control--select" style={{ flex: 1 }}>
              <option value="camisa">Camisa</option>
              <option value="calça">Calça</option>
              <option value="calçado">Calçado</option>
              <option value="acessório">Acessório</option>
            </select>

            <select value={tamanho} onChange={(e) => setTamanho(e.target.value)} className="field-control field-control--select" style={{ flex: 1 }}>
              <option value="PP">PP</option>
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
              <option value="GG">GG</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <select value={conservacao} onChange={(e) => setConservacao(e.target.value)} className="field-control field-control--select" style={{ flex: 1 }}>
              <option value="Novo">Novo</option>
              <option value="Bom">Bom</option>
              <option value="Regular">Regular</option>
              <option value="Marcas de uso">Marcas de uso</option>
            </select>

            <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className="field-control field-control--select" style={{ flex: 1 }}>
              <option value="Venda">Venda</option>
              <option value="Troca">Troca</option>
              <option value="Ambos">Ambos (Venda e Troca)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="url" placeholder="URL da foto do item" value={foto} onChange={(e) => setFoto(e.target.value)} className="field-control" style={{ flex: 2 }} />
            <input type="number" placeholder="Valor em VATs" required value={vats} onChange={(e) => setVats(e.target.value)} className="field-control" style={{ flex: 1 }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{ padding: '0.6rem 2rem', cursor: 'pointer', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {idEdicao ? 'Atualizar' : 'Publicar Peça'}
            </button>
            {idEdicao && <button type="button" onClick={limparFormulario} style={{ padding: '0.6rem 2rem', cursor: 'pointer', background: '#d1d1d1', color: '#3c3c3c', border: 'none', borderRadius: '4px' }}>Cancelar</button>}
          </div>
        </form>
      </div>

      {['Disponível', 'Negociação', 'Trocado/Vendido'].map((aba) => {
        const itensDaAba = meusAnuncios.filter((a) => a.status === aba);

        return (
          <div key={aba} style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '0.5rem' }}>
              Lista: {aba} ({itensDaAba.length})
            </h3>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {itensDaAba.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>Nenhum item nesta lista.</p>
              ) : (
                itensDaAba.map((anuncio) => (
                  <div key={anuncio.id} style={{ width: '260px' }}>
                    <AnuncioCard anuncio={anuncio} onClickDetalhe={(id) => navigate(`/anuncio/${id}`)} />

                    <div className="garage-actions">
                      {anuncio.status === 'Disponível' && (
                        <button onClick={() => handleIniciarEdicao(anuncio)} className="garage-action-button garage-action-button--edit">
                          Editar Peça
                        </button>
                      )}

                      <select
                        value={anuncio.status}
                        onChange={(e) => handleMudarStatus(anuncio.id, e.target.value)}
                        className="garage-status-select"
                      >
                        <option value="Disponível">Mover p/ Disponível</option>
                        <option value="Negociação">Mover p/ Negociação</option>
                        <option value="Trocado/Vendido">Mover p/ Trocado/Vendido</option>
                      </select>

                      <button onClick={() => handleExcluirAnuncio(anuncio.id)} className="garage-action-button garage-action-button--danger">
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}