import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, EyeOff, Shield, Wallet, Download, Headphones,
    ArrowDownCircle, ArrowLeftRight, RefreshCcw, Gift,
    CreditCard, ChevronRight, Globe, Check, Lock, PhoneCall, AlertTriangle
} from 'lucide-react';
import WithdrawModal from '../components/WithdrawModal';
import DepositModal from '../components/DepositModal';
import ExchangeModal from '../components/ExchangeModal';
import PromotionModal from '../components/PromotionModal';
import BindAddressModal from '../components/BindAddressModal';
import { useApp } from '../context/AppContext';
import { getVerificationStatus } from '../services/verificationService';

const MenuItem = ({ icon: DynamicIcon, title, onClick, isLast }) => (
    <div
        onClick={onClick}
        className={`p-5 flex justify-between items-center cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${!isLast ? 'border-b border-gray-100 dark:border-white/5' : ''}`}
    >
        <div className="flex items-center">
            <div className="w-1 h-6 bg-gradient-gold rounded mr-4 shadow-gold-sm"></div>
            <div className="mr-3 text-primary-dark dark:text-primary">
                {React.createElement(DynamicIcon, { size: 22 })}
            </div>
            <span className="text-gray-900 dark:text-white font-medium text-base">
                {title}
            </span>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
    </div>
);

// Helper function to manage Google Translate cookie (avoids React Compiler warnings)
const setGoogleTranslateCookie = (code, googleCode) => {
    const hostname = window.location.hostname;
    if (code === 'en') {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + hostname;
    } else if (googleCode) {
        document.cookie = `googtrans=${googleCode}; path=/;`;
        document.cookie = `googtrans=${googleCode}; path=/; domain=${hostname}`;
    }
};

