import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ArrowRight } from 'lucide-react';

const ExchangeModal = ({ isOpen, onClose }) => {
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('BTC');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    const [rates, setRates] = useState({
        USD: 1,
        USDT: 1,
        BTC: 65000,
        ETH: 3500
    });

    // Mock Rate Fetch
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
                const data = await response.json();
                setRates(prev => ({
                    ...prev,
                    BTC: data.bitcoin.usd,
                    ETH: data.ethereum.usd
                }));
            } catch (error) {
                console.error("Error fetching rates:", error);
                // Keep default/fallback rates
            }
        };
        if (isOpen) {
            fetchRates();
        }
    }, [isOpen]);

    const getConversionRate = (from, to) => {
        const fromRateInUSD = from === 'USD' || from === 'USDT' ? 1 : rates[from];
        const toRateInUSD = to === 'USD' || to === 'USDT' ? 1 : rates[to];

        // If converting From BTC (high value) to USD (low value), we multiply by rate
        // If converting From USD (low value) to BTC (high value), we divide by rate
        // Formula: Amount * (FromRate / ToRate)
        return fromRateInUSD / toRateInUSD;
    };

    const result = amount ? (parseFloat(amount) * getConversionRate(fromCurrency, toCurrency)).toFixed(6) : 0;

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (fromCurrency === toCurrency) {
            setError('Cannot exchange the same currency.');
            return;
        }

        setIsSubmitting(true);
        setSuccess('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            
            const response = await fetch(`${apiUrl}/users/exchange`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fromCurrency,
                    toCurrency,
                    amount: amount
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(`Successfully exchanged ${amount} ${fromCurrency} to ${parseFloat(data.convertedAmount).toFixed(6)} ${toCurrency}`);
                setAmount('');
                setTimeout(() => {
                    setSuccess('');
                    onClose();
                    window.location.reload(); 
                }, 2000);
            } else {
                setError(data.error || 'Exchange failed.');
            }
        } catch (err) {
            console.error('Exchange error:', err);
            setError('An error occurred during exchange.');
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
                        <RefreshCw className="text-primary" size={20} />
                        <h2 className="text-xl font-bold text-white tracking-wide font-display">EXCHANGE</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="text-gray-400 hover:text-white" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">From</label>
                            <select
                                value={fromCurrency}
                                onChange={(e) => setFromCurrency(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="USD">USD</option>
                                <option value="USDT">USDT</option>
                                <option value="BTC">BTC</option>
                                <option value="ETH">ETH</option>
                            </select>
                        </div>
                        <div className="pt-6">
                            <div className="p-2 bg-primary/10 rounded-full border border-primary/50">
                                <ArrowRight className="text-primary" size={18} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">To</label>
                            <select
                                value={toCurrency}
                                onChange={(e) => setToCurrency(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="USD">USD</option>
                                <option value="USDT">USDT</option>
                                <option value="BTC">BTC</option>
                                <option value="ETH">ETH</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</label>
                            {amount && (
                                <span className="text-xs text-primary font-bold">
                                    ≈ {result} {toCurrency}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all text-lg font-mono"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">
                                {fromCurrency}
                            </div>
                        </div>
                    </div>

                    {success && (
                        <div className="flex items-center justify-center p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs font-bold text-center">
                            {success}
                        </div>
                    )}
                    
                    {error && (
                        <div className="flex items-center justify-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                        {isSubmitting ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} />
                                PROCESSING...
                            </>
                        ) : (
                            <>
                                <RefreshCw size={20} />
                                INSTANT EXCHANGE
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExchangeModal;
