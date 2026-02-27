import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Menu, X, User, Plus, Settings2, Maximize2, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { subscribeToTicker } from '../services/binance';

const OrderBook = lazy(() => import('../components/OrderBook'));
const TradingViewWidget = lazy(() => import('../components/TradingViewWidget'));
import ContractDetail from '../components/ContractDetail';

import { saveTrade, subscribeToTrades } from '../services/tradeService';
import { incrementUserPoints } from '../services/userService';
import { auth } from '../firebase';

// Helper function to format numbers with commas
const formatNumber = (num) => {
    if (num === undefined || num === null) return '0.00';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const investmentOptions = [
    { time: '30 seconds', profit: 5, min: 100 },
    { time: '60 seconds', profit: 10, min: 10000 },
    { time: '90 seconds', profit: 15, min: 50000 },
    { time: '120 seconds', profit: 20, min: 100000 },
    { time: '180 seconds', profit: 25, min: 300000 },
    { time: '360 seconds', profit: 30, min: 500000 }
];

const assets = [
    { symbol: 'BTCUSDT', name: 'BTC/USDT', tvSymbol: 'BINANCE:BTCUSDT', type: 'crypto', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png' },
    { symbol: 'XAUUSD', name: 'XAU/USD', tvSymbol: 'BINANCE:PAXGUSDT', type: 'forex', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5705.png' },
    { symbol: 'ETHUSDT', name: 'ETH/USDT', tvSymbol: 'BINANCE:ETHUSDT', type: 'crypto', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    { symbol: 'EURUSD', name: 'EUR/USD', tvSymbol: 'BINANCE:EURUSDT', type: 'forex', logo: 'https://flagcdn.com/w40/eu.png' },
    { symbol: 'AUDUSD', name: 'AUD/USD', tvSymbol: 'BINANCE:AUDUSDT', type: 'forex', logo: 'https://flagcdn.com/w40/au.png' },
    { symbol: 'XAGUSD', name: 'XAG/USD', tvSymbol: 'BINANCE:XAGUSDT', type: 'forex', logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3053.png' },
    { symbol: 'US30', name: 'US30', tvSymbol: 'BINANCE:BTCUSDT', type: 'index', logo: 'https://flagcdn.com/w40/us.png' },
    { symbol: 'UKOIL', name: 'UKOIL', tvSymbol: 'BINANCE:LTCUSDT', type: 'commodity', logo: 'https://flagcdn.com/w40/gb.png' },
];

const Trading = () => {
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState({ c: '0.00', P: '0.00', h: '0.00', l: '0.00', v: '0.00' });
    const [activeSymbol, setActiveSymbol] = useState(assets[0]);
    const [trades, setTrades] = useState([]);
    const [selectedContractId, setSelectedContractId] = useState(null);
    const { user: currentUser } = useApp();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState(0);
    const [activeTab, setActiveTab] = useState('transaction');

    const [isTrading, setIsTrading] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

    const priceRef = React.useRef(price);
    const tradesRef = React.useRef(trades);
    const currentUserRef = React.useRef(currentUser);

    // Keep refs in sync with state
    useEffect(() => { priceRef.current = price; }, [price]);
    useEffect(() => { tradesRef.current = trades; }, [trades]);
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    const resolvingRef = React.useRef(new Set());

    const triggerTradeResolution = useCallback(async (tradeId, tradeToResolve = null) => {
        // Prevent double resolution if already in progress
        if (resolvingRef.current.has(tradeId)) return;

        try {
            resolvingRef.current.add(tradeId);

            // Use provided trade object or find it in state using ref
            const currentTrades = tradesRef.current;
            const trade = tradeToResolve || currentTrades.find(t => t.id === tradeId);
            if (!trade || trade.status !== 'pending') {
                resolvingRef.current.delete(tradeId);
                return;
            }

            // Calculate win/loss using price ref
            const currentPrice = parseFloat(priceRef.current.c);
            const entryPrice = parseFloat(trade.entryPrice);
            let isWin = trade.direction === 'up' ? currentPrice > entryPrice : currentPrice < entryPrice;

            // Admin Force Win/Loss Override
            const user = currentUserRef.current;
            const resultSetting = user?.trade_result || user?.tradeResult;

            if (resultSetting === 'win') isWin = true;
            if (resultSetting === 'loss' || resultSetting === 'lose') isWin = false;
            const payout = isWin ? trade.amount + (trade.amount * (trade.profitRate / 100)) : 0;
            const result = isWin ? (trade.amount * (trade.profitRate / 100)) : -trade.amount;

            // Update trade record
            await saveTrade(user.email, {
                status: 'completed',
                exitPrice: currentPrice,
                result: result,
                payout: payout,
                completedAt: Date.now()
            }, tradeId);

            // If win, add payout to balance (original stake + profit)
            if (payout > 0) {
                console.log(`[Trade] Adding payout of $${payout} to ${user.email}'s balance`);
                const balanceResult = await incrementUserPoints(user.email, payout);
                if (!balanceResult.success) {
                    console.error(`[Trade] Balance update failed for ${tradeId}:`, balanceResult.error);
                    // Retry once after a short delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const retryResult = await incrementUserPoints(user.email, payout);
                    if (!retryResult.success) {
                        console.error(`[Trade] Balance update retry also failed for ${tradeId}:`, retryResult.error);
                    } else {
                        console.log(`[Trade] Balance update succeeded on retry for ${tradeId}`);
                    }
                } else {
                    console.log(`[Trade] Balance updated successfully for ${tradeId}`);
                }
            }

            console.log(`[Trade] Resolved ${tradeId}: ${isWin ? 'WIN' : 'LOSS'} (Result: ${result})`);
        } catch (error) {
            console.error('Failed to resolve trade locally:', error);
        } finally {
            resolvingRef.current.delete(tradeId);
        }
    }, [/* Dependencies removed to avoid recreating the function which resets trade listeners */]);

    // Initial load and subscription
    useEffect(() => {
        let unsubscribeTrades = null;

        if (currentUser?.email) {
            // Phase 6: Robust re-sync logic for trades
            unsubscribeTrades = subscribeToTrades(currentUser.email, (newTrades) => {
                const now = Date.now();
                const processedTrades = newTrades.map(t => {
                    if (t.status === 'pending' && t.startTime) {
                        const startTime = t.startTime.seconds
                            ? t.startTime.seconds * 1000
                            : (typeof t.startTime === 'string' ? new Date(t.startTime).getTime() : t.startTime);
                        const elapsed = (now - startTime) / 1000;
                        const remaining = Math.max(0, Math.ceil(t.duration - elapsed));

                        // If duration has passed but still pending, trigger resolution
                        if (remaining === 0) {
                            triggerTradeResolution(t.id, t);
                        }

                        return { ...t, remainingTime: remaining };
                    }
                    return t;
                });
                setTrades(processedTrades);
            });
        }

        return () => {
            if (unsubscribeTrades) unsubscribeTrades();
        };
    }, [currentUser?.email, triggerTradeResolution]);

    // Price updates
    useEffect(() => {
        const unsubscribeTicker = subscribeToTicker([activeSymbol.symbol], (data) => {
            const ticker = Array.isArray(data) ? data[0] : data;
            setPrice({
                c: parseFloat(ticker.c).toFixed(2),
                P: parseFloat(ticker.P).toFixed(2),
                h: parseFloat(ticker.h).toFixed(2),
                l: parseFloat(ticker.l).toFixed(2),
                v: ticker.q || ticker.v || '0', // Prefer quote volume (USDT)
            });
        });

        return () => unsubscribeTicker();
    }, [activeSymbol]);

    // UI Countdown timer (local state updates for smoothness)
    useEffect(() => {
        const timer = setInterval(() => {
            setTrades(prevTrades => prevTrades.map(trade => {
                if (trade.status === 'pending' && trade.remainingTime > 0) {
                    return { ...trade, remainingTime: trade.remainingTime - 1 };
                }
                return trade;
            }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleTrade = async (direction) => {
        if (isTrading) return;

        if (!currentUser || !currentUser.email) {
            alert('Please login to trade');
            return;
        }

        const tradeAmount = parseFloat(amount);
        const currentOption = investmentOptions[selectedTime];
        const currentBalance = currentUser.balance || 0;

        if (currentUser.isFrozen) {
            alert('Your assets are frozen. Please contact support.');
            return;
        }

        // Check both verification_status (DB field) and status (Mock/Legacy)
        const isVerified = currentUser.verification_status === 'verified' || currentUser.status === 'approved';
        if (!isVerified) {
            alert('Please complete identity verification to trade');
            return;
        }

        if (!amount || isNaN(tradeAmount) || tradeAmount < currentOption.min) {
            alert(`Minimum amount is ${currentOption.min}`);
            return;
        }

        if (currentBalance < tradeAmount) {
            alert('Insufficient balance');
            return;
        }

        try {
            setIsTrading(true);

            const finalProfitRate = currentUser.isVIP ? currentOption.profit + 5 : currentOption.profit;

            const tradeData = {
                symbol: activeSymbol.name,
                tvSymbol: activeSymbol.tvSymbol,
                direction,
                amount: tradeAmount,
                duration: parseInt(currentOption.time),
                entryPrice: price.c,
                profitRate: finalProfitRate
            };

            // Call the secure execution backend
            const userForToken = auth.currentUser;
            if (!userForToken) throw new Error("Authentication token unavailable");
            const idToken = await userForToken.getIdToken();

            const response = await fetch('https://us-central1-aurelian-td-trade.cloudfunctions.net/executeTradeNode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(tradeData)
            });

            const result = await response.json();

            if (result.success && result.tradeId) {
                // Focus the newly tracked trade visually
                setSelectedContractId(result.tradeId);
            } else {
                throw new Error(result.error || 'Failed to initialize secure trade constraint');
            }

        } catch (error) {
            console.error('Trade execution failed:', error);
            alert('Failed to execute trade: ' + (error.message || 'Unknown error'));
        } finally {
            setTimeout(() => {
                setIsTrading(false);
            }, 500);
        }
    };

    // Helper to format volume
    const formatVolume = (vol) => {
        if (!vol) return '0.00';
        const num = parseFloat(vol);
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toFixed(2);
    };

    const currentOption = investmentOptions[selectedTime];
    const amountNum = parseFloat(amount) || 0;
    const finalProfitRate = currentUser?.isVIP ? currentOption.profit + 5 : currentOption.profit;
    const expectedProfit = (amountNum * (finalProfitRate / 100)).toFixed(2);
    const minAmount = currentOption.min;
    const activeTrades = trades.filter(t => t.status === 'pending');
    const historyTrades = trades.filter(t => t.status === 'completed');

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1000);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-background-base text-gray-900 dark:text-gray-300 overflow-hidden">
            {/* Asset Selection Menu - Overlay */}
            <div className={`fixed inset-y-0 left-0 w-80 bg-surface-light dark:bg-surface-dark z-[2000] transform transition-transform duration-300 shadow-2xl border-r border-border-light dark:border-border-gold/20 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-border-light dark:border-border-gold/20 flex justify-between items-center bg-gray-50 dark:bg-surface-dark">
                    <span className="font-display font-bold text-lg text-primary-dark dark:text-primary tracking-wider">MARKETS</span>
                    <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-primary transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-2">
                    {assets.map(asset => (
                        <div key={asset.symbol} onClick={() => { setActiveSymbol(asset); setIsMenuOpen(false); }}
                            className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${activeSymbol.symbol === asset.symbol
                                ? 'bg-primary/10 border-primary/40'
                                : 'bg-white dark:bg-surface-light/5 border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                }`}
                        >
                            <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full shadow-sm" />
                            <div>
                                <div className={`font-bold text-sm ${activeSymbol.symbol === asset.symbol ? 'text-primary-dark dark:text-primary' : 'text-gray-900 dark:text-white'}`}>
                                    {asset.name}
                                </div>
                                <div className="text-[10px] uppercase text-text-muted font-medium tracking-wide">{asset.type}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1900]"></div>}

            {/* Top Bar for Chart Controls */}
            <div className="px-6 py-3 bg-background-base border-b border-border-light dark:border-border-subtle flex justify-between items-center shadow-lg relative z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsMenuOpen(true)}>
                        <div className="p-2 -ml-2 rounded-lg hover:bg-surface-light/10 transition-colors">
                            <Menu size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex items-center gap-4">
                            <img src={activeSymbol.logo} alt={activeSymbol.name} className="w-9 h-9 rounded-full shadow-lg border border-white/5 group-hover:scale-105 transition-transform" />
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-display font-bold text-lg text-white tracking-wide">{activeSymbol.name}</span>
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary uppercase tracking-wider border border-primary/20">{activeSymbol.type}</span>
                                </div>
                                <div className={`text-sm font-mono font-bold ${parseFloat(price.c) >= parseFloat(price.P) ? 'text-success' : 'text-danger'}`}>
                                    ${price.c}
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isMobile && (
                        <div className="flex gap-8 text-xs font-medium border-l border-white/5 pl-8 ml-2 h-8 items-center">
                            <div className="flex flex-col justify-between h-full">
                                <span className="text-[9px] uppercase tracking-widest text-text-subtle font-bold">24h High</span>
                                <span className="text-gray-200 font-mono text-[11px]">{price.h}</span>
                            </div>
                            <div className="flex flex-col justify-between h-full">
                                <span className="text-[9px] uppercase tracking-widest text-text-subtle font-bold">24h Low</span>
                                <span className="text-gray-200 font-mono text-[11px]">{price.l}</span>
                            </div>
                            <div className="flex flex-col justify-between h-full">
                                <span className="text-[9px] uppercase tracking-widest text-text-subtle font-bold">24h Vol</span>
                                <span className="text-primary font-mono text-[11px]">{formatVolume(price.v)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex bg-surface-dark rounded-lg p-1.5 gap-1 border border-white/5">
                    {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                        (!isMobile || ['1m', '15m', '1h'].includes(tf)) && (
                            <button
                                key={tf}
                                onClick={() => setSelectedTimeframe(tf)}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${selectedTimeframe === tf
                                    ? 'bg-gradient-gold text-black shadow-glow'
                                    : 'text-text-muted hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tf.toUpperCase()}
                            </button>
                        )
                    ))}
                </div>
            </div>

            {/* Main Layout (Responsive) */}
            <div className="flex flex-1 overflow-hidden flex-col lg:flex-row relative">

                {/* 1. Chart Section */}
                <div className="flex-1 bg-gray-50 dark:bg-background-base relative border-b lg:border-r border-gray-200 dark:border-border-subtle h-[400px] lg:h-auto z-0">
                    <TradingViewWidget symbol={activeSymbol.tvSymbol} interval={selectedTimeframe} theme="dark" />
                </div>

                {/* 2. Trading Controls */}
                <div className="w-full lg:w-[340px] bg-white dark:bg-surface-dark z-10 flex flex-col border-l border-gray-200 dark:border-border-gold/10 shadow-xl overflow-y-auto custom-scrollbar">

                    <div className="p-6 space-y-6">
                        {/* Time Setting */}
                        <div>
                            <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                Expiration Time
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {investmentOptions.map((option, index) => (
                                    <button key={index} onClick={() => setSelectedTime(index)}
                                        className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all duration-200 ${selectedTime === index
                                            ? 'bg-primary/10 border-primary/50 text-white shadow-glow-strong'
                                            : 'bg-white/5 border-transparent hover:border-white/10 text-gray-400'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{option.time.split(' ')[0]}s</span>
                                        <span className="text-[10px] font-medium opacity-80">{option.profit}%</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] font-bold text-text-muted uppercase">Amount</span>
                                <span className="text-[10px] text-text-muted">
                                    Wallet: <span className="text-gray-900 dark:text-white font-bold">{currentUser ? formatNumber((currentUser.balance || 0).toFixed(2)) : '0.00'}</span>
                                </span>
                            </div>
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={`Min ${minAmount}`}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 pr-16 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder-gray-500"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary-dark dark:text-primary">USDT</span>
                            </div>
                        </div>

                        {/* Est. Yield */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center shadow-inner relative overflow-hidden">
                            {currentUser?.isVIP && (
                                <div className="absolute top-0 right-0 bg-primary text-black text-[8px] font-bold px-2 py-0.5 rounded-bl-lg shadow-glow-sm">
                                    VIP BONUS (+5%)
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-text-muted">Est. Payout</span>
                                {currentUser?.isVIP && <span className="text-[10px] text-primary font-bold">{finalProfitRate}% Return</span>}
                            </div>
                            <span className="text-lg font-bold text-success font-mono">+${formatNumber(expectedProfit)}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleTrade('up')}
                                disabled={isTrading}
                                className="py-4 bg-success hover:bg-green-600 text-white rounded-xl font-bold shadow-glow-success active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="text-sm tracking-widest relative z-10">LONG</span>
                                <span className="text-[10px] opacity-80 relative z-10">BUY</span>
                            </button>
                            <button
                                onClick={() => handleTrade('down')}
                                disabled={isTrading}
                                className="py-4 bg-danger hover:bg-red-600 text-white rounded-xl font-bold shadow-glow-danger active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <span className="text-sm tracking-widest relative z-10">SHORT</span>
                                <span className="text-[10px] opacity-80 relative z-10">SELL</span>
                            </button>
                        </div>
                    </div>

                    {/* Positions List (Mini) */}
                    <div className="flex-1 flex flex-col min-h-[300px] border-t border-gray-200 dark:border-border-gold/10 bg-gray-50/50 dark:bg-surface-dark">
                        <div className="flex border-b border-gray-200 dark:border-white/5">
                            {['transaction', 'position'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === tab
                                        ? 'border-primary text-primary bg-white/5'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                        }`}
                                >
                                    {tab === 'transaction' ? `Open Positions (${activeTrades.length})` : 'History'}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {activeTab === 'transaction' ? (
                                activeTrades.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-text-subtle gap-2 opacity-60">
                                        <span className="material-symbols-outlined text-3xl">inbox</span>
                                        <span className="text-xs">No open positions</span>
                                    </div>
                                ) : (
                                    activeTrades.map(trade => (
                                        <div key={trade.id} className="bg-white/5 p-3 rounded-lg border border-white/5 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                            <div className="flex justify-between mb-1">
                                                <span className="font-bold text-xs text-white">{trade.symbol}</span>
                                                <span className="text-xs font-mono font-bold text-primary">{trade.remainingTime}s</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${trade.direction === 'up' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                                    {trade.direction.toUpperCase()}
                                                </span>
                                                <span className="text-text-muted font-medium">${trade.amount}</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="absolute bottom-0 left-0 h-0.5 bg-primary/20 w-full">
                                                <div
                                                    className="h-full bg-primary transition-all duration-1000 linear"
                                                    style={{ width: `${(trade.remainingTime / trade.duration) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                historyTrades.slice(0, 10).map(trade => (
                                    <div key={trade.id} className="bg-white/5 p-3 rounded-lg border border-white/5 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-xs text-white">{trade.symbol}</span>
                                            <span className={`font-bold text-xs ${trade.result >= 0 ? 'text-success' : 'text-danger'}`}>
                                                {trade.result >= 0 ? '+' : ''}{trade.result.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-text-muted">
                                            <span>{new Date(trade.completedAt).toLocaleTimeString()}</span>
                                            <span>${trade.amount}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Order Book Section - Tablet/Desktop Only */}
                <div className="hidden xl:block w-[280px] bg-white dark:bg-surface-dark border-l border-gray-200 dark:border-border-gold/10 z-10">
                    <div className="p-3 border-b border-gray-200 dark:border-white/5 font-bold text-xs text-text-subtle uppercase tracking-wider">
                        Order Book
                    </div>
                    <div className="h-full">
                        <OrderBook price={price.c} />
                    </div>
                </div>

            </div>

            {selectedContractId && (
                <ContractDetail
                    contract={trades.find(t => t.id === selectedContractId)}
                    onClose={() => setSelectedContractId(null)}
                />
            )}
        </div>
    );
};

export default Trading;
