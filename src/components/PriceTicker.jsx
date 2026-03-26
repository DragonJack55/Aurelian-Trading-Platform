import React from 'react';
import { useCryptoPrices } from '../hooks/useCryptoPrices';

const PriceTicker = () => {
    const { prices, loading } = useCryptoPrices();

    if (loading && prices.length === 0) return null;

    // Duplicate list for seamless infinite scroll
    const displayList = [...prices, ...prices, ...prices];

    return (
        <div className="fixed top-0 w-full z-[60] bg-white dark:bg-[#05080F] border-b border-gray-100 dark:border-[#D4AF37]/20 h-10 flex items-center overflow-hidden transition-colors duration-500">
            <div className="ticker-wrap w-full">
                <div className="ticker-move flex items-center gap-8 animate-ticker">
                    {displayList.map((coin, index) => (
                        <div key={`${coin.id}-${index}`} className="flex items-center gap-2 text-xs font-mono whitespace-nowrap">
                            <span className="font-bold text-[#D4AF37] dark:text-[#D4AF37] opacity-90">{coin.symbol}</span>
                            <span className="text-gray-900 dark:text-white transition-colors duration-500">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className={`flex items-center ${coin.price_change_percentage_24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                <span className="text-[10px] mr-0.5">{coin.price_change_percentage_24h >= 0 ? '▲' : '▼'}</span>
                                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-ticker {
                    animation: ticker 40s linear infinite;
                    width: max-content;
                }
                .ticker-wrap:hover .animate-ticker {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default PriceTicker;
