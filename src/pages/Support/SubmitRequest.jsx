import React, { useState } from 'react';
import { Send, Upload, ChevronDown, CheckCircle2, LifeBuoy, Mail, MessageSquare, Phone } from 'lucide-react';

const DEPARTMENTS = [
    { id: 'tech', title: 'Technical Support', icon: LifeBuoy },
    { id: 'billing', title: 'Billing & Deposits', icon: Mail },
    { id: 'trading', title: 'Trading Assistance', icon: MessageSquare },
    { id: 'vip', title: 'Institutional VIP Service', icon: Phone }
];

const SubmitRequest = () => {
    const [status, setStatus] = useState('idle'); // idle, loading, success
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: 'tech',
        subject: '',
        message: '',
        priority: 'medium'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('loading');
        setTimeout(() => setStatus('success'), 1500);
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-background-main text-text-main flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-surface-main rounded-[40px] border border-gray-100 dark:border-white/5 p-12 text-center shadow-2xl animate-scale-in">
                    <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center text-success mx-auto mb-8">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Request Submitted</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Thank you for contacting Aurelian TD Support. Your ticket <strong>#AU-78213</strong> has been created. One of our specialists will respond within 2-4 hours.
                    </p>
                    <button 
                        onClick={() => setStatus('idle')}
                        className="btn-gold w-full py-4 text-sm font-bold tracking-tight"
                    >
                        Return to Support
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-main text-text-main pt-24 pb-32">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
                        Submit a <span className="text-primary">Support Request</span>
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Please provide the details of your inquiry below. Our internal institutional support team will review your request immediately.
                    </p>
                </div>

                <div className="bg-white dark:bg-surface-main rounded-[40px] border border-gray-100 dark:border-white/5 p-4 md:p-12 shadow-2xl dark:shadow-none overflow-hidden relative">
                    
                    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                        {/* Name & Email Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-tight text-gray-400">Full name</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all text-sm"
                                    placeholder="Enter your name..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-tight text-gray-400">Email address</label>
                                <input 
                                    required
                                    type="email" 
                                    className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all text-sm"
                                    placeholder="Enter your email..."
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Department & Priority Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-tight text-gray-400">Department</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all text-sm appearance-none pr-12 cursor-pointer"
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                    >
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.title}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-tight text-gray-400">Support priority level</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all text-sm appearance-none pr-12 cursor-pointer"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                    >
                                        <option value="low">Low - General Question</option>
                                        <option value="medium">Medium - Technical Issue</option>
                                        <option value="high">High - Urgent (Locked Account/Asset Issue)</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-tight text-gray-400">Subject</label>
                            <input 
                                required
                                type="text" 
                                className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl py-4 px-6 outline-none focus:border-primary transition-all text-sm"
                                placeholder="Summary of your issue..."
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-tight text-gray-400">Description of inquiry</label>
                            <textarea 
                                required
                                rows={6}
                                className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-[30px] py-6 px-8 outline-none focus:border-primary transition-all text-sm resize-none"
                                placeholder="Explain your inquiry in detail..."
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                            ></textarea>
                        </div>

                        {/* Upload Field */}
                        <div className="bg-gray-50/50 dark:bg-surface-dark/50 border border-dashed border-gray-200 dark:border-white/10 rounded-[30px] p-8 text-center group cursor-pointer hover:border-primary transition-all">
                            <div className="w-12 h-12 bg-white dark:bg-surface-main rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 border border-gray-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                                <Upload size={20} />
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Attach Supporting Files</h4>
                            <p className="text-xs text-gray-500">Drop files here or click to browse (Max 5MB). JPG, PNG, PDF supported.</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="btn-gold w-full py-5 flex items-center justify-center gap-3 group shadow-glow disabled:opacity-50"
                        >
                            {status === 'loading' ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Send Support Request</span>
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                </div>

                <div className="mt-12 text-center text-xs text-gray-500 italic">
                    All support requests are encrypted and handled through our secure institutional service node.
                </div>

            </div>
        </div>
    );
};

export default SubmitRequest;
