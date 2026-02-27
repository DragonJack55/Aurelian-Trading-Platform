import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, CandlestickChart, Wallet, Award } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/quotes', label: 'Market', icon: TrendingUp },
    { path: '/trading', label: 'Trading', icon: CandlestickChart },
    { path: '/leaderboard', label: 'Leaders', icon: Award },
    { path: '/assets', label: 'Assets', icon: Wallet },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--bg-deep)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0 env(safe-area-inset-bottom)',
      borderTop: '1px solid var(--glass-border)',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      {navItems.map((item) => (
        <div
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            color: isActive(item.path) ? 'var(--primary-gold)' : 'var(--text-secondary)',
            transition: 'all 0.3s ease',
            flex: 1
          }}
        >
          <item.icon size={22} style={{ filter: isActive(item.path) ? 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.5))' : 'none' }} />
          <span style={{ fontSize: '11px', marginTop: '6px', fontWeight: isActive(item.path) ? '700' : '500' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BottomNav;
