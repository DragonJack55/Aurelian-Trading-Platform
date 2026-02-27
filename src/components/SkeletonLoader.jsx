import React from 'react';

/**
 * Reusable skeleton loader component for loading states
 * @param {Object} props
 * @param {number} props.width - Width in pixels or percentage string
 * @param {number} props.height - Height in pixels
 * @param {string} props.variant - Type of skeleton: 'text', 'circular', 'rectangular', 'chart'
 * @param {string} props.borderRadius - Custom border radius
 */
const SkeletonLoader = ({
    width = '100%',
    height = 20,
    variant = 'rectangular',
    borderRadius,
    style = {}
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'text':
                return {
                    borderRadius: '4px',
                    height: '1em',
                    width: width
                };
            case 'circular':
                return {
                    borderRadius: '50%',
                    width: height,
                    height: height
                };
            case 'chart':
                return {
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, var(--bg-light) 0%, var(--bg-white) 50%, var(--bg-light) 100%)',
                    backgroundSize: '200% 100%',
                    position: 'relative',
                    overflow: 'hidden'
                };
            case 'rectangular':
            default:
                return {
                    borderRadius: borderRadius || '8px'
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <div
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: `${height}px`,
                background: variant === 'chart'
                    ? variantStyles.background
                    : 'linear-gradient(90deg, var(--bg-light) 0%, #e0e0e0 50%, var(--bg-light) 100%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
                ...variantStyles,
                ...style
            }}
        >
            {variant === 'chart' && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                    height: '60%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '8px'
                }}>
                    {[30, 50, 40, 60, 35, 55, 45, 65].map((height, index) => (
                        <div
                            key={index}
                            style={{
                                flex: 1,
                                height: `${height}%`,
                                background: 'rgba(255, 215, 0, 0.1)',
                                borderRadius: '4px 4px 0 0',
                                animation: `skeleton-bar ${1.5 + index * 0.1}s ease-in-out infinite`
                            }}
                        />
                    ))}
                </div>
            )}
            <style>
                {`
                    @keyframes skeleton-pulse {
                        0% {
                            background-position: 200% 0;
                        }
                        100% {
                            background-position: -200% 0;
                        }
                    }
                    
                    @keyframes skeleton-bar {
                        0%, 100% {
                            opacity: 0.3;
                        }
                        50% {
                            opacity: 0.6;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default SkeletonLoader;
