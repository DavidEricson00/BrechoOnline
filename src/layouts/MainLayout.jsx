import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

export function MainLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem 1rem' }}>
        <Outlet />
      </main>
      
      <footer style={{ textAlign: 'center', padding: '1.5rem', background: '#fff', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#999' }}>
        &copy; {new Date().getFullYear()} Memória de Armário - Consumo consciente & estilo sustentável
      </footer>
    </div>
  );
}