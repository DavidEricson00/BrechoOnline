import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function Garagem() {
  const { usuarioLogado } = useAuth();
  const [anuncios, setAnuncios] = useState([]);
  

  const [idEdicao, setIdEdicao] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('camisa');
  const [tamanho, setTamanho] = useState('M');
  const [conservacao, setConservacao] = useState('Bom');
  const [foto, setFoto] = useState('');
  const [modalidade, setModalidade] = useState('Venda');
  const [vats, setVats] = useState('');

  useEffect(() => {
    const salvos = localStorage.getItem('anuncios');
    if (salvos) setAnuncios(JSON.parse(salvos));
  }, []);

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
            titulo, descricao, categoria, tamanho, conservacao, foto, modalidade, vats: valorVat
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
        foto: foto || 'https://via.placeholder.com/300?text=Sem+Foto',
        modalidade,
        vats: valorVat,
        status: 'Disponível'
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

  const handleExcluirAnuncio = (id) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente este anúncio?')) {
      const novaLista = anuncios.filter(a => a.id !== id);
      salvarNoStorage(novaLista);
    }
  };


  const handleMudarStatus = (id, novoStatus) => {
    const novaLista = anuncios.map(a => a.id === id ? { ...a, status: novoStatus } : a);
    salvarNoStorage(novaLista);
  };

  const meusAnuncios = anuncios.filter(a => a.usuarioId === usuarioLogado.id);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Minha Garagem Virtual</h2>
      <p>Gerencie suas peças, mude os estados das negociações e cadastre novos desapegos.</p>


      <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #ddd' }}>
        <h3>{idEdicao ? 'Editar Anúncio' : 'Anunciar Nova Peça'}</h3>
        <form onSubmit={handleSalvarAnuncio} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="text" placeholder="Título do anúncio" required value={titulo} onChange={e => setTitulo(e.target.value)} />
          <textarea placeholder="Descrição da roupa/acessório" required value={descricao} onChange={e => setDescricao(e.target.value)} />
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ flex: 1 }}>
              <option value="camisa">Camisa</option>
              <option value="calça">Calça</option>
              <option value="calçado">Calçado</option>
              <option value="acessório">Acessório</option>
            </select>

            <select value={tamanho} onChange={e => setTamanho(e.target.value)} style={{ flex: 1 }}>
              <option value="PP">PP</option>
              <option value="P">P</option>
              <option value="M">M</option>
              <option value="G">G</option>
              <option value="GG">GG</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <select value={conservacao} onChange={e => setConservacao(e.target.value)} style={{ flex: 1 }}>
              <option value="Novo">Novo</option>
              <option value="Bom">Bom</option>
              <option value="Regular">Regular</option>
              <option value="Marcas de uso">Marcas de uso</option>
            </select>

            <select value={modalidade} onChange={e => setModalidade(e.target.value)} style={{ flex: 1 }}>
              <option value="Venda">Venda</option>
              <option value="Troca">Troca</option>
              <option value="Ambos">Ambos (Venda e Troca)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="url" placeholder="URL da foto do item" value={foto} onChange={e => setFoto(e.target.value)} style={{ flex: 2 }} />
            <input type="number" placeholder="Valor em VATs" required value={vats} onChange={e => setVats(e.target.value)} style={{ flex: 1 }} />
          </div>

          <div>
            <button type="submit" style={{ padding: '0.6rem 2rem', cursor: 'pointer', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {idEdicao ? 'Atualizar' : 'Publicar Peça'}
            </button>
            {idEdicao && <button type="button" onClick={limparFormulario} style={{ marginLeft: '1rem' }}>Cancelar</button>}
          </div>
        </form>
      </div>

      {['Disponível', 'Negociação', 'Trocado/Vendido'].map((aba) => (
        <div key={aba} style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '0.5rem' }}>
            Lista: {aba} ({meusAnuncios.filter(a => a.status === aba).length})
          </h3>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {meusAnuncios.filter(a => a.status === aba).length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>Nenhum item nesta lista.</p>
            ) : (
              meusAnuncios.filter(a => a.status === aba).map((anuncio) => (
                <div key={anuncio.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '6px', width: '220px', background: '#fff' }}>
                  <img src={anuncio.foto} alt={anuncio.titulo} style={{ width: '100%', height: '150px', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Erro+Imagem'; }} />
                  <h4 style={{ margin: '0.5rem 0 0.2rem 0' }}>{anuncio.titulo}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#555', margin: 0 }}>Tam: {anuncio.tamanho} | {anuncio.conservacao}</p>
                  <p style={{ fontWeight: 'bold', color: '#0056b3', margin: '0.3rem 0' }}>{anuncio.vats} VATs</p>
                  

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                    {anuncio.status === 'Disponível' && (
                      <button onClick={() => handleIniciarEdicao(anuncio)} style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Editar Peça</button>
                    )}
                    

                    <select 
                      value={anuncio.status} 
                      onChange={(e) => handleMudarStatus(anuncio.id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '2px' }}
                    >
                      <option value="Disponível">Mover p/ Disponível</option>
                      <option value="Negociação">Mover p/ Negociação</option>
                      <option value="Trocado/Vendido">Mover p/ Trocado/Vendido</option>
                    </select>

                    <button onClick={() => handleExcluirAnuncio(anuncio.id)} style={{ fontSize: '0.8rem', color: 'red', cursor: 'pointer' }}>Excluir</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}