import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, unit, icon, color = 'var(--accent)', sub, trend }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 32, fontFamily: 'Rajdhani', fontWeight: 700, color }}>{value}</span>
            {unit && <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{unit}</span>}
          </div>
          {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
          {trend && (
            <div style={{ marginTop: 6, fontSize: 12, color: trend > 0 ? 'var(--red)' : 'var(--green)' }}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% vs yesterday
            </div>
          )}
        </div>
        {icon && <div style={{ fontSize: 28, opacity: 0.8 }}>{icon}</div>}
      </div>
    </div>
  );
}

// ─── ChartCard ────────────────────────────────────────────────────────────────
export function ChartCard({ title, children, action }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Usage Line Chart ─────────────────────────────────────────────────────────
export function UsageLineChart({ usage, prediction }) {
  const data = DAYS.map((d, i) => ({ day: d, usage: usage[i], avg: 14.2 }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} unit="kW" />
        <Tooltip content={<CustomTooltip unit="kW" />} />
        <Line type="monotone" dataKey="usage" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="avg" stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Appliance Bar Chart ──────────────────────────────────────────────────────
export function ApplianceBarChart({ appliances }) {
  const data = [
    { name: 'A/C', value: appliances.ac },
    { name: 'Fridge', value: appliances.fridge },
    { name: 'Washer', value: appliances.washing },
    { name: 'EV', value: appliances.ev },
  ];
  const colors = ['#00d4ff', '#00ff88', '#ffaa00', '#ff6644'];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} unit="kW" />
        <Tooltip content={<CustomTooltip unit="kW" />} />
        {data.map((_, i) => (
          <Bar key={i} dataKey="value" fill={colors[i % colors.length]} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Appliance Pie ────────────────────────────────────────────────────────────
export function AppliancePieChart({ appliances }) {
  const data = [
    { name: 'A/C', value: appliances.ac },
    { name: 'Fridge', value: appliances.fridge },
    { name: 'Washer', value: appliances.washing },
    { name: 'EV Charger', value: appliances.ev },
  ];
  const colors = ['#00d4ff', '#00ff88', '#ffaa00', '#ff6644'];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={colors[i]} stroke="transparent" />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i], display: 'inline-block' }} />
                {d.name}
              </span>
              <span style={{ fontSize: 12, fontFamily: 'Space Mono', color: colors[i] }}>{((d.value / total) * 100).toFixed(0)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(d.value / total) * 100}%`, background: colors[i] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--accent)', fontSize: 13, fontFamily: 'Space Mono' }}>
          {p.value}{unit}
        </p>
      ))}
    </div>
  );
}

// ─── Insight Panel ─────────────────────────────────────────────────────────────
export function InsightPanel({ insights }) {
  const colors = {
    warning: { border: 'var(--amber)', bg: 'rgba(255,170,0,0.06)', text: 'var(--amber)' },
    critical: { border: 'var(--red)', bg: 'rgba(255,68,68,0.06)', text: 'var(--red)' },
    tip: { border: 'var(--accent)', bg: 'rgba(0,212,255,0.06)', text: 'var(--accent)' },
    good: { border: 'var(--green)', bg: 'rgba(0,255,136,0.06)', text: 'var(--green)' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {insights.map((ins, i) => {
        const c = colors[ins.type] || colors.tip;
        return (
          <div key={i} style={{ border: `1px solid ${c.border}`, background: c.bg, borderRadius: 10, padding: '12px 16px' }} className="animate-fade-up">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
              <div>
                <p style={{ fontFamily: 'Rajdhani', fontWeight: 600, color: c.text, fontSize: 14, marginBottom: 3 }}>{ins.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ins.msg}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Efficiency Gauge ─────────────────────────────────────────────────────────
export function EfficiencyGauge({ score }) {
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)';
  const label = score >= 70 ? 'EFFICIENT' : score >= 40 ? 'MODERATE' : 'HIGH USAGE';
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - score / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={140} height={140} style={{ overflow: 'visible' }}>
        <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--border)" strokeWidth={8} />
        <circle
          cx={70} cy={70} r={radius} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circumference} strokeDashoffset={dashoffset}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <text x={70} y={64} textAnchor="middle" fill={color} fontSize={28} fontFamily="Rajdhani" fontWeight={700}>{score}</text>
        <text x={70} y={82} textAnchor="middle" fill="var(--text-muted)" fontSize={10} fontFamily="Space Mono">SCORE</text>
      </svg>
      <span className="badge" style={{ background: `rgba(0,0,0,0.3)`, color, border: `1px solid ${color}` }}>{label}</span>
    </div>
  );
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────
export function RankBadge({ rank }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const color = rank <= 3 ? 'var(--green)' : rank <= 6 ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {medal && <span style={{ fontSize: 24 }}>{medal}</span>}
      <div>
        <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>BUILDING RANK</p>
        <p style={{ fontSize: 36, fontFamily: 'Rajdhani', fontWeight: 700, color, lineHeight: 1 }}>#{rank}</p>
      </div>
    </div>
  );
}
