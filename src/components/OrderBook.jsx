import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const OrderBook = ({ price }) => {
    const [asks, setAsks] = useState([]);
    const [bids, setBids] = useState([]);
    const [lastDisplayPrice, setLastDisplayPrice] = useState(price || '0.00');
    const [activeTab, setActiveTab] = useState('book'); // 'book' or 'trades'
    const [recentTrades, setRecentTrades] = useState([]);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Theme-aware colors
    const colors = {
        bg: isDark ? '#131722' : '#ffffff',
        border: isDark ? '#2a2e39' : '#e5e7eb',
        textPrimary: isDark ? '#EAECEF' : '#1f2937',
        textSecondary: isDark ? '#848E9C' : '#6b7280',
        headerBg: isDark ? '#131722' : '#f9fafb',
    };

    // Ref to track latest display price for the interval closure without triggering re-runs
    const displayPriceRef = useRef(price || '0.00');

    // Update ref when state changes
    useEffect(() => {
        displayPriceRef.current = lastDisplayPrice;
    }, [lastDisplayPrice]);

    // Initialize layout immediately on mount
    useEffect(() => {
        const center = parseFloat(price) || 50000;
        const newAsks = [];
        const newBids = [];

        for (let i = 0; i < 18; i++) {
            newAsks.push({
                price: (center + 0.1 + (i * 0.1)).toFixed(1),
                amount: (Math.random() * 0.5).toFixed(5),
                total: (Math.random() * 2).toFixed(5),
                width: Math.random() * 80 + 10
            });
            newBids.push({
                price: (center - 0.1 - (i * 0.1)).toFixed(1),
                amount: (Math.random() * 0.5).toFixed(5),
                total: (Math.random() * 2).toFixed(5),
                width: Math.random() * 80 + 10
            });
        }
        setAsks(newAsks.reverse());
        setBids(newBids);
    }, []);

    // High-frequency visuals update loop (150ms ~ 6-7fps)
    useEffect(() => {
        const interval = setInterval(() => {
            // 1. UPDATE BOOK (Visual flicker)
            const updateRow = (row) => {
                if (Math.random() > 0.8) {
                    return {
                        ...row,
                        amount: (Math.random() * 0.8).toFixed(5),
                        total: (parseFloat(row.total) + (Math.random() * 0.1 - 0.05)).toFixed(5),
                        width: Math.random() * 90 + 5
                    };
                }
                return row;
            };
            setAsks(prev => prev.map(updateRow));
            setBids(prev => prev.map(updateRow));

            // 3. UPDATE TRADES
            if (activeTab === 'trades' || Math.random() > 0.7) {
                const isBuy = Math.random() > 0.5;
                const centerPrice = parseFloat(price || displayPriceRef.current);
                const variance = Math.random() * 0.5;
                const tradePrice = (centerPrice + (Math.random() > 0.5 ? variance : -variance)).toFixed(2);

                const newTrade = {
                    price: tradePrice,
                    amount: (Math.random() * 1.5).toFixed(4),
                    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    type: isBuy ? 'buy' : 'sell'
                };

                setRecentTrades(prev => [newTrade, ...prev].slice(0, 30));
            }

            // 4. SYNC DISPLAY PRICE
            if (price) {
                setLastDisplayPrice(prev => {
                    const p = parseFloat(prev);
                    const target = parseFloat(price);
                    if (Math.abs(p - target) > 0.5) {
                        return price;
                    }
                    if (Math.random() > 0.5) return price;
                    return prev;
                });
            }

        }, 150);

        return () => clearInterval(interval);
    }, [price, activeTab]);

    useEffect(() => {
        if (!price) return;
    }, [price]);

    const Row = ({ item, type }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '35% 30% 35%',
            padding: '1px 12px',
            position: 'relative',
            fontSize: '11px',
            lineHeight: '18px',
            cursor: 'pointer'
        }} className="order-book-row">
            <div style={{
                position: 'absolute',
                top: 1, bottom: 1, right: 0,
                width: `${item.width}%`,
                background: type === 'ask' ? 'rgba(246, 70, 93, 0.15)' : 'rgba(14, 203, 129, 0.15)',
                transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 0
            }} />
            <span className="mono-font" style={{ color: type === 'ask' ? '#f6465d' : '#0ecb81', zIndex: 1, textAlign: 'left', fontWeight: '500' }}>{item.price}</span>
            <span className="mono-font" style={{ color: colors.textPrimary, zIndex: 1, textAlign: 'right', opacity: 0.9 }}>{item.amount}</span>
            <span className="mono-font" style={{ color: colors.textSecondary, zIndex: 1, textAlign: 'right' }}>{item.total}</span>
        </div>
    );

    const TradeRow = ({ item }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '35% 35% 30%',
            padding: '2px 12px',
            fontSize: '11px',
            lineHeight: '18px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.04)'}`
        }}>
            <span className="mono-font" style={{ color: item.type === 'buy' ? '#0ecb81' : '#f6465d', textAlign: 'left', fontWeight: '500' }}>{item.price}</span>
            <span className="mono-font" style={{ color: colors.textPrimary, textAlign: 'right', opacity: 0.9 }}>{item.amount}</span>
            <span className="mono-font" style={{ color: colors.textSecondary, textAlign: 'right' }}>{item.time}</span>
        </div>
    );

    return (
        <div style={{
            background: colors.bg,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderLeft: `1px solid ${colors.border}`,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Header / Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: '40px', borderBottom: `1px solid ${colors.border}`, gap: '20px' }}>
                <span
                    onClick={() => setActiveTab('book')}
                    style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: activeTab === 'book' ? colors.textPrimary : colors.textSecondary,
                        borderBottom: activeTab === 'book' ? '2px solid #F0B90B' : '2px solid transparent',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        marginRight: '8px'
                    }}>Order Book</span>
                <span
                    onClick={() => setActiveTab('trades')}
                    style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: activeTab === 'trades' ? colors.textPrimary : colors.textSecondary,
                        borderBottom: activeTab === 'trades' ? '2px solid #F0B90B' : '2px solid transparent',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'color 0.2s'
                    }}>Trades</span>
            </div>

            {activeTab === 'book' ? (
                <>
                    {/* Order Book View */}
                    <div style={{ display: 'grid', gridTemplateColumns: '35% 30% 35%', padding: '8px 12px', fontSize: '10px', color: colors.textSecondary, fontWeight: '600' }}>
                        <span style={{ textAlign: 'left' }}>Price(USDT)</span>
                        <span style={{ textAlign: 'right' }}>Amount</span>
                        <span style={{ textAlign: 'right' }}>Total</span>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '4px' }}>
                        {asks.map((item, i) => <Row key={`ask-${i}`} item={item} type="ask" />)}
                    </div>
                    <div style={{
                        padding: '10px 16px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: parseFloat(lastDisplayPrice) >= parseFloat(price || 0) ? '#0ecb81' : '#f6465d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: colors.headerBg,
                        borderTop: `1px solid ${colors.border}`,
                        borderBottom: `1px solid ${colors.border}`
                    }}>
                        {lastDisplayPrice}
                        <span className="mono-font" style={{ fontSize: '14px' }}>{parseFloat(lastDisplayPrice) >= parseFloat(price || 0) ? '↑' : '↓'}</span>
                        <span style={{ fontSize: '12px', color: colors.textPrimary, fontWeight: 'normal', marginLeft: 'auto' }}>
                            ≈ ${lastDisplayPrice}
                        </span>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', paddingTop: '4px' }}>
                        {bids.map((item, i) => <Row key={`bid-${i}`} item={item} type="bid" />)}
                    </div>
                </>
            ) : (
                <>
                    {/* Recent Trades View */}
                    <div style={{ display: 'grid', gridTemplateColumns: '35% 35% 30%', padding: '8px 12px', fontSize: '10px', color: colors.textSecondary, fontWeight: '600' }}>
                        <span style={{ textAlign: 'left' }}>Price(USDT)</span>
                        <span style={{ textAlign: 'right' }}>Amount</span>
                        <span style={{ textAlign: 'right' }}>Time</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="custom-scrollbar">
                        {recentTrades.map((item, i) => <TradeRow key={`trade-${i}`} item={item} />)}
                    </div>
                </>
            )}
        </div>
    );
};

export default OrderBook;
