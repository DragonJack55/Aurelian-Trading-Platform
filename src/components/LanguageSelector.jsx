import React from 'react';
import { Globe, X, Check, Wallet, ArrowRightLeft, RefreshCw, Gift, CreditCard } from 'lucide-react';

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

const menuOptions = [
    { label: 'Deposit', icon: Wallet, code: 'deposit', color: '#10B981' },
    { label: 'Withdrawal', icon: CreditCard, code: 'withdrawal', color: '#EF4444' },
    { label: 'Exchange', icon: RefreshCw, code: 'exchange', color: '#F59E0B' },
    { label: 'My promotion', icon: Gift, code: 'promotion', color: '#8B5CF6' },
];

const LanguageSelector = ({ isOpen, onClose, currentLang, onSelect, onMenuAction }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }} onClick={onClose}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '24px',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div className="gold-text" style={{ fontWeight: '800', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Globe size={22} /> Preference
                    </div>
                    <X onClick={onClose} style={{ cursor: 'pointer', color: 'var(--primary-gold)' }} />
                </div>

                <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        {menuOptions.map((option) => (
                            <div key={option.code}
                                onClick={() => {
                                    if (onMenuAction) {
                                        onMenuAction(option.code);
                                    }
                                    onClose();
                                }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    background: 'var(--bg-deep)',
                                    border: '1px solid var(--glass-border)',
                                    transition: 'all 0.3s ease'
                                }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'rgba(212, 175, 55, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <option.icon size={20} color="var(--primary-gold)" />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{option.label}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '24px 0' }} />

                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary-gold)', marginBottom: '16px', letterSpacing: '1px', textTransform: 'uppercase' }}>Select Language</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {languages.map(lang => (
                            <div key={lang.code}
                                onClick={() => { onSelect(lang.code); onClose(); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '14px 20px',
                                    borderRadius: '14px',
                                    cursor: 'pointer',
                                    background: currentLang === lang.code ? 'var(--bg-deep)' : 'transparent',
                                    border: currentLang === lang.code ? '1px solid var(--primary-gold)' : '1px solid var(--glass-border)',
                                    transition: 'all 0.3s ease'
                                }}>
                                <img src={lang.flag} alt={lang.name} style={{ width: '28px', height: '20px', borderRadius: '4px', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', flex: 1 }}>{lang.name}</span>
                                {currentLang === lang.code && <Check size={18} color="var(--primary-gold)" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;
