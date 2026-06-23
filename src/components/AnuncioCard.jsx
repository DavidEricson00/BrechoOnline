export function AnuncioCard({ anuncio, onClickDetalhe }) {
  const foto = anuncio.foto || 'https://digest.med.br/wp-content/uploads/2024/07/no-image.jpg';
  const exibirVats = anuncio.modalidade !== 'Troca';

  return (
    <article className="product-card">
      <img
        src={foto}
        alt={anuncio.titulo}
        className="product-image"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          if (!e.currentTarget.dataset.fallbackApplied) {
            e.currentTarget.dataset.fallbackApplied = 'true';
            e.currentTarget.src = 'https://digest.med.br/wp-content/uploads/2024/07/no-image.jpg';
          }
        }}
      />

      <div className="product-info">
        <h3 className="product-title">{anuncio.titulo}</h3>

        <div className="product-meta">
          <span>{anuncio.categoria}</span>
          <span>Tam: {anuncio.tamanho}</span>
        </div>

        <div className="product-meta">
          <span>{anuncio.conservacao}</span>
          <span>{anuncio.modalidade}</span>
        </div>

        <div className="product-footer">
          <span className="product-price">{exibirVats ? `${anuncio.vats} VATs` : 'Troca'}</span>

          <button
            type="button"
            className="btn-view"
            onClick={() => onClickDetalhe?.(anuncio.id)}
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </article>
  );
}