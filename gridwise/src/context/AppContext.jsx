import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initHouseholds, computeRanks, USERS } from '../data/store';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gridwise_session')); } catch { return null; }
  });
  const [households, setHouseholds] = useState(() => computeRanks(initHouseholds()));
  const [evBookings, setEvBookings] = useState({}); // { 'house1_6AM': true, ... }
  const [tick, setTick] = useState(0);
  const intervalRef = useRef(null);

  // Simulation engine
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setHouseholds(prev => {
        const updated = prev.map(h => {
          const delta = (Math.random() - 0.5) * 1.2;
          const newUsage = Math.max(5, +(h.currentUsage + delta).toFixed(1));
          const newScore = Math.max(10, Math.min(100, h.efficiencyScore + Math.round((Math.random() - 0.52) * 2)));
          const dailyCopy = [...h.usage];
          dailyCopy[6] = +(dailyCopy[6] + (Math.random() - 0.5) * 0.5).toFixed(1);
          return {
            ...h,
            currentUsage: newUsage,
            efficiencyScore: newScore,
            usage: dailyCopy,
            prediction: +(newUsage * (0.88 + Math.random() * 0.24)).toFixed(1),
            moneySaved: +(newScore * 0.45).toFixed(2),
            energySaved: +(newScore * 0.12).toFixed(1),
            alert: newUsage > 22 ? 'CRITICAL' : newUsage > 17 ? 'WARNING' : null,
          };
        });
        return computeRanks(updated);
      });
      setTick(t => t + 1);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const login = (username, password) => {
    const user = USERS[username];
    if (!user || user.password !== password) return false;
    const s = { username, role: user.role, name: user.name, householdId: user.householdId || null };
    setSession(s);
    localStorage.setItem('gridwise_session', JSON.stringify(s));
    return true;
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('gridwise_session');
  };

  const bookSlot = (householdId, slot) => {
    const key = `${householdId}_${slot}`;
    setEvBookings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const adminOverride = (householdId, slot, value) => {
    const key = `${householdId}_${slot}`;
    setEvBookings(prev => ({ ...prev, [key]: value }));
  };

  const getHousehold = (id) => households.find(h => h.id === id);

  return (
    <AppContext.Provider value={{ session, login, logout, households, evBookings, bookSlot, adminOverride, getHousehold, tick }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
