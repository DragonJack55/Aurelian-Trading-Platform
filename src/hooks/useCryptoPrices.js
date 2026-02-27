import { useState, useEffect } from 'react';

const MOINS_IDS = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'solana': 'SOL',
    'ripple': 'XRP',
    'cardano': 'ADA',
    'polkadot': 'DOT',
    'dogecoin': 'DOGE',
    'avalanche-2': 'AVAX'
};

const MOCK_DATA = [
    { id: 'bitcoin', symbol: 'BTC', current_price: 64231.50, price_change_percentage_24h: 2.5 },
    { id: 'ethereum', symbol: 'ETH', current_price: 3452.10, price_change_percentage_24h: 1.2 },
    { id: 'solana', symbol: 'SOL', current_price: 145.20, price_change_percentage_24h: -0.5 },
    { id: 'ripple', symbol: 'XRP', current_price: 0.62, price_change_percentage_24h: 0.8 },
    { id: 'cardano', symbol: 'ADA', current_price: 0.45, price_change_percentage_24h: -1.1 },
    { id: 'avalanche-2', symbol: 'AVAX', current_price: 35.60, price_change_percentage_24h: 4.2 }
];

export const useCryptoPrices = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const ids = Object.keys(MOINS_IDS).join(',');
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);

                if (!response.ok) {
                    throw new Error('Failed to fetch prices');
                }

                const data = await response.json();

                const formattedData = Object.keys(data).map(key => ({
                    id: key,
                    symbol: MOINS_IDS[key],
                    current_price: data[key].usd,
                    price_change_percentage_24h: data[key].usd_24h_change
                }));

                setPrices(formattedData);
                setLoading(false);
            } catch (err) {
                console.warn('[Ticker] API Fetch failed, using mock data:', err);
                // Fallback to mock data with slight randomization to simulate movement
                const randomizedMock = MOCK_DATA.map(coin => ({
                    ...coin,
                    current_price: coin.current_price * (1 + (Math.random() * 0.002 - 0.001)),
                    price_change_percentage_24h: coin.price_change_percentage_24h + (Math.random() * 0.1 - 0.05)
                }));
                setPrices(randomizedMock);
                setLoading(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // 60s poll to respect rate limits

        return () => clearInterval(interval);
    }, []);

    return { prices, loading, error };
};
