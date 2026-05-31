import { useState } from 'react';

export function Home() {
  const [anuncios] = useState([
    {
      id: "anc_mock1",
      usuarioId: "usr_outro",
      titulo: "Jaqueta Jeans Vintage",
      descricao: "Pouco uso, sem manchas e com todos os botões originais.",
      categoria: "casaco",
      tamanho: "M",
      conservacao: "Bom",
      foto: "",
      modalidade: "Ambos",
      vats: 35,
      status: "disponivel",
      criadoEm: new Date().toISOString()
    },
    {
      id: "anc_mock2",
      usuarioId: "usr_outro2",
      titulo: "Tênis Air Casual",
      descricao: "Perfeito estado, higienizado e pronto para uso.",
      categoria: "calcado",
      tamanho: "40",
      conservacao: "Novo",
      foto: "",
      modalidade: "Venda",
      vats: 120,
      status: "disponivel",
      criadoEm: new Date().toISOString()
    }
  ]);

  return (
    <div>
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#2d3748' }}>Armário de Desapegos</h1>
        <p style={{ color: '#718096' }}>Explore os produtos disponíveis para compra ou troca</p>
      </div>

      <div className="products-grid">
        {anuncios.map((item) => (
          <div key={item.id} className="product-card">
            <img src={item.foto} alt={item.titulo} className="product-image" />
            <div className="product-info">
              <h3 className="product-title">{item.titulo}</h3>
              <div className="product-meta">
                <span>📏 Tam: {item.tamanho}</span>
                <span>{item.conservacao}</span>
              </div>
              <div className="product-footer">
                <span className="product-price">{item.vats} VATs</span>
                <button className="btn-view">Ver Detalhes</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}