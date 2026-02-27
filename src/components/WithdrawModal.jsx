import React, { useState, useEffect } from 'react';
import { X, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { submitWithdrawal } from '../services/withdrawalService';
import { incrementUserPoints } from '../services/userService';

const WithdrawModal = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USDT-TRC20'); // Default to match screenshot
    const [walletAddress, setWalletAddress] = useState('');
    const [remark, setRemark] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Mock rates - in a real app these would come from an API
    const rates = {
        'USDT-TRC20': 1,
        'BTC-BTC': 0.00001, // Mock rate: 1 USD = 0.00001 BTC
        'ETH-ERC20': 0.0003, // Mock rate: 1 USD = 0.0003 ETH
        'ETH-ETH': 0.0003
    };

    const handlingFee = 1;

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (isOpen) {
            const boundAddress = localStorage.getItem('boundWithdrawalAddress');
            if (boundAddress && boundAddress !== walletAddress) {
                setWalletAddress(boundAddress);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const getExpectedAmount = () => {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return 0;
        const rate = rates[currency] || 0;
        // Simple mock calculation: (Amount - Fee) * Rate
        const netAmount = Math.max(0, val - handlingFee);
        return (netAmount * rate).toFixed(6);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (!user) {
            setError('You must be logged in to withdraw.');
            setIsSubmitting(false);
            return;
        }

        if (user.isFrozen) {
            setError('Your assets are frozen. Please contact support.');
            setIsSubmitting(false);
            return;
        }

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount.');
            setIsSubmitting(false);
            return;
        }

        if ((user.points || 0) < parseFloat(amount)) {
            setError('Insufficient balance.');
            setIsSubmitting(false);
            return;
        }

        if (String(passwordInput) !== String(user.withdrawPassword)) {
            setError('Invalid Withdraw Password.');
            setIsSubmitting(false);
            return;
        }

        if (!walletAddress.trim()) {
            setError('Please enter your wallet address.');
            setIsSubmitting(false);
            return;
        }

        const [currencyCode, networkType] = currency.includes('-') ? currency.split('-') : [currency, ''];

        const result = await submitWithdrawal({
            userId: user.id || user.email,
            userEmail: user.email,
            amount: parseFloat(amount),
            method: currencyCode, // Updated key from currency to method to match service
            walletType: networkType,
            details: { walletAddress, walletType: networkType }, // Mapping details to JSONB
            userName: user.name || 'User'
        });

        if (result.success) {
            await incrementUserPoints(user.email, -parseFloat(amount));
            setSuccess('Withdrawal request submitted successfully.');
            setAmount('');
            setWalletAddress('');
            setRemark('');
            setPasswordInput('');
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 2000);
        } else {
            setError('Failed to submit request: ' + (result.error?.message || 'Unknown error'));
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[2000] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface-dark border border-white/10 p-4 md:p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <ArrowRight className="text-primary rotate-[-45deg]" size={24} />
                        <h2 className="text-xl font-bold text-white tracking-wide font-display">WITHDRAW</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="text-gray-400 hover:text-white" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Currency Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="USDT-TRC20">USDT-TRC20</option>
                            <option value="BTC-BTC">BTC-BTC</option>
                            <option value="ETH-ERC20">ETH-ERC20</option>
                        </select>
                    </div>

                    {/* Wallet Address */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Wallet Address</label>
                        <input
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="Enter or paste wallet address"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                    </div>

                    {/* Amount USD */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount (USD)</label>
                            <span className="text-xs text-primary font-bold">Balance: {user ? (user.points || 0).toFixed(2) : '0.00'}</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                step="any"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-16 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setAmount(user ? user.points : 0)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-white transition-colors"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    {/* Remark */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Remark (Optional)</label>
                        <input
                            type="text"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Add a note"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                    </div>

                    {/* Withdraw Password */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Withdraw Password</label>
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Enter withdrawal password"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                        />
                    </div>

                    {/* Summary Card */}
                    <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Handling Fee</span>
                            <span className="text-white font-bold">{handlingFee} USD</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                            <span className="text-gray-400 font-bold uppercase tracking-wider">Expected Received</span>
                            <span className="text-primary font-bold font-mono text-lg space-x-1">
                                <span>{getExpectedAmount()}</span>
                                <span className="text-xs text-gray-400 ml-1">{currency.split('-')[0]}</span>
                            </span>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs font-bold">
                            <Info size={16} />
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WithdrawModal;
