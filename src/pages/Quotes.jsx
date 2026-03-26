import React, { useEffect, useState, useCallback } from 'react';
import { subscribeToTicker } from '../services/binance';
import Sparkline from '../components/Sparkline';
import { assets as initialAssets, getIconUrl } from '../data/assets';
import {
  Search, Star, ChevronUp, ChevronDown, ChevronsUpDown,
  TrendingUp, BarChart2, Bitcoin, Zap
} from 'lucide-react';

// ─────────────────────────────────────────────
// Column Definitions per Tab
// ─────────────────────────────────────────────
const CRYPTO_COLS = [
  { key: 'rank',    label: '#',          cls: 'w-8 text-center hidden md:table-cell',    sortable: false },
  { key: 'name',    label: 'Name',       cls: 'w-auto',                                  sortable: true  },
  { key: 'price',   label: 'Price',      cls: 'text-right w-28',                         sortable: true  },
  { key: 'change',  label: '24h %',      cls: 'text-right w-20',                         sortable: true  },
  { key: 'cap',     label: 'Market Cap', cls: 'text-right hidden lg:table-cell w-28',    sortable: false },
  { key: 'history', label: '7d Chart',   cls: 'text-right hidden md:table-cell w-20',    sortable: false },
  { key: 'action',  label: '',           cls: 'text-right hidden md:table-cell w-20',    sortable: false },
];

const FUTURES_COLS = [
  { key: 'rank',     label: '#',             cls: 'w-8 text-center hidden md:table-cell',  sortable: false },
  { key: 'name',     label: 'Contract',      cls: 'w-auto',                                 sortable: true  },
  { key: 'price',    label: 'Mark Price',    cls: 'text-right w-28',                        sortable: true  },
  { key: 'change',   label: '24h %',         cls: 'text-right w-20',                        sortable: true  },
  { key: 'funding',  label: 'Funding Rate',  cls: 'text-right hidden sm:table-cell w-28',   sortable: false },
  { key: 'cap',      label: 'Open Interest', cls: 'text-right hidden lg:table-cell w-32',   sortable: false },
  { key: 'history',  label: '7d Chart',      cls: 'text-right hidden md:table-cell w-20',   sortable: false },
];

const OPTIONS_COLS = [
  { key: 'rank',    label: '#',          cls: 'w-8 text-center hidden md:table-cell',  sortable: false },
  { key: 'name',    label: 'Contract',   cls: 'w-auto',                                sortable: true  },
  { key: 'price',   label: 'Mark Price', cls: 'text-right w-28',                       sortable: true  },
  { key: 'change',  label: '24h %',      cls: 'text-right w-20',                       sortable: true  },
  { key: 'strike',  label: 'Strike',     cls: 'text-right hidden sm:table-cell w-24',  sortable: false },
  { key: 'expiry',  label: 'Expiry',     cls: 'text-right hidden sm:table-cell w-24',  sortable: false },
  { key: 'cap',     label: 'Volume',     cls: 'text-right hidden lg:table-cell w-28',  sortable: false },
];

const TABS = ['Favorites', 'Crypto', 'Spot', 'Futures', 'Options'];

const CRYPTO_SUBTAGS = ['All', 'Layer 1', 'DeFi', 'Meme', 'Solana', 'AI', 'RWA', 'New'];
const SPOT_SUBTAGS   = ['All', 'Metals', 'Forex'];

const STABLECOINS = ['USDTUSDT', 'USDCUSDT'];

// ─────────────────────────────────────────────
// Sub-tag filter logic
// ─────────────────────────────────────────────
const matchesSubTag = (asset, sub) => {
  if (sub === 'All') return true;
  if (sub === 'Meme')    return ['DOGEUSDT','SHIBUSDT','PEPEUSDT'].includes(asset.symbol);
  if (sub === 'Solana')  return asset.symbol.includes('SOL');
  if (sub === 'Layer 1') return ['BTCUSDT','ETHUSDT','ADAUSDT','AVAXUSDT','NEARUSDT','DOTUSDT'].includes(asset.symbol);
  if (sub === 'DeFi')    return ['UNIUSDT','AAVEUSDT','MKRUSDT','ARBUSDT','OPUSDT','LDOUSDT'].includes(asset.symbol);
  if (sub === 'AI')      return ['RNDRUSDT','FETUSDT','IMXUSDT'].includes(asset.symbol);
  if (sub === 'RWA')     return ['MKRUSDT','RLCUSDT'].includes(asset.symbol);
  if (sub === 'New')     return ['IMXUSDT','STXUSDT','TONUSDT'].includes(asset.symbol);
  // Spot
  if (sub === 'Metals')  return ['XAUUSD','XAGUSD'].includes(asset.symbol);
  if (sub === 'Forex')   return ['EURUSD','AUDUSD'].includes(asset.symbol);
  return true;
};

