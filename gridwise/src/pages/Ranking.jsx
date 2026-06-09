import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Ranking({ adminView = false }) {
  const { session, households } = useApp();
  const sorted = [...households].sort((a, b) => a.rank - b.rank);
  const myId = session?.householdId;

  const chartData = sorted.map(h => ({
    name: h.unit,
    score: h.efficiencyScore,
    isMe: h.id === myId,
  }));

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }} className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          🏆 {adminView ? 'BUILDING LEADERBOARD' : 'EFFICIENCY RANKINGS'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Live efficiency rankings — updated every 3 seconds via simulation engine
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'TOP PERFORMER', value: sorted[0]?.unit, sub: `Score: ${sorted[0]?.efficiencyScore}`, color: 'var(--green)' },
          { label: 'AVG EFFICIENCY', value: Math.round(sorted.reduce((s, h) => s + h.efficiencyScore, 0) / sorted.length), sub: 'Building average', color: 'var(--accent)' },
          { label: 'TOTAL SAVED', value: `₹${sorted.reduce((s, h) => s + h.moneySaved, 0).toFixed(0)}`, sub: 'Collective savings', color: 'var(--amber)' },
          { label: 'ENERGY SAVED', value: `${sorted.reduce((s, h) => s + h.energySaved, 0).toFixed(0)} kWh`, sub: 'vs baseline', color: 'var(--green-dim)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontFamily: 'Rajdhani', fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>EFFICIENCY SCORE COMPARISON</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={30}>
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="custom-tooltip">
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }}>{payload[0]?.payload?.name}</p>
                    <p style={{ color: 'var(--accent)', fontSize: 14, fontFamily: 'Space Mono' }}>Score: {payload[0]?.value}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isMe ? 'var(--accent)' : entry.score >= 70 ? 'var(--green-dim)' : entry.score >= 40 ? 'var(--amber-dim)' : 'var(--red-dim)'}
                  opacity={entry.isMe ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leaderboard Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 120px 120px 100px', gap: 12 }}>
          {['RANK', 'HOUSEHOLD', 'UNIT', 'SCORE', 'USAGE', 'SAVED', 'STATUS'].map(h => (
            <span key={h} style={{ fontSize: 10, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{h}</span>
          ))}
        </div>
        {sorted.map((h, i) => {
          const isMe = h.id === myId;
          const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
          const scoreColor = h.efficiencyScore >= 70 ? 'var(--green)' : h.efficiencyScore >= 40 ? 'var(--amber)' : 'var(--red)';
          const tier = h.rank <= 3 ? 'PRIORITY' : h.rank <= 6 ? 'STANDARD' : 'LIMITED';
          const tierColor = h.rank <= 3 ? 'badge-green' : h.rank <= 6 ? 'badge-amber' : 'badge-red';

          return (
            <div
              key={h.id}
              style={{
                padding: '14px 24px',
                borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'grid',
                gridTemplateColumns: '60px 1fr 120px 120px 120px 120px 100px',
                gap: 12,
                alignItems: 'center',
                background: isMe ? 'rgba(0,212,255,0.04)' : 'transparent',
                borderLeft: isMe ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => !isMe && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => !isMe && (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {medal ? <span style={{ fontSize: 20 }}>{medal}</span> : (
                  <span style={{ fontSize: 18, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--text-muted)' }}>#{h.rank}</span>
                )}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: isMe ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {h.name} {isMe && <span className="badge badge-cyan" style={{ marginLeft: 6 }}>YOU</span>}
                </p>
              </div>
              <span style={{ fontSize: 12, fontFamily: 'Space Mono', color: 'var(--text-secondary)' }}>Floor {h.floor} · {h.unit}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontFamily: 'Rajdhani', fontWeight: 700, color: scoreColor }}>{h.efficiencyScore}</span>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', width: 50 }}>
                    <div style={{ height: '100%', width: `${h.efficiencyScore}%`, background: scoreColor, borderRadius: 2, transition: 'width 0.5s' }} />
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 14, fontFamily: 'Space Mono',
                color: h.currentUsage > 20 ? 'var(--red)' : h.currentUsage > 14 ? 'var(--amber)' : 'var(--green)'
              }}>
                {h.currentUsage} kW
              </span>
              <span style={{ fontSize: 13, fontFamily: 'Space Mono', color: 'var(--green)' }}>₹{h.moneySaved}</span>
              <span className={`badge ${tierColor}`}>{tier}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
