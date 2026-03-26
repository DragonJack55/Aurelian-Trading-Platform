import React, { useState, useEffect } from 'react';
import { subscribeToTicker } from '../services/binance';

const DEFAULT_ASSETS = [
    { symbol: 'BTCUSDT', sub: 'Bitcoin' },
    { symbol: 'ETHUSDT', sub: 'Ethereum' },
    { symbol: 'SOLUSDT', sub: 'Solana' },
    { symbol: 'BNBUSDT', sub: 'Binance' },
    { symbol: 'XRPUSDT', sub: 'Ripple' },
    { symbol: 'ADAUSDT', sub: 'Cardano' },
    { symbol: 'AVAXUSDT', sub: 'Avalanche' },
    { symbol: 'DOGEUSDT', sub: 'Dogecoin' },
    { symbol: 'DOTUSDT', sub: 'Polkadot' },
    { symbol: 'MATICUSDT', sub: 'Polygon' }
];

const BottomTicker = () => {
    const [prices, setPrices] = useState(DEFAULT_ASSETS.map(a => ({ ...a, price: '0.00', change: '0.00%' })));

    useEffect(() => {
        const symbols = DEFAULT_ASSETS.map(a => a.symbol);
        const unsubscribe = subscribeToTicker(symbols, (data) => {
            const updateAsset = (ticker) => {
                setPrices(prev => prev.map(asset => {
                    if (asset.symbol === ticker.s) {
                        return {
                            ...asset,
                            price: parseFloat(ticker.c).toFixed(asset.symbol.includes('SHIB') ? 8 : 2),
                            change: `${parseFloat(ticker.P).toFixed(2)}%`,
                        };
                    }
                    return asset;
                }));
            };

            if (Array.isArray(data)) data.forEach(updateAsset);
            else updateAsset(data);
        });

        return () => unsubscribe();
    }, []);

    const getIconUrl = (symbol) => {
        const base = symbol.replace('USDT', '').toLowerCase();
        return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${base}.png`;
    };

    return (
        <div className="fixed bottom-16 lg:bottom-0 left-0 w-full bg-white/90 dark:bg-[#05080F]/95 backdrop-blur-md border-t border-gray-100 dark:border-white/10 py-2.5 z-40 flex overflow-hidden transition-all duration-500 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-none">
            <div className="ticker-scroll flex gap-16 whitespace-nowrap pl-4 items-center">
                {prices.map((asset, i) => (
                    <div key={`${asset.symbol}-${i}`} className="flex items-center gap-3 text-[11px] font-mono tracking-tight group">
                        <img 
                            src={getIconUrl(asset.symbol)} 
                            alt="" 
                            className="w-4 h-4 rounded-full transition-all" 
                            onError={(e) => { e.target.style.display = 'none' }} 
                        />
                        <span className="text-gray-400 font-bold uppercase">{asset.symbol.replace('USDT', '')}</span>
                        <span className="text-gray-900 dark:text-white font-medium">${asset.price}</span>
                        <span className={`flex items-center gap-0.5 font-bold ${asset.change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                            {asset.change.startsWith('-') ? '▼' : '▲'} {asset.change.replace(/[+-]/, '')}
                        </span>
                    </div>
                ))}
                {/* Duplicate for seamless loop */}
                {prices.map((asset, i) => (
                    <div key={`dup-${asset.symbol}-${i}`} className="flex items-center gap-3 text-[11px] font-mono tracking-tight group">
                        <img 
                            src={getIconUrl(asset.symbol)} 
                            alt="" 
                            className="w-4 h-4 rounded-full transition-all" 
                            onError={(e) => { e.target.style.display = 'none' }} 
                        />
                        <span className="text-gray-400 font-bold uppercase">{asset.symbol.replace('USDT', '')}</span>
                        <span className="text-gray-900 dark:text-white font-medium">${asset.price}</span>
                        <span className={`flex items-center gap-0.5 font-bold ${asset.change.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                            {asset.change.startsWith('-') ? '▼' : '▲'} {asset.change.replace(/[+-]/, '')}
                        </span>
                    </div>
                ))}
            </div>
            <style jsx="true">{`
                @keyframes tickerScroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .ticker-scroll {
                    animation: tickerScroll 60s linear infinite;
                    width: max-content;
                }
                .ticker-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default BottomTicker;
