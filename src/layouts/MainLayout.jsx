import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import BottomTicker from '../components/BottomTicker';

const MainLayout = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="min-h-screen bg-background-main text-text-main font-sans transition-colors duration-300 selection:bg-primary/30 selection:text-black dark:selection:text-white">

            {/* Fixed Top Elements - Only show on Home for mobile, always on desktop */}
            <div className={`${isHomePage ? '' : 'hidden lg:block'}`}>
                <Navbar isDarkMode={theme === 'dark'} toggleTheme={toggleTheme} />
            </div>

            {/* Main Content Area */}
            <main className={`${isHomePage ? 'pt-0' : (location.pathname === '/trade' || location.pathname === '/trading' ? 'pt-[60px] lg:pt-[80px]' : 'pt-4 lg:pt-24')} pb-24 lg:pb-0 min-h-screen w-full flex flex-col`}>
                <Outlet />
            </main>

            {/* Global Bottom Ticker - Visible on all pages */}
            <BottomTicker />

            {/* Bottom Navigation for Mobile */}
            <div className="lg:hidden">
                <BottomNav />
            </div>

        </div>
    );
};

export default MainLayout;
