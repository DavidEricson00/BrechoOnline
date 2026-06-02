import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Cadastro } from '../pages/Cadastro';
import { Garagem } from '../pages/Garagem';
import { Perfil } from '../pages/Perfil';
import { DetalheAnuncio } from '../pages/DetalheAnuncio';
import { Negociacoes } from '../pages/Negociacoes';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="cadastro" element={<Cadastro />} />
          <Route path="anuncio/:id" element={<DetalheAnuncio />} />

          {/* Rotas Protegidas (Exigem Login) */}
          <Route path="perfil" element={
            <ProtectedRoute><Perfil /></ProtectedRoute>
          } />
          <Route path="garagem" element={
            <ProtectedRoute><Garagem /></ProtectedRoute>
          } />
          <Route path="minhas-negociacoes" element={
            <ProtectedRoute><Negociacoes /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}