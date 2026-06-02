import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuarioLogado } = useAuth();
  const [anuncio, setAnuncio] = useState(null);


  useEffect(() => {

    const anunciosSalvos = JSON.parse(localStorage.getItem('anunciosGaragem') || '[]');
    const itemEncontrado = anunciosSalvos.find(item => item.id === id);

    if (itemEncontrado) {
      setAnuncio(itemEncontrado);
    } else {

      setAnuncio({
        id: id,
        titulo: 'Tênis Running Casual',
        descricao: 'Tênis em ótimo estado, usado poucas vezes. Perfeito para o dia a dia.',
        precoVats: 150,
        donoId: 'outro-usuario-id',
        donoNome: 'Ana Silva',
        foto: 'https://via.placeholder.com/300?text=Tenis+Casual'
      });
    }
  }, [id]);

  const handleFazerProposta = () => {
    if (!usuarioLogado) {
      alert('Você precisa estar logado para fazer uma proposta!');
      navigate('/login');
      return;
    }

    if (anuncio.donoId === usuarioLogado.id) {
      alert('Você não pode fazer uma proposta no seu próprio desapego!');
      return;
    }


    const negociacoesAtuais = JSON.parse(localStorage.getItem('negociacoes') || '[]');
    
    const novaProposta = {
      id: crypto.randomUUID(),
      anuncioId: anuncio.id,
      tituloAnuncio: anuncio.titulo,
      precoOriginal: anuncio.precoVats,
      compradorId: usuarioLogado.id,
      compradorNome: usuarioLogado.nome,
      vendedorId: anuncio.donoId,
      status: 'ABERTA'
    };

    negociacoesAtuais.push(novaProposta);
    localStorage.setItem('negociacoes', JSON.stringify(negociacoesAtuais));

    alert('Proposta enviada com sucesso! Você pode acompanhar em "Minhas Negociações".');
    navigate('/minhas-negociacoes');
  };

  if (!anuncio) return <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando desapego...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fc9003', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
        ← Voltar
      </button>
      
      <img src={anuncio.foto} alt={anuncio.titulo} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }} />
      
      <h2 style={{ marginTop: '1rem', color: '#333' }}>{anuncio.titulo}</h2>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>Desapego de: <strong>{anuncio.donoNome}</strong></p>
      
      <div style={{ margin: '1rem 0', padding: '0.8rem', background: 'rgba(252, 144, 3, 0.1)', borderRadius: '4px', display: 'inline-block' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fc9003' }}>{anuncio.precoVats} VATs</span>
      </div>

      <p style={{ lineHeight: '1.6', color: '#444', margin: '1rem 0' }}>{anuncio.descricao}</p>

      <button 
        onClick={handleFazerProposta}
        style={{ width: '100%', padding: '0.8rem', background: '#fc9003', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Intercambiar
      </button>
    </div>
  );
}