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
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#05080F]/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 flex justify-around pt-3 pb-[calc(14px+env(safe-area-inset-bottom))] z-[1000] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-500">
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 flex-1 ${active ? 'text-primary' : 'text-text-muted hover:text-text-subtle'}`}
          >
            <item.icon size={22} className={active ? 'drop-shadow-[0_0_5px_rgba(212,175,55,0.6)]' : ''} />
            <span className={`text-[11px] mt-1.5 ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default BottomNav;
