import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { usuarioLogado } = useAuth();


  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}