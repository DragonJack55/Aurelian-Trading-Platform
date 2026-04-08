import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, CandlestickChart, Wallet, Sun, Moon, User, LogOut, Menu, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import SideMenu from './SideMenu';

const DesktopNav = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        // Load user from localStorage on mount
        const loadUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error('Error parsing user:', e);
                }
            } else {
                setUser(null);
            }
        };

        loadUser();

        // Listen for storage events
        const handleStorageChange = () => {
            loadUser();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [location.pathname]); // Re-check user on navigation changes (e.g. Register -> Home)

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/quotes', label: 'Market', icon: TrendingUp },
        { path: '/trading', label: 'Trade', icon: CandlestickChart },
        { path: '/assets', label: 'Assets', icon: Wallet },
        { path: '/leaderboard', label: 'Leaders', icon: Award },
    ];

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '80px',
                backgroundColor: 'var(--bg-deep)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 20px',
                borderBottom: '1px solid var(--glass-border)',
                zIndex: 1000,
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{
                    width: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 10px'
                }}>
                    <img
                        src="/aurelian_header_logo_v3.png"
                        alt="AURELIAN"
                        style={{ height: '40px', cursor: 'pointer', objectFit: 'contain', mixBlendMode: 'screen' }}
                        onClick={() => navigate('/')}
                    />

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {!props.isAdminPage && navItems.map((item) => (
                            <div
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    color: isActive(item.path) ? 'var(--primary-gold)' : 'var(--text-secondary)',
                                    fontWeight: isActive(item.path) ? '700' : '500',
                                    padding: '10px 20px',
                                    borderRadius: '12px',
                                    backgroundColor: isActive(item.path) ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    fontSize: '15px'
                                }}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <button
                            onClick={toggleTheme}
                            style={{
                                padding: '10px',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: 'var(--primary-gold)',
                                transition: 'all 0.3s ease'
                            }}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        {user ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.05)' }}>
                                    <User size={18} color="var(--primary-gold)" />
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '15px' }}>
                                        {user.name ? user.name.split(' ')[0] : (user.fullName ? user.fullName.split(' ')[0] : user.email.split('@')[0])}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--danger-red)', background: 'transparent', cursor: 'pointer', color: 'var(--danger-red)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.3s ease' }}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleLoginClick}
                                    className="btn-primary"
                                    style={{
                                        padding: '10px 24px',
                                        fontSize: '15px',
                                        background: 'transparent',
                                        border: '1px solid var(--primary-gold)',
                                        color: 'var(--primary-gold)'
                                    }}
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={handleRegisterClick}
                                    className="btn-primary"
                                    style={{ padding: '10px 24px', fontSize: '15px' }}
                                >
                                    Join Now
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setIsSideMenuOpen(true)}
                            style={{
                                padding: '8px',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <SideMenu
                isOpen={isSideMenuOpen}
                onClose={() => setIsSideMenuOpen(false)}
            />
        </>
    );
};

export default DesktopNav;
