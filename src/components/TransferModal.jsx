import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Mail, AlertCircle, Info } from 'lucide-react';
import { getUserByEmail, incrementUserPoints } from '../services/userService';
import { saveTrade } from '../services/tradeService';

const TransferModal = ({ isOpen, onClose }) => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const user = JSON.parse(localStorage.getItem('user'));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) {
            setError('Please login to transfer.');
            return;
        }

        if (user.isFrozen) {
            setError('Account frozen. Contact support.');
            return;
        }

        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            setError('Invalid amount.');
            return;
        }

        if ((user.points || 0) < withdrawAmount) {
            setError('Insufficient balance.');
            return;
        }

        if (recipientEmail === user.email) {
            setError('Cannot transfer to yourself.');
            return;
        }

        if (user.password && user.password !== password) {
            setError('Incorrect password.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Check if recipient exists
            const recipientRes = await getUserByEmail(recipientEmail);
            if (!recipientRes.success) {
                setError('Recipient email not found.');
                setIsSubmitting(false);
                return;
            }

            // 2. Deduct from Sender
            const deductRes = await incrementUserPoints(user.email, -withdrawAmount);
            if (!deductRes.success) {
                setError('Transfer failed: ' + deductRes.error);
                setIsSubmitting(false);
                return;
            }

            // 3. Add to Recipient
            await incrementUserPoints(recipientEmail, withdrawAmount);

            // 4. Record Transaction
            await saveTrade(user.email, {
                type: 'TRANSFER_OUT',
                amount: withdrawAmount,
                asset: 'USD',
                to: recipientEmail,
                status: 'completed'
            });

            await saveTrade(recipientEmail, {
                type: 'TRANSFER_IN',
                amount: withdrawAmount,
                asset: 'USD',
                from: user.email,
                status: 'completed'
            });

            setSuccess('Transfer successful!');
            setAmount('');
            setRecipientEmail('');
            setPassword('');

            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 2000);

        } catch (err) {
            setError('An error occurred: ' + err.message);
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
                        <ArrowRight className="text-primary" size={20} />
                        <h2 className="text-xl font-bold text-white tracking-wide font-display">TRANSFER</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="text-gray-400 hover:text-white" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Recipient Email */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recipient Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="Enter recipient email"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        </div>
                    </div>

                    {/* Amount USD */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount (USD)</label>
                            <span className="text-xs text-primary font-bold">Balance: {user ? parseFloat(user.points || 0).toFixed(2) : '0.00'}</span>
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            min="1"
                            step="any"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-lg font-mono"
                        />
                    </div>

                    {/* Security Password */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Security Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter transaction password"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                            />
                            <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50" size={18} />
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
                        {isSubmitting ? (
                            'PROCESSING...'
                        ) : (
                            <>
                                <ArrowRight size={20} />
                                TRANSFER NOW
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransferModal;
