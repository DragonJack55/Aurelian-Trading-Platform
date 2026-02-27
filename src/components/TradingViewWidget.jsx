import React, { useEffect, useRef, memo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import SkeletonLoader from './SkeletonLoader';

function TradingViewWidget({ symbol = "OANDA:XAUUSD", interval = "1h", theme: themeProp }) {
    const container = useRef();
    const { theme: contextTheme } = useTheme();
    const theme = themeProp || contextTheme || 'dark';
    const [isLoading, setIsLoading] = useState(true);
    const [prevSymbol, setPrevSymbol] = useState(symbol);
    const [prevTheme, setPrevTheme] = useState(theme);
    const [prevInterval, setPrevInterval] = useState(interval);

    // Convert user-friendly interval to TradingView format
    const getTvInterval = (interval) => {
        const map = {
            '5m': '5',
            '15m': '15',
            '30m': '30',
            '1h': '60',
            '4h': '240',
            '8h': '480',
            '1d': 'D',
            '1w': 'W'
        };
        return map[interval] || '60';
    };

    if (symbol !== prevSymbol || theme !== prevTheme || interval !== prevInterval) {
        setPrevSymbol(symbol);
        setPrevTheme(theme);
        setPrevInterval(interval);
        setIsLoading(true);
    }

    useEffect(
        () => {
            // Clear previous widget if any
            if (container.current) {
                container.current.innerHTML = "";
            }

            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "${getTvInterval(interval)}",
          "timezone": "Etc/UTC",
          "theme": "${theme}",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "hide_top_toolbar": true,
          "hide_legend": true,
          "save_image": false,
          "calendar": false,
          "hide_volume": true,
          "support_host": "https://www.tradingview.com"
        }`;

            // Hide loading after script loads and chart renders
            script.onload = () => {
                setTimeout(() => {
                    setIsLoading(false);
                }, 1500); // Give chart time to render
            };

            container.current.appendChild(script);
        },
        [symbol, theme, interval]
    );

    return (
        <div className="tradingview-widget-container" style={{ height: "100%", width: "100%", position: 'relative' }}>
            {isLoading && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
                    <SkeletonLoader width="100%" height={400} variant="chart" />
                </div>
            )}
            <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%", opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}>
                <div ref={container} style={{ height: "100%", width: "100%" }} />
            </div>
        </div>
    );
}

export default memo(TradingViewWidget);
