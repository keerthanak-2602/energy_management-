// GridWise AI — Central Data Store

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function genUsage(base, variance) {
  return DAYS.map(() => +(base + (Math.random() - 0.5) * variance * 2).toFixed(1));
}

export const USERS = {
  admin: { password: 'admin123', role: 'admin', name: 'System Administrator' },
  house1: { password: 'pass1', role: 'user', householdId: 'house1', name: 'Rivera Family' },
  house2: { password: 'pass2', role: 'user', householdId: 'house2', name: 'Chen Residence' },
  house3: { password: 'pass3', role: 'user', householdId: 'house3', name: 'Patel Home' },
  house4: { password: 'pass4', role: 'user', householdId: 'house4', name: 'Johnson Suite' },
  house5: { password: 'pass5', role: 'user', householdId: 'house5', name: 'Kim Apartment' },
  house6: { password: 'pass6', role: 'user', householdId: 'house6', name: 'Martinez Unit' },
  house7: { password: 'pass7', role: 'user', householdId: 'house7', name: 'Thompson Place' },
  house8: { password: 'pass8', role: 'user', householdId: 'house8', name: 'Nguyen Suite' },
  house9: { password: 'pass9', role: 'user', householdId: 'house9', name: 'Okonkwo Home' },
  house10: { password: 'pass10', role: 'user', householdId: 'house10', name: 'Alvarez Unit' },
};

export function initHouseholds() {
  const raw = [
    { id: 'house1', name: 'Rivera Family',    base: 18, appliances: { ac: 8.2, fridge: 3.1, washing: 2.4, ev: 4.5 }, floor: 3, unit: '3A' },
    { id: 'house2', name: 'Chen Residence',   base: 12, appliances: { ac: 4.1, fridge: 2.8, washing: 1.2, ev: 3.8 }, floor: 1, unit: '1B' },
    { id: 'house3', name: 'Patel Home',       base: 22, appliances: { ac: 10.5, fridge: 3.2, washing: 3.1, ev: 5.2 }, floor: 4, unit: '4C' },
    { id: 'house4', name: 'Johnson Suite',    base: 14, appliances: { ac: 5.2, fridge: 2.9, washing: 1.8, ev: 4.1 }, floor: 2, unit: '2A' },
    { id: 'house5', name: 'Kim Apartment',    base: 9,  appliances: { ac: 3.0, fridge: 2.5, washing: 0.8, ev: 2.7 }, floor: 1, unit: '1A' },
    { id: 'house6', name: 'Martinez Unit',    base: 20, appliances: { ac: 9.1, fridge: 3.4, washing: 2.9, ev: 4.6 }, floor: 5, unit: '5B' },
    { id: 'house7', name: 'Thompson Place',   base: 16, appliances: { ac: 6.8, fridge: 3.0, washing: 2.2, ev: 4.0 }, floor: 3, unit: '3C' },
    { id: 'house8', name: 'Nguyen Suite',     base: 11, appliances: { ac: 4.5, fridge: 2.7, washing: 1.3, ev: 2.5 }, floor: 2, unit: '2B' },
    { id: 'house9', name: 'Okonkwo Home',     base: 25, appliances: { ac: 12.0, fridge: 3.8, washing: 3.5, ev: 5.7 }, floor: 6, unit: '6A' },
    { id: 'house10', name: 'Alvarez Unit',    base: 13, appliances: { ac: 5.5, fridge: 2.6, washing: 1.6, ev: 3.3 }, floor: 4, unit: '4A' },
  ];

  return raw.map(h => {
    const usage = genUsage(h.base, 3);
    const avgUsage = usage.reduce((a, b) => a + b, 0) / usage.length;
    const efficiencyScore = Math.max(10, Math.min(100, Math.round(110 - avgUsage * 3.2)));
    const moneySaved = +(efficiencyScore * 0.45).toFixed(2);
    const energySaved = +(efficiencyScore * 0.12).toFixed(1);
    return {
      ...h,
      usage,
      prediction: +(avgUsage * (0.9 + Math.random() * 0.2)).toFixed(1),
      efficiencyScore,
      moneySaved,
      energySaved,
      rank: 0,
      currentUsage: +(h.base + (Math.random() - 0.5) * 2).toFixed(1),
      alert: avgUsage > 20 ? 'CRITICAL' : avgUsage > 16 ? 'WARNING' : null,
    };
  });
}

export function computeRanks(households) {
  const sorted = [...households].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  return households.map(h => ({
    ...h,
    rank: sorted.findIndex(s => s.id === h.id) + 1,
  }));
}

export function generateInsights(household) {
  const insights = [];
  const { appliances, efficiencyScore, currentUsage } = household;

  if (appliances.ac > 7) {
    insights.push({ type: 'warning', icon: '❄️', title: 'AC Overuse Detected', msg: `Your AC accounts for ${((appliances.ac / currentUsage) * 100).toFixed(0)}% of usage. Set thermostat to 24°C to save ~₹${(appliances.ac * 0.3).toFixed(0)}/day.` });
  }
  if (appliances.ev > 4.5) {
    insights.push({ type: 'tip', icon: '⚡', title: 'EV Off-Peak Scheduling', msg: 'Shift EV charging to 11PM–5AM to reduce cost by up to 40% using off-peak tariffs.' });
  }
  if (appliances.washing > 2.5) {
    insights.push({ type: 'tip', icon: '🌀', title: 'Washer Efficiency', msg: 'Run full loads and use cold-water cycles. Your current pattern costs ~₹12 extra/week.' });
  }
  if (efficiencyScore > 75) {
    insights.push({ type: 'good', icon: '🌱', title: 'Green Household Status', msg: `You're in the top ${100 - efficiencyScore + 10}% of efficient households. Keep it up!` });
  }
  if (currentUsage > 20) {
    insights.push({ type: 'critical', icon: '🔴', title: 'Peak Load Alert', msg: 'Current usage exceeds building average by 35%. Risk of load-shedding override active.' });
  }
  if (insights.length === 0) {
    insights.push({ type: 'good', icon: '✅', title: 'Optimal Performance', msg: 'All systems running within efficient parameters. No immediate action required.' });
  }
  return insights;
}

export const TIME_SLOTS = [
  '6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM',
  '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM',
  '8PM', '9PM', '10PM'
];

export function getAccessibleSlots(rank, total = 10) {
  if (rank <= 3) return TIME_SLOTS; // top rank: all slots
  if (rank <= 6) return TIME_SLOTS.filter((_, i) => i >= 2 && i <= 14); // mid: limited
  return TIME_SLOTS.filter((_, i) => i >= 4 && i <= 10); // low: restricted
}
