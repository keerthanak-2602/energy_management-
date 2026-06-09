import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TIME_SLOTS, getAccessibleSlots } from '../data/store';

export default function EVBooking({ adminView = false, targetHouseId = null }) {
  const { session, households, evBookings, bookSlot, adminOverride } = useApp();
  const [selectedHouse, setSelectedHouse] = useState(targetHouseId || (adminView ? 'house1' : session?.householdId));
  const [confirmSlot, setConfirmSlot] = useState(null);

  const household = households.find(h => h.id === (adminView ? selectedHouse : session?.householdId));
  if (!household) return null;

  const accessible = getAccessibleSlots(household.rank);
  const myBookings = TIME_SLOTS.filter(s => evBookings[`${household.id}_${s}`]);

  const getSlotStatus = (slot) => {
    const key = `${household.id}_${slot}`;
    if (evBookings[key]) return 'mine';
    const isLocked = !accessible.includes(slot);
    if (isLocked) return 'locked';
    // Check if booked by another (simulated)
    const othersBooked = households
      .filter(h => h.id !== household.id)
      .some(h => evBookings[`${h.id}_${slot}`]);
    if (othersBooked && Math.abs(TIME_SLOTS.indexOf(slot) % 3) === 0) return 'booked';
    return 'available';
  };

  const handleSlotClick = (slot) => {
    if (adminView) {
      const key = `${selectedHouse}_${slot}`;
      adminOverride(selectedHouse, slot, !evBookings[key]);
      return;
    }
    const status = getSlotStatus(slot);
    if (status === 'locked' || status === 'booked') return;
    setConfirmSlot(slot);
  };

  const confirmBook = () => {
    if (confirmSlot) {
      bookSlot(household.id, confirmSlot);
      setConfirmSlot(null);
    }
  };

  const rankTier = household.rank <= 3 ? 'PRIORITY' : household.rank <= 6 ? 'STANDARD' : 'RESTRICTED';
  const rankColor = household.rank <= 3 ? 'var(--green)' : household.rank <= 6 ? 'var(--amber)' : 'var(--red)';

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: '0 auto' }} className="animate-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          {adminView ? '⚡ EV MANAGEMENT CONSOLE' : '🔋 EV CHARGING STATION'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {adminView ? 'View and override all EV slot bookings across the building' : 'Book your EV charging time slot based on your efficiency tier'}
        </p>
      </div>

      {adminView && (
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>SELECT HOUSEHOLD</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {households.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHouse(h.id)}
                style={{
                  padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                  fontFamily: 'Space Mono', transition: 'all 0.2s',
                  background: selectedHouse === h.id ? 'rgba(0,212,255,0.15)' : 'var(--bg-secondary)',
                  border: selectedHouse === h.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color: selectedHouse === h.id ? 'var(--accent)' : 'var(--text-secondary)'
                }}
              >
                {h.unit} · #{h.rank}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Access Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', marginBottom: 8 }}>ACCESS TIER</p>
          <p style={{ fontSize: 22, fontFamily: 'Rajdhani', fontWeight: 700, color: rankColor }}>{rankTier}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Based on rank #{household.rank}</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', marginBottom: 8 }}>AVAILABLE SLOTS</p>
          <p style={{ fontSize: 22, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)' }}>{accessible.length}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>of {TIME_SLOTS.length} total</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', marginBottom: 8 }}>MY BOOKINGS</p>
          <p style={{ fontSize: 22, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--green)' }}>{myBookings.length}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Active reservations</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', marginBottom: 8 }}>EST. CHARGE TIME</p>
          <p style={{ fontSize: 22, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--amber)' }}>{myBookings.length * 1}h</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>~{(myBookings.length * 7.2).toFixed(0)} kWh</p>
        </div>
      </div>

      {/* Restriction notice */}
      {household.rank > 6 && !adminView && (
        <div style={{
          background: 'rgba(255,170,0,0.08)', border: '1px solid rgba(255,170,0,0.3)',
          borderRadius: 10, padding: '12px 20px', marginBottom: 20,
          display: 'flex', gap: 12, alignItems: 'center'
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <p style={{ fontFamily: 'Rajdhani', fontWeight: 600, color: 'var(--amber)', fontSize: 14 }}>RESTRICTED ACCESS TIER</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Your rank #{household.rank} limits charging to off-peak hours only (10AM–4PM). Improve your efficiency score to unlock all slots.
            </p>
          </div>
        </div>
      )}

      {/* Slot Grid */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>TIME SLOT BOOKING — TODAY</h3>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'Space Mono' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: 'rgba(0,212,255,0.3)', border: '1px solid var(--accent)', borderRadius: 2, display: 'inline-block' }} /> MY BOOKING
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: 'rgba(255,68,68,0.2)', border: '1px solid var(--red)', borderRadius: 2, display: 'inline-block' }} /> OCCUPIED
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 2, opacity: 0.3, display: 'inline-block' }} /> LOCKED
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {TIME_SLOTS.map(slot => {
            const status = getSlotStatus(slot);
            return (
              <div
                key={slot}
                className={`slot-btn ${status}`}
                onClick={() => handleSlotClick(slot)}
              >
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{slot}</div>
                <div style={{ fontSize: 9, letterSpacing: '0.05em' }}>
                  {status === 'mine' ? adminView ? 'BOOKED' : 'YOUR SLOT' : status === 'booked' ? 'OCCUPIED' : status === 'locked' ? '🔒 LOCKED' : 'AVAILABLE'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Bookings Summary */}
      {myBookings.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            {adminView ? `${household.name} BOOKINGS` : 'MY ACTIVE BOOKINGS'}
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {myBookings.map(slot => (
              <div key={slot} style={{
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)',
                borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span style={{ fontSize: 14, fontFamily: 'Space Mono', color: 'var(--accent)', fontWeight: 700 }}>⚡ {slot}</span>
                {!adminView && (
                  <button
                    onClick={() => bookSlot(household.id, slot)}
                    style={{
                      background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                      borderRadius: 4, padding: '2px 8px', color: 'var(--red)', fontSize: 10,
                      cursor: 'pointer', fontFamily: 'Space Mono'
                    }}
                  >
                    CANCEL
                  </button>
                )}
                {adminView && (
                  <button
                    onClick={() => adminOverride(selectedHouse, slot, false)}
                    style={{
                      background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                      borderRadius: 4, padding: '2px 8px', color: 'var(--red)', fontSize: 10,
                      cursor: 'pointer', fontFamily: 'Space Mono'
                    }}
                  >
                    REVOKE
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmSlot && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="card glow-cyan" style={{ padding: 32, maxWidth: 360, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>CONFIRM BOOKING</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
              Reserve EV charging slot for
            </p>
            <p style={{ fontSize: 28, fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{confirmSlot}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, fontFamily: 'Space Mono' }}>Est. cost: ₹{(7.2 * 4.5).toFixed(0)} · 7.2 kWh</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setConfirmSlot(null)}
                style={{
                  flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'Rajdhani',
                  fontSize: 14, fontWeight: 600, letterSpacing: '0.1em'
                }}
              >
                CANCEL
              </button>
              <button
                onClick={confirmBook}
                style={{
                  flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00d4ff, #0088cc)',
                  border: 'none', borderRadius: 8, color: '#000', cursor: 'pointer', fontFamily: 'Rajdhani',
                  fontSize: 14, fontWeight: 700, letterSpacing: '0.1em'
                }}
              >
                CONFIRM ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
