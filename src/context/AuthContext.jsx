import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  });


  const login = (email, senha) => {
    const usuariosSalvos = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioEncontrado = usuariosSalvos.find(u => u.email === email && u.senha === senha);

    if (usuarioEncontrado) {
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
      setUsuarioLogado(usuarioEncontrado);
      return true;
    }
    return false;
  };

  const cadastrar = (dadosUsuario) => {
    const usuariosSalvos = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    if (usuariosSalvos.some(u => u.email === dadosUsuario.email)) {
      alert('Este e-mail já está cadastrado!');
      return false;
    }

  const novoUsuario = {
    id: `usr_${crypto.randomUUID().substring(0, 8)}`, 
    nome: dadosUsuario.nome,
    email: dadosUsuario.email,
    senha: dadosUsuario.senha,
    telefone: dadosUsuario.telefone,
    endereco: dadosUsuario.endereco,
    avatar: dadosUsuario.avatar || null,
    vats: 100, 
    mediaAvaliacoes: 0,
    totalNegociacoes: 0,
    criadoEm: new Date().toISOString()
  };

    usuariosSalvos.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuariosSalvos));
    return true;
  };


  const logout = () => {
    localStorage.removeItem('usuarioLogado');
    setUsuarioLogado(null);
  };

  return (
    <AuthContext.Provider value={{ usuarioLogado, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}