import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function Negociacoes() {
  const { usuarioLogado } = useAuth();
  const [propostasRecebidas, setPropostasRecebidas] = useState([]);
  const [propostasEnviadas, setPropostasEnviadas] = useState([]);


  useEffect(() => {
    const todasNegociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    

    const recebidas = todasNegociacoes.filter(n => n.vendedorId === usuarioLogado?.id);
    

    const enviadas = todasNegociacoes.filter(n => n.compradorId === usuarioLogado?.id);

    setPropostasRecebidas(recebidas);
    setPropostasEnviadas(enviadas);
  }, [usuarioLogado]);

  const handleAtualizarStatus = (idNegocicao, novoStatus) => {
    const todasNegociacoes = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    
    const index = todasNegociacoes.findIndex(n => n.id === idNegocicao);
    if (index !== -1) {
      todasNegociacoes[index].status = novoStatus;
      localStorage.setItem('negociacoes', JSON.stringify(todasNegociacoes));
      

      alert(`Proposta atualizada para: ${novoStatus}`);
      window.location.reload(); 
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      <h2 style={{ color: '#333', marginBottom: '2rem' }}>Painel de Negociações</h2>


      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ color: '#fc9003', borderBottom: '2px solid #fc9003', paddingBottom: '0.5rem' }}>
          📥 Propostas Recebidas
        </h3>
        {propostasRecebidas.length === 0 ? (
          <p style={{ color: '#777', marginTop: '1rem' }}>Nenhuma proposta recebida por enquanto.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {propostasRecebidas.map(p => (
              <div key={p.id} style={{ padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>{p.tituloAnuncio}</h4>
                  <p style={{ fontSize: '0.9rem', color: '#555' }}>Interessado(a): <strong>{p.compradorNome}</strong></p>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fc9003' }}>Valor: {p.precoOriginal} VATs</p>
                  <p style={{ marginTop: '0.3rem' }}>
                    Status: <span style={{ fontWeight: 'bold', color: p.status === 'ABERTA' ? '#fc9003' : p.status === 'ACEITA' ? '#28a745' : '#dc3545' }}>{p.status}</span>
                  </p>
                </div>

                {p.status === 'ABERTA' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleAtualizarStatus(p.id, 'ACEITA')}
                      style={{ padding: '0.5rem 1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Aceitar
                    </button>
                    <button 
                      onClick={() => handleAtualizarStatus(p.id, 'RECUSADA')}
                      style={{ padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>


      <section>
        <h3 style={{ color: '#555', borderBottom: '2px solid #555', paddingBottom: '0.5rem' }}>
          📤 Propostas Enviadas
        </h3>
        {propostasEnviadas.length === 0 ? (
          <p style={{ color: '#777', marginTop: '1rem' }}>Você ainda não fez nenhuma proposta em itens de terceiros.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {propostasEnviadas.map(p => (
              <div key={p.id} style={{ padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h4>{p.tituloAnuncio}</h4>
                <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fc9003' }}>Oferecido: {p.precoOriginal} VATs</p>
                <p style={{ marginTop: '0.3rem' }}>
                  Situação do Pedido: <span style={{ fontWeight: 'bold', color: p.status === 'ABERTA' ? '#fc9003' : p.status === 'ACEITA' ? '#28a745' : '#dc3545' }}>{p.status}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}