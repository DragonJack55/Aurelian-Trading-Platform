import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                "primary-light": "var(--color-primary-light)",
                "primary-dark": "var(--color-primary-dark)",
                "background-main": "var(--color-background-main)", // Added missing key
                "background-dark": "var(--color-background-main)", // Kept key name for compat, maps to main bg
                "background-base": "var(--color-background-base)",
                "surface-dark": "var(--color-surface-main)", // Kept key name for compat
                "surface-light": "var(--color-surface-light)",
                "surface-highlight": "var(--color-surface-highlight)",

                // Functional Colors
                "success": "var(--color-success)",
                "danger": "var(--color-danger)",
                "warning": "var(--color-warning)",
                "info": "var(--color-info)",

                // Text
                "text-main": "var(--color-text-main)",
                "text-muted": "var(--color-text-muted)",
                "text-subtle": "var(--color-text-subtle)",

                // Borders
                "border-subtle": "var(--color-border-subtle)",
                "border-gold": "var(--color-border-gold)",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Inter', 'sans-serif'], // unified font
            },
            boxShadow: {
                'glow': '0 0 20px rgba(212, 175, 55, 0.15)',
                'glow-strong': '0 0 40px rgba(212, 175, 55, 0.25)',
                'glow-success': '0 0 20px rgba(0, 210, 106, 0.2)',
                'glow-danger': '0 0 20px rgba(249, 44, 44, 0.2)',
                'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            backgroundImage: {
                'gradient-gold': 'var(--gradient-gold)',
                'gradient-gold-hover': 'var(--gradient-gold-hover)',
                'gradient-dark': 'var(--gradient-main)',
                'gradient-mesh': 'radial-gradient(at 0% 0%, rgba(212, 175, 55, 0.05) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 210, 106, 0.03) 0px, transparent 50%)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'shine': 'shine 3s linear infinite',
                'slide-up': 'slideUp 0.5s ease-out forwards',
            },
            keyframes: {
                shine: {
                    '0%': { backgroundPosition: '200% center' },
                    '100%': { backgroundPosition: '-200% center' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [
        forms,
        containerQueries,
    ],
}