const Assets = () => {
    const navigate = useNavigate();
    const { setIsChatOpen, user } = useApp();

    const balance = parseFloat(user?.balance || 0);
    const [verificationStatus, setVerificationStatus] = useState('unverified');

    const [currency, setCurrency] = useState('USD');
    const [rates, setRates] = useState({ BTC: 0, ETH: 0 });
    const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isExchangeOpen, setIsExchangeOpen] = useState(false);
    const [isPromotionOpen, setIsPromotionOpen] = useState(false);
    const [isBindAddressOpen, setIsBindAddressOpen] = useState(false);
    const [showBalance, setShowBalance] = useState(true);
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸', googleCode: '/en/en' },
        { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳', googleCode: '/en/zh-CN' },
        { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸', googleCode: '/en/es' },
        { code: 'fr', name: 'Français (French)', flag: '🇫🇷', googleCode: '/en/fr' },
        { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦', googleCode: '/en/ar' }
    ];

    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        return localStorage.getItem('aurelian_language') || 'en';
    });

    const handleLanguageSelect = (code) => {
        const langInfo = languages.find(l => l.code === code);
        setSelectedLanguage(code);
        localStorage.setItem('aurelian_language', code);
        setIsLanguageOpen(false);

        // Call outer helper function to manage cookies
        setGoogleTranslateCookie(code, langInfo?.googleCode);
        
        // Reload to let Google Translate parse the DOM
        window.location.reload();
    };

    // Fetch verification status
    useEffect(() => {
        const fetchStatus = async () => {
            if (user?.uid || user?.email) {
                const result = await getVerificationStatus(user.uid || user.email);
                if (result.success) {
                    setVerificationStatus(result.status);
                }
            }
        };
        fetchStatus();
    }, [user?.uid, user?.email]);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
                const data = await response.json();
                setRates({
                    BTC: data.bitcoin.usd,
                    ETH: data.ethereum.usd
                });
            } catch (error) {
                console.error("Error fetching rates:", error);
                setRates({ BTC: 65000, ETH: 3500 });
            }
        };
        fetchRates();
        const interval = setInterval(fetchRates, 60000);
        return () => clearInterval(interval);
    }, []);

    const usdtBalance = parseFloat(user?.balance || user?.points || 0);
    const btcBalance = parseFloat(user?.btcBalance || 0);
    const ethBalance = parseFloat(user?.ethBalance || 0);
    
    // Calculate total valuation in USD
    const totalUsdValuation = usdtBalance + (btcBalance * (rates.BTC || 0)) + (ethBalance * (rates.ETH || 0));

    const getDisplayBalance = () => {
        if (!showBalance) return '******';
        switch (currency) {
            case 'BTC':
                return rates.BTC ? (totalUsdValuation / rates.BTC).toFixed(6) + ' BTC' : '...';
            case 'ETH':
                return rates.ETH ? (totalUsdValuation / rates.ETH).toFixed(4) + ' ETH' : '...';
            case 'USDT':
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalUsdValuation).replace('$', '') + ' USDT';
            case 'USD':
            default:
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalUsdValuation);
        }
    };

    const currencies = ['USD', 'USDT', 'BTC', 'ETH'];

    return (
        <div className="min-h-screen container mx-auto px-4 pb-20 max-w-4xl">
            {/* Modals */}
            <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
            <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
            <ExchangeModal isOpen={isExchangeOpen} onClose={() => setIsExchangeOpen(false)} />
            <PromotionModal isOpen={isPromotionOpen} onClose={() => setIsPromotionOpen(false)} />
            <BindAddressModal isOpen={isBindAddressOpen} onClose={() => setIsBindAddressOpen(false)} />

            {/* Header */}
            <div className="pt-6 mb-4 flex justify-between items-center">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-gold-text tracking-tight">Assets</h1>
            </div>

            {/* User Info Header */}
            <div className="mb-6 flex justify-between items-center px-1">
                <div>
                    <div className="text-sm text-gray-500 font-medium mb-1">
                        {user?.email ? (user.email.length > 25 ? user.email.substring(0, 25) + '...' : user.email) : 'Join Aurelian Excellence'}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user ? `Hello, ${user.name || user.full_name?.split(' ')[0] || 'Trader'}` : 'Welcome Candidate'}
                    </div>
                </div>
                {user && (
                    <div
                        onClick={() => navigate('/security')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${verificationStatus === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                            verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                verificationStatus === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                    'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'
                            }`}
                    >
                        <Shield size={14} fill={verificationStatus === 'verified' ? 'currentColor' : 'none'} />
                        {verificationStatus === 'verified' ? 'VERIFIED' :
                            verificationStatus === 'pending' ? 'PENDING' :
                                verificationStatus === 'rejected' ? 'REJECTED' :
                                    'UNVERIFIED'}
                    </div>
                )}
            </div>

            {/* My Assets Card */}
            <div className="relative mb-6 group">
                {/* Background & Clipping Container */}
                <div className={`absolute inset-0 rounded-3xl overflow-hidden transition-all duration-300 ${
                    user?.isFrozen
                        ? 'bg-gradient-to-br from-blue-950 to-slate-900 shadow-lg border border-blue-500/30'
                        : user
                        ? 'bg-gradient-gold shadow-gold-lg'
                        : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 shadow-lg'
                    }`}>
                    {user && !user.isFrozen && (
                        /* Background Shine */
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    )}
                    {user?.isFrozen && (
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoLTZ2LTZoNnYtNmg2djZoNnY2aC02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                    )}
                </div>

                {/* Content Container (Allows Overflow) */}
                <div className={`relative rounded-3xl transition-colors duration-300 ${user?.isFrozen ? 'p-8 text-white' : user ? 'p-8 text-black' : 'p-6 text-gray-900 dark:text-white'}`}>
                    {user?.isFrozen ? (
                        /* ---- FROZEN ASSETS BANNER ---- */
                        <div className="relative z-10 flex flex-col items-center text-center py-2">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-4 animate-pulse">
                                <Lock size={28} className="text-blue-300" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Assets Frozen</h3>
                            <p className="text-blue-200 text-sm max-w-xs mb-6 leading-relaxed">
                                Your assets have been temporarily frozen by the platform. To restore access, please contact our customer service team for further assistance.
                            </p>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/30"
                            >
                                <PhoneCall size={16} />
                                Contact Customer Service
                            </button>

                            {/* Disabled action buttons */}
                            <div className="flex gap-2 mt-6 opacity-30 pointer-events-none">
                                <div className="flex-1 bg-white/10 border border-white/10 py-3 px-6 rounded-2xl flex flex-col items-center gap-1">
                                    <ArrowDownCircle size={20} />
                                    <span className="text-[10px] font-bold">Deposit</span>
                                </div>
                                <div className="flex-1 bg-white/10 border border-white/10 py-3 px-6 rounded-2xl flex flex-col items-center gap-1">
                                    <Wallet size={20} />
                                    <span className="text-[10px] font-bold">Withdraw</span>
                                </div>
                                <div className="flex-1 bg-white/10 border border-white/10 py-3 px-6 rounded-2xl flex flex-col items-center gap-1">
                                    <RefreshCcw size={20} />
                                    <span className="text-[10px] font-bold">Exchange</span>
                                </div>
                            </div>
                        </div>
                    ) : user ? (
                        <>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3 opacity-90">
                                    <span className="text-sm font-semibold tracking-tight">Total Assets Valuation</span>
                                    <div onClick={() => setShowBalance(!showBalance)} className="cursor-pointer p-1 hover:bg-black/5 rounded transition-colors">
                                        {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-2">
                                    <div className="text-4xl font-extrabold tracking-tight">
                                        {getDisplayBalance()}
                                    </div>

                                    {/* Currency Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                                        >
                                            {currency}
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform duration-200 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`}>
                                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>

                                        {isCurrencyDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-24 bg-white rounded-xl shadow-xl overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                                                {currencies.map(c => (
                                                    <div
                                                        key={c}
                                                        onClick={() => {
                                                            setCurrency(c);
                                                            setIsCurrencyDropdownOpen(false);
                                                        }}
                                                        className={`px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${currency === c ? 'bg-amber-50 text-amber-600' : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {c}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions Row */}
                                <div className="flex gap-2 lg:gap-4 mt-8">
                                    <button
                                        onClick={() => setIsDepositOpen(true)}
                                        className="flex-1 bg-black/10 hover:bg-black/20 backdrop-blur-md border border-black/5 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-[0.98]"
                                    >
                                        <ArrowDownCircle size={20} className="mb-0.5" />
                                        <span className="text-[10px] font-bold tracking-tight">Deposit</span>
                                    </button>
                                    <button
                                        onClick={() => setIsWithdrawOpen(true)}
                                        className="flex-1 bg-black/10 hover:bg-black/20 backdrop-blur-md border border-black/5 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-[0.98]"
                                        disabled={balance <= 0}
                                    >
                                        <Wallet size={20} className="mb-0.5" />
                                        <span className="text-[10px] font-bold tracking-tight">Withdraw</span>
                                    </button>
                                    <button
                                        onClick={() => setIsExchangeOpen(true)}
                                        className="flex-1 bg-black/10 hover:bg-black/20 backdrop-blur-md border border-black/5 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-[0.98]"
                                    >
                                        <RefreshCcw size={20} className="mb-0.5" />
                                        <span className="text-[10px] font-bold tracking-tight">Exchange</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-1 relative z-10">
                            <div className="text-lg font-bold mb-2">Institutional Portfolio Access</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm mx-auto">Log in to access your secure trading environment and portfolio management tools.</p>
                            <div className="flex gap-3 justify-center max-w-xs mx-auto">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark text-black font-bold rounded-xl transition-colors shadow-lg shadow-primary/20 text-sm"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="flex-1 py-2.5 px-4 bg-transparent border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors text-sm"
                                >
                                    Register
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* My Wallet / Portfolio */}
            {user && (
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                    <div className="text-xs font-bold text-gray-400 mb-4 ml-2 uppercase tracking-widest">My Wallet</div>
                    <div className="space-y-3">
                        {/* USDT */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 dark:border-white/5 transition-transform active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-xl border border-green-500/20">
                                    ₮
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-lg">USDT</div>
                                    <div className="text-xs text-gray-400 font-medium">Tether</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-900 dark:text-white font-mono text-lg">{showBalance ? usdtBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '******'}</div>
                                <div className="text-xs text-gray-400 font-mono mt-0.5">{showBalance ? `$${usdtBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '******'}</div>
                            </div>
                        </div>

                        {/* BTC */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 dark:border-white/5 transition-transform active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-xl border border-orange-500/20">
                                    ₿
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-lg">BTC</div>
                                    <div className="text-xs text-gray-400 font-medium">Bitcoin</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-900 dark:text-white font-mono text-lg">{showBalance ? btcBalance : '******'}</div>
                                <div className="text-xs text-gray-400 font-mono mt-0.5">{showBalance ? `$${(btcBalance * (rates.BTC || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '******'}</div>
                            </div>
                        </div>

                        {/* ETH */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 dark:border-white/5 transition-transform active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xl border border-blue-500/20">
                                    Ξ
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-lg">ETH</div>
                                    <div className="text-xs text-gray-400 font-medium">Ethereum</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-900 dark:text-white font-mono text-lg">{showBalance ? ethBalance : '******'}</div>
                                <div className="text-xs text-gray-400 font-mono mt-0.5">{showBalance ? `$${(ethBalance * (rates.ETH || 0)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '******'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Portfolio Management */}
            <div className="mb-8">
                <div className="text-xs font-bold text-gray-400 mb-4 ml-2">Portfolio Management</div>
                <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <MenuItem
                        icon={ArrowDownCircle}
                        title="Inbound Transfer (Deposit)"
                        onClick={() => setIsDepositOpen(true)}
                    />
                    <MenuItem
                        icon={Wallet}
                        title="Outbound Transfer (Withdraw)"
                        onClick={() => setIsWithdrawOpen(true)}
                    />
                    <MenuItem
                        icon={RefreshCcw}
                        title="Asset Exchange"
                        onClick={() => setIsExchangeOpen(true)}
                    />
                    <MenuItem
                        icon={Gift}
                        title="Institutional Referral"
                        onClick={() => setIsPromotionOpen(true)}
                    />
                    <MenuItem
                        icon={Shield}
                        title="Account Security"
                        onClick={() => navigate('/security')}
                    />
                    <MenuItem
                        icon={CreditCard}
                        title="Payment Endpoint Configuration"
                        onClick={() => setIsBindAddressOpen(true)}
                        isLast={true}
                    />
                </div>
            </div>

            {/* Support */}
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-2">Support & Access</div>
                <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <MenuItem
                        icon={Headphones}
                        title="24/7 Priority Concierge"
                        onClick={() => setIsChatOpen(true)}
                    />
                    <div
                        onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                        className={`p-5 flex justify-between items-center cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 border-t border-gray-100 dark:border-white/5`}
                    >
                        <div className="flex items-center">
                            <div className="w-1 h-6 bg-gradient-gold rounded mr-4 shadow-gold-sm"></div>
                            <div className="mr-3 text-primary-dark dark:text-primary">
                                <Globe size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-900 dark:text-white font-medium text-base">Language</span>
                                <span className="text-xs text-gray-400">
                                    {languages.find(l => l.code === selectedLanguage)?.flag}{' '}
                                    {languages.find(l => l.code === selectedLanguage)?.name}
                                </span>
                            </div>
                        </div>
                        <ChevronRight size={18} className={`text-gray-400 transition-transform duration-200 ${isLanguageOpen ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Language Dropdown */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isLanguageOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
                            {languages.map((lang, idx) => (
                                <div
                                    key={lang.code}
                                    onClick={() => handleLanguageSelect(lang.code)}
                                    className={`flex items-center justify-between px-6 py-3.5 cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/5 ${idx !== languages.length - 1 ? 'border-b border-gray-100 dark:border-white/[0.04]' : ''} ${selectedLanguage === lang.code ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl" role="img" aria-label={lang.name}>{lang.flag}</span>
                                        <span className={`font-medium text-sm ${selectedLanguage === lang.code ? 'text-primary font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {lang.name}
                                        </span>
                                    </div>
                                    {selectedLanguage === lang.code && (
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <Check size={12} className="text-black" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Check Updates / Download App */}
            <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center">
                    <div className="w-1 h-6 bg-gradient-gold rounded mr-4 shadow-gold-sm"></div>
                    <div className="mr-3 text-primary-dark dark:text-primary">
                        <Download size={22} />
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">Download app</span>
                </div>

                <div className="flex gap-4">
                    <a
                        href="https://apps.apple.com/us/app/crypto-com-onchain-wallet/id1527870020"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transform transition-transform hover:scale-105 active:scale-95"
                    >
                        <div className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
                            <svg viewBox="0 0 384 512" width="20" height="20" fill="currentColor">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                            </svg>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] opacity-80 font-medium">Download on the</span>
                                <span className="text-sm font-bold">App Store</span>
                            </div>
                        </div>
                    </a>

                    <a
                        href="https://play.google.com/store/apps/details?id=com.defi.wallet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transform transition-transform hover:scale-105 active:scale-95"
                    >
                        <div className="bg-[#01875f] text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
                            <svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
                                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                            </svg>
                            <div className="flex flex-col leading-none">
                                <span className="text-[10px] opacity-80 font-medium">GET IT ON</span>
                                <span className="text-sm font-bold">Google Play</span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Assets;
