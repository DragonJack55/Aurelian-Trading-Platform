import React, { useState } from 'react';
import { X, Newspaper, Calendar, GraduationCap, Globe, TrendingUp, BookOpen } from 'lucide-react';

const GlobalResourcesModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('news');

    if (!isOpen) return null;

    const tabs = [
        { id: 'news', label: 'Market News', icon: Newspaper },
        { id: 'calendar', label: 'Economic Calendar', icon: Calendar },
        { id: 'education', label: 'Education', icon: GraduationCap }
    ];

    const newsItems = [
        {
            title: "Bitcoin Surges Past $93K Amidst Institutional Adoption",
            source: "CryptoDaily",
            time: "2h ago",
            sentiment: "positive"
        },
        {
            title: "Federal Reserve Signals Potential Rate Cuts in Q3",
            source: "FinanceGlobal",
            time: "4h ago",
            sentiment: "neutral"
        },
        {
            title: "Ethereum Upgrade 'Pectra' Expected to Lower Gas Fees",
            source: "BlockchainWeek",
            time: "6h ago",
            sentiment: "positive"
        },
        {
            title: "Regulatory Clarity Boosts Altcoin Market Confidence",
            source: "MarketWatch",
            time: "8h ago",
            sentiment: "positive"
        }
    ];

    const calendarItems = [
        {
            event: "Non-Farm Payrolls (NFP)",
            country: "USA",
            time: "Fri, 08:30",
            impact: "high"
        },
        {
            event: "CPI Inflation Data",
            country: "USA",
            time: "Tue, 08:30",
            impact: "high"
        },
        {
            event: "ECB Interest Rate Decision",
            country: "EUR",
            time: "Thu, 08:15",
            impact: "medium"
        },
        {
            event: "Crude Oil Inventories",
            country: "USA",
            time: "Wed, 10:30",
            impact: "low"
        }
    ];

    const educationItems = [
        {
            title: "Crypto Trading 101: Understanding Candlesticks",
            level: "Beginner",
            duration: "10 min"
        },
        {
            title: "Risk Management Strategies for Forex",
            level: "Intermediate",
            duration: "15 min"
        },
        {
            title: "How to Read MACD and RSI Indicators",
            level: "Advanced",
            duration: "20 min"
        },
        {
            title: "DeFi Yield Farming Explained",
            level: "Intermediate",
            duration: "12 min"
        }
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '600px',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--glass-border)',
                padding: 0
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(212, 175, 55, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Globe size={24} color="var(--primary-gold)" />
                        <h2 className="gold-text" style={{ fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '1px' }}>GLOBAL RESOURCES</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-gold)' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '18px',
                                background: activeTab === tab.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary-gold)' : 'none',
                                color: activeTab === tab.id ? 'var(--primary-gold)' : 'var(--text-secondary)',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                fontSize: '13px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'transparent' }}>

                    {activeTab === 'news' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {newsItems.map((item, index) => (
                                <div key={index} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    gap: '16px',
                                    transition: 'all 0.3s ease'
                                }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-gold)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
                                    <div style={{
                                        minWidth: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: 'rgba(212, 175, 55, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '1px solid rgba(212, 175, 55, 0.2)'
                                    }}>
                                        <TrendingUp size={20} color="var(--primary-gold)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)', lineHeight: '1.4' }}>{item.title}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                            <span style={{ color: 'var(--primary-gold)' }}>{item.source}</span>
                                            <span>{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'calendar' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {calendarItems.map((item, index) => (
                                <div key={index} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.3s ease'
                                }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-gold)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{
                                            padding: '8px 12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '8px',
                                            fontWeight: '800',
                                            fontSize: '12px',
                                            color: 'var(--text-primary)',
                                            textAlign: 'center',
                                            minWidth: '54px',
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            {item.country}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '14px' }}>{item.event}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>{item.time}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            background: item.impact === 'high' ? 'rgba(239, 68, 68, 0.1)' : item.impact === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: item.impact === 'high' ? 'var(--danger-red)' : item.impact === 'medium' ? '#f59e0b' : 'var(--success-green)',
                                            fontWeight: '800',
                                            border: `1px solid ${item.impact === 'high' ? 'var(--danger-red)' : item.impact === 'medium' ? '#f59e0b' : 'var(--success-green)'}44`
                                        }}>
                                            {item.impact.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'education' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            {educationItems.map((item, index) => (
                                <div key={index} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-gold)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
                                    <div style={{
                                        width: '52px',
                                        height: '52px',
                                        borderRadius: '50%',
                                        background: 'var(--gold-gradient)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#000',
                                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                                    }}>
                                        <BookOpen size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px', fontSize: '15px' }}>{item.title}</div>
                                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                            <span style={{ color: 'var(--primary-gold)' }}>Level: {item.level}</span>
                                            <span>•</span>
                                            <span>{item.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalResourcesModal;
