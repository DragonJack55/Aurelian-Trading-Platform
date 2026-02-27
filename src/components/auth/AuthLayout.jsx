import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex bg-background-main dark:bg-background-dark overflow-hidden transition-colors duration-300">

            {/* Left Side - Form Container */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 relative z-10 transition-colors duration-300 pt-24">

                {/* Logo (Functional Return to Home) */}
                <div
                    className="absolute top-8 left-8 flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate('/')}
                >
                    <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <div className="absolute inset-0 bg-gradient-gold rounded-lg rotate-45 group-hover:rotate-90 transition-transform duration-500 opacity-90 blur-sm"></div>
                        <div className="relative w-[92%] h-[92%] bg-white dark:bg-[#080b13] rounded-[8px] flex items-center justify-center z-10 shadow-sm border border-primary/20">
                            <span className="material-symbols-outlined text-primary-dark dark:text-transparent dark:bg-clip-text dark:bg-gradient-gold-text text-2xl">diamond</span>
                        </div>
                    </div>
                    <span className="font-display font-bold text-xl tracking-wider text-gray-900 dark:text-white group-hover:text-primary transition-colors">AURELIAN</span>
                </div>

                <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                    <div className="text-center lg:text-left">
                        <h2 className="mt-6 text-3xl font-display font-bold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-2 text-sm text-text-muted dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="mt-8">
                        {children}
                    </div>

                    <div className="mt-8 text-center lg:text-left">
                        <p className="text-xs text-text-muted dark:text-gray-500">
                            © {new Date().getFullYear()} Aurelian TD Trade. Secured by 256-bit encryption.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-background-dark">
                    <img
                        className="w-full h-full object-cover opacity-60 mix-blend-overlay filter contrast-125 transition-transform duration-[20s] hover:scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZLDLjZPbMQbG0BTTc9O02OPIiXr0m6GIm8wxolfbOR6KIHyJ6ZjRQCiBbvimSH3RTasufoi476zFcMdWSpMue1SLtJY9aWWxOmG76Y-QhUVmvE7txlc4u7aOoZ45ROevJth7-ylfd_WYpjc-BlKoWa8qEbUZ4bnw-7glfXK55L0NsjvYZzc6gndtFh0X7bQ3XbRGqkim0lJCGAm854eNOUsRFjVC93SwPgQcOAJMeoF3CKyoqYCiJfUI6-8C_LsGVpivvSr3u_0I"
                        alt="Background Texture"
                    />
                    {/* Gradient Overlay for Text Readability or Style */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/40 to-background-dark/90 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                </div>

                {/* Hero Content / Quotes */}
                <div className="absolute bottom-20 left-12 right-12 z-20 text-white">
                    <div className="max-w-xl">
                        <div className="w-16 h-1 bg-gradient-gold mb-8"></div>
                        <h3 className="text-4xl font-display font-bold leading-tight mb-6 drop-shadow-lg">
                            Institutional Grade <br />
                            <span className="text-transparent bg-clip-text bg-gradient-gold-text">Trading Infrastructure</span>
                        </h3>
                        <p className="text-lg text-gray-300 leading-relaxed font-light mb-8">
                            Experience lightning-fast execution, deep liquidity, and bank-grade security on the world's most advanced digital asset platform.
                        </p>

                        <div className="flex gap-4">
                            <div className="flex -space-x-3">
                                <div className="w-10 h-10 rounded-full border-2 border-primary/50 bg-surface-dark flex items-center justify-center text-xs font-bold ring-2 ring-black">A</div>
                                <div className="w-10 h-10 rounded-full border-2 border-primary/50 bg-surface-dark flex items-center justify-center text-xs font-bold ring-2 ring-black">T</div>
                                <div className="w-10 h-10 rounded-full border-2 border-primary/50 bg-surface-dark flex items-center justify-center text-xs font-bold ring-2 ring-black">D</div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-sm font-bold text-white">Trusted by 50K+ Traders</span>
                                <span className="text-xs text-primary">Join the elite circle</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
