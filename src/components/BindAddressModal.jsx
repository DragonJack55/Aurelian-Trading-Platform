import React, { useState, useEffect } from 'react';
import { X, Save, Wallet } from 'lucide-react';

const BindAddressModal = ({ isOpen, onClose }) => {
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Load existing address if any
            const savedAddress = localStorage.getItem('boundWithdrawalAddress');
            if (savedAddress) {
                setAddress(savedAddress);
            }
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call/processing
        setTimeout(() => {
            localStorage.setItem('boundWithdrawalAddress', address);
            setSuccess('Address bound successfully!');
            setIsSubmitting(false);

            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 1500);
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[2000] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface-dark border border-white/10 p-4 md:p-6 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Wallet className="text-primary" size={20} />
                        <h2 className="text-xl font-bold text-white tracking-wide font-display">BIND ADDRESS</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="text-gray-400 hover:text-white" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">USDT Address (TRC20)</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your withdrawal address"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all font-mono text-sm"
                        />
                    </div>

                    {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs font-bold text-center">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                        <Save size={20} />
                        {isSubmitting ? 'SAVING...' : 'SAVE ADDRESS'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BindAddressModal;
