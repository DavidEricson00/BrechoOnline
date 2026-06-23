import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

export function MainLayout() {
  return (
    <div className="app-shell">
      <Header />
      
      <main className="page-shell">
        <Outlet />
      </main>
      
      <footer className="site-footer">
        &copy; {new Date().getFullYear()} Memória de Armário - Consumo consciente & estilo sustentável
      </footer>
    </div>
  );
}
