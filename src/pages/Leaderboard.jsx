import React, { useState, useEffect } from 'react';
import { subscribeToAllUsers } from '../services/userService';
import { Trophy, Medal, Star, TrendingUp, Sparkles, User, Award, ShieldCheck } from 'lucide-react';

const MOCK_LEADERS = [
    { id: 'mk1', name: 'Robert C.', email: 'robert***@gmail.com', balance: 1450250.75, isVIP: true, status: 'active', verificationStatus: 'verified' },
    { id: 'mk2', name: 'Elena K.', email: 'elena***@yahoo.com', balance: 980145.20, isVIP: true, status: 'active', verificationStatus: 'verified' },
    { id: 'mk3', name: 'Marcus W.', email: 'marcus***@icloud.com', balance: 745300.50, isVIP: true, status: 'active', verificationStatus: 'verified' },
    { id: 'mk4', name: 'James L.', email: 'james***@gmail.com', balance: 615800.00, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk5', name: 'Sophia R.', email: 'sophia***@outlook.com', balance: 520445.90, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk6', name: 'William B.', email: 'william***@gmail.com', balance: 412550.25, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk7', name: 'Olivia H.', email: 'olivia***@yahoo.com', balance: 395100.80, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk8', name: 'David M.', email: 'david***@gmail.com', balance: 350220.15, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk9', name: 'Isabella S.', email: 'isabella***@protonmail.com', balance: 295400.00, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk10', name: 'Joseph T.', email: 'joseph***@icloud.com', balance: 215890.50, isVIP: false, status: 'active', verificationStatus: 'verified' }
];

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAllUsers((fetchedUsers) => {
            // Filter to only verified and active users
            const realActiveUsers = fetchedUsers.filter(u => u.status === 'active' && u.verificationStatus === 'verified');

            // Combine real users with mock leaders
            const allUsers = [...realActiveUsers, ...MOCK_LEADERS];

            // Sort by highest balance
            const sortedUsers = allUsers.sort((a, b) => {
                const balA = parseFloat(a.balance) || 0;
                const balB = parseFloat(b.balance) || 0;
                return balB - balA;
            });

            setUsers(sortedUsers);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatBalance = (balance) => {
        const val = parseFloat(balance) || 0;
        return "$" + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400 drop-shadow-lg" size={28} />;
            case 1: return <Medal className="text-gray-300 drop-shadow-md" size={26} />;
            case 2: return <Medal className="text-amber-600 drop-shadow-md" size={24} />;
            default: return <div className="w-8 flex justify-center text-gray-500 font-bold">#{index + 1}</div>;
        }
    };

    const getRankStyle = (index) => {
        switch (index) {
            case 0: return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 shadow-[0_4px_20px_rgba(234,179,8,0.15)] transform hover:-translate-y-1 transition-all z-10 relative";
            case 1: return "bg-gradient-to-r from-gray-300/10 to-gray-400/5 border-gray-400/20";
            case 2: return "bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700/20";
            default: return "bg-[#131b2f]/50 border-white/5 hover:bg-[#131b2f] transition-colors";
        }
    };

    // Mask name for privacy (e.g. j***@email.com -> j***m) or using partial parts
    const maskName = (name) => {
        if (!name) return "Anonymous Trader";
        if (name.includes('@')) {
            const parts = name.split('@');
            if (parts[0].length <= 2) return `*${parts[0].slice(-1)}***`;
            return `${parts[0].slice(0, 2)}***${parts[0].slice(-1)}`;
        }
        if (name.length <= 3) return name;
        return `${name.slice(0, 2)}***${name.slice(-1)}`;
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-slate-300 pb-20 relative pt-[80px]">
            {/* Background elements */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0a0f1c] to-[#0a0f1c] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 relative z-10 animate-fade-in">

                {/* Header Area */}
                <div className="text-center mb-12 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-[80px]"></div>
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-brand mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)] relative">
                        <Award size={32} className="text-black" />
                        <Sparkles size={16} className="text-white absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 font-display">
                        Global <span className="text-transparent bg-clip-text bg-gradient-brand">Leaderboard</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Track the performance of top traders worldwide. Climb the ranks by increasing your overall portfolio value through successful trades.
                    </p>
                </div>

                {/* Leaderboard Container */}
                <div className="bg-[#131b2f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl relative overflow-hidden">

                    {/* Top 3 Decorative Header */}
                    <div className="flex justify-between text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest px-4 md:px-6 mb-4 mt-2">
                        <span>Trader</span>
                        <span>Portfolio Value</span>
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-primary font-bold animate-pulse">Loading top traders...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="py-20 text-center text-gray-500 flex flex-col items-center">
                            <ShieldCheck size={48} className="mb-4 text-gray-600 opacity-50" />
                            <p>No verified traders found. Start trading to be the first!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user, index) => (
                                <div
                                    key={user.id || index}
                                    className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border ${getRankStyle(index)} backdrop-blur-sm group`}
                                >
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className="flex items-center justify-center w-8 md:w-10">
                                            {getRankIcon(index)}
                                        </div>

                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="relative">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-lg
                                                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/30' :
                                                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                                                            index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                                                                'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                                                    }
                                                `}>
                                                    {user.isVIP ? <Star size={18} className={index < 3 ? 'text-black/80' : 'text-primary'} fill="currentColor" /> : <User size={20} />}
                                                </div>
                                                {user.isVIP && (
                                                    <div className="absolute -bottom-1 -right-1 bg-primary text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                                                        VIP
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className={`font-bold text-base md:text-lg tracking-wide ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                                                    {maskName(user.name || user.email)}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <TrendingUp size={12} className={index < 3 ? "text-green-500" : "text-gray-600"} />
                                                    Active Trader
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`font-mono font-bold text-lg md:text-xl tracking-tight ${index === 0 ? 'text-yellow-400 text-2xl drop-shadow-md' : 'text-success'}`}>
                                        {formatBalance(user.balance)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
