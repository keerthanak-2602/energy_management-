import { useApp } from '../context/AppContext';
import { generateInsights } from '../data/store';
import {
  StatCard, ChartCard, UsageLineChart, ApplianceBarChart,
  AppliancePieChart, InsightPanel, EfficiencyGauge, RankBadge
} from '../components/UI';

export default function Dashboard({ setPage }) {
  const { session, households } = useApp();
  const household = households.find(h => h.id === session?.householdId);
  if (!household) return null;

  const insights = generateInsights(household);
  const totalAppliance = Object.values(household.appliances).reduce((a, b) => a + b, 0);
  const predTrend = +(((household.prediction - household.currentUsage) / household.currentUsage) * 100).toFixed(1);

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }} className="animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            {household.name}
            <span style={{ marginLeft: 12, fontSize: 14, fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>
              Floor {household.floor} · Unit {household.unit}
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Real-time energy monitoring & AI optimization</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {household.alert && (
            <div className={`badge ${household.alert === 'CRITICAL' ? 'badge-red' : 'badge-amber'}`} style={{ padding: '6px 12px', fontSize: 12 }}>
              {household.alert === 'CRITICAL' ? '🔴' : '⚠️'} {household.alert}
            </div>
          )}
          <button
            onClick={() => setPage('ev')}
            style={{
              padding: '8px 18px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: 8, color: 'var(--accent)', fontSize: 12, cursor: 'pointer',
              fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.08em'
            }}
          >
            ⚡ BOOK EV SLOT
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {household.alert === 'CRITICAL' && (
        <div style={{
          background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.4)',
          borderRadius: 10, padding: '12px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 20 }}>🚨</span>
          <div>
            <p style={{ fontFamily: 'Rajdhani', fontWeight: 600, color: 'var(--red)', fontSize: 15 }}>CRITICAL OVERUSE ALERT</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Your usage ({household.currentUsage} kW) exceeds safe threshold. Building load manager may throttle your supply. Reduce AC and EV charging immediately.
            </p>
          </div>
        </div>
      )}

      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="CURRENT LOAD"
          value={household.currentUsage}
          unit="kW"
          icon="⚡"
          color={household.currentUsage > 20 ? 'var(--red)' : household.currentUsage > 14 ? 'var(--amber)' : 'var(--green)'}
          sub="Live reading"
        />
        <StatCard
          label="TOMORROW FORECAST"
          value={household.prediction}
          unit="kW"
          icon="🔮"
          color="var(--accent)"
          trend={predTrend}
        />
        <StatCard
          label="MONEY SAVED"
          value={`₹${household.moneySaved}`}
          icon="💰"
          color="var(--green)"
          sub="This billing cycle"
        />
        <StatCard
          label="ENERGY SAVED"
          value={household.energySaved}
          unit="kWh"
          icon="🌱"
          color="var(--green-dim)"
          sub="vs avg household"
        />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 20, marginBottom: 20 }}>
        {/* Usage Chart */}
        <ChartCard title="Weekly Usage Pattern">
          <UsageLineChart usage={household.usage} prediction={household.prediction} />
          <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, background: 'var(--accent)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>Your Usage</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, background: 'var(--text-muted)', borderTop: '2px dashed var(--text-muted)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>Building Avg</span>
            </div>
          </div>
        </ChartCard>

        {/* Appliance Breakdown */}
        <ChartCard title="Appliance Breakdown">
          <ApplianceBarChart appliances={household.appliances} />
        </ChartCard>

        {/* Efficiency + Rank */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 16 }}>EFFICIENCY SCORE</p>
            <EfficiencyGauge score={household.efficiencyScore} />
          </div>
          <div className="card" style={{ padding: 20 }}>
            <RankBadge rank={household.rank} />
            <div style={{ marginTop: 12 }}>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${((10 - household.rank) / 9) * 100}%`,
                  background: household.rank <= 3 ? 'var(--green)' : household.rank <= 6 ? 'var(--amber)' : 'var(--red)'
                }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'Space Mono' }}>
                {household.rank <= 3 ? 'TOP PERFORMER' : household.rank <= 6 ? 'AVERAGE TIER' : 'NEEDS IMPROVEMENT'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Pie breakdown */}
        <ChartCard title="Energy Distribution">
          <AppliancePieChart appliances={household.appliances} />
          <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>
              TOTAL METERED: <span style={{ color: 'var(--accent)' }}>{totalAppliance.toFixed(1)} kW</span>
              &nbsp;·&nbsp; UNACCOUNTED: <span style={{ color: 'var(--amber)' }}>{Math.max(0, household.currentUsage - totalAppliance).toFixed(1)} kW</span>
            </p>
          </div>
        </ChartCard>

        {/* AI Insights */}
        <ChartCard title="🤖 AI Insights & Recommendations">
          <InsightPanel insights={insights} />
        </ChartCard>
      </div>
    </div>
  );
}
