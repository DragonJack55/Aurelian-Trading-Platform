import React, { useState, useEffect } from 'react';
import { X, Globe, Headphones, ChevronRight, Check, ArrowDownCircle, ArrowUpCircle, Repeat, RefreshCw, Gift, User, LogOut, Shield, Wallet, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';
import PromotionModal from './PromotionModal';
import BindAddressModal from './BindAddressModal';

const languages = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w80/us.png' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w80/fr.png' },
    { code: 'de', name: 'Deutsch', flag: 'https://flagcdn.com/w80/de.png' },
    { code: 'cn', name: '中文', flag: 'https://flagcdn.com/w80/cn.png' },
    { code: 'ar', name: 'العربية', flag: 'https://flagcdn.com/w80/sa.png' },
    { code: 'am', name: 'Amharic', flag: 'https://flagcdn.com/w80/et.png' },
    { code: 'jp', name: '日本語', flag: 'https://flagcdn.com/w80/jp.png' },
    { code: 'kr', name: '한국어', flag: 'https://flagcdn.com/w80/kr.png' },
];

const SideMenu = ({ isOpen, onClose }) => {
    const { language, setLanguage, setIsChatOpen, t } = useApp();
    const { theme, toggleTheme } = useTheme();
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isBindAddressOpen, setIsBindAddressOpen] = useState(false);
    const [isPromotionOpen, setIsPromotionOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
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

        const handleStorageChange = () => {
            loadUser();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('storage'));
        onClose();
    };

    const handleLoginClick = () => {
        onClose();
        window.location.href = '/login';
    };

    const handleRegisterClick = () => {
        onClose();
        window.location.href = '/register';
    };

    const menuItems = [
        { label: 'Deposit', icon: ArrowDownCircle, color: 'var(--primary-gold)', action: () => setIsDepositOpen(true) },
        { label: 'Withdrawal', icon: ArrowUpCircle, color: '#EF4444', action: () => setIsWithdrawOpen(true) },
        { label: 'Trade', icon: RefreshCw, color: 'var(--primary-gold)', action: () => window.location.href = '/trading' },
        { label: 'My promotion', icon: Gift, color: 'var(--primary-gold)', action: () => setIsPromotionOpen(true) },
        { label: 'Security Center', icon: Shield, color: 'var(--primary-gold)', action: () => window.location.href = '/security' },
        { label: 'Bind the withdrawal address', icon: Wallet, color: 'var(--primary-gold)', action: () => setIsBindAddressOpen(true) },
    ];

    return (
        <>
            <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
            <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
            <BindAddressModal isOpen={isBindAddressOpen} onClose={() => setIsBindAddressOpen(false)} />
            <PromotionModal isOpen={isPromotionOpen} onClose={() => setIsPromotionOpen(false)} />

            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 1040,
                        backdropFilter: 'blur(3px)'
                    }}
                />
            )}

            {/* Drawer */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: isOpen ? 0 : '-100%',
                width: '80%',
                maxWidth: '300px',
                height: '100%',
                background: 'var(--bg-deep)',
                zIndex: 1050,
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '-5px 0 25px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid var(--glass-border)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 20px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <img
                        src="/aurelian_header_logo_v3.png"
                        alt="AURELIAN"
                        style={{ height: '32px', objectFit: 'contain', mixBlendMode: 'screen' }}
                    />
                    <X onClick={onClose} style={{ cursor: 'pointer', color: 'var(--primary-gold)' }} />
                </div>

                {/* Content */}
                <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>

                    {/* User Profile Section */}
                    <div className="card" style={{
                        padding: '16px',
                        marginBottom: '24px',
                    }}>
                        {user ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="auth-premium-logo" style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'var(--gold-gradient)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#000'
                                    }}>
                                        <User size={24} />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.name || user.email.split('@')[0]}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--danger-red)',
                                        background: 'transparent',
                                        color: 'var(--danger-red)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '4px' }}>
                                    Experience Institutional Excellence
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={handleLoginClick}
                                        className="btn-primary"
                                        style={{
                                            flex: 1,
                                            padding: '10px 4px',
                                            fontSize: '14px',
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
                                        style={{
                                            flex: 1,
                                            padding: '10px 4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Join Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer Service */}
                    <div
                        onClick={() => {
                            setIsChatOpen(true);
                            onClose();
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            borderRadius: '12px',
                            background: 'var(--bg-light)',
                            marginBottom: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid var(--primary-gold)'
                        }}>
                            <img
                                src="/customer_service_agent.png"
                                alt="Support"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{t('customerService')}</span>
                    </div>

                    {/* New Menu Items */}
                    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {menuItems.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    item.action();
                                    onClose();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)' // Added border for separation
                                }}
                            >
                                <div style={{
                                    // background: item.color, // Optional: Colored backgrounds for icons
                                    // padding: '6px',
                                    // borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: item.color // Icon color
                                }}>
                                    <item.icon size={20} />
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Theme Toggle Section */}
                    <div style={{ marginBottom: '16px' }}>
                        <div
                            onClick={toggleTheme}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 0',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--border-color)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '500' }}>
                                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                            </span>
                            <div style={{
                                width: '40px',
                                height: '22px',
                                background: theme === 'dark' ? 'var(--primary-gold)' : 'var(--bg-glass)',
                                borderRadius: '20px',
                                position: 'relative',
                                transition: 'background 0.3s',
                                border: '1px solid var(--text-muted)'
                            }}>
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    background: '#fff',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '1px',
                                    left: theme === 'dark' ? '19px' : '1px',
                                    transition: 'left 0.3s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Language Section */}
                    <div style={{ marginBottom: '16px' }}>
                        <div
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 0',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--border-color)'
                            }}
                        >
                            <Globe size={20} color="var(--text-secondary)" />
                            <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: '500' }}>{t('language')}</span>
                            <ChevronRight size={16} style={{
                                transform: isLangOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                color: 'var(--text-secondary)'
                            }} />
                        </div>

                        {/* Language List */}
                        {isLangOpen && (
                            <div style={{ paddingLeft: '16px', marginTop: '8px' }}>
                                {languages.map(lang => (
                                    <div key={lang.code}
                                        onClick={() => { setLanguage(lang.code); onClose(); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            background: language === lang.code ? 'var(--bg-light)' : 'transparent'
                                        }}
                                    >
                                        <img src={lang.flag} alt={lang.name} style={{ width: '24px', height: '16px', borderRadius: '2px', objectFit: 'cover' }} />
                                        <span style={{ fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>{lang.name}</span>
                                        {language === lang.code && <Check size={16} color="var(--primary-gold)" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default SideMenu;
