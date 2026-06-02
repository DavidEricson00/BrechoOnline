import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnuncioCard } from '../components/AnuncioCard';
import { anunciosMock } from '../mocks/anuncios';

const categorias = ['', 'camisa', 'calça', 'calçado', 'acessório'];
const tamanhos = ['', 'PP', 'P', 'M', 'G', 'GG'];
const modalidades = ['', 'Venda', 'Troca', 'Ambos'];
const ordenacoes = [
  { value: '', label: 'Padrão' },
  { value: 'menor-vat', label: 'Menor VAT' },
  { value: 'maior-vat', label: 'Maior VAT' },
  { value: 'recentes', label: 'Mais recentes' }
];

function extrairFaixa(valor) {
  if (!valor) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function normalizarTexto(valor) {
  return valor.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function ordenarAnuncios(anuncios, ordenacao) {
  const lista = [...anuncios];

  if (ordenacao === 'menor-vat') {
    return lista.sort((a, b) => a.vats - b.vats);
  }

  if (ordenacao === 'maior-vat') {
    return lista.sort((a, b) => b.vats - a.vats);
  }

  return lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}

export function Home() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [vatMin, setVatMin] = useState('');
  const [vatMax, setVatMax] = useState('');
  const [ordenacao, setOrdenacao] = useState('recentes');

  const anunciosFiltrados = useMemo(() => {
    const textoBusca = normalizarTexto(busca.trim());
    const min = extrairFaixa(vatMin);
    const max = extrairFaixa(vatMax);

    const base = anunciosMock.filter((anuncio) => {
      if (anuncio.status !== 'Disponível') return false;

      if (textoBusca) {
        const titulo = normalizarTexto(anuncio.titulo);
        const descricao = normalizarTexto(anuncio.descricao);
        if (!titulo.includes(textoBusca) && !descricao.includes(textoBusca)) return false;
      }

      if (categoria && anuncio.categoria !== categoria) return false;
      if (tamanho && anuncio.tamanho !== tamanho) return false;
      if (modalidade && anuncio.modalidade !== modalidade) return false;
      if (min !== null && anuncio.vats < min) return false;
      if (max !== null && anuncio.vats > max) return false;

      return true;
    });

    return ordenarAnuncios(base, ordenacao);
  }, [busca, categoria, tamanho, modalidade, vatMin, vatMax, ordenacao]);

  const limparFiltros = () => {
    setBusca('');
    setCategoria('');
    setTamanho('');
    setModalidade('');
    setVatMin('');
    setVatMax('');
    setOrdenacao('recentes');
  };

  return (
    <div>
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', color: '#0f172a', letterSpacing: '-0.03em' }}>Armário de Desapegos</h1>
          <p style={{ color: '#64748b' }}>Busque, filtre e descubra peças com estilo sustentável</p>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.85rem' }}>
            <input
              type="text"
              placeholder="Pesquisar por título ou descrição"
              className="field-control"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="field-control field-control--select">
              <option value="">Categoria</option>
              {categorias.filter(Boolean).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select value={tamanho} onChange={(e) => setTamanho(e.target.value)} className="field-control field-control--select">
              <option value="">Tamanho</option>
              {tamanhos.filter(Boolean).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className="field-control field-control--select">
              <option value="">Modalidade</option>
              {modalidades.filter(Boolean).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.85rem', marginTop: '0.85rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input type="number" min="0" placeholder="VAT mínimo" value={vatMin} onChange={(e) => setVatMin(e.target.value)} className="field-control field-control--compact" />
              <input type="number" min="0" placeholder="VAT máximo" value={vatMax} onChange={(e) => setVatMax(e.target.value)} className="field-control field-control--compact" />
            </div>

            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className="field-control field-control--select field-control--compact">
              {ordenacoes.map((item) => (
                <option key={item.value || 'padrao'} value={item.value}>{item.label}</option>
              ))}
            </select>

            <div style={{ color: '#64748b', fontSize: '0.92rem' }}>
              {anunciosFiltrados.length} anúncio(s) encontrado(s)
            </div>

            <button type="button" className="btn-view" onClick={limparFiltros}>Limpar</button>
          </div>
        </div>
      </section>

      <div className="products-grid">
        {anunciosFiltrados.map((anuncio) => (
          <AnuncioCard
            key={anuncio.id}
            anuncio={anuncio}
            onClickDetalhe={(id) => navigate(`/anuncio/${id}`)}
          />
        ))}
      </div>

      {anunciosFiltrados.length === 0 && (
        <p style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b' }}>
          Nenhum anúncio encontrado com os filtros atuais.
        </p>
      )}
    </div>
  );
}