import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { initiateRegistration, login } from '../../services/authService';

const Register = () => {
    console.log('[Register] Mounting...');
    const navigate = useNavigate();
    // Step state removed as we only have one step now
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Registration data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        withdrawPassword: '',
        fullName: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.withdrawPassword.length < 4) {
            return setError('Withdraw password must be at least 4 characters');
        }

        setLoading(true);
        const result = await initiateRegistration(formData);

        if (result.success) {
            if (result.session) {
                // Case A: Auto-Confirm is ON (Session created immediately)
                const loginRes = await login(formData.email, formData.password);
                if (loginRes.success) {
                    window.dispatchEvent(new Event('storage'));
                    navigate('/'); // Redirect to Home/Dashboard
                } else {
                    setLoading(false);
                    setError('Account created! Logging in...');
                    setTimeout(() => {
                        window.dispatchEvent(new Event('storage'));
                        navigate('/');
                    }, 1000);
                }
            } else {
                // Case B: Auto-Confirm is OFF (Email verification required)
                setLoading(false);
                alert('Account created! Please check your email to confirm your account before logging in.');
                navigate('/login');
            }
        } else {
            setLoading(false);
            setError(result.error || 'Registration failed');
        }
    };



    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join the elite trading platform"
        >
            {/* Back Button */}
            <Link to="/" className="absolute top-28 left-8 flex items-center gap-2 text-text-muted hover:text-primary transition-colors group z-20">
                <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                <span className="text-sm font-bold uppercase tracking-wider">Back</span>
            </Link>

            {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6 text-center animate-shake">
                    {error}
                </div>
            )}

            <form onSubmit={handleDetailsSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold tracking-widest text-text-muted dark:text-primary mb-2 uppercase">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        autoComplete="name"

                        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#D4AF37] transition-all duration-300"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold tracking-widest text-text-muted dark:text-primary mb-2 uppercase">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"

                        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#D4AF37] transition-all duration-300"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold tracking-widest text-text-muted dark:text-primary mb-2 uppercase">Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"

                        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#D4AF37] transition-all duration-300"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold tracking-widest text-text-muted dark:text-primary mb-2 uppercase">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"

                        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#D4AF37] transition-all duration-300"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold tracking-widest text-text-muted dark:text-primary mb-2 uppercase">Withdraw Password</label>
                    <input
                        type="password"
                        name="withdrawPassword"
                        placeholder="Set a security code (e.g. 1234)"
                        required
                        value={formData.withdrawPassword}
                        onChange={handleChange}
                        autoComplete="new-password"

                        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary dark:focus:border-[#D4AF37] transition-all duration-300"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full relative overflow-hidden group py-3.5 rounded-lg text-black font-display font-bold text-sm uppercase tracking-wider shadow-lg transition-all duration-300 transform active:scale-[0.98] mt-4 bg-gradient-gold dark:bg-gradient-to-b dark:from-[#D4AF37] dark:to-[#B38728] shadow-primary/20 dark:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-primary/40 dark:hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                            "CREATING ACCOUNT..."
                        ) : (
                            <>
                                CREATE ACCOUNT
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </>
                        )}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>

                <div className="text-center mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
                    <p className="text-sm text-text-muted dark:text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-primary-dark dark:text-[#D4AF37] hover:text-primary dark:hover:text-[#FEDC56] transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Register;
