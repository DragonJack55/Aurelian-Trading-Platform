import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, Shield } from 'lucide-react';
import VerifyModal from '../components/VerifyModal';
import { getVerificationStatus } from '../services/verificationService';
import { useApp } from '../context/AppContext';

const SecurityCenter = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [rejectionReason, setRejectionReason] = useState(null);

    const fetchStatus = async () => {
        if (user?.email) {
            const result = await getVerificationStatus(user.email);
            if (result.success) {
                setVerificationStatus(result.status);
                setRejectionReason(result.rejectionReason);
            }
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [user?.email, fetchStatus]);

    const handleVerifyClick = () => {
        if (!user) {
            alert('Please login first');
            return;
        }
        setIsVerifyModalOpen(true);
    };

    const handleVerifyModalClose = () => {
        setIsVerifyModalOpen(false);
        // Reload verification status when modal closes
        if (user?.email) {
            fetchStatus();
        }
    };

    const getVerificationStatusDisplay = () => {
        if (!verificationStatus || verificationStatus === 'unverified') {
            return { text: 'Not verified', icon: Shield, color: 'text-gray-500', bg: 'bg-gray-500/10' };
        }
        if (verificationStatus === 'pending') {
            return { text: 'Under review', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' };
        }
        if (verificationStatus === 'verified') {
            return { text: 'Verified ✓', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' };
        }
        if (verificationStatus === 'rejected') {
            return { text: 'Rejected', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' };
        }
        return { text: 'Not verified', icon: Shield, color: 'text-gray-500', bg: 'bg-gray-500/10' };
    };

    const menuItems = [
        { title: 'Login password', path: '/security/password/login' },
        { title: 'Funding password', path: '/security/password/funding' }
    ];

    const statusDisplay = getVerificationStatusDisplay();
    const StatusIcon = statusDisplay.icon;

    return (
        <div className="min-h-screen bg-background-base text-gray-100 font-sans pb-20">
            <VerifyModal
                isOpen={isVerifyModalOpen}
                onClose={handleVerifyModalClose}
                userEmail={user?.email}
            />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-background-base/80 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center">
                <ChevronLeft onClick={() => navigate('/assets')} className="cursor-pointer text-primary" size={24} />
                <h1 className="flex-1 text-center text-lg font-bold text-primary font-display">Security Center</h1>
                <div className="w-6"></div>
            </div>

            <div className="p-5 max-w-lg mx-auto">
                {/* Identity Verification Section */}
                <div className="mb-8">
                    <div className="text-[10px] text-gray-400 font-bold mb-3 pl-1">Identity</div>
                    <div
                        onClick={handleVerifyClick}
                        className="bg-surface-dark border border-white/5 rounded-2xl p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusDisplay.bg} ${statusDisplay.color}`}>
                                <StatusIcon size={24} />
                            </div>
                            <div>
                                <div className="text-base font-bold text-white mb-0.5">Identity Verification</div>
                                <div className="text-xs text-gray-400">Status: <span className={statusDisplay.color}>{statusDisplay.text}</span></div>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-600" />
                    </div>
                    {/* Rejection Reason Display */}
                    {verificationStatus === 'rejected' && rejectionReason && (
                        <div className="mt-3 bg-red-500/5 border border-red-500/10 rounded-xl p-4 animate-fade-in">
                            <div className="text-[10px] font-bold text-red-500 mb-1">Rejection reason</div>
                            <div className="text-xs text-red-200 leading-relaxed font-medium">
                                {rejectionReason}
                            </div>
                            <div className="text-[10px] text-red-400/60 mt-2 italic">
                                Please correct these issues and submit again.
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Management */}
                <div className="mb-8">
                    <div className="text-[10px] text-gray-400 font-bold mb-3 pl-1">Account security</div>
                    <div className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                        {menuItems.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(item.path)}
                                className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors active:bg-white/10"
                            >
                                <span className="text-sm font-semibold text-white">{item.title}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Modify</span>
                                    <ChevronRight size={16} className="text-gray-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Tip */}
                <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20">
                    <div className="flex gap-3 items-center mb-3">
                        <Shield size={20} className="text-primary" />
                        <span className="text-sm font-bold text-primary">Security tip</span>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed">
                        For your account safety, please do not share your funding password or recovery keys with anyone, including Aurelian support staff.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SecurityCenter;
