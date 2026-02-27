import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Lock, Save } from 'lucide-react';

const ModifyPassword = () => {
    const navigate = useNavigate();
    const { type } = useParams(); // 'login' or 'funding'
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert("New passwords don't match!");
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            alert(`${type === 'login' ? 'Login' : 'Funding'} password updated successfully!`);
            setIsLoading(false);
            navigate('/security');
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-background-base text-gray-100 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background-base/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center">
                <ChevronLeft
                    onClick={() => navigate('/security')}
                    className="cursor-pointer text-primary hover:text-white transition-colors"
                    size={24}
                />
                <h1 className="flex-1 text-center text-lg font-extrabold text-primary tracking-wide font-display uppercase">
                    Modify {type === 'login' ? 'Login' : 'Funding'} Password
                </h1>
                <div className="w-6"></div>
            </div>

            {/* Content */}
            <div className="p-6 max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl">
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                            <Lock size={32} className="text-primary" />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors">Old Password</label>
                            <input
                                type="password"
                                value={formData.oldPassword}
                                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                placeholder="Enter old password"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors">New Password</label>
                            <input
                                type="password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                placeholder="Enter new password"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-primary transition-colors">Confirm New Password</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-8 bg-primary hover:bg-primary-dark text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                CONFIRM MODIFICATION
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>Make sure your password is strong and secure.</p>
                </div>
            </div>
        </div>
    );
};

export default ModifyPassword;
