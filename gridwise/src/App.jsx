import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EVBooking from './pages/EVBooking';
import Ranking from './pages/Ranking';
import Admin from './pages/Admin';
import Sidebar from './components/Sidebar';

function AppShell() {
  const { session } = useApp();
  const [page, setPage] = useState(session?.role === 'admin' ? 'overview' : 'dashboard');

  if (!session) return <Login />;

  const renderPage = () => {
    if (session.role === 'admin') return <Admin page={page} />;
    if (page === 'dashboard') return <Dashboard setPage={setPage} />;
    if (page === 'ev') return <EVBooking />;
    if (page === 'ranking') return <Ranking />;
    return <Dashboard setPage={setPage} />;
  };

  return (
    <div className="grid-bg" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, overflowY: 'auto', maxHeight: '100vh' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
