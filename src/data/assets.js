
// Map symbols to icon URLs
export const getIconUrl = (symbol) => {
    // Standardize symbol for lookups
    const baseSymbol = symbol.replace(/USDT|USD|_PERP/g, '').toLowerCase();

    // Mapping for assets that don't match the standard coin-icon pattern or need specific styles
    const specialIcons = {
        // Metals
        'xau': 'https://cdn-icons-png.flaticon.com/512/2881/2881045.png',
        'xag': 'https://cdn-icons-png.flaticon.com/512/2451/2451551.png',
        // Forex (country flags)
        'eur': 'https://flagcdn.com/w80/eu.png',
        'aud': 'https://flagcdn.com/w80/au.png',
        // Stablecoins
        'usdt': 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
        'usdc': 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
        // Major alts missing from spothq CDN
        'ton': 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png',
        'shib': 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
        'pepe': 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg',
        'iota': 'https://assets.coingecko.com/coins/images/692/small/IOTA_Swirl.png',
        'op': 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
        'ldo': 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png',
        'pol': 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
        'matic': 'https://assets.coingecko.com/coins/images/4713/small/polygon.png',
        'ape': 'https://assets.coingecko.com/coins/images/24383/small/apecoin.jpg',
        'apt': 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
        'arb': 'https://assets.coingecko.com/coins/images/16547/small/arb.jpg',
        'imx': 'https://assets.coingecko.com/coins/images/17233/small/immutableX-symbol-BLK-RGB.png',
        'inj': 'https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png',
        'rndr': 'https://assets.coingecko.com/coins/images/11636/small/rndr.png',
        'near': 'https://assets.coingecko.com/coins/images/10365/small/near.jpg',
        'stx': 'https://assets.coingecko.com/coins/images/2069/small/Stacks_logo_full.png',
        'hbar': 'https://assets.coingecko.com/coins/images/3688/small/hbar.png',
        'soy': 'https://cdn-icons-png.flaticon.com/512/6001/6001527.png',
        'soyu': 'https://cdn-icons-png.flaticon.com/512/6001/6001527.png',
        'yfi': 'https://assets.coingecko.com/coins/images/11849/small/yearn.jpg',
        'etc': 'https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png',
        // Indices & Commodities
        'us30': 'https://flagcdn.com/w80/us.png',
        'ukoil': 'https://flagcdn.com/w80/gb.png',
    };

    if (specialIcons[baseSymbol]) return specialIcons[baseSymbol];

    // Default to a high-quality crypto icon CDN
    return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${baseSymbol}.png`;
};

export const assets = [
    // Top 10
    { symbol: 'BTCUSDT', name: 'BTC/USDT', sub: 'Bitcoin', type: 'crypto', price: '93174.17', change: '-0.56%', cap: '1.85T', high: '94284.50', low: '92320.00', history: [93400, 93350, 93380, 93320, 93174] },
    { symbol: 'ETHUSDT', name: 'ETH/USDT', sub: 'Ethereum', type: 'crypto', price: '3136.90', change: '+1.31%', cap: '369B', high: '3160.10', low: '3100.00', history: [3120, 3130, 3125, 3140, 3136] },
    { symbol: 'USDTUSDT', name: 'USDT/USD', sub: 'Tether', type: 'crypto', price: '1.00', change: '0.00%', cap: '103B', high: '1.001', low: '0.999', history: [1, 1, 1, 1, 1] },
    { symbol: 'BNBUSDT', name: 'BNB/USDT', sub: 'BNB', type: 'crypto', price: '620.45', change: '+0.85%', cap: '92.1B', high: '625.00', low: '615.50', history: [618, 619, 620, 621, 620.4] },
    { symbol: 'SOLUSDT', name: 'SOL/USDT', sub: 'Solana', type: 'crypto', price: '145.20', change: '+2.15%', cap: '67.2B', high: '147.50', low: '143.10', history: [142, 144, 145, 146, 145.2] },
    { symbol: 'USDCUSDT', name: 'USDC/USD', sub: 'USDC', type: 'crypto', price: '1.00', change: '0.00%', cap: '32B', high: '1.001', low: '0.999', history: [1, 1, 1, 1, 1] },
    { symbol: 'XRPUSDT', name: 'XRP/USDT', sub: 'XRP', type: 'crypto', price: '0.6200', change: '-1.10%', cap: '34.5B', high: '0.6250', low: '0.6150', history: [0.63, 0.625, 0.62, 0.615, 0.62] },
    { symbol: 'DOGEUSDT', name: 'DOGE/USDT', sub: 'Dogecoin', type: 'crypto', price: '0.1367', change: '-0.41%', cap: '19.8B', high: '0.1380', low: '0.1350', history: [0.137, 0.136, 0.1365, 0.135, 0.136] },
    { symbol: 'TONUSDT', name: 'TON/USDT', sub: 'Toncoin', type: 'crypto', price: '6.50', change: '+1.80%', cap: '15.5B', high: '6.60', low: '6.30', history: [6.4, 6.45, 6.5, 6.55, 6.5] },
    { symbol: 'ADAUSDT', name: 'ADA/USDT', sub: 'Cardano', type: 'crypto', price: '0.3837', change: '-0.55%', cap: '13.2B', high: '0.3860', low: '0.3800', history: [0.385, 0.384, 0.383, 0.382, 0.383] },

    // Top 11-20
    { symbol: 'SHIBUSDT', name: 'SHIB/USDT', sub: 'Shiba Inu', type: 'crypto', price: '0.000024', change: '-0.37%', cap: '14.2B', high: '0.000025', low: '0.000023', history: [0.000023, 0.000024, 0.0000235, 0.000024, 0.000024] },
    { symbol: 'AVAXUSDT', name: 'AVAX/USDT', sub: 'Avalanche', type: 'crypto', price: '35.50', change: '+2.10%', cap: '12.4B', high: '36.00', low: '34.00', history: [34, 34.5, 35, 35.2, 35.5] },
    { symbol: 'TRXUSDT', name: 'TRX/USDT', sub: 'Tron', type: 'crypto', price: '0.1250', change: '+0.10%', cap: '11.0B', high: '0.1260', low: '0.1240', history: [0.124, 0.125, 0.125, 0.1245, 0.125] },
    { symbol: 'DOTUSDT', name: 'DOT/USDT', sub: 'Polkadot', type: 'crypto', price: '7.20', change: '-1.50%', cap: '10.1B', high: '7.35', low: '7.15', history: [7.3, 7.25, 7.22, 7.18, 7.20] },
    { symbol: 'BCHUSDT', name: 'BCH/USDT', sub: 'Bitcoin Cash', type: 'crypto', price: '450.00', change: '-0.20%', cap: '8.8B', high: '455.00', low: '445.00', history: [452, 451, 450, 449, 450] },
    { symbol: 'LINKUSDT', name: 'LINK/USDT', sub: 'Chainlink', type: 'crypto', price: '14.80', change: '+0.50%', cap: '8.5B', high: '14.90', low: '14.50', history: [14.5, 14.6, 14.7, 14.8, 14.8] },
    { symbol: 'NEARUSDT', name: 'NEAR/USDT', sub: 'NEAR Protocol', type: 'crypto', price: '6.20', change: '+2.50%', cap: '6.8B', high: '6.30', low: '6.00', history: [6.0, 6.1, 6.2, 6.25, 6.2] },
    { symbol: 'MATICUSDT', name: 'MATIC/USDT', sub: 'Polygon', type: 'crypto', price: '0.7200', change: '-0.80%', cap: '7.2B', high: '0.7300', low: '0.7100', history: [0.73, 0.725, 0.72, 0.715, 0.72] },
    { symbol: 'LTCUSDT', name: 'LTC/USDT', sub: 'Litecoin', type: 'crypto', price: '77.47', change: '-0.48%', cap: '5.8B', high: '78.20', low: '77.00', history: [78, 77.5, 77.8, 77.2, 77.47] },
    { symbol: 'UNIUSDT', name: 'UNI/USDT', sub: 'Uniswap', type: 'crypto', price: '7.50', change: '+3.20%', cap: '4.5B', high: '7.60', low: '7.20', history: [7.2, 7.3, 7.4, 7.45, 7.5] },

    // Added based on request for more coins
    { symbol: 'ICPUSDT', name: 'ICP/USDT', sub: 'Internet Computer', type: 'crypto', price: '12.00', change: '-0.50%', cap: '5.5B', high: '12.20', low: '11.80', history: [12.1, 12.05, 12.0, 11.95, 12.0] },
    { symbol: 'APTUSDT', name: 'APT/USDT', sub: 'Aptos', type: 'crypto', price: '12.50', change: '+1.20%', cap: '4.8B', high: '12.80', low: '12.20', history: [12.3, 12.4, 12.5, 12.6, 12.5] },
    { symbol: 'FILUSDT', name: 'FIL/USDT', sub: 'Filecoin', type: 'crypto', price: '5.80', change: '-0.90%', cap: '3.2B', high: '6.00', low: '5.70', history: [5.9, 5.85, 5.8, 5.75, 5.8] },
    { symbol: 'ETCUSDT', name: 'ETC/USDT', sub: 'Ethereum Classic', type: 'crypto', price: '24.50', change: '-0.19%', cap: '3.5B', high: '24.80', low: '24.20', history: [24.6, 24.55, 24.5, 24.45, 24.5] },
    { symbol: 'ATOMUSDT', name: 'ATOM/USDT', sub: 'Cosmos', type: 'crypto', price: '8.50', change: '-1.20%', cap: '3.2B', high: '8.70', low: '8.40', history: [8.6, 8.55, 8.5, 8.45, 8.5] },
    { symbol: 'IMXUSDT', name: 'IMX/USDT', sub: 'Immutable', type: 'crypto', price: '2.10', change: '+4.50%', cap: '3.1B', high: '2.20', low: '2.00', history: [2.0, 2.05, 2.1, 2.15, 2.1] },
    { symbol: 'STXUSDT', name: 'STX/USDT', sub: 'Stacks', type: 'crypto', price: '2.30', change: '+0.80%', cap: '3.3B', high: '2.40', low: '2.20', history: [2.2, 2.25, 2.3, 2.35, 2.3] },
    { symbol: 'OKBUSDT', name: 'OKB/USDT', sub: 'OKB', type: 'crypto', price: '45.20', change: '-1.20%', cap: '2.7B', high: '46.00', low: '44.50', history: [45.5, 45.4, 45.2, 45.1, 45.2] },
    { symbol: 'XLMUSDT', name: 'XLM/USDT', sub: 'Stellar', type: 'crypto', price: '0.11', change: '-0.50%', cap: '3.2B', high: '0.115', low: '0.105', history: [0.11, 0.112, 0.11, 0.108, 0.11] },
    { symbol: 'VETUSDT', name: 'VET/USDT', sub: 'VeChain', type: 'crypto', price: '0.035', change: '+1.50%', cap: '2.5B', high: '0.036', low: '0.034', history: [0.034, 0.035, 0.035, 0.036, 0.035] },
    { symbol: 'INJUSDT', name: 'INJ/USDT', sub: 'Injective', type: 'crypto', price: '25.50', change: '+5.20%', cap: '2.4B', high: '26.00', low: '24.00', history: [24, 24.5, 25, 25.5, 25.5] },
    { symbol: 'RNDRUSDT', name: 'RNDR/USDT', sub: 'Render', type: 'crypto', price: '7.80', change: '+3.10%', cap: '3.0B', high: '8.00', low: '7.50', history: [7.5, 7.6, 7.7, 7.8, 7.8] },
    { symbol: 'OPUSDT', name: 'OP/USDT', sub: 'Optimism', type: 'crypto', price: '2.50', change: '-1.50%', cap: '2.8B', high: '2.60', low: '2.40', history: [2.55, 2.5, 2.45, 2.5, 2.5] },
    { symbol: 'ARBUSDT', name: 'ARB/USDT', sub: 'Arbitrum', type: 'crypto', price: '1.05', change: '-0.80%', cap: '2.9B', high: '1.10', low: '1.00', history: [1.08, 1.05, 1.04, 1.05, 1.05] },
    { symbol: 'AAVEUSDT', name: 'AAVE/USDT', sub: 'Aave', type: 'crypto', price: '95.00', change: '+2.00%', cap: '1.4B', high: '98.00', low: '92.00', history: [92, 94, 95, 96, 95] },
    { symbol: 'ALGOUSDT', name: 'ALGO/USDT', sub: 'Algorand', type: 'crypto', price: '0.18', change: '-1.00%', cap: '1.5B', high: '0.19', low: '0.17', history: [0.18, 0.185, 0.18, 0.175, 0.18] },
    { symbol: 'HBARUSDT', name: 'HBAR/USDT', sub: 'Hedera', type: 'crypto', price: '0.08', change: '+0.50%', cap: '2.6B', high: '0.085', low: '0.075', history: [0.078, 0.08, 0.082, 0.08, 0.08] },
    { symbol: 'EOSUSDT', name: 'EOS/USDT', sub: 'EOS', type: 'crypto', price: '0.85', change: '0.00%', cap: '1.2B', high: '0.86', low: '0.84', history: [0.85, 0.85, 0.85, 0.85, 0.85] },
    { symbol: 'MKRUSDT', name: 'MKR/USDT', sub: 'Maker', type: 'crypto', price: '2800.00', change: '+1.50%', cap: '2.6B', high: '2900.00', low: '2700.00', history: [2750, 2780, 2800, 2820, 2800] },

    // Metals
    { symbol: 'XAUUSD', name: 'Gold/USD', sub: 'Gold', type: 'spot', price: '4349.21', change: '-0.47%', cap: '12.4T', high: '4360.00', low: '4330.00', history: [4350, 4345, 4340, 4348, 4349] },
    { symbol: 'XAGUSD', name: 'Silver/USD', sub: 'Silver', type: 'spot', price: '32.50', change: '+0.80%', cap: '1.5T', high: '33.00', low: '32.00', history: [32, 32.2, 32.5, 32.4, 32.5] },

    // Forex
    { symbol: 'EURUSD', name: 'EUR/USD', sub: 'Euro', type: 'spot', price: '1.1732', change: '-0.13%', cap: 'N/A', high: '1.1800', low: '1.1700', history: [1.1740, 1.1750, 1.1732, 1.1720, 1.1732] },
    { symbol: 'AUDUSD', name: 'AUD/USD', sub: 'Australian Dollar', type: 'spot', price: '0.6521', change: '+0.15%', cap: 'N/A', high: '0.6600', low: '0.6500', history: [0.6510, 0.6515, 0.6521, 0.6525, 0.6521] },

    // Futures (With added coins as requested)
    { symbol: 'BTCUSDT_PERP', name: 'BTC/USDT Perp', sub: 'Perpetual', type: 'futures', price: '86420.50', change: '-0.25%', cap: 'Open Interest: 4.54B', high: '87333.1', low: '89187.9', history: [86450, 86400, 86430, 86380, 86420] },
    { symbol: 'ETHUSDT_PERP', name: 'ETH/USDT Perp', sub: 'Perpetual', type: 'futures', price: '2845.20', change: '-0.05%', cap: 'Open Interest: 5.99B', high: '2860.00', low: '2840.00', history: [2850, 2842, 2848, 2840, 2845] },
    { symbol: 'SOLUSDT_PERP', name: 'SOL/USDT Perp', sub: 'Perpetual', type: 'futures', price: '145.35', change: '+1.15%', cap: 'Open Interest: 1.2B', high: '147.00', low: '144.00', history: [142.5, 143.5, 144.5, 145.2, 145.3] },
    { symbol: 'BNBUSDT_PERP', name: 'BNB/USDT Perp', sub: 'Perpetual', type: 'futures', price: '581.50', change: '+0.55%', cap: 'Open Interest: 800M', high: '585.00', low: '578.00', history: [579, 580, 582, 581, 581.5] },
    { symbol: 'ADAUSDT_PERP', name: 'ADA/USDT Perp', sub: 'Perpetual', type: 'futures', price: '0.3845', change: '-0.60%', cap: 'Open Interest: 250M', high: '0.3880', low: '0.3820', history: [0.386, 0.385, 0.384, 0.383, 0.3845] },
    { symbol: 'DOGEUSDT_PERP', name: 'DOGE/USDT Perp', sub: 'Perpetual', type: 'futures', price: '0.1370', change: '-0.45%', cap: 'Open Interest: 300M', high: '0.1390', low: '0.1360', history: [0.138, 0.137, 0.1375, 0.136, 0.137] },
    { symbol: 'XRPUSDT_PERP', name: 'XRP/USDT Perp', sub: 'Perpetual', type: 'futures', price: '0.6210', change: '-0.15%', cap: 'Open Interest: 500M', high: '0.6260', low: '0.6180', history: [0.61, 0.62, 0.615, 0.625, 0.621] },

    // Options (Mock)
    { symbol: 'BTC-25APR-90000-C', name: 'BTC-90k-Call', sub: '25 APR', type: 'options', price: '1200.00', change: '+5.50%', cap: 'Vol: 436.95K', high: '1250', low: '1150', history: [1150, 1180, 1200, 1190, 1200] },
    { symbol: 'ETH-25APR-3000-C', name: 'ETH-3k-Call', sub: '25 APR', type: 'options', price: '85.00', change: '-2.10%', cap: 'Vol: 120.5K', high: '90', low: '80', history: [88, 86, 85, 84, 85] },
];
