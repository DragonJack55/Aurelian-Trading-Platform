import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { login } from '../../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('[Login] Starting login process...');

        try {
            // Timeout wrapper - Firebase Auth can hang on mobile
            const loginWithTimeout = Promise.race([
                login(formData.email, formData.password),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Connection timed out. Please check your internet and try again.')), 15000)
                )
            ]);

            const result = await loginWithTimeout;

            console.log('[Login] Login result:', result);

            if (result.success) {
                console.log('[Login] Login successful, navigating to home');
                window.dispatchEvent(new Event('storage'));
                navigate('/');
            } else {
                console.error('[Login] Login failed:', result.error);
                setError(result.error || 'Invalid email or password');
            }
        } catch (error) {
            console.error('[Login] Login exception:', error);
            setError(error.message || 'Login failed - please try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Login to your premium trading account"
        >
            {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold tracking-widest text-text-muted dark:text-primary mb-2 uppercase">Email Address</label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#D4AF37] transition-all duration-300"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold tracking-widest text-text-muted dark:text-primary mb-2 uppercase">Password</label>
                    <div className="relative">
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#D4AF37] transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer text-sm text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-black/40 mr-2"
                        />
                        Remember Me
                    </label>
                    <Link to="/forgot-password" className="text-sm font-medium text-primary-dark dark:text-[#D4AF37] hover:text-primary dark:hover:text-[#FEDC56] transition-colors">
                        Forgot Password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative overflow-hidden group py-3.5 rounded-lg bg-gradient-gold dark:bg-gradient-to-b dark:from-[#D4AF37] dark:to-[#B38728] text-black font-display font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20 dark:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-primary/40 dark:hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 transform active:scale-[0.98]"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? "AUTHENTICATING..." : "LOGIN NOW"}
                        {!loading && <span className="material-symbols-outlined text-lg">login</span>}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>

                <div className="text-center mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <p className="text-sm text-text-muted dark:text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-primary-dark dark:text-[#D4AF37] hover:text-primary dark:hover:text-[#FEDC56] transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;
