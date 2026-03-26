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
                'float-slow': 'floatSlow 8s ease-in-out infinite',
                'float-medium': 'floatMedium 6s ease-in-out infinite',
                'float-fast': 'floatFast 4s ease-in-out infinite',
                'shine': 'shine 3s linear infinite',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'spin-slow': 'spin 20s linear infinite',
                'spin-slower': 'spin 30s linear infinite',
                'spin-reverse-slow': 'spinReverse 20s linear infinite',
                'spin-reverse-slower': 'spinReverse 30s linear infinite',
                'orbit-bitcoin': 'orbitBitcoin 14s linear infinite',
                'orbit-euro': 'orbitEuro 12s linear infinite',
                'orbit-yen': 'orbitYen 18s linear infinite',
                'orbit-goldbar': 'orbitGoldbar 16s linear infinite',
            },
            keyframes: {
                spinReverse: {
                    from: { transform: 'rotate(360deg)' },
                    to: { transform: 'rotate(0deg)' },
                },
                shine: {
                    '0%': { backgroundPosition: '200% center' },
                    '100%': { backgroundPosition: '-200% center' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                floatSlow: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                floatMedium: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-15px) rotate(5deg)' },
                },
                floatFast: {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '50%': { transform: 'translateY(-25px) rotate(-10deg)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                /* Orbital keyframes: elliptical paths around the phone center.
                   0% = start position, traces ellipse, goes behind phone (scale down + z changes).
                   The phone sits at z-20, assets toggle between z-10 (behind) and z-30 (in front). */
                orbitBitcoin: {
                    '0%':   { transform: 'translate(-220px, -20px) scale(1)', zIndex: '30', opacity: '1' },
                    '15%':  { transform: 'translate(-160px, -120px) scale(0.9)', zIndex: '30', opacity: '1' },
                    '30%':  { transform: 'translate(0px, -140px) scale(0.7)', zIndex: '10', opacity: '0.5' },
                    '45%':  { transform: 'translate(160px, -100px) scale(0.6)', zIndex: '10', opacity: '0.4' },
                    '55%':  { transform: 'translate(200px, 0px) scale(0.65)', zIndex: '10', opacity: '0.45' },
                    '70%':  { transform: 'translate(140px, 100px) scale(0.8)', zIndex: '30', opacity: '0.8' },
                    '85%':  { transform: 'translate(-80px, 80px) scale(0.95)', zIndex: '30', opacity: '1' },
                    '100%': { transform: 'translate(-220px, -20px) scale(1)', zIndex: '30', opacity: '1' },
                },
                orbitEuro: {
                    '0%':   { transform: 'translate(180px, -100px) scale(1)', zIndex: '30', opacity: '1' },
                    '15%':  { transform: 'translate(100px, -160px) scale(0.85)', zIndex: '30', opacity: '0.9' },
                    '30%':  { transform: 'translate(-60px, -130px) scale(0.65)', zIndex: '10', opacity: '0.4' },
                    '45%':  { transform: 'translate(-180px, -40px) scale(0.6)', zIndex: '10', opacity: '0.35' },
                    '55%':  { transform: 'translate(-170px, 60px) scale(0.65)', zIndex: '10', opacity: '0.4' },
                    '70%':  { transform: 'translate(-60px, 120px) scale(0.8)', zIndex: '30', opacity: '0.8' },
                    '85%':  { transform: 'translate(120px, 60px) scale(0.95)', zIndex: '30', opacity: '1' },
                    '100%': { transform: 'translate(180px, -100px) scale(1)', zIndex: '30', opacity: '1' },
                },
                orbitYen: {
                    '0%':   { transform: 'translate(160px, 60px) scale(1)', zIndex: '30', opacity: '0.9' },
                    '15%':  { transform: 'translate(200px, -60px) scale(0.9)', zIndex: '30', opacity: '0.85' },
                    '30%':  { transform: 'translate(100px, -150px) scale(0.7)', zIndex: '10', opacity: '0.4' },
                    '45%':  { transform: 'translate(-80px, -130px) scale(0.55)', zIndex: '10', opacity: '0.3' },
                    '55%':  { transform: 'translate(-200px, -30px) scale(0.6)', zIndex: '10', opacity: '0.35' },
                    '70%':  { transform: 'translate(-150px, 90px) scale(0.75)', zIndex: '30', opacity: '0.7' },
                    '85%':  { transform: 'translate(-20px, 130px) scale(0.9)', zIndex: '30', opacity: '0.9' },
                    '100%': { transform: 'translate(160px, 60px) scale(1)', zIndex: '30', opacity: '0.9' },
                },
                orbitGoldbar: {
                    '0%':   { transform: 'translate(140px, 120px) rotate(12deg) scale(1)', zIndex: '30', opacity: '1' },
                    '15%':  { transform: 'translate(220px, 20px) rotate(8deg) scale(0.9)', zIndex: '30', opacity: '0.9' },
                    '30%':  { transform: 'translate(140px, -110px) rotate(5deg) scale(0.7)', zIndex: '10', opacity: '0.4' },
                    '45%':  { transform: 'translate(-40px, -140px) rotate(0deg) scale(0.55)', zIndex: '10', opacity: '0.3' },
                    '55%':  { transform: 'translate(-180px, -60px) rotate(-3deg) scale(0.6)', zIndex: '10', opacity: '0.35' },
                    '70%':  { transform: 'translate(-160px, 70px) rotate(0deg) scale(0.75)', zIndex: '30', opacity: '0.7' },
                    '85%':  { transform: 'translate(-40px, 140px) rotate(8deg) scale(0.9)', zIndex: '30', opacity: '0.95' },
                    '100%': { transform: 'translate(140px, 120px) rotate(12deg) scale(1)', zIndex: '30', opacity: '1' },
                },
            }
        },
    },
    plugins: [
        forms,
        containerQueries,
    ],
}
