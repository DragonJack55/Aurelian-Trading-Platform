import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Upload, Loader2, Wallet } from 'lucide-react';
import { subscribeToDepositSettings } from '../services/settingsService';
import { submitDeposit } from '../services/depositService';

const DepositModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('USDT');
    const [settings, setSettings] = useState({ btcAddress: '', ethAddress: '', usdtAddress: '' });
    const [copied, setCopied] = useState(false);
    const [amount, setAmount] = useState('');
    const [proofPreview, setProofPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        const unsubscribe = subscribeToDepositSettings((data) => {
            setSettings(data);
        });
        return () => unsubscribe();
    }, [isOpen]);

    const getCurrentAddress = () => {
        switch (activeTab) {
            case 'BTC': return settings.btcAddress;
            case 'ETH': return settings.ethAddress;
            case 'USDT': return settings.usdtAddress;
            default: return '';
        }
    };

    const getCurrentQr = () => {
        switch (activeTab) {
            case 'BTC': return settings.btcQr;
            case 'ETH': return settings.ethQr;
            case 'USDT': return settings.usdtQr;
            default: return null;
        }
    };

    const handleCopy = () => {
        const addr = getCurrentAddress();
        if (addr) {
            navigator.clipboard.writeText(addr);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitDeposit = async () => {
        if (!amount || !proofPreview) {
            alert('Please enter amount and upload proof of payment.');
            return;
        }

        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert('Please log in to submit a deposit.');
            return;
        }
        const user = JSON.parse(userStr);

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const result = await submitDeposit({
                userId: user.email,
                userEmail: user.email,
                currency: activeTab,
                amount: amount,
                proofBase64: proofPreview
            });

            if (result.success) {
                setSubmitStatus('success');
                setAmount('');
                setProofPreview(null);
                setTimeout(() => {
                    setSubmitStatus(null);
                    onClose();
                }, 3000);
            } else {
                setSubmitStatus('error');
                alert('Failed to submit: ' + result.error);
            }
        } catch (err) {
            console.error(err);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[2000] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface-dark border border-white/10 p-4 md:p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Wallet className="text-primary" size={20} />
                        <h2 className="text-xl font-bold text-white tracking-wide font-display">DEPOSIT</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="text-gray-400 hover:text-white" size={20} />
                    </button>
                </div>

                {/* Currency Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-xl border border-white/5">
                    {['USDT', 'BTC', 'ETH'].map(coin => (
                        <button
                            key={coin}
                            onClick={() => {
                                setActiveTab(coin);
                                setCopied(false);
                            }}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === coin
                                ? 'bg-primary text-black shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {coin}
                        </button>
                    ))}
                </div>

                {/* QR Code Section */}
                <div className="mb-6">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Scan QR Code</div>
                    <div className="bg-white p-6 rounded-2xl border-4 border-primary/20 flex items-center justify-center relative min-h-[180px]">
                        {getCurrentQr() ? (
                            <img src={getCurrentQr()} alt={`${activeTab} QR Code`} className="w-40 h-40" />
                        ) : (
                            <div className="text-center text-gray-500">
                                <div className="text-base font-bold text-black mb-1">{activeTab} QR</div>
                                <div className="text-xs font-medium">Not configured</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Address Section */}
                <div className="mb-6">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Wallet Address ({activeTab})</div>
                    <div className="flex gap-2 items-center bg-black/40 border border-white/10 rounded-xl p-3">
                        <div className="flex-1 font-mono text-xs text-gray-300 break-all">
                            {getCurrentAddress() || 'Address unavailable'}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`p-2 rounded-lg border transition-all ${copied
                                ? 'bg-green-500/10 border-green-500 text-green-500'
                                : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                                }`}
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                {/* Payment Proof Section */}
                <div className="border-t border-white/10 pt-6">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Submit Payment Proof</div>

                    {/* Amount Input */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-1">Deposit Amount ({activeTab})</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="block text-xs text-gray-500 mb-1">Upload Receipt</label>
                        <div
                            onClick={() => document.getElementById('proof-upload').click()}
                            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${proofPreview ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-black/20 hover:bg-white/5'
                                }`}
                        >
                            <input
                                id="proof-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {proofPreview ? (
                                <div className="relative w-full h-32">
                                    <img src={proofPreview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setProofPreview(null);
                                        }}
                                        className="absolute top-0 right-0 p-1 bg-black/60 text-white rounded-bl-lg hover:bg-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="text-gray-400 mb-2" size={24} />
                                    <span className="text-xs text-gray-500">Tap to upload proof</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleSubmitDeposit}
                        disabled={isSubmitting || !amount || !proofPreview}
                        className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Processing...
                            </>
                        ) : submitStatus === 'success' ? (
                            <>
                                <Check size={18} />
                                Deposited Successfully
                            </>
                        ) : (
                            'Confirm Deposit'
                        )}
                    </button>
                    {submitStatus === 'error' && (
                        <p className="mt-3 text-center text-xs text-red-500 font-medium">
                            Submission failed. Please try again.
                        </p>
                    )}
                </div>

                <div className="mt-6 p-3 bg-red-500/10 border-l-2 border-red-500 rounded-r-lg">
                    <p className="text-[10px] text-red-400 leading-relaxed">
                        <strong className="block uppercase text-[9px] mb-1 opacity-75">Warning</strong>
                        Only send {activeTab} to this address. Sending other assets will result in permanent loss.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DepositModal;
