import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { logout } from '../services/authService';
import NotificationsDropdown from './NotificationsDropdown';

const Navbar = ({ isDarkMode, toggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [appVersion, setAppVersion] = useState('v2.0.2');
    const { user } = useApp();

    useEffect(() => {
        // Fetch version from version.json
        fetch('/version.json?t=' + Date.now())
            .then(res => res.json())
            .then(data => setAppVersion('v' + data.version))
            .catch(() => setAppVersion('v2.0.2')); // Fallback
    }, []);

    const navItems = [
        { name: 'Home', path: '/', icon: 'home' },
        { name: 'Market', path: '/market', icon: 'candlestick_chart' },
        { name: 'Trade', path: '/trade', icon: 'sync_alt' },
        { name: 'Assets', path: '/assets', icon: 'wallet' },
        // { name: 'Learn', path: '#', icon: 'school' } // Placeholder - commented until content is ready
    ];

    const getInitials = (name) => {
        if (!name) return 'U';
        if (name.includes('@')) return name.substring(0, 2).toUpperCase(); // Fallback for emails
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getDisplayName = (name) => {
        if (!name) return 'User';
        return name.split('@')[0];
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${isDarkMode ? 'bg-background-dark/80 backdrop-blur-md border-b border-border-gold' : 'bg-white/95 backdrop-blur-md border-b border-border-light shadow-sm'}`}>
            {/* Dark Mode Top Line Effect */}
            <div className="hidden dark:block absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 dark:h-20 transition-all duration-300">
                    {/* Logo Area */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-3 dark:gap-4 cursor-pointer group relative">
                        <div className="hidden dark:block absolute -inset-2 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative w-10 h-10 dark:w-12 dark:h-12 flex items-center justify-center transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-gold rounded-lg dark:rounded-xl rotate-45 group-hover:rotate-90 dark:group-hover:rotate-[135deg] transition-transform duration-500 dark:duration-700 opacity-80 dark:opacity-90 blur-[2px] dark:blur-none dark:shadow-gold-sm"></div>
                            <div className="relative w-full h-full dark:w-[96%] dark:h-[96%] bg-white dark:bg-[#080b13] border border-primary/50 dark:border-none rounded-lg dark:rounded-[10px] flex items-center justify-center z-10 shadow-sm">
                                <span className="material-symbols-outlined text-primary-dark text-2xl dark:text-3xl dark:text-transparent dark:bg-clip-text dark:bg-gradient-gold-text dark:drop-shadow-sm transition-all">diamond</span>
                            </div>
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="font-display font-bold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary-dark via-primary to-primary-dark min-[0px]:dark:bg-gradient-gold-text uppercase leading-none group-hover:text-primary-dark transition-colors drop-shadow-sm dark:tracking-widest">Aurelian</span>
                            <div className="flex items-center gap-0.5 dark:gap-2">
                                <span className="hidden dark:block h-[1px] w-3 bg-gradient-gold opacity-50"></span>
                                <span className="font-sans text-[0.6rem] dark:text-[0.65rem] text-primary-dark dark:text-primary tracking-[0.3em] uppercase pl-0.5 dark:pl-0 font-bold dark:font-medium dark:opacity-90">TD Trade</span>
                                <span className="ml-2 px-1 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">{appVersion}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden lg:flex items-center gap-2 bg-surface-light/30 p-1.5 px-4 rounded-full border border-border-gold/20 shadow-inner-light backdrop-blur-md">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`nav-link px-4 py-2 flex items-center gap-2 rounded-lg transition-all ${isActive(item.path) ? 'text-primary' : ''}`}
                            >
                                {isActive(item.path) && (
                                    <span className="absolute inset-0 bg-primary/10 rounded-lg -z-10 animate-fade-in"></span>
                                )}
                                <span className="material-symbols-outlined text-lg group-hover:text-primary transition-colors dark:hidden">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-text-muted hover:text-primary transition-colors focus:outline-none"
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {isDarkMode ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        <NotificationsDropdown />

                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center gap-3 focus:outline-none">
                                    <div className="w-10 h-10 rounded-full bg-surface-dark border border-border-gold flex items-center justify-center text-primary font-bold font-display tracking-widest shadow-glow group-hover:shadow-glow-strong transition-all duration-300">
                                        {getInitials(user?.full_name || user.user_metadata?.full_name || user.email)}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="text-xs text-text-muted font-medium">Welcome</div>
                                        <div className="text-sm font-bold text-white max-w-[100px] truncate">
                                            {getDisplayName(user?.full_name || user.user_metadata?.full_name || user.email)}
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-500 group-hover:text-primary transition-colors">expand_more</span>
                                </button>


                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-dark border border-border-gold rounded-xl shadow-glass opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right z-50">
                                    <div className="py-2">
                                        <Link to="/security" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors">
                                            My Profile
                                        </Link>
                                        <Link to="/security" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors">
                                            Security
                                        </Link>
                                        <div className="h-px bg-white/10 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-white/5 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="hidden sm:block text-sm font-semibold text-primary-dark dark:text-primary hover:text-primary dark:hover:text-primary-light transition-colors tracking-wide uppercase"
                                >
                                    LOG IN
                                </button>

                                <button
                                    onClick={() => navigate('/register')}
                                    className="btn-gold shadow-glow"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Join Now
                                        <span className="material-symbols-outlined text-sm font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </span>
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-primary-dark dark:text-primary hover:text-primary dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl dark:text-3xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-16 dark:top-20 w-full bg-surface-dark border-b border-border-gold shadow-glass p-4 flex flex-col gap-4 animate-slide-up">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 p-3 rounded-lg ${isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="font-semibold">{item.name}</span>
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
