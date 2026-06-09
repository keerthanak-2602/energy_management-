import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateInsights } from '../data/store';
import {
  StatCard, ChartCard, UsageLineChart, ApplianceBarChart,
  InsightPanel, EfficiencyGauge, RankBadge
} from '../components/UI';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area
} from 'recharts';
import Ranking from './Ranking';
import EVBooking from './EVBooking';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Overview Page ────────────────────────────────────────────────────────────
function Overview() {
  const { households, tick } = useApp();
  const totalUsage = households.reduce((s, h) => s + h.currentUsage, 0).toFixed(1);
  const totalSaved = households.reduce((s, h) => s + h.moneySaved, 0).toFixed(0);
  const totalEnergy = households.reduce((s, h) => s + h.energySaved, 0).toFixed(1);
  const peakHousehold = [...households].sort((a, b) => b.currentUsage - a.currentUsage)[0];
  const avgScore = Math.round(households.reduce((s, h) => s + h.efficiencyScore, 0) / households.length);

  // Aggregate daily usage
  const aggData = DAYS.map((day, i) => ({
    day,
    total: +households.reduce((s, h) => s + h.usage[i], 0).toFixed(1),
    avg: +(households.reduce((s, h) => s + h.usage[i], 0) / households.length).toFixed(1),
  }));

  const alerts = households.filter(h => h.alert);

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }} className="animate-fade-up">
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>🌐 BUILDING OVERVIEW</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Real-time aggregate monitoring · All 10 households · Simulation tick: {tick}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>LIVE FEED</span>
        </div>
      </div>

      {/* Alert banner */}
      {alerts.length > 0 && (
        <div style={{
          background: 'rgba(255,68,68,0.06)', border: '1px solid rgba(255,68,68,0.3)',
          borderRadius: 10, padding: '12px 20px', marginBottom: 24,
          display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, color: 'var(--red)', fontSize: 15 }}>{alerts.length} ACTIVE ALERT{alerts.length > 1 ? 'S' : ''}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {alerts.map(h => (
              <span key={h.id} className="badge badge-red">{h.unit} · {h.alert}</span>
            ))}
          </div>
        </div>
      )}

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="TOTAL BUILDING LOAD" value={totalUsage} unit="kW" icon="🏢" color="var(--accent)" sub="All households" />
        <StatCard label="PEAK HOUSEHOLD" value={peakHousehold?.unit} icon="🔴" color="var(--red)" sub={`${peakHousehold?.currentUsage} kW · ${peakHousehold?.name}`} />
        <StatCard label="AVG EFFICIENCY" value={avgScore} unit="/100" icon="📊" color={avgScore >= 60 ? 'var(--green)' : 'var(--amber)'} sub="Building-wide score" />
        <StatCard label="COLLECTIVE SAVINGS" value={`₹${totalSaved}`} icon="💰" color="var(--green)" sub="This billing cycle" />
        <StatCard label="ENERGY CONSERVED" value={totalEnergy} unit="kWh" icon="🌱" color="var(--green-dim)" sub="vs baseline avg" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <ChartCard title="Aggregate Weekly Usage — All Units">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={aggData}>
              <defs>
                <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} unit="kW" />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="custom-tooltip">
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono', marginBottom: 6 }}>{label}</p>
                    <p style={{ color: 'var(--accent)', fontSize: 13, fontFamily: 'Space Mono' }}>Total: {payload[0]?.value} kW</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'Space Mono' }}>Avg/unit: {payload[1]?.value} kW</p>
                  </div>
                );
              }} />
              <Area type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} fill="url(#usageGrad)" />
              <Line type="monotone" dataKey="avg" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Live grid */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>LIVE UNIT GRID</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {households.map(h => (
              <div
                key={h.id}
                style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: h.currentUsage > 20 ? 'rgba(255,68,68,0.08)' : h.currentUsage > 14 ? 'rgba(255,170,0,0.06)' : 'rgba(0,255,136,0.06)',
                  border: `1px solid ${h.currentUsage > 20 ? 'rgba(255,68,68,0.3)' : h.currentUsage > 14 ? 'rgba(255,170,0,0.3)' : 'rgba(0,255,136,0.2)'}`,
                }}
              >
                <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>{h.unit}</p>
                <p style={{
                  fontSize: 16, fontFamily: 'Rajdhani', fontWeight: 700,
                  color: h.currentUsage > 20 ? 'var(--red)' : h.currentUsage > 14 ? 'var(--amber)' : 'var(--green)'
                }}>{h.currentUsage}kW</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Households List + Detail ─────────────────────────────────────────────────
function Households() {
  const { households } = useApp();
  const [selected, setSelected] = useState(null);
  const sorted = [...households].sort((a, b) => a.rank - b.rank);
  const household = selected ? households.find(h => h.id === selected) : null;

  if (household) {
    const insights = generateInsights(household);
    return (
      <div style={{ padding: 32, maxWidth: 1300, margin: '0 auto' }} className="animate-fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button
            onClick={() => setSelected(null)}
            style={{
              padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
              fontFamily: 'Rajdhani', letterSpacing: '0.08em'
            }}
          >
            ← BACK
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{household.name} · {household.unit}</h1>
          {household.alert && <span className={`badge ${household.alert === 'CRITICAL' ? 'badge-red' : 'badge-amber'}`}>{household.alert}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <StatCard label="CURRENT LOAD" value={household.currentUsage} unit="kW" icon="⚡" color={household.currentUsage > 20 ? 'var(--red)' : 'var(--green)'} />
          <StatCard label="EFFICIENCY SCORE" value={household.efficiencyScore} unit="/100" icon="📊" color="var(--accent)" />
          <StatCard label="MONEY SAVED" value={`₹${household.moneySaved}`} icon="💰" color="var(--green)" />
          <StatCard label="RANK" value={`#${household.rank}`} icon="🏆" color={household.rank <= 3 ? 'var(--green)' : 'var(--amber)'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <ChartCard title="Weekly Usage Pattern">
            <UsageLineChart usage={household.usage} />
          </ChartCard>
          <ChartCard title="Appliance Breakdown">
            <ApplianceBarChart appliances={household.appliances} />
          </ChartCard>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <EfficiencyGauge score={household.efficiencyScore} />
          </div>
          <ChartCard title="🤖 AI Insights">
            <InsightPanel insights={insights} />
          </ChartCard>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }} className="animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>🏠 HOUSEHOLD MANAGEMENT</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Click any household for detailed analytics</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }} className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '14px 24px', borderBottom: '1px solid var(--border)',
          display: 'grid', gridTemplateColumns: '70px 1fr 80px 100px 100px 100px 100px 100px 80px',
          gap: 12, background: 'var(--bg-secondary)'
        }}>
          {['RANK', 'HOUSEHOLD', 'UNIT', 'LOAD', 'SCORE', 'PREDICTION', 'SAVED', 'STATUS', ''].map(h => (
            <span key={h} style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{h}</span>
          ))}
        </div>
        {sorted.map((h, i) => {
          const scoreColor = h.efficiencyScore >= 70 ? 'var(--green)' : h.efficiencyScore >= 40 ? 'var(--amber)' : 'var(--red)';
          return (
            <div
              key={h.id}
              style={{
                padding: '14px 24px',
                borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'grid',
                gridTemplateColumns: '70px 1fr 80px 100px 100px 100px 100px 100px 80px',
                gap: 12, alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => setSelected(h.id)}
            >
              <span style={{ fontSize: 16, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--text-secondary)' }}>#{h.rank}</span>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{h.name}</p>
              <span style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>{h.unit}</span>
              <span style={{ fontSize: 14, fontFamily: 'Space Mono', color: h.currentUsage > 20 ? 'var(--red)' : h.currentUsage > 14 ? 'var(--amber)' : 'var(--green)' }}>
                {h.currentUsage} kW
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontFamily: 'Space Mono', color: scoreColor }}>{h.efficiencyScore}</span>
              </div>
              <span style={{ fontSize: 13, fontFamily: 'Space Mono', color: 'var(--accent)' }}>{h.prediction} kW</span>
              <span style={{ fontSize: 13, fontFamily: 'Space Mono', color: 'var(--green)' }}>₹{h.moneySaved}</span>
              <span className={`badge ${h.alert === 'CRITICAL' ? 'badge-red' : h.alert === 'WARNING' ? 'badge-amber' : 'badge-green'}`}>
                {h.alert || 'NORMAL'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'Space Mono' }}>VIEW →</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Admin Root ───────────────────────────────────────────────────────────────
export default function Admin({ page }) {
  if (page === 'overview') return <Overview />;
  if (page === 'households') return <Households />;
  if (page === 'ranking') return <Ranking adminView />;
  if (page === 'ev-admin') return <EVBooking adminView />;
  return <Overview />;
}
