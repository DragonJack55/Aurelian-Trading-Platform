import React from 'react';
import { X, CheckCircle } from 'lucide-react';

const PromotionModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

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
                maxWidth: '480px',
                padding: '40px',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative',
                border: '1px solid var(--glass-border)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 className="gold-text" style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '1px' }}>EXECUTIVE REFERRAL</h2>
                    <X onClick={onClose} style={{ cursor: 'pointer', color: 'var(--primary-gold)' }} size={24} />
                </div>

                <div style={{ color: 'var(--text-primary)', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '24px', fontWeight: '800', fontSize: '20px', letterSpacing: '0.5px' }} className="gold-text">
                        Pioneer Institutional Growth with Aurelian TD Trade.
                    </p>
                    <p style={{ marginBottom: '24px', fontSize: '15px', color: 'var(--text-secondary)', opacity: 0.9 }}>
                        We specialize in sophisticated institutional trading strategies, enabling capital appreciation through rigorous methodologies and elite-tier market intelligence.
                    </p>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        marginBottom: '32px',
                        padding: '24px',
                        background: 'rgba(212, 175, 55, 0.05)',
                        borderRadius: '20px',
                        border: '1px solid var(--glass-border)'
                    }}>
                        {[
                            'Institutional-grade derivatives execution',
                            'Precision risk-parity frameworks',
                            'Real-time performance analytics',
                            'Tier-1 liquidity access',
                            'Bespoke white-glove advisory'
                        ].map((item, index) => (
                            <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '14px', color: 'var(--text-primary)' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    background: 'var(--primary-gold)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 10px var(--primary-gold)'
                                }} />
                                <span style={{ fontWeight: '700', letterSpacing: '0.3px' }}>{item}</span>
                            </div>
                        ))}
                    </div>

                    <p style={{ marginBottom: '24px', fontSize: '15px', color: 'var(--text-secondary)', opacity: 0.9 }}>
                        Aurelian TD Trade provides the infrastructure for consistent, high-conviction participation in global financial markets, tailored for discerning traders.
                    </p>

                    <div style={{
                        marginBottom: '40px',
                        padding: '16px',
                        textAlign: 'center',
                        background: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid var(--primary-gold)'
                    }}>
                        <span style={{ fontWeight: '800', fontSize: '15px', color: 'var(--primary-gold)', letterSpacing: '1px' }}>
                            🏛️ ELEVATE YOUR CAPITAL DEPLOYMENT
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="gold-button"
                        style={{
                            width: '100%',
                            padding: '18px',
                            fontSize: '16px',
                            fontWeight: '800',
                            letterSpacing: '1px'
                        }}>
                        EXPERIENCE AURELIAN EXCELLENCE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
