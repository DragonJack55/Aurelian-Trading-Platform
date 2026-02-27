import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tradingDashboard from '../assets/trading-dashboard.jpg';
import { assets, getIconUrl } from '../data/assets';

import { subscribeToTicker } from '../services/binance';

const Home = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('crypto');
    const [marketAssets, setMarketAssets] = useState(assets);

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
            } catch (e) {
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
                            // We don't need history updates for Home page mainly, but good to have if we used sparklines
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

    // Removed theme logic (handled by MainLayout)

    return (
        <div className="w-full flex flex-col font-sans antialiased bg-background-dark text-gray-300 pb-20 lg:pb-0">

            {/* Hero Section */}
            {/* Hero Section */}
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 min-h-screen flex flex-col justify-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    {/* CSS-only Premium Background */}
                    <div className="absolute inset-0 bg-background-dark"></div>
                    <div className="absolute inset-0 bg-gradient-mesh opacity-40"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

                    {/* Glowing Orbs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-slow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-dark/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 fade-up visible">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-border-gold bg-surface-dark/50 backdrop-blur-md text-primary text-[10px] font-bold tracking-[0.2em] uppercase mb-8 shadow-glow-strong transition-all duration-300 hover:border-primary/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3 animate-pulse"></span>
                            Institutional Grade Platform
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.95] tracking-tight transition-colors duration-300">
                            Experience premium <br />
                            <span className="text-gradient-gold drop-shadow-2xl">institutional trading</span>
                        </h1>
                        <p className="text-text-muted max-w-2xl mx-auto text-lg mb-10 font-light leading-relaxed transition-colors duration-300">
                            Access deep liquidity, superior execution, and bank-grade security on the world's most sophisticated crypto trading platform.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button onClick={() => navigate('/register')} className="btn-gold px-10 py-4 text-xl shadow-glow-strong">
                                <span className="relative flex items-center justify-center gap-3">
                                    START TRADING
                                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">trending_up</span>
                                </span>
                            </button>
                            <button onClick={() => navigate('/market')} className="px-10 py-4 rounded-lg border border-border-subtle hover:border-primary/50 hover:bg-white/5 text-white font-display font-bold tracking-wider transition-all duration-300">
                                VIEW MARKETS
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-12 gap-4 lg:gap-6 fade-up visible" style={{ transitionDelay: '200ms' }}>
                        <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
                            {[
                                { val: '$1.23B+', label: '24h Volume' },
                                { val: '350+', label: 'Assets Listed' },
                                { val: '1k+', label: 'Partners' },
                                { val: '0.01%', label: 'Maker Fees' }
                            ].map((stat, i) => (
                                <div key={i} className="glass-panel p-5 rounded-xl flex flex-col items-center justify-center hover:border-primary/40 transition-all group hover:-translate-y-1">
                                    <span className="text-3xl font-display font-bold text-white group-hover:text-primary transition-colors drop-shadow-sm">{stat.val}</span>
                                    <span className="text-[10px] text-text-muted uppercase tracking-widest mt-1 font-bold">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Interactive Boxes */}
                        <div className="col-span-6 lg:col-span-3 flex flex-col gap-3 lg:gap-4">
                            <div onClick={() => navigate('/security')} className="flex-1 group relative overflow-hidden p-4 lg:p-6 glass-panel rounded-2xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-center min-h-[100px] lg:min-h-[140px] cursor-pointer">
                                <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                    <span className="material-symbols-outlined text-8xl text-primary">verified_user</span>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-black transition-colors text-primary border border-primary/20">
                                    <span className="material-symbols-outlined text-xl">verified_user</span>
                                </div>
                                <span className="font-display font-bold text-white text-xl group-hover:text-primary transition-colors">Verify Identity</span>
                                <span className="text-xs text-text-muted mt-1 font-medium">Unlock institutional limits</span>
                            </div>
                            <div onClick={() => navigate('/market')} className="flex-1 group relative overflow-hidden p-4 lg:p-6 glass-panel rounded-2xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-center min-h-[100px] lg:min-h-[140px] cursor-pointer">
                                <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                    <span className="material-symbols-outlined text-8xl text-primary">public</span>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-black transition-colors text-primary border border-primary/20">
                                    <span className="material-symbols-outlined text-xl">public</span>
                                </div>
                                <span className="font-display font-bold text-white text-xl group-hover:text-primary transition-colors">Global Resources</span>
                                <span className="text-xs text-text-muted mt-1 font-medium">Access worldwide markets</span>
                            </div>
                        </div>

                        {/* Market Cap Chart + Fear & Greed */}
                        <div className="col-span-6 lg:col-span-9 flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-6">
                            <div className="lg:col-span-2 glass-panel p-4 lg:p-6 rounded-2xl relative overflow-hidden group hover:bg-surface-light/40 transition-colors duration-500 min-h-[100px] lg:min-h-0">
                                <div className="flex justify-between items-start mb-4 lg:mb-8">
                                    <div>
                                        <h3 className="font-bold text-text-muted text-[10px] uppercase tracking-widest mb-1">Total Market Cap</h3>
                                        <span className="text-white font-display font-bold text-2xl lg:text-3xl tracking-tight drop-shadow-sm">$3.17T</span>
                                    </div>
                                    <span className="text-success text-xs font-bold bg-success/10 px-2 py-1 rounded border border-success/20 flex items-center gap-1 shadow-glow-success">
                                        <span className="material-symbols-outlined text-sm">trending_up</span> +6.94%
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-24 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {/* Using SVG for static chart matching reference */}
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
                            <div className="lg:col-span-1 glass-panel p-4 lg:p-6 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center group hover:bg-surface-light/40 transition-colors duration-500 min-h-[100px] lg:min-h-0">
                                <div className="w-full flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-text-muted text-[10px] uppercase tracking-widest">Fear & Greed</h3>
                                    <span className="material-symbols-outlined text-text-subtle text-sm hover:text-primary transition-colors cursor-help">info</span>
                                </div>
                                {/* SVG Gauge */}
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
                                    <div className="text-3xl lg:text-4xl font-bold text-white font-display drop-shadow-lg">24</div>
                                    <div className="text-[10px] text-danger font-bold uppercase tracking-widest bg-danger/10 px-2 py-0.5 rounded mt-1 shadow-glow-danger">Extreme Fear</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ticker Bar (Bottom in light, but Top in Dark - wait, user wants Ticker at top?) 
                   The dark code html has ticker at BOTTOM of footer? No, it's sticky or fixed? 
                   Let's stick to the Dark Design: Reference line 788: Ticker is at BOTTOM in Dark mode?
                   Let's look at dark code again.
                   "div class="w-full border-t ... relative z-20"" - appears at end of footer?
                   Wait, my previous Home.jsx had it fixed at TOP.
                   I'll stick to fixed at TOP as per previous user preference "Move Price Ticker to Top" in task.md.
                */}


            </div>

            {/* Market Overview Section */}
            <section className="py-24 bg-background-base/50 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Market Overview</h2>
                            <p className="text-text-muted text-sm">Real-time prices from the world's leading digital exchanges</p>
                        </div>
                        <div className="flex space-x-1 bg-surface-dark p-1 rounded-lg border border-border-subtle">
                            {['crypto', 'forex', 'indices', 'commodities'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2 rounded-md text-xs uppercase tracking-wider transition-all ${activeTab === tab
                                        ? 'bg-gradient-gold text-black font-bold shadow-glow'
                                        : 'text-text-muted hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-dark/40 backdrop-blur-sm min-h-[400px] relative glass-panel">
                        {activeTab === 'crypto' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-text-muted text-[10px] uppercase tracking-[0.1em] border-b border-white/5 bg-surface-light/30">
                                        <th className="py-4 pl-8 font-semibold">Asset</th>
                                        <th className="py-4 font-semibold">Price</th>
                                        <th className="py-4 font-semibold">24h Change</th>
                                        <th className="py-4 font-semibold hidden md:table-cell">Market Cap</th>
                                        <th className="py-4 font-semibold hidden lg:table-cell">Volume (24h)</th>
                                        <th className="py-4 font-semibold text-right pr-8">Trend (7d)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-300 font-medium text-sm">
                                    {marketAssets.filter(a => a.type === 'crypto').map((asset) => (
                                        <tr key={asset.symbol} className="hover:bg-white/5 transition-colors border-b border-white/5 group cursor-pointer" onClick={() => navigate('/market')}>
                                            <td className="py-4 pl-8">
                                                <div className="flex items-center gap-4">
                                                    <img alt={asset.sub} className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all" src={getIconUrl(asset.symbol)} onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/6001/6001368.png' }} />
                                                    <div>
                                                        <span className="font-bold text-white block group-hover:text-primary transition-colors">{asset.sub}</span>
                                                        <span className="text-text-muted text-[10px] tracking-wide">{asset.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 font-display font-bold text-white">${asset.price}</td>
                                            <td className="py-4"><span className={`${asset.change.startsWith('-') ? 'text-danger' : 'text-success'} flex items-center gap-1 text-xs font-bold shadow-glow-${asset.change.startsWith('-') ? 'danger' : 'success'}/20`}><span className="material-symbols-outlined text-sm">{asset.change.startsWith('-') ? 'arrow_drop_down' : 'arrow_drop_up'}</span> {asset.change.replace(/[+-]/, '')}</span></td>
                                            <td className="py-4 hidden md:table-cell text-text-muted font-display text-xs">{asset.cap}</td>
                                            <td className="py-4 hidden lg:table-cell text-text-muted font-display text-xs">-</td>
                                            <td className="py-4 text-right pr-8">
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
                                <h3 className="text-2xl font-display font-bold text-white mb-3">Institutional Access Only</h3>
                                <p className="text-text-muted max-w-sm mx-auto mb-8 leading-relaxed">
                                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} markets are currently in closed beta testing for institutional partners.
                                </p>
                                <button className="px-8 py-3 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all duration-300">
                                    Notify When Live
                                </button>
                            </div>
                        )}
                    </div>
                    {activeTab === 'crypto' && (
                        <div className="mt-8 text-center">
                            <a className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-primary hover:border-primary transition-all group" href="#" onClick={(e) => { e.preventDefault(); navigate('/market'); }}>
                                View All Markets <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                    )}
                </div>
            </section>

            {/* Advanced Trading Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                                Advanced Trading <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary">Made Accessible</span>
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
                                        <h4 className="text-white font-bold mb-1">Lightning Fast</h4>
                                        <p className="text-text-subtle text-xs">Microsecond latency execution</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-surface-dark border border-border-subtle flex items-center justify-center text-primary shadow-glow shrink-0">
                                        <span className="material-symbols-outlined">security</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1">Bank-Grade</h4>
                                        <p className="text-text-subtle text-xs">SOC2 Type II Certified</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-surface-dark border border-border-subtle flex items-center justify-center text-primary shadow-glow shrink-0">
                                        <span className="material-symbols-outlined">monitoring</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1">Deep Liquidity</h4>
                                        <p className="text-text-subtle text-xs">Access global order books</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-surface-dark border border-border-subtle flex items-center justify-center text-primary shadow-glow shrink-0">
                                        <span className="material-symbols-outlined">psychology</span>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold mb-1">AI Analysis</h4>
                                        <p className="text-text-subtle text-xs">Smart market predictions</p>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-gold px-8 py-4 rounded-lg shadow-glow text-sm group" onClick={() => navigate('/market')}>
                                Explore Features <span className="material-symbols-outlined align-middle ml-1 text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-gold opacity-20 blur-[100px] rounded-full"></div>
                            <img alt="Trading Interface 3D" className="relative z-10 w-full animate-[float_6s_ease-in-out_infinite] rounded-xl shadow-2xl border border-white/10" src={tradingDashboard} />
                            {/* Floating Card 1 */}
                            <div className="absolute -top-10 -right-10 glass-panel p-4 rounded-xl animate-[float_4s_ease-in-out_infinite] hidden md:block border border-white/10 z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                                        <span className="material-symbols-outlined">trending_up</span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-text-muted">Profit P/L</div>
                                        <div className="text-success font-bold">+24.5%</div>
                                    </div>
                                </div>
                            </div>
                            {/* Floating Card 2 */}
                            <div className="absolute -bottom-5 -left-5 glass-panel p-4 rounded-xl animate-[float_5s_ease-in-out_infinite] hidden md:block border border-white/10 z-20" style={{ animationDelay: '1s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                        <span className="material-symbols-outlined text-sm">notifications_active</span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-text-muted">Signal Alert</div>
                                        <div className="text-white text-xs font-bold">BTC Buy Zone</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-background-base border-y border-border-subtle">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="group p-8 rounded-2xl glass-panel hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
                            <div className="w-14 h-14 rounded-full bg-gradient-gold p-[1px] mb-6 shadow-glow">
                                <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center text-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-2xl">analytics</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-display font-bold text-white mb-3">Market Intelligence</h3>
                            <p className="text-text-muted text-sm leading-relaxed">Advanced charting tools (TradingView integration), real-time sentiment analysis, and on-chain data streams.</p>
                        </div>
                        <div className="group p-8 rounded-2xl glass-panel hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
                            <div className="w-14 h-14 rounded-full bg-gradient-gold p-[1px] mb-6 shadow-glow">
                                <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center text-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">lock_person</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-display font-bold text-white mb-3">Institutional Security</h3>
                            <p className="text-text-muted text-sm leading-relaxed">Multi-signature cold storage, real-time fraud monitoring, and insurance coverage for digital assets.</p>
                        </div>
                        <div className="group p-8 rounded-2xl glass-panel hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
                            <div className="w-14 h-14 rounded-full bg-gradient-gold p-[1px] mb-6 shadow-glow">
                                <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center text-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">flash_on</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-display font-bold text-white mb-3">Lightning Execution</h3>
                            <p className="text-text-muted text-sm leading-relaxed">High-performance matching engine capable of 100,000 TPS with &lt;50ms latency for all order types.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 relative overflow-hidden bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                    {/* Header */}
                    <div className="text-center mb-20 fade-up">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                            Your Secure Partner for <span className="text-white">Digital Assets</span>
                        </h2>
                    </div>

                    {/* Process Steps */}
                    <div className="relative mb-20 fade-up" style={{ transitionDelay: '100ms' }}>
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0"></div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                            {[
                                { icon: 'account_balance', title: '99.99% Uptime', desc: 'Institutional reliability for continuous trading access.' },
                                { icon: 'verified_user', title: '1:1 Reserves', desc: 'All client assets are backed 1:1 and verifiable on-chain.' },
                                { icon: 'wallet', title: 'Instant Funding', desc: 'Multi-chain architecture allows for immediate secure deposits.' },
                                { icon: 'security', title: 'Identity Shield', desc: 'Advanced encryption protects your identity and data.' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center group cursor-default">
                                    <div className="w-16 h-16 rounded-full bg-surface-dark border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-glow group-hover:scale-110 transition-transform duration-300 relative bg-black ring-4 ring-black z-10">
                                        <span className="material-symbols-outlined text-2xl group-hover:text-white transition-colors">{item.icon}</span>
                                    </div>
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-text-muted text-[10px] md:text-xs max-w-[200px] leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto fade-up" style={{ transitionDelay: '200ms' }}>
                        {/* Card 1 */}
                        <div className="glass-panel p-8 rounded-2xl flex items-start gap-6 group hover:-translate-y-1 shadow-lg hover:shadow-glow/20">
                            <div className="w-14 h-14 rounded-xl bg-gradient-gold p-[1px] shrink-0">
                                <div className="w-full h-full bg-[#0B101B] rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-2xl group-hover:text-white transition-colors">speed</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-primary transition-colors">High-Performance Engine</h3>
                                <p className="text-text-muted text-xs leading-relaxed">300,000 transactions per second with &lt; 1ms latency for precision execution.</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="glass-panel p-8 rounded-2xl flex items-start gap-6 group hover:-translate-y-1 shadow-lg hover:shadow-glow/20">
                            <div className="w-14 h-14 rounded-xl bg-gradient-gold p-[1px] shrink-0">
                                <div className="w-full h-full bg-[#0B101B] rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-2xl group-hover:text-white transition-colors">hub</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-primary transition-colors">Advanced Connectivity</h3>
                                <p className="text-text-muted text-xs leading-relaxed">Enterprise-grade FIX API for institutional traders and quantitative sub-accounts.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-background-base relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-white mb-4">Client Testimonials</h2>
                        <div className="w-16 h-1 bg-gradient-gold mx-auto mb-4 rounded-full"></div>
                        <p className="text-text-muted text-sm">Trusted by thousands of professional traders worldwide</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'JANE D.', role: 'Professional Trader', text: "Aurelian TD Trade provides reliable and fast crypto futures trading. The liquidity is unmatched for high-volume orders.", initial: 'JD' },
                            { name: 'MICHAEL S.', role: 'Crypto Enthusiast', text: "The platform's analytics tools are superior to anything else on the market. It has significantly improved my win rate.", initial: 'MS' },
                            { name: 'LAURA P.', role: 'Institutional Client', text: "Excellent customer support and educational resources. They actually care about your trading success.", initial: 'LP' }
                        ].map((t, i) => (
                            <div key={i} className="glass-panel p-8 rounded-2xl relative group hover:border-primary/20 transition-all duration-300">
                                <div className="flex gap-1 mb-6 text-primary text-xs">
                                    {[...Array(5)].map((_, j) => <span key={j} className="material-symbols-outlined fill-current text-sm">star</span>)}
                                </div>
                                <span className="material-symbols-outlined absolute top-8 right-8 text-4xl text-white/5 group-hover:text-primary/10 transition-colors">format_quote</span>
                                <p className="text-text-muted text-sm italic mb-8 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-glow">{t.initial}</div>
                                    <div>
                                        <div className="text-white font-bold text-sm">{t.name}</div>
                                        <div className="text-text-subtle text-[10px] uppercase tracking-wide">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Audited By */}
            <section className="py-12 bg-background-dark border-t border-border-subtle">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-text-subtle text-xs font-bold tracking-[0.2em] uppercase mb-12">Secured & Audited By</h3>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {['verified_user|GeoTrust', 'security|McAfee', 'account_balance|BARCLAYS', 'star|Trustpilot', 'lock|SECURE SSL'].map((item, i) => {
                            const [icon, text] = item.split('|');
                            return (
                                <div key={i} className="flex items-center gap-2 group cursor-default">
                                    <span className="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">{icon}</span>
                                    <span className="font-bold text-lg text-text-muted group-hover:text-white transition-colors">{text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#05080F] border-t border-white/5 pt-20 pb-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        {/* Brand Column */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-gradient-gold p-[1px]">
                                    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-lg">diamond</span>
                                    </div>
                                </div>
                                <span className="text-lg font-display font-bold tracking-widest text-white uppercase">Aurelian TD</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                                The premier destination for institutional and retail crypto futures trading. Secure, fast, and reliable. Built for the future of finance.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black transition-all">
                                    <span className="text-xs font-bold">X</span>
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black transition-all">
                                    <span className="text-xs font-bold">f</span>
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black transition-all">
                                    <span className="text-xs font-bold">in</span>
                                </a>
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div>
                            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Platform</h4>
                            <ul className="space-y-4 text-xs text-gray-500">
                                <li><a href="#" className="hover:text-primary transition-colors">Markets</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Trading Fees</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">API Services</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Institutional Services</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Support</h4>
                            <ul className="space-y-4 text-xs text-gray-500">
                                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Submit Request</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">System Status</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Legal & Compliance</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-xs">© 2026 Aurelian TD Trade. All rights reserved.</p>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider">System Operational</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center border-t border-white/5 pt-8">
                        <p className="text-gray-700 text-[10px] uppercase tracking-widest">Regulated by SEC (USA) | CONSOB (ITALY) | ISO 27001 Compliant</p>
                    </div>
                </div>
            </footer>

            {/* Ticker Overlay - sits above BottomNav on mobile */}
            <div className="fixed bottom-16 lg:bottom-0 left-0 w-full bg-[#05080F]/95 backdrop-blur-md border-t border-white/10 py-2 z-40 flex overflow-hidden">
                <div className="ticker-scroll flex gap-12 whitespace-nowrap pl-4">
                    {marketAssets.map((asset) => (
                        <div key={asset.symbol} className="flex items-center gap-2 text-xs font-mono">
                            <img src={getIconUrl(asset.symbol)} alt="" className="w-4 h-4 rounded-full" onError={(e) => { e.target.style.display = 'none' }} />
                            <span className="text-gray-400">{asset.sub}</span>
                            <span className={`${asset.change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                                {asset.price} {asset.change.startsWith('-') ? '▼' : '▲'} {asset.change.replace(/[+-]/, '')}
                            </span>
                        </div>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {marketAssets.map((asset) => (
                        <div key={`dup-${asset.symbol}`} className="flex items-center gap-2 text-xs font-mono">
                            <img src={getIconUrl(asset.symbol)} alt="" className="w-4 h-4 rounded-full" onError={(e) => { e.target.style.display = 'none' }} />
                            <span className="text-gray-400">{asset.sub}</span>
                            <span className={`${asset.change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                                {asset.price} {asset.change.startsWith('-') ? '▼' : '▲'} {asset.change.replace(/[+-]/, '')}
                            </span>
                        </div>
                    ))}
                </div>
                <style>{`
                    @keyframes tickerScroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .ticker-scroll {
                        animation: tickerScroll 120s linear infinite;
                        width: max-content;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Home;
