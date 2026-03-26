import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tradingDashboard from '../assets/trading-dashboard.jpg';
import { assets, getIconUrl } from '../data/assets';

import { subscribeToTicker } from '../services/binance';

const Home = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('crypto');
    const [marketAssets, setMarketAssets] = useState(assets);

    // Sequential Typewriter animation
    const content = {
        title1: 'Experience Premium',
        title2: 'Institutional Trading',
        desc: "Access deep liquidity, superior execution, and bank-grade security on the world's most sophisticated crypto trading platform."
    };

    const [typed, setTyped] = useState({ t1: '', t2: '', d: '' });
    const [activeCursor, setActiveCursor] = useState('t1'); // 't1', 't2', 'd', or null

    useEffect(() => {
        let isCancelled = false;

        const runSequence = async () => {
            if (isCancelled) return;

            // Reset
            setTyped({ t1: '', t2: '', d: '' });
            setActiveCursor('t1');

            // Type T1
            for (let i = 0; i <= content.title1.length; i++) {
                if (isCancelled) return;
                setTyped(prev => ({ ...prev, t1: content.title1.slice(0, i) }));
                await new Promise(r => setTimeout(r, 40));
            }
            setActiveCursor('t2');

            // Type T2
            for (let i = 0; i <= content.title2.length; i++) {
                if (isCancelled) return;
                setTyped(prev => ({ ...prev, t2: content.title2.slice(0, i) }));
                await new Promise(r => setTimeout(r, 60));
            }
            setActiveCursor('d');

            // Type Desc
            for (let i = 0; i <= content.desc.length; i++) {
                if (isCancelled) return;
                setTyped(prev => ({ ...prev, d: content.desc.slice(0, i) }));
                await new Promise(r => setTimeout(r, 15));
            }
            
            // Blink cursor for 2 seconds then hide
            await new Promise(r => setTimeout(r, 2000));
            if (!isCancelled) setActiveCursor(null);
        };

        runSequence();
        const mainInterval = setInterval(runSequence, 10000); // Repeat every 10 seconds

        return () => {
            isCancelled = true;
            clearInterval(mainInterval);
        };
    }, [content.desc, content.title1, content.title2]);

    // Fetch initial accurate prices from Binance REST API
    useEffect(() => {
        const fetchInitialPrices = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
                const data = await res.json();
                const priceMap = {};
                data.forEach(t => {
                    priceMap[t.symbol] = {
                        price: parseFloat(t.lastPrice),
                        change: parseFloat(t.priceChangePercent)
                    };
                });
                setMarketAssets(prev => prev.map(asset => {
                    const ticker = priceMap[asset.symbol];
                    if (ticker) {
                        return {
                            ...asset,
                            price: ticker.price.toFixed(asset.symbol.includes('SHIB') ? 8 : (ticker.price < 1 ? 6 : 2)),
                            change: `${ticker.change >= 0 ? '+' : ''}${ticker.change.toFixed(2)}%`
                        };
                    }
                    return asset;
                }));
            } catch {
                // Silently fail - WebSocket will update prices
            }
        };
        fetchInitialPrices();
    }, []);

    useEffect(() => {
        const symbolsToSubscribe = assets
            .filter(a => a.type === 'crypto' || a.type === 'spot')
            .map(a => a.symbol);

        const unsubscribe = subscribeToTicker(symbolsToSubscribe, (data) => {
            const updateAsset = (ticker) => {
                setMarketAssets(prev => prev.map(asset => {
                    if (asset.symbol === ticker.s) {
                        const newPrice = parseFloat(ticker.c);
                        return {
                            ...asset,
                            price: newPrice.toFixed(asset.symbol.includes('SHIB') ? 8 : (asset.price < 1 ? 6 : 2)),
                            change: `${parseFloat(ticker.P).toFixed(2)}%`,
                        };
                    }
                    return asset;
                }));
            };

            if (Array.isArray(data)) data.forEach(updateAsset);
            else updateAsset(data);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full flex flex-col font-sans antialiased bg-gray-50 dark:bg-background-dark text-gray-700 dark:text-gray-300 pb-20 lg:pb-0 transition-colors duration-500">

            {/* Hero Section */}
            <div className="relative pt-12 lg:pt-32 pb-8 lg:pb-20 min-h-[85vh] lg:min-h-screen flex flex-col justify-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gray-50 dark:bg-background-dark"></div>
                    <div className="absolute inset-0 bg-gradient-mesh opacity-20 dark:opacity-40"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20 mix-blend-overlay"></div>

                    {/* Glowing Orbs - Softened for Light Mode */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] opacity-50 dark:opacity-100 animate-pulse-slow"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 fade-up visible">
                        {/* Left Column: Original Text Content */}
                        <div className="relative z-10 text-left mt-0 lg:mt-0 min-h-[220px] sm:min-h-[320px] lg:min-h-[480px]">
                            <div className="flex justify-center lg:justify-start w-full mb-4 lg:mb-8">
                                <div className="inline-flex items-center px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full border border-[#D4AF37]/30 dark:border-primary/20 bg-[#D4AF37]/5 dark:bg-primary/10 backdrop-blur-md text-[#B8860B] dark:text-primary text-[7px] sm:text-[9px] font-bold tracking-tight shadow-sm dark:shadow-glow">
                                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#D4AF37] dark:bg-primary mr-1.5 sm:mr-2 animate-pulse"></span>
                                    Institutional Grade Platform
                                </div>
                            </div>
                            <h1 className="text-[2rem] leading-tight sm:text-5xl lg:text-7xl xl:text-8xl font-display font-bold text-gray-900 dark:text-white mb-3 lg:mb-6 lg:leading-[0.95] tracking-tight">
                                {typed.t1}
                                {activeCursor === 't1' && <span className="inline-block w-[2px] lg:w-[4px] h-[1.8rem] sm:h-[2.8rem] lg:h-[4rem] bg-gray-900 dark:bg-white ml-1 animate-pulse align-middle rounded-sm"></span>}
                                <br />
                                <span className="text-[#D4AF37] drop-shadow-sm dark:drop-shadow-2xl">
                                    {typed.t2}
                                    {activeCursor === 't2' && <span className="inline-block w-[2px] lg:w-[4px] h-[1.8rem] sm:h-[2.8rem] lg:h-[4rem] bg-[#D4AF37] ml-1 animate-pulse align-middle rounded-sm"></span>}
                                </span>
                            </h1>
                            <div className="relative mb-6 lg:mb-10">
                                <p className="text-gray-500 dark:text-text-muted max-w-2xl text-sm lg:text-lg font-light leading-relaxed mx-0 min-h-[3em]">
                                    {typed.d}
                                    {activeCursor === 'd' && <span className="inline-block w-[2px] lg:w-[3px] h-[1rem] lg:h-[1.4rem] bg-primary ml-1 animate-pulse align-middle rounded-sm"></span>}
                                </p>
                            </div>

                            {/* Desktop-only buttons */}
                            <div className="hidden lg:flex flex-col sm:flex-row items-start justify-start gap-3 lg:gap-6">
                                <div className="btn-racing-wrapper group w-full sm:w-auto">
                                    <div className="candle-racing-border"></div>
                                    <button onClick={() => navigate('/register')} className="btn-gold relative z-10 px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-xl shadow-glow-strong w-full sm:w-auto">
                                        <span className="relative flex items-center justify-center gap-3">
                                            START TRADING
                                            <span className="material-symbols-outlined transition-transform">trending_up</span>
                                        </span>
                                    </button>
                                </div>
                                <button onClick={() => navigate('/market')} className="px-6 sm:px-10 py-3 sm:py-4 rounded-lg border border-border-subtle hover:border-primary/50 hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-white font-display font-bold text-sm sm:text-base tracking-wider transition-all duration-300 w-full sm:w-auto">
                                    VIEW MARKETS
                                </button>
                            </div>
                        </div>

                        {/* Right Column: 3D Visualization Asset */}
                        <div className="relative z-10 h-[380px] sm:h-[600px] lg:h-[750px] flex items-center justify-center translate-x-4 sm:translate-x-0 lg:translate-x-6 -mt-48 sm:-mt-64 lg:mt-0 lg:opacity-100">

                            {/* Background Radial Glow - subtle institutional look */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none"></div>

                            {/* Orbital Lines - High-Fidelity Golden Radiant Tracks */}
                            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                                <svg viewBox="0 0 1000 1000" className="w-[140%] sm:w-[180%] lg:w-[165%] h-auto">
                                    <defs>
                                        <linearGradient id="orbit-gold-radiant" x1="0%" y1="50%" x2="100%" y2="50%">
                                            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
                                            <stop offset="15%" stopColor="#D4AF37" stopOpacity="0.8" />
                                            <stop offset="50%" stopColor="#FFF878" stopOpacity="1" />
                                            <stop offset="85%" stopColor="#D4AF37" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Backend Paths (passing BEHIND left side of phone) */}
                                    <ellipse cx="500" cy="500" rx="490" ry="175" fill="none" stroke="url(#orbit-gold-radiant)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(6, 500, 500)" strokeDasharray="1000" strokeDashoffset="500" opacity="0.6" />
                                    <ellipse cx="500" cy="500" rx="395" ry="140" fill="none" stroke="url(#orbit-gold-radiant)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(6, 500, 500)" strokeDasharray="800" strokeDashoffset="400" opacity="0.8" />
                                    <ellipse cx="500" cy="500" rx="300" ry="105" fill="none" stroke="url(#orbit-gold-radiant)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(6, 500, 500)" strokeDasharray="600" strokeDashoffset="300" opacity="0.9" />
                                </svg>
                            </div>

                            {/* Smartphone Mockup V2 - Titanium/Gold -> Orange iPhone 17 Pro Max */}
                            <div className="relative w-[190px] sm:w-[280px] lg:w-[310px] h-[390px] sm:h-[580px] lg:h-[630px] z-20 transition-transform duration-1000 transform hover:scale-[1.02] drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
                                
                                {/* Hardware Buttons (Volume & Power) */}
                                <div className="absolute left-[-4px] top-[100px] w-[4px] h-[25px] bg-gradient-to-b from-[#FF9D5C] to-[#A03000] rounded-l-md opacity-80 shadow-[inset_1px_0_2px_rgba(255,255,255,0.4)]"></div>
                                <div className="absolute left-[-4px] top-[140px] w-[4px] h-[40px] bg-gradient-to-b from-[#FF9D5C] to-[#A03000] rounded-l-md opacity-80 shadow-[inset_1px_0_2px_rgba(255,255,255,0.4)]"></div>
                                <div className="absolute left-[-4px] top-[190px] w-[4px] h-[40px] bg-gradient-to-b from-[#FF9D5C] to-[#A03000] rounded-l-md opacity-80 shadow-[inset_1px_0_2px_rgba(255,255,255,0.4)]"></div>
                                <div className="absolute right-[-4px] top-[150px] w-[4px] h-[55px] bg-gradient-to-b from-[#FF9D5C] to-[#A03000] rounded-r-md opacity-80 shadow-[inset_-1px_0_2px_rgba(255,255,255,0.4)]"></div>

                                {/* Metallic Outer Frame */}
                                <div className="absolute inset-0 rounded-[2.6rem] sm:rounded-[3.5rem] p-[1.5px] sm:p-[2.5px] bg-gradient-to-br from-[#FFD3B6] via-[#E25822] to-[#6B2400] shadow-[inset_0_0_10px_rgba(255,255,255,0.5)]">
                                    {/* Black Bezel & Screen Container */}
                                    <div className="absolute inset-[1.5px] sm:inset-[2.5px] rounded-[2.5rem] sm:rounded-[3.35rem] bg-black p-[5px] sm:p-[8px] overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                                        
                                        {/* Screen Background */}
                                        <div className="relative w-full h-full rounded-[2.1rem] sm:rounded-[2.9rem] bg-[#FAFAFA] dark:bg-[#0B0E14] overflow-hidden flex flex-col transition-colors duration-500 shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
                                            
                                            {/* Dynamic Island */}
                                            <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-[70px] sm:w-[95px] h-[20px] sm:h-[28px] bg-black rounded-full z-50 flex items-center justify-between px-2 sm:px-3 shadow-md">
                                                <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-[#1A1A1A] border-[0.5px] border-white/10 flex items-center justify-center">
                                                    <div className="w-[3px] h-[3px] rounded-full bg-[#0F0F0F] blur-[0.3px]"></div>
                                                </div>
                                                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500/80 shadow-[0_0_4px_rgba(59,130,246,0.8)]"></div>
                                            </div>

                                            {/* Content Padding Wrapper */}
                                            <div className="flex flex-col h-full pt-10 sm:pt-14 pb-5 sm:pb-8 px-4 sm:px-6">
                                                {/* App Header */}
                                                <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-[6px] sm:rounded-lg bg-gradient-to-br from-[#FDE08B] to-[#D4AF37] flex items-center justify-center shadow-md">
                                                        <span className="material-symbols-outlined text-white text-[14px] sm:text-[18px]">diamond</span>
                                                    </div>
                                                    <span className="text-[11px] sm:text-[15px] font-bold text-[#8B6508] dark:text-[#D4AF37] tracking-[0.15em] uppercase font-display drop-shadow-sm">Aurelian</span>
                                                    <div className="flex items-center gap-1.5 ml-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_#22c55e] animate-pulse"></span>
                                                        <span className="text-green-700 dark:text-green-400 text-[8px] sm:text-[10px] font-bold tracking-wider">LIVE</span>
                                                    </div>
                                                </div>

                                                {/* Price UI */}
                                                <div className="px-1 mb-4 sm:mb-8">
                                                    <div className="text-gray-500 dark:text-gray-400 text-[9px] sm:text-[12px] tracking-[0.12em] mb-1 font-bold uppercase">XAU/USD SPOT</div>
                                                    <div className="text-gray-900 dark:text-white text-4xl sm:text-[3.5rem] leading-none font-display font-extrabold tracking-tight mb-2 sm:mb-3 transition-colors duration-500">$4,491.16</div>
                                                    <div className="text-red-500 text-[11px] sm:text-[15px] font-bold flex items-center gap-0.5">
                                                        <span className="material-symbols-outlined text-[16px] sm:text-[20px] -ml-1">arrow_drop_down</span>
                                                        -1.04% <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">24h</span>
                                                    </div>
                                                </div>

                                                {/* Area Chart UI */}
                                                <div className="flex-1 w-full bg-white dark:bg-[#0E1118] rounded-[1.2rem] sm:rounded-2xl border border-gray-100 dark:border-white/5 p-3 sm:p-5 flex flex-col relative overflow-hidden shadow-sm transition-colors duration-500">
                                                    
                                                    {/* Chart SVG */}
                                                    <div className="absolute inset-0 pt-8 pb-10 sm:pb-12 px-0 flex items-end">
                                                        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                                                            <defs>
                                                                <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
                                                                    <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.8" />
                                                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.9" />
                                                                </linearGradient>
                                                                <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                                                                    <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.15" />
                                                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                                                </linearGradient>
                                                            </defs>
                                                            {/* Area Fill */}
                                                            <path d="M0,50 L0,30 Q5,40 10,25 T20,15 T30,35 T40,25 T50,40 T60,25 T70,35 T80,25 T90,30 T100,20 L100,50 Z" fill="url(#area-gradient)" />
                                                            {/* Line Curve */}
                                                            <path d="M0,30 Q5,40 10,25 T20,15 T30,35 T40,25 T50,40 T60,25 T70,35 T80,25 T90,30 T100,20" fill="none" stroke="url(#chart-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                    
                                                    <div className="flex-1"></div>
                                                    
                                                    {/* X Axis Labels */}
                                                    <div className="flex justify-between items-end relative z-10 w-full text-[8.5px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                                                        <span>12:00</span>
                                                        <span>19:30</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Orbiting Assets — orbit around phone like planets around the sun */}
                            {/* Each uses a wrapper for centering + inner div for animation to avoid transform conflicts */}
                            
                            {/* Bitcoin */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
                                <div className="animate-orbit-bitcoin" style={{ willChange: 'transform, opacity' }}>
                                    <img src="/stitch_bitcoin.png" alt="Bitcoin" className="w-[100px] sm:w-[140px] lg:w-[200px] h-auto drop-shadow-2xl" />
                                </div>
                            </div>

                            {/* Euro */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
                                <div className="animate-orbit-euro" style={{ willChange: 'transform, opacity' }}>
                                    <img src="/stitch_euro.png" alt="Euro" className="w-[50px] sm:w-[70px] lg:w-[100px] h-auto drop-shadow-2xl" />
                                </div>
                            </div>

                            {/* Yen */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
                                <div className="animate-orbit-yen" style={{ willChange: 'transform, opacity' }}>
                                    <img src="/stitch_yen.png" alt="Yen" className="w-[45px] sm:w-[60px] lg:w-[85px] h-auto drop-shadow-lg" />
                                </div>
                            </div>

                            {/* Gold Bar */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
                                <div className="animate-orbit-goldbar" style={{ willChange: 'transform, opacity' }}>
                                    <div className="relative">
                                        <img
                                            src="/stitch_goldbar.png"
                                            alt="Gold Bar"
                                            className="w-[130px] sm:w-[180px] lg:w-[260px] h-auto drop-shadow-2xl"
                                        />
                                        {/* Badge */}
                                        <div className="absolute right-[-10px] bottom-[15%] flex flex-col items-center justify-center">
                                            <div className="bg-gradient-to-br from-[#B8860B] to-[#DAA520] px-2 py-1.5 lg:px-4 lg:py-2 rounded-[1.2rem] shadow-[0_10px_30px_rgba(184,134,11,0.5)] border border-white/30 backdrop-blur-sm">
                                                <div className="text-white text-[7px] lg:text-[9px] font-bold tracking-widest uppercase opacity-70 mb-0.5">GOLD Bar</div>
                                                <div className="text-white text-[9px] lg:text-[12px] font-black tracking-widest uppercase">999.9 FINE</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Foreground Orbits (passing IN FRONT of right side of phone) */}
                            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
                                <svg viewBox="0 0 1000 1000" className="w-[140%] sm:w-[180%] lg:w-[165%] h-auto">
                                    <ellipse cx="500" cy="500" rx="490" ry="175" fill="none" stroke="url(#orbit-gold-radiant)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(6, 500, 500)" strokeDasharray="1000" strokeDashoffset="0" opacity="0.8" />
                                    <ellipse cx="500" cy="500" rx="395" ry="140" fill="none" stroke="url(#orbit-gold-radiant)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(6, 500, 500)" strokeDasharray="800" strokeDashoffset="0" opacity="0.9" />
                                    <ellipse cx="500" cy="500" rx="300" ry="105" fill="none" stroke="url(#orbit-gold-radiant)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(6, 500, 500)" strokeDasharray="600" strokeDashoffset="0" opacity="1.0" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Mobile-only: START TRADING button below the phone */}
                    <div className="lg:hidden flex flex-col items-center gap-3 mt-2 mb-8 px-4 fade-up visible">
                        <div className="btn-racing-wrapper w-full">
                            <div className="candle-racing-border"></div>
                            <button onClick={() => navigate('/register')} className="btn-gold relative z-10 px-6 py-3 text-sm shadow-glow-strong w-full">
                                <span className="relative flex items-center justify-center gap-3">
                                    START TRADING
                                    <span className="material-symbols-outlined transition-transform">trending_up</span>
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid - Moved inside max-w-7xl below the hero grid */}
                    <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-16 fade-up visible">
                        {[
                            { val: '$1.23B+', label: '24h Volume' },
                            { val: '350+', label: 'Assets Listed' },
                            { val: '1k+', label: 'Partners' },
                            { val: '0.01%', label: 'Maker Fees' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-panel p-5 rounded-xl flex flex-col items-center justify-center hover:border-primary/40 transition-all group hover:-translate-y-1">
                                <span className="text-3xl font-display font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors drop-shadow-sm">{stat.val}</span>
                                <span className="text-[10px] text-text-muted mt-1 font-bold">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-12 auto-rows-min gap-3 lg:gap-6 fade-up visible">
                        {/* Verify Identity */}
                        <div onClick={() => navigate('/security')} className="col-span-1 lg:col-span-3 lg:row-span-1 group relative overflow-hidden p-4 lg:p-6 glass-panel rounded-2xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-center min-h-[100px] cursor-pointer">
                            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-6xl lg:text-8xl text-primary">verified_user</span>
                            </div>
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 lg:mb-3 group-hover:bg-primary group-hover:text-black transition-colors text-primary border border-primary/20">
                                <span className="material-symbols-outlined text-lg lg:text-xl">verified_user</span>
                            </div>
                            <span className="font-display font-bold text-gray-900 dark:text-white text-sm lg:text-xl group-hover:text-primary transition-colors">Verify Identity</span>
                            <span className="text-[10px] lg:text-xs text-text-muted mt-1 font-medium">Unlock institutional limits</span>
                        </div>

                        {/* Global Resources */}
                        <div onClick={() => navigate('/market')} className="col-span-1 lg:col-span-3 lg:col-start-1 lg:row-start-2 group relative overflow-hidden p-4 lg:p-6 glass-panel rounded-2xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-center min-h-[100px] cursor-pointer">
                            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-6xl lg:text-8xl text-primary">public</span>
                            </div>
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 lg:mb-3 group-hover:bg-primary group-hover:text-black transition-colors text-primary border border-primary/20">
                                <span className="material-symbols-outlined text-lg lg:text-xl">public</span>
                            </div>
                            <span className="font-display font-bold text-gray-900 dark:text-white text-sm lg:text-xl group-hover:text-primary transition-colors">Global Resources</span>
                            <span className="text-[10px] lg:text-xs text-text-muted mt-1 font-medium">Access worldwide markets</span>
                        </div>

                        {/* Top Traders */}
                        <div onClick={() => navigate('/leaderboard')} className="col-span-1 lg:col-span-3 lg:col-start-1 lg:row-start-3 group relative overflow-hidden p-4 lg:p-6 glass-panel rounded-2xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-center min-h-[100px] cursor-pointer">
                            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-6xl lg:text-8xl text-primary">workspace_premium</span>
                            </div>
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 lg:mb-3 group-hover:bg-primary group-hover:text-black transition-colors text-primary border border-primary/20">
                                <span className="material-symbols-outlined text-lg lg:text-xl">workspace_premium</span>
                            </div>
                            <span className="font-display font-bold text-gray-900 dark:text-white text-sm lg:text-xl group-hover:text-primary transition-colors">Top Traders</span>
                            <span className="text-[10px] lg:text-xs text-text-muted mt-1 font-medium">View global leaderboard</span>
                        </div>

                        {/* Market Cap */}
                        <div className="col-span-1 lg:col-span-6 lg:col-start-4 lg:row-start-1 lg:row-span-3 glass-panel p-4 lg:p-6 rounded-2xl relative overflow-hidden group hover:bg-surface-light/40 transition-colors duration-500 flex flex-col justify-between">
                            <div className="flex flex-col sm:flex-row justify-between items-start lg:items-center gap-2 mb-4 z-10">
                                <div>
                                    <h3 className="font-bold text-text-muted text-[10px] mb-1">Total Market Cap</h3>
                                    <span className="text-gray-900 dark:text-white font-display font-bold text-xl lg:text-3xl tracking-tight drop-shadow-sm">$3.17T</span>
                                </div>
                                <span className="text-success text-[10px] lg:text-xs font-bold bg-success/10 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded border border-success/20 flex items-center gap-1 shadow-glow-success self-start">
                                    <span className="material-symbols-outlined text-[10px] lg:text-sm">trending_up</span> +6.94%
                                </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-20 lg:h-32 opacity-60 group-hover:opacity-100 transition-opacity z-0">
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 0.3 }}></stop>
                                            <stop offset="100%" style={{ stopColor: '#D4AF37', stopOpacity: 0 }}></stop>
                                        </linearGradient>
                                    </defs>
                                    <path d="M0 40 L0 20 Q 20 35, 40 15 T 80 10 L 100 5 L 100 40 Z" fill="url(#grad1)" stroke="none"></path>
                                    <path className="chart-path" d="M0 20 Q 20 35, 40 15 T 80 10 L 100 5" fill="none" stroke="#D4AF37" strokeWidth="1.5"></path>
                                </svg>
                            </div>
                        </div>

                        {/* Fear & Greed */}
                        <div className="col-span-2 lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:row-span-3 glass-panel p-4 lg:p-6 rounded-2xl flex flex-col items-center justify-center group hover:bg-surface-light/40">
                            <div className="w-full flex justify-between items-center mb-2">
                                <h3 className="font-bold text-text-muted text-[10px]">Fear & Greed</h3>
                                <span className="material-symbols-outlined text-text-subtle text-sm">info</span>
                            </div>
                            <div className="w-28 lg:w-full max-w-[160px] aspect-[2/1] relative">
                                <svg viewBox="0 0 120 65" className="w-full h-full">
                                    <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#1A202E" strokeWidth="10" strokeLinecap="round" />
                                    <path d="M 10 60 A 50 50 0 0 1 60 10" fill="none" stroke="#F92C2C" strokeWidth="10" strokeLinecap="round" />
                                    <path d="M 60 10 A 50 50 0 0 1 110 60" fill="none" stroke="#00D26A" strokeWidth="10" strokeLinecap="round" />
                                    <line x1="60" y1="58" x2="28" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    <circle cx="60" cy="58" r="3" fill="white" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white font-display">24</div>
                                <div className="text-[10px] text-danger font-bold bg-danger/10 px-2 py-0.5 rounded mt-1">Extreme Fear</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Market Overview Section */}
            <section className="py-24 bg-background-base/50 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">Market Overview</h2>
                            <p className="text-text-muted text-sm">Real-time prices from the world's leading digital exchanges</p>
                        </div>
                        <div className="flex space-x-1 bg-surface-dark p-1 rounded-lg border border-border-subtle overflow-x-auto w-full md:w-auto max-w-full hide-scrollbar">
                            {['crypto', 'forex', 'indices', 'commodities'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 sm:px-5 py-2 rounded-md text-[10px] sm:text-xs font-bold transition-all ${activeTab === tab
                                        ? 'bg-gradient-gold text-black font-bold shadow-glow'
                                        : 'text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-dark/40 backdrop-blur-sm min-h-[400px] relative glass-panel w-full hide-scrollbar">
                        {activeTab === 'crypto' ? (
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="text-text-muted text-[10px] border-b border-white/5 bg-surface-light/30">
                                        <th className="py-4 pl-4 md:pl-8 font-semibold">Asset</th>
                                        <th className="py-4 font-semibold">Price</th>
                                        <th className="py-4 font-semibold">24h Change</th>
                                        <th className="py-4 font-semibold hidden md:table-cell">Market Cap</th>
                                        <th className="py-4 font-semibold hidden lg:table-cell">Volume (24h)</th>
                                        <th className="py-4 font-semibold text-right pr-4 md:pr-8 hidden sm:table-cell">Trend (7d)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-text-muted font-medium text-sm">
                                    {marketAssets.filter(a => a.type === 'crypto').map((asset) => (
                                        <tr key={asset.symbol} className="hover:bg-white/5 transition-colors border-b border-white/5 group cursor-pointer" onClick={() => navigate('/market')}>
                                            <td className="py-4 pl-4 md:pl-8 border-none">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <img alt={asset.sub} className="w-7 h-7 md:w-8 md:h-8 rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all" src={getIconUrl(asset.symbol)} onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/6001/6001368.png' }} />
                                                    <div>
                                                        <span className="font-bold text-gray-900 dark:text-white block group-hover:text-primary transition-colors">{asset.sub}</span>
                                                        <span className="text-text-muted text-[10px] tracking-wide">{asset.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 font-display font-bold text-gray-900 dark:text-white">${asset.price}</td>
                                            <td className="py-4"><span className={`${asset.change.startsWith('-') ? 'text-danger' : 'text-success'} flex items-center gap-1 text-xs font-bold shadow-glow-${asset.change.startsWith('-') ? 'danger' : 'success'}/20`}><span className="material-symbols-outlined text-sm">{asset.change.startsWith('-') ? 'arrow_drop_down' : 'arrow_drop_up'}</span> {asset.change.replace(/[+-]/, '')}</span></td>
                                            <td className="py-4 hidden md:table-cell text-text-muted font-display text-xs">{asset.cap}</td>
                                            <td className="py-4 hidden lg:table-cell text-text-muted font-display text-xs">-</td>
                                            <td className="py-4 text-right pr-4 md:pr-8 hidden sm:table-cell border-none">
                                                <svg className={`w-20 h-8 inline-block ${asset.change.startsWith('-') ? 'text-danger' : 'text-success'} opacity-80`} fill="none" stroke="currentColor" viewBox="0 0 100 40"><path d={asset.change.startsWith('-') ? "M0 10 L 20 25 L 40 10 L 60 10 L 100 10" : "M0 25 L 30 25 L 50 35 L 70 15 L 100 5"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path></svg>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 animate-fade-in-up">
                                <div className="w-20 h-20 rounded-full bg-gradient-gold p-[1px] mb-6 shadow-glow">
                                    <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center text-primary relative overflow-hidden">
                                        <span className="material-symbols-outlined text-4xl">lock_clock</span>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 w-[200%] h-full -translate-x-[150%] skew-x-[-20deg] animate-[shine_2s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">Institutional Access Only</h3>
                                <p className="text-text-muted max-w-sm mx-auto mb-8 leading-relaxed">
                                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} markets are currently in closed beta testing for institutional partners.
                                </p>
                                <button className="px-8 py-3 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all duration-300">
                                    Notify When Live
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Advanced Trading Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                Advanced Trading <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-gray-900 dark:via-white to-primary">Made Accessible</span>
                            </h2>
                            <p className="text-lg text-text-muted mb-8 leading-relaxed">
                                Experience a trading interface designed for professionals but accessible to everyone. Smart order routing, deep liquidity, and instant execution.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-surface-dark border border-border-subtle flex items-center justify-center text-primary shadow-glow shrink-0">
                                        <span className="material-symbols-outlined">bolt</span>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-900 dark:text-white font-bold mb-1">Lightning Fast</h4>
                                        <p className="text-text-subtle text-xs">Microsecond latency execution</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-surface-dark border border-border-subtle flex items-center justify-center text-primary shadow-glow shrink-0">
                                        <span className="material-symbols-outlined">security</span>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-900 dark:text-white font-bold mb-1">Bank-Grade</h4>
                                        <p className="text-text-subtle text-xs">SOC2 Type II Certified</p>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-gold px-8 py-4 shadow-glow text-sm group" onClick={() => navigate('/market')}>
                                Explore Features <span className="material-symbols-outlined align-middle ml-1 text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-gold opacity-20 blur-[100px] rounded-full"></div>
                            <img alt="Trading Interface 3D" className="relative z-10 w-full animate-[float_6s_ease-in-out_infinite] rounded-xl shadow-2xl border border-white/10" src={tradingDashboard} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 relative overflow-hidden bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20 fade-up">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
                            Your Secure Partner for Digital Assets
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10 mb-20">
                        {[
                            { icon: 'account_balance', title: '99.99% Uptime', desc: 'Institutional reliability for continuous trading access.' },
                            { icon: 'verified_user', title: '1:1 Reserves', desc: 'All client assets are backed 1:1 and verifiable on-chain.' },
                            { icon: 'wallet', title: 'Instant Funding', desc: 'Multi-chain architecture allows for immediate secure deposits.' },
                            { icon: 'security', title: 'Identity Shield', desc: 'Advanced encryption protects your identity and data.' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className="w-16 h-16 rounded-full bg-surface-dark border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-glow">
                                    <span className="material-symbols-outlined text-2xl group-hover:text-white transition-colors">{item.icon}</span>
                                </div>
                                <h3 className="text-gray-900 dark:text-white font-bold text-sm mb-2">{item.title}</h3>
                                <p className="text-text-muted text-xs max-w-[200px] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-100 dark:bg-[#05080F] border-t border-gray-200 dark:border-white/5 pt-20 pb-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-gradient-gold p-[1px]">
                                    <div className="w-full h-full bg-white dark:bg-black rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-lg">diamond</span>
                                    </div>
                                </div>
                                <span className="text-lg font-display font-bold tracking-tight text-gray-900 dark:text-white">Aurelian TD</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                                The premier destination for institutional and retail crypto futures trading. Secure, fast, and reliable. Built for the future of finance.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-gray-900 dark:text-white text-xs font-bold mb-6">Support</h4>
                            <ul className="space-y-4 text-xs text-gray-500 font-medium">
                                <li><button onClick={() => navigate('/help')} className="hover:text-primary transition-all">Help Center</button></li>
                                <li><button onClick={() => navigate('/submit-request')} className="hover:text-primary transition-all">Submit Request</button></li>
                                <li><button onClick={() => navigate('/compliance')} className="hover:text-primary transition-all">Legal & Compliance</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                        <p>© 2026 Aurelian TD Trade. All rights reserved.</p>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-bold">System operational</span>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;
