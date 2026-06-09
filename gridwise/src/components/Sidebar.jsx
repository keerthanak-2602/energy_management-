import { useApp } from '../context/AppContext';

const USER_NAV = [
  { id: 'dashboard', icon: '⚡', label: 'DASHBOARD' },
  { id: 'ev', icon: '🔋', label: 'EV CHARGING' },
  { id: 'ranking', icon: '🏆', label: 'LEADERBOARD' },
];

const ADMIN_NAV = [
  { id: 'overview', icon: '🌐', label: 'OVERVIEW' },
  { id: 'households', icon: '🏠', label: 'HOUSEHOLDS' },
  { id: 'ranking', icon: '🏆', label: 'RANKINGS' },
  { id: 'ev-admin', icon: '🔋', label: 'EV MANAGEMENT' },
];

export default function Sidebar({ page, setPage }) {
  const { session, logout, households } = useApp();
  const isAdmin = session?.role === 'admin';
  const nav = isAdmin ? ADMIN_NAV : USER_NAV;

  const household = !isAdmin && households.find(h => h.id === session?.householdId);

  return (
    <div style={{
      width: 220, minHeight: '100vh', background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #00d4ff, #0066aa)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⚡</div>
          <div>
            <p style={{ fontFamily: 'Rajdhani', fontSize: 16, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>GRIDWISE AI</p>
            <p style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{isAdmin ? 'ADMIN CONSOLE' : 'RESIDENT HUB'}</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>AUTHENTICATED</span>
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{session?.name}</p>
        <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>{session?.username}</p>
        {household && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontFamily: 'Rajdhani', fontWeight: 700, color: household.rank <= 3 ? 'var(--green)' : household.rank <= 6 ? 'var(--amber)' : 'var(--red)' }}>#{household.rank}</p>
              <p style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>RANK</p>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-card)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)' }}>{household.currentUsage}</p>
              <p style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>kW NOW</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {nav.map(n => (
          <div
            key={n.id}
            className={`sidebar-link ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '6px 16px', marginBottom: 8, fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: 'var(--green)' }}>●</span> Grid: STABLE
        </div>
        <div
          className="sidebar-link"
          onClick={logout}
          style={{ color: 'var(--red)', opacity: 0.7 }}
        >
          <span>🔓</span>
          <span>SIGN OUT</span>
        </div>
      </div>
    </div>
  );
}