// ─────────────────────────────────────────────
// Sort helper
// ─────────────────────────────────────────────
const sortAssets = (list, key, dir) => {
  if (!key || dir === 'none') return list;
  return [...list].sort((a, b) => {
    let va, vb;
    if (key === 'price')  { va = parseFloat(a.price);  vb = parseFloat(b.price);  }
    if (key === 'change') { va = parseFloat(a.change); vb = parseFloat(b.change); }
    if (key === 'name')   { va = (a.sub || '').toLowerCase(); vb = (b.sub || '').toLowerCase(); return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va); }
    if (va === undefined) return 0;
    return dir === 'asc' ? va - vb : vb - va;
  });
};

// ─────────────────────────────────────────────
// SortIcon
// ─────────────────────────────────────────────
const SortIcon = ({ col, sortKey, sortDir }) => {
  if (!col.sortable) return null;
  if (sortKey !== col.key) return <ChevronsUpDown size={12} className="inline ml-1 text-gray-400 opacity-40" />;
  if (sortDir === 'asc')  return <ChevronUp  size={12} className="inline ml-1 text-primary" />;
  return <ChevronDown size={12} className="inline ml-1 text-primary" />;
};

// ─────────────────────────────────────────────
// ChangeChip
// ─────────────────────────────────────────────
const ChangeChip = ({ value }) => {
  const isNeg = String(value).startsWith('-');
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
      isNeg ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
    }`}>
      {isNeg ? <ChevronDown size={10}/> : <ChevronUp size={10}/>}
      {String(value).replace(/[+-]/, '')}
    </span>
  );
};

// ─────────────────────────────────────────────
// Market Overview Strip
// ─────────────────────────────────────────────
const OVERVIEW = [
  { label: 'Total Market Cap', value: '$2.87T', sub: '+1.2% today',     icon: TrendingUp, color: 'text-emerald-500' },
  { label: '24h Volume',       value: '$98.4B', sub: 'Global turnover', icon: BarChart2,  color: 'text-primary'     },
  { label: 'BTC Dominance',    value: '53.4%',  sub: 'of total cap',    icon: Bitcoin,    color: 'text-orange-400'  },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const Quotes = () => {
  const [assets, setAssets] = useState(initialAssets);
  const [activeTab, setActiveTab]         = useState('Crypto');
  const [activeSubTag, setActiveSubTag]   = useState('All');
  const [search, setSearch]               = useState('');
  const [sortKey, setSortKey]             = useState('');
  const [sortDir, setSortDir]             = useState('none'); // 'asc' | 'desc' | 'none'
  const [favorites, setFavorites]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('collected_assets') || '[]'); } catch { return []; }
  });

  // Live tickers
  useEffect(() => {
    const symbols = assets.filter(a => a.type === 'crypto' || a.type === 'spot').map(a => a.symbol);
    const unsub = subscribeToTicker(symbols, (data) => {
      const update = (t) => setAssets(prev => prev.map(a => {
        if (a.symbol !== t.s) return a;
        const p = parseFloat(t.c);
        return {
          ...a,
          price: p.toFixed(a.symbol.includes('SHIB') ? 8 : p < 1 ? 6 : 2),
          change: `${parseFloat(t.P).toFixed(2)}%`,
          high: parseFloat(t.h).toFixed(2),
          low: parseFloat(t.l).toFixed(2),
          history: [...a.history, p].slice(-10),
        };
      }));
      if (Array.isArray(data)) data.forEach(update); else update(data);
    });
    return () => unsub();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Column set
  const cols = activeTab === 'Futures' ? FUTURES_COLS
             : activeTab === 'Options' ? OPTIONS_COLS
             : CRYPTO_COLS;

  // Sub-tags
  const subTags = activeTab === 'Crypto' ? CRYPTO_SUBTAGS
                : activeTab === 'Spot'   ? SPOT_SUBTAGS
                : null;

  // Filter
  const baseList = (() => {
    if (activeTab === 'Favorites') {
      return assets.filter(a => favorites.includes(a.symbol));
    }
    if (activeTab === 'Crypto')  return assets.filter(a => a.type === 'crypto' && !STABLECOINS.includes(a.symbol));
    if (activeTab === 'Spot')    return assets.filter(a => a.type === 'spot');
    if (activeTab === 'Futures') return assets.filter(a => a.type === 'futures');
    if (activeTab === 'Options') return assets.filter(a => a.type === 'options');
    return [];
  })();

  const afterSubTag = subTags ? baseList.filter(a => matchesSubTag(a, activeSubTag)) : baseList;

  const afterSearch = search.trim()
    ? afterSubTag.filter(a =>
        a.sub.toLowerCase().includes(search.toLowerCase()) ||
        a.symbol.toLowerCase().includes(search.toLowerCase()))
    : afterSubTag;

  const displayList = sortAssets(afterSearch, sortKey, sortDir).map((a, i) => ({ ...a, rank: i + 1 }));

  // Sort cycle
  const handleSort = useCallback((key) => {
    setSortKey(prev => {
      if (prev !== key) { setSortDir('desc'); return key; }
      setSortDir(d => d === 'desc' ? 'asc' : d === 'asc' ? 'none' : 'desc');
      return key;
    });
  }, []);

  // Favorite toggle
  const toggleFav = (symbol) => {
    setFavorites(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      localStorage.setItem('collected_assets', JSON.stringify(next));
      return next;
    });
  };

  // Tab change resets sub-tag + sort
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveSubTag('All');
    setSortKey('');
    setSortDir('none');
    setSearch('');
  };

  // Options-specific helpers
  const getStrike  = (sym) => { const m = sym.match(/-(\d+)-/); return m ? `$${parseInt(m[1]).toLocaleString()}` : 'N/A'; };
  const getExpiry  = (sym) => { const m = sym.match(/(\d+[A-Z]+)/); return m ? m[1] : 'N/A'; };
  const getOptType = (sym) => sym.endsWith('-C') ? 'Call' : sym.endsWith('-P') ? 'Put' : '';

  return (
    <div className="min-h-screen pb-28 lg:pb-8 pt-4 lg:pt-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">Markets</h1>
            <p className="text-xs text-gray-500 mt-1">Live prices across crypto, spot, futures &amp; options</p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search markets…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* ── Market Overview Strip ── */}
        <div className="flex overflow-x-auto pb-4 mb-2 -mx-3 px-3 gap-3 md:grid md:grid-cols-3 md:pb-0 md:mb-6 md:mx-0 md:px-0 custom-scrollbar-hide">
          {OVERVIEW.map((item) => (
            <div key={item.label} className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[160px] md:min-w-0 shrink-0 md:shrink">
              <div className={`w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center ${item.color} shrink-0`}>
                {React.createElement(item.icon, { size: 16 })}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.value}</div>
                <div className="text-[10px] text-gray-500 truncate">{item.label}</div>
                <div className={`text-[10px] font-medium ${item.color}`}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Tabs ── */}
        <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl mb-4 w-full overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 min-w-max flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white dark:bg-[#05080F] text-gray-900 dark:text-white shadow-md dark:shadow-black/30'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'Favorites' && <Star size={13} className={favorites.length ? 'text-primary fill-primary' : ''} />}
              {tab}
              {tab === 'Favorites' && favorites.length > 0 && (
                <span className="bg-primary text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Sub-Tags ── */}
        {subTags && (
          <div className="flex gap-2 overflow-x-auto mb-4 pb-1 custom-scrollbar">
            {subTags.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubTag(sub)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeSubTag === sub
                    ? 'bg-primary text-black border-primary'
                    : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-primary/40 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* ── Asset Table ── */}
        <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
          <div>
            <table className="w-full text-sm table-fixed">
              {/* Head */}
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  {/* Star col */}
                  <th className="w-8 pl-4 py-3 text-left"></th>
                  {cols.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`py-3 px-3 text-[11px] font-bold text-gray-400 select-none whitespace-nowrap ${col.cls} ${col.sortable ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors' : ''}`}
                    >
                      {col.label}
                      <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {displayList.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length + 1} className="py-20 text-center text-gray-400 text-sm">
                      {activeTab === 'Favorites'
                        ? '⭐ No favorites yet. Click the star on any asset to add it.'
                        : 'No assets match your search.'}
                    </td>
                  </tr>
                ) : (
                  displayList.map((asset, idx) => {
                    const isFav = favorites.includes(asset.symbol);
                    const isNeg = String(asset.change).startsWith('-');
                    // Static funding rate seeded from symbol so it doesn't flicker on re-render
                    const seed = asset.symbol.length % 2;
                    const fundingRate = asset.type === 'futures'
                      ? (seed ? '+' : '-') + '0.0100%'
                      : null;

                    return (
                      <tr
                        key={asset.symbol + idx}
                        className="group border-b border-gray-50 dark:border-white/[0.04] last:border-none hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                      >
                        {/* Star */}
                        <td className="pl-4 py-3.5 w-8">
                          <button
                            onClick={e => { e.stopPropagation(); toggleFav(asset.symbol); }}
                            className="text-gray-300 hover:text-primary transition-colors"
                          >
                            <Star size={14} className={isFav ? 'fill-primary text-primary' : ''} />
                          </button>
                        </td>

                        {/* # Rank */}
                        {cols.find(c => c.key === 'rank') && (
                          <td className="py-3.5 px-3 text-center text-xs text-gray-400 hidden md:table-cell">
                            {idx + 1}
                          </td>
                        )}

                        {/* Name */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={getIconUrl(asset.symbol.replace('_PERP','').split('-')[0])}
                                alt={asset.sub}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={e => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/6001/6001368.png'; }}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                                {activeTab === 'Options'
                                  ? asset.name
                                  : activeTab === 'Futures'
                                  ? asset.name.split(' Perp')[0]
                                  : asset.sub}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-gray-400 font-medium">
                                  {asset.symbol.replace('_PERP','').replace('USDT','').split('-')[0]}
                                  {!asset.symbol.includes('-') && '/USDT'}
                                </span>
                                {asset.type === 'futures' && (
                                  <span className="text-[9px] bg-amber-400/15 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase">PERP</span>
                                )}
                                {activeTab === 'Options' && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${getOptType(asset.symbol) === 'Call' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'}`}>
                                    {getOptType(asset.symbol)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-bold font-mono text-gray-900 dark:text-white tabular-nums text-sm">
                            ${parseFloat(asset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.symbol.includes('SHIB') ? 8 : 4 })}
                          </span>
                        </td>

                        {/* 24h % */}
                        <td className="py-3.5 px-3 text-right">
                          <ChangeChip value={asset.change} />
                        </td>

                        {/* Futures: Funding Rate */}
                        {activeTab === 'Futures' && (
                          <td className="py-3.5 px-3 text-right hidden sm:table-cell">
                            <span className={`text-xs font-bold font-mono tabular-nums ${fundingRate?.startsWith('-') ? 'text-red-400' : 'text-emerald-400'}`}>
                              {fundingRate}
                            </span>
                          </td>
                        )}

                        {/* Options: Strike */}
                        {activeTab === 'Options' && (
                          <td className="py-3.5 px-3 text-right text-xs font-mono text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                            {getStrike(asset.symbol)}
                          </td>
                        )}

                        {/* Options: Expiry */}
                        {activeTab === 'Options' && (
                          <td className="py-3.5 px-3 text-right text-xs font-mono text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                            {getExpiry(asset.symbol)}
                          </td>
                        )}

                        {/* Market Cap / Open Interest / Volume */}
                        <td className="py-3.5 px-3 text-right text-xs text-gray-500 dark:text-gray-400 hidden lg:table-cell font-mono tabular-nums">
                          {asset.cap}
                        </td>

                        {/* 7d Chart — only on non-options */}
                        {activeTab !== 'Options' && (
                          <td className="py-3.5 px-3 text-right hidden md:table-cell">
                            <Sparkline
                              data={asset.history}
                              color={isNeg ? '#ef4444' : '#10b981'}
                              width={72}
                              height={30}
                            />
                          </td>
                        )}

                        {/* Trade action — only on Crypto/Spot/Favorites */}
                        {(activeTab === 'Crypto' || activeTab === 'Spot' || activeTab === 'Favorites') && (
                          <td className="py-3.5 px-3 text-right hidden sm:table-cell">
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-primary text-black text-xs font-bold hover:brightness-110"
                              onClick={e => e.stopPropagation()}
                            >
                              Trade
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {displayList.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 dark:border-white/5">
              <span className="text-xs text-gray-400">
                Showing <strong className="text-gray-600 dark:text-gray-300">{displayList.length}</strong> assets
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <Zap size={10} className="text-primary" />
                Live data via Binance WebSocket
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Quotes;
