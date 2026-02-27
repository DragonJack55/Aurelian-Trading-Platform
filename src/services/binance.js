const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

// Map internal symbols to Binance equivalents
const SYMBOL_MAP = {
    'XAUUSD': 'PAXGUSDT',
    'EURUSD': 'EURUSDT',
    'AUDUSD': 'AUDUSDT',
    'XAGUSD': 'XAGUSDT', // Silver
    'UKOIL': 'LTCUSDT',  // Fallback or specific oil proxy if available
    'US30': 'BTCUSDT'    // Fallback or specific index proxy if available
};

const getBinanceSymbol = (symbol) => {
    return SYMBOL_MAP[symbol] || symbol;
};

const getInternalSymbol = (binanceSymbol) => {
    return Object.keys(SYMBOL_MAP).find(key => SYMBOL_MAP[key] === binanceSymbol) || binanceSymbol;
};

/**
 * Subscribe to ticker updates for multiple symbols
 * @param {string[]} symbols - Array of symbols, e.g., ['BTCUSDT', 'XAUUSD']
 * @param {function} callback - Function called with updated ticker data
 */
export const subscribeToTicker = (symbols, callback) => {
    const binanceSymbols = symbols.map(s => getBinanceSymbol(s).toLowerCase());
    const streams = binanceSymbols.map(s => `${s}@ticker`).join('/');
    const url = `${BINANCE_WS_URL}/${streams}`;

    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000; // 1 second
    let reconnectTimeout = null;
    let isClosed = false;

    const connect = () => {
        if (isClosed) return;

        try {
            socket = new WebSocket(url);

            socket.onopen = () => {
                reconnectAttempts = 0; // Reset on successful connection
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // Translate back to internal symbol if mapped
                if (data.s) {
                    data.s = getInternalSymbol(data.s);
                }
                callback(data);
            };

            socket.onerror = () => {
                // Only log first error to avoid console flooding
                if (reconnectAttempts === 0) {
                    console.warn('Binance WebSocket: Connection issue detected. Attempting to reconnect...');
                }
            };

            socket.onclose = (event) => {
                if (isClosed) return;

                // Only log close events when not expected
                if (!event.wasClean && reconnectAttempts === 0) {
                    console.info('Binance WebSocket: Connection closed. Reconnecting...');
                }

                // Attempt to reconnect with exponential backoff
                if (reconnectAttempts < maxReconnectAttempts) {
                    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
                    reconnectAttempts++;

                    reconnectTimeout = setTimeout(() => {
                        connect();
                    }, delay);
                } else {
                    console.error('Binance WebSocket: Max reconnection attempts reached. Please refresh the page.');
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    };

    // Initial connection
    connect();

    // Return cleanup function
    return () => {
        isClosed = true;
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
        }
        if (socket) {
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        }
    };
};

export const subscribeToKline = (symbol, interval, callback) => {
    const url = `${BINANCE_WS_URL}/${symbol.toLowerCase()}@kline_${interval}`;
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.k) {
            callback(data.k);
        }
    };

    return () => socket.close();
};
