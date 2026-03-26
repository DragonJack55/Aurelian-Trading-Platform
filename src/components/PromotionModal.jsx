import React from 'react';
import { X, Trophy, Target, TrendingUp, Anchor, ShieldCheck } from 'lucide-react';

const PromotionModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const benefits = [
        { text: 'Institutional-grade derivatives execution', icon: Trophy },
        { text: 'Precision risk-parity frameworks', icon: Target },
        { text: 'Real-time performance analytics', icon: TrendingUp },
        { text: 'Tier-1 liquidity access', icon: Anchor },
        { text: 'Bespoke white-glove advisory', icon: ShieldCheck }
    ];

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white/95 dark:bg-[#111] backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5">
                    <h2 className="text-xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-gold">
                        EXECUTIVE REFERRAL
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        Pioneer Institutional Growth with Aurelian TD Trade.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                        We specialize in sophisticated institutional trading strategies, enabling capital appreciation through rigorous methodologies and elite-tier market intelligence.
                    </p>

                    {/* Feature List */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5 mb-6 space-y-4">
                        {benefits.map((item, index) => {
                            const IconWrapper = item.icon;
                            return (
                                <div key={index} className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <IconWrapper size={14} className="text-primary" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {item.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 text-center">
                        Aurelian TD Trade provides the infrastructure for consistent, high-conviction participation in global financial markets, tailored for discerning traders.
                    </p>

                    {/* Banner */}
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center mb-8">
                        <span className="text-sm font-black text-primary tracking-widest inline-flex items-center gap-2">
                            🏛️ ELEVATE YOUR CAPITAL
                        </span>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 px-6 rounded-xl bg-gradient-gold text-black font-black text-sm tracking-widest hover:shadow-gold transition-all duration-300"
                    >
                        EXPERIENCE EXCELLENCE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
