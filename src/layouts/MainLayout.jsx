import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const MainLayout = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="min-h-screen bg-background-main text-text-main font-sans transition-colors duration-300 selection:bg-primary/30 selection:text-black dark:selection:text-white">

            {/* Fixed Top Elements */}
            <Navbar isDarkMode={theme === 'dark'} toggleTheme={toggleTheme} />

            {/* Main Content Area */}
            {/* Padding Top logic: Home page needs full bleed (pt-0), others need to account for Fixed Header */}
            <main className={`${isHomePage ? 'pt-0' : 'pt-20 lg:pt-24'} pb-16 lg:pb-0 min-h-screen w-full`}>
                <Outlet />
            </main>

            {/* Bottom Navigation for Mobile */}
            <div className="lg:hidden">
                <BottomNav />
            </div>

        </div>
    );
};

export default MainLayout;
