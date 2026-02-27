import React from 'react';
import { X } from 'lucide-react';

const ContractDetail = ({ contract, onClose }) => {
    if (!contract) return null;

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const isPending = contract.status === 'pending';
    const profit = contract.result || 0;
    const isProfit = profit >= 0;
    const contractNumber = contract.id;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} onClick={onClose}>
            <div className="card"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    background: '#121212',
                    border: '1px solid var(--primary-gold)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    borderRadius: '16px',
                    padding: 0
                }}>

                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to right, rgba(212, 175, 55, 0.1), transparent)'
                }}>
                    <h2 className="gold-text" style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {contract.symbol}
                    </h2>
                    <X onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-secondary)', transition: 'color 0.2s' }} size={20} />
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Large Profit Display */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '30px',
                        padding: '30px 20px',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{
                            fontSize: '48px',
                            fontWeight: '800',
                            color: isPending ? 'var(--primary-gold)' : (isProfit ? '#22c55e' : '#ef4444'),
                            marginBottom: '8px',
                            letterSpacing: '-1px',
                            textShadow: isPending ? '0 0 20px rgba(212, 175, 55, 0.3)' : (isProfit ? '0 0 20px rgba(34, 197, 94, 0.3)' : '0 0 20px rgba(239, 68, 68, 0.3)')
                        }}>
                            {isPending ? `${contract.remainingTime}s` : (isProfit ? '+' : '') + '$' + profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </div>
                        {!isPending && (
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                opacity: 0.8
                            }}>
                                {isProfit ? 'Total Profit' : 'Total Loss'}
                            </div>
                        )}
                        {isPending && (
                            <div style={{ fontSize: '12px', color: 'var(--primary-gold)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', animation: 'pulse 2s infinite' }}>
                                Awaiting Delivery
                            </div>
                        )}
                    </div>

                    {/* Contract Details Table */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        paddingBottom: '10px'
                    }}>
                        {[
                            { label: 'Trading Direction', value: contract.direction === 'up' ? 'Buy Up / Long' : 'Buy Down / Short', color: contract.direction === 'up' ? '#22c55e' : '#ef4444' },
                            { label: 'Contract Number', value: contractNumber, color: 'var(--text-secondary)', mono: true },
                            { label: 'Opening Price', value: contract.entryPrice },
                            { label: 'Closing Price', value: contract.exitPrice || 'Pending...', color: !contract.exitPrice && 'var(--primary-gold)' },
                            { label: 'Delivery Time', value: `${contract.duration} Seconds` },
                            { label: 'Profit Rate', value: `${contract.profitRate}%`, color: 'var(--primary-gold)' },
                            { label: 'Opening Time', value: formatDateTime(contract.startTime) },
                            {
                                label: 'Closing Time',
                                value: isPending
                                    ? 'In progress...'
                                    : (contract.completedAt
                                        ? formatDateTime(contract.completedAt)
                                        : formatDateTime((typeof contract.startTime === 'string' ? new Date(contract.startTime).getTime() : contract.startTime) + (contract.duration * 1000)))
                            },
                        ].map((item, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: '12px',
                                borderBottom: '1px solid rgba(255,255,255,0.03)'
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    color: 'var(--text-muted)',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {item.label}
                                </span>
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: item.color || 'var(--text-primary)',
                                    fontFamily: item.mono ? 'monospace' : 'inherit'
                                }}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDetail;
