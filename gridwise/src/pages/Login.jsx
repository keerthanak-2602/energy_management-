import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (!login(username.trim(), password)) {
      setError('ACCESS DENIED — Invalid credentials');
    }
    setLoading(false);
  };

  const quickFill = (u, p) => { setUsername(u); setPassword(p); setError(''); };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #00d4ff, #0066aa)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>GRIDWISE AI</h1>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.2em', fontFamily: 'Space Mono' }}>SMART ENERGY MANAGEMENT</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Intelligent apartment energy & EV control system</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32, borderColor: 'var(--border-bright)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SYSTEM ONLINE — SECURE ACCESS</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>UNIT ID / ADMIN</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="house1 · house2 · admin"
                style={{
                  width: '100%', padding: '12px 16px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)',
                  fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'Space Mono'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>ACCESS CODE</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '12px 16px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)',
                  fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'Space Mono'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)', fontFamily: 'Space Mono' }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px', background: loading ? 'var(--border)' : 'linear-gradient(135deg, #00d4ff, #0088cc)',
                border: 'none', borderRadius: 8, color: '#000', fontSize: 14,
                fontFamily: 'Rajdhani', fontWeight: 700, letterSpacing: '0.15em',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                marginTop: 4
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE →'}
            </button>
          </form>
        </div>

        {/* Quick access hints */}
        <div className="card" style={{ marginTop: 16, padding: 16 }}>
          <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.08em' }}>DEMO QUICK ACCESS:</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'ADMIN', u: 'admin', p: 'admin123' },
              { label: 'HOUSE 1', u: 'house1', p: 'pass1' },
              { label: 'HOUSE 5', u: 'house5', p: 'pass5' },
              { label: 'HOUSE 9', u: 'house9', p: 'pass9' },
            ].map(d => (
              <button
                key={d.u}
                onClick={() => quickFill(d.u, d.p)}
                style={{
                  padding: '4px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
                  fontFamily: 'Space Mono', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
          GridWise AI v2.4.1 · Building Neural Grid Active
        </p>
      </div>
    </div>
  );
}
