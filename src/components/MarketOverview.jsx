import React, { useState, useEffect } from 'react';
import Sparkline from './Sparkline';

const StatCard = ({ title, value, change, history }) => (
    <div className="card" style={{
        padding: '16px', // Reduced padding for mobile
        flex: 1,
        minWidth: '140px', // Allow shrinking for 2-col
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid var(--glass-border)',
        background: 'rgba(255,255,255,0.03)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{title}</span>
            <span style={{ color: 'var(--primary-gold)', fontSize: '12px' }}>›</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className="gold-text mono-font" style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {title === 'Market Cap' ? `$${value.toFixed(2)}T` : `$${value.toFixed(2)}`}
            </span>
            <span className="mono-font" style={{ color: 'var(--success-green)', fontSize: '13px', fontWeight: 'bold' }}>
                +{change}%
            </span>
        </div>

        <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', opacity: 0.8 }}>
            <Sparkline data={history} color="var(--primary-gold)" width={100} height={40} />
        </div>
    </div>
);

const GaugeCard = ({ value, status }) => {
    // Gauge Configuration
    const radius = 55;
    const cx = 70;
    const cy = 70;

    // Calculate ball position
    // Map 0-100 value to 180-0 degrees (Left to Right)
    const angle = 180 - (value / 100) * 180;
    const angleRad = (angle * Math.PI) / 180;

    // Position on the arc (center of stroke)
    const ballX = cx + Math.cos(angleRad) * radius;
    const ballY = cy - Math.sin(angleRad) * radius;

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const describeArc = (x, y, radius, startAngle, endAngle) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
        return d;
    };

    return (
        <div className="card" style={{
            padding: '16px',
            flex: 1,
            minWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.03)'
        }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px' }}>Fear & Greed</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>›</span>
            </div>

            <div style={{ position: 'relative', width: '140px', height: '80px', display: 'flex', justifyContent: 'center' }}>
                <svg width="140" height="80" viewBox="0 0 140 80">
                    {/* 
                        Calculated Segments for ~5 degree visual gaps (Reduced by half)
                        Path coordinates (Length 24, Gap 13):
                        1: 4-28
                        2: 41-65
                        3: 78-102
                        4: 115-139
                        5: 152-176
                    */}

                    {/* Segment 1: Extreme Fear (Red) */}
                    <path
                        d={describeArc(70, 70, 55, 4, 28)}
                        fill="none"
                        stroke="#FF3B30" // Vibrant Red
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Segment 2: Fear (Orange) */}
                    <path
                        d={describeArc(70, 70, 55, 41, 65)}
                        fill="none"
                        stroke="#FF9500" // Vibrant Orange
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Segment 3: Neutral (Yellow) */}
                    <path
                        d={describeArc(70, 70, 55, 78, 102)}
                        fill="none"
                        stroke="#FFCC00" // Vibrant Yellow
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Segment 4: Greed (Light Green) */}
                    <path
                        d={describeArc(70, 70, 55, 115, 139)}
                        fill="none"
                        stroke="#34C759" // Vibrant Apple Green
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Segment 5: Extreme Greed (Darker Green) */}
                    <path
                        d={describeArc(70, 70, 55, 152, 176)}
                        fill="none"
                        stroke="#30D158" // Intense Green
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* Indicator Ball */}
                    <circle
                        cx={ballX}
                        cy={ballY}
                        r="6"
                        fill="white"
                        stroke="#1E2026"
                        strokeWidth="2"
                    />
                </svg>

                <div style={{ position: 'absolute', bottom: '0', textAlign: 'center' }}>
                    <div className="mono-font" style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', lineHeight: '1' }}>{value}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{status}</div>
                </div>
            </div>
        </div>
    );
};

const MarketOverview = () => {
    // Initial simulated data
    const [marketData, setMarketData] = useState({
        marketCap: { value: 3.16, change: 6.94, history: [3.0, 3.05, 3.1, 3.12, 3.14, 3.15, 3.16, 3.18, 3.16] },
        cmc20: { value: 197.03, change: 7.77, history: [180, 185, 190, 192, 195, 196, 197, 198, 197] },
        fearGreed: { value: 22, status: 'Fear' }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setMarketData(prev => {
                // Simulate Market Cap fluctuations
                const mcChange = (Math.random() - 0.5) * 0.02;
                const newMcValue = Math.max(0, prev.marketCap.value + mcChange);
                const newMcHistory = [...prev.marketCap.history.slice(1), newMcValue];

                // Simulate CMC20 fluctuations
                const cmcChange = (Math.random() - 0.5) * 1.5;
                const newCmcValue = Math.max(0, prev.cmc20.value + cmcChange);
                const newCmcHistory = [...prev.cmc20.history.slice(1), newCmcValue];

                // Simulate Fear & Greed fluctuations
                let newFgValue = prev.fearGreed.value;
                if (Math.random() > 0.7) {
                    newFgValue = Math.max(0, Math.min(100, prev.fearGreed.value + Math.floor(Math.random() * 5) - 2));
                }

                // Determine Status based on 5 levels
                let status = 'Neutral';
                if (newFgValue < 20) status = 'Extreme Fear';
                else if (newFgValue < 40) status = 'Fear';
                else if (newFgValue < 60) status = 'Neutral';
                else if (newFgValue < 80) status = 'Greed';
                else status = 'Extreme Greed';

                return {
                    marketCap: {
                        ...prev.marketCap,
                        value: newMcValue,
                        history: newMcHistory
                    },
                    cmc20: {
                        ...prev.cmc20,
                        value: newCmcValue,
                        history: newCmcHistory
                    },
                    fearGreed: {
                        ...prev.fearGreed,
                        value: newFgValue,
                        status: status
                    }
                };
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '0 16px 32px 16px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingBottom: '12px' }}>
                <div style={{ flex: '1 1 calc(50% - 12px)', minWidth: '140px' }}>
                    <StatCard
                        title="Market Cap"
                        value={marketData.marketCap.value}
                        change={marketData.marketCap.change}
                        history={marketData.marketCap.history}
                    />
                </div>
                <div style={{ flex: '1 1 calc(50% - 12px)', minWidth: '140px' }}>
                    <StatCard
                        title="CMC20 Index"
                        value={marketData.cmc20.value}
                        change={marketData.cmc20.change}
                        history={marketData.cmc20.history}
                    />
                </div>
                <div style={{ flex: '1 1 100%' }}>
                    <GaugeCard
                        value={marketData.fearGreed.value}
                        status={marketData.fearGreed.status}
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketOverview;
