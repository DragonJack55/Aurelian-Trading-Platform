import React, { useEffect, useState } from 'react';
import { subscribeToTicker } from '../services/binance';
import Sparkline from '../components/Sparkline';

import { Menu, CheckCircle2 } from 'lucide-react';

// Map symbols to icon URLs


import { assets as initialAssets, getIconUrl } from '../data/assets';

const Quotes = () => {
  const [assets, setAssets] = useState(initialAssets);

  const [activeTab, setActiveTab] = useState('Favorites');
  const [activeSubTab, setActiveSubTab] = useState('All');

  // Filter assets
  const getFilteredAssets = () => {
    let list = [];
    switch (activeTab) {
      case 'Favorites': {
        const collected = JSON.parse(localStorage.getItem('collected_assets') || '[]');
        // Default favorites
        if (collected.length === 0) {
          return assets.filter(a => ['BTCUSDT', 'ETHUSDT', 'OKBUSDT', 'XRPUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT', 'BCHUSDT'].includes(a.symbol));
        }
        list = assets.filter(a => collected.includes(a.symbol));
        break;
      }
      case 'Crypto': list = assets.filter(a => a.type === 'crypto'); break;
      case 'Spot': list = assets.filter(a => a.type === 'crypto' || a.type === 'spot'); break;
      case 'Futures': list = assets.filter(a => a.type === 'futures'); break;
      case 'Options': list = assets.filter(a => a.type === 'options'); break;
      default: list = assets.filter(a => a.type === 'crypto');
    }

    // Sub-tab filter
    if (activeSubTab !== 'All' && activeTab === 'Crypto') {
      if (activeSubTab === 'Meme') return list.filter(a => ['DOGEUSDT', 'SHIBUSDT'].includes(a.symbol));
      if (activeSubTab === 'Solana') return list.filter(a => a.symbol.includes('SOL'));
      if (activeSubTab === 'Layer 1') return list.filter(a => ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'AVAXUSDT'].includes(a.symbol));
    }
    return list;
  };

  const filteredAssets = getFilteredAssets();

  useEffect(() => {
    // Init favorites if empty
    const collected = JSON.parse(localStorage.getItem('collected_assets') || '[]');
    if (collected.length === 0) {
      localStorage.setItem('collected_assets', JSON.stringify(['BTCUSDT', 'ETHUSDT', 'OKBUSDT', 'XRPUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT', 'BCHUSDT']));
    }

    // Subscribe
    const symbolsToSubscribe = assets
      .filter(a => a.type === 'crypto' || a.type === 'spot')
      .map(a => a.symbol);

    const unsubscribe = subscribeToTicker(symbolsToSubscribe, (data) => {
      const updateAsset = (ticker) => {
        setAssets(prev => prev.map(asset => {
          if (asset.symbol === ticker.s) {
            const newPrice = parseFloat(ticker.c);
            const newHistory = [...asset.history, newPrice].slice(-10);
            return {
              ...asset,
              price: newPrice.toFixed(asset.symbol.includes('SHIB') ? 8 : (asset.price < 1 ? 6 : 2)),
              change: `${parseFloat(ticker.P).toFixed(2)}%`,
              high: parseFloat(ticker.h).toFixed(2),
              low: parseFloat(ticker.l).toFixed(2),
              history: newHistory
            };
          }
          return asset;
        }));
      };

      if (Array.isArray(data)) data.forEach(updateAsset);
      else updateAsset(data);
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen container mx-auto px-4 pb-20">
      {/* Header */}
      <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-8 pt-6">Markets</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-white/10 mb-6 overflow-x-auto">
        {['Favorites', 'Crypto', 'Spot', 'Futures', 'Options'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === tab
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sub-Tabs */}
      {activeTab === 'Crypto' && (
        <div className="flex gap-2 overflow-x-auto mb-6 custom-scrollbar pb-2">
          {['All', 'Top', 'New', 'AI', 'Solana', 'RWA', 'Meme', 'Payment', 'DeFi', 'Layer 1'].map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSubTab(sub)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeSubTab === sub
                ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 mb-8">

        {/* Hot Crypto Carousel - Now Grid on Large */}
        {!activeTab.includes('Favorites') && (
          <>
            <div className="flex-1 bg-white dark:bg-surface-dark/40 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Hot Crypto</h3>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">Spot</span>
                </div>
              </div>
              <div className="space-y-4">
                {[initialAssets[0], initialAssets[1], initialAssets[2]].map(asset => (
                  <div key={asset.symbol} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={getIconUrl(asset.symbol)} className="w-8 h-8" onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/6001/6001368.png' }} />
                      <span className="font-bold text-gray-900 dark:text-white">{asset.sub}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 dark:text-white font-medium">{asset.price}</div>
                      <div className={`text-xs ${asset.change.startsWith('-') ? 'text-accent-red' : 'text-accent-green'}`}>{asset.change}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-surface-dark/40 backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">New Listings</h3>
              </div>
              <div className="space-y-4">
                {[
                  { s: 'BREVUSDT', p: '0.3772', c: '-9.91%', tags: ['Perp', 'Pro'], icon: 'https://cdn-icons-png.flaticon.com/512/6001/6001527.png' },
                  { s: 'LITUSDT', p: '2.536', c: '-8.65%', tags: ['Perp'], icon: 'https://cdn-icons-png.flaticon.com/512/6001/6001569.png' },
                  { s: 'LIGHTUSDT', p: '1.7561', c: '+286.55%', tags: ['Perp'], icon: 'https://cdn-icons-png.flaticon.com/512/6001/6001368.png' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={item.icon} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{item.s}</div>
                        <div className="flex gap-1">
                          {item.tags.map(tag => (
                            <span key={tag} className={`text-[9px] px-1 rounded ${tag === 'Perp' ? 'bg-amber-900/40 text-amber-500' : 'bg-white/10 text-gray-400'}`}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 dark:text-white font-medium">{item.p}</div>
                      <div className={`text-xs ${item.c.startsWith('-') ? 'text-accent-red' : 'text-accent-green'}`}>{item.c}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Assets Grid/List */}
      {activeTab === 'Favorites' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div key={asset.symbol} className="group relative overflow-hidden bg-white dark:bg-surface-dark/40 backdrop-blur-md border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-surface-dark/60 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(255,215,0,0.1)] cursor-pointer">
              {/* Hover Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={getIconUrl(asset.symbol.replace('_PERP', '').split('-')[0])}
                    className="w-12 h-12 rounded-full relative z-10 transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-110 shadow-lg"
                    onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/6001/6001368.png' }}
                  />
                </div>
                <div>
                  <div className="font-display font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary transition-colors duration-300">{asset.name.split('/')[0]}</div>
                  <div className="text-xs text-gray-400 font-medium tracking-wide uppercase group-hover:text-gray-300 transition-colors">{asset.sub}</div>
                </div>
              </div>
              <div className="relative z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <CheckCircle2 size={18} className="text-gray-500 group-hover:text-primary transition-colors duration-300" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-dark/40 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-4 px-6 py-4 border-b border-gray-200 dark:border-white/5 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div>Name</div>
            <div className="text-right">Price</div>
            <div className="text-right">24h Change</div>
            <div className="text-right hidden sm:block">Chart</div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No assets found.</div>
          ) : (
            filteredAssets.map((asset, index) => (
              <div key={index} className="grid grid-cols-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer items-center border-b border-gray-200 dark:border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <img src={getIconUrl(asset.symbol.replace('_PERP', '').split('-')[0])}
                    onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/6001/6001368.png' }}
                    className="w-8 h-8 rounded-full shadow-sm" />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">{asset.sub}</div>
                    <div className="flex items-center gap-2">
                      {asset.type === 'futures' && <span className="text-[9px] bg-amber-900/40 text-amber-500 px-1 rounded font-bold">PERP</span>}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{asset.symbol.replace('_PERP', '')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-gray-900 dark:text-white font-medium">{asset.price}</div>

                <div className={`text-right font-medium ${asset.change.startsWith('-') ? 'text-accent-red' : 'text-accent-green'}`}>
                  {asset.change}
                </div>

                <div className="hidden sm:flex justify-end opacity-80">
                  <Sparkline data={asset.history} color={asset.change.startsWith('-') ? '#ff4d4f' : '#0ecb81'} width={80} height={35} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default Quotes;
