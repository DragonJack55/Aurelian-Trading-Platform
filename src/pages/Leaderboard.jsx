import React, { useState, useEffect } from 'react';
import { subscribeToAllUsers } from '../services/userService';
import { Trophy, Medal, Star, TrendingUp, ShieldCheck, User, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';

const MOCK_LEADERS = [
    { id: 'mk1', name: 'Robert C.', email: 'robert***@gmail.com', balance: 1450250.75, winRate: 94.2, totalTrades: 1240, pnl24h: 12500.50, isVIP: true, status: 'active', verificationStatus: 'verified' },
    { id: 'mk2', name: 'Elena K.', email: 'elena***@yahoo.com', balance: 980145.20, winRate: 91.8, totalTrades: 850, pnl24h: 8400.20, isVIP: true, status: 'active', verificationStatus: 'verified' },
    { id: 'mk3', name: 'Marcus W.', email: 'marcus***@icloud.com', balance: 745300.50, winRate: 88.5, totalTrades: 2100, pnl24h: -1200.30, isVIP: true, status: 'active', verificationStatus: 'verified' },
    { id: 'mk4', name: 'James L.', email: 'james***@gmail.com', balance: 615800.00, winRate: 85.2, totalTrades: 560, pnl24h: 3200.00, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk5', name: 'Sophia R.', email: 'sophia***@outlook.com', balance: 520445.90, winRate: 82.7, totalTrades: 920, pnl24h: 1500.40, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk6', name: 'William B.', email: 'william***@gmail.com', balance: 412550.25, winRate: 81.1, totalTrades: 430, pnl24h: 900.25, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk7', name: 'Olivia H.', email: 'olivia***@yahoo.com', balance: 395100.80, winRate: 79.8, totalTrades: 610, pnl24h: 2100.80, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk8', name: 'David M.', email: 'david***@gmail.com', balance: 350220.15, winRate: 78.4, totalTrades: 380, pnl24h: -400.15, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk9', name: 'Isabella S.', email: 'isabella***@protonmail.com', balance: 295400.00, winRate: 77.2, totalTrades: 240, pnl24h: 1100.00, isVIP: false, status: 'active', verificationStatus: 'verified' },
    { id: 'mk10', name: 'Joseph T.', email: 'joseph***@icloud.com', balance: 215890.50, winRate: 75.9, totalTrades: 190, pnl24h: 800.50, isVIP: false, status: 'active', verificationStatus: 'verified' }
];

const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const maskName = (name) => {
    if (!name) return 'Anonymous';
    if (name.includes('@')) {
        const parts = name.split('@');
        if (parts[0].length <= 2) return `*${parts[0].slice(-1)}***`;
        return `${parts[0].slice(0, 2)}***${parts[0].slice(-1)}`;
    }
    if (name.length <= 3) return name;
    return `${name.slice(0, 2)}***${name.slice(-1)}`;
};

const formatBalance = (balance) => {
    const val = parseFloat(balance) || 0;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toFixed(2)}`;
};

// Top 3 podium card
const PodiumCard = ({ user, rank }) => {
    const configs = {
        1: {
            gradient: 'from-yellow-400/20 via-yellow-500/10 to-transparent',
            border: 'border-yellow-500/40',
            glow: 'shadow-[0_0_30px_rgba(234,179,8,0.2)]',
            icon: <Trophy size={20} className="text-yellow-400" />,
            nameColor: 'text-yellow-300',
            balColor: 'text-yellow-400',
            avatarBg: 'from-yellow-400 to-yellow-600',
            order: 'order-2',
            scale: 'scale-105',
            badge: '🥇',
            height: 'pt-6',
        },
        2: {
            gradient: 'from-gray-300/15 via-gray-400/8 to-transparent',
            border: 'border-gray-400/30',
            glow: 'shadow-[0_0_20px_rgba(156,163,175,0.1)]',
            icon: <Medal size={18} className="text-gray-300" />,
            nameColor: 'text-gray-200',
            balColor: 'text-gray-100',
            avatarBg: 'from-gray-300 to-gray-500',
            order: 'order-1',
            scale: '',
            badge: '🥈',
            height: 'pt-8',
        },
        3: {
            gradient: 'from-amber-600/15 via-amber-700/8 to-transparent',
            border: 'border-amber-600/30',
            glow: 'shadow-[0_0_20px_rgba(180,83,9,0.1)]',
            icon: <Medal size={18} className="text-amber-500" />,
            nameColor: 'text-amber-200',
            balColor: 'text-amber-300',
            avatarBg: 'from-amber-500 to-amber-700',
            order: 'order-3',
            scale: '',
            badge: '🥉',
            height: 'pt-8',
        }
    };
    const c = configs[rank];
    const isPositive = (user.pnl24h || 500) >= 0;

    return (
        <div className={`${c.order} ${c.scale} flex flex-col items-center flex-1 min-w-0`}>
            <div className={`w-full bg-gradient-to-b ${c.gradient} border ${c.border} ${c.glow} rounded-2xl p-4 ${c.height} transition-all duration-300 hover:scale-[1.02] relative overflow-hidden`}>
                {/* inner glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-2xl" />
                <div className="flex flex-col items-center text-center gap-2 relative z-10">
                    <span className="text-2xl">{c.badge}</span>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${c.avatarBg} flex items-center justify-center shadow-lg`}>
                        {user.isVIP
                            ? <ShieldCheck size={20} className="text-white" />
                            : <User size={20} className="text-white/80" />
                        }
                    </div>
                    <div>
                        <div className={`font-bold text-sm truncate ${c.nameColor}`}>{maskName(user.name || user.email)}</div>
                        {user.isVIP && <span className="text-[8px] font-black bg-primary/30 text-primary px-1.5 py-0.5 rounded-full tracking-widest">VIP</span>}
                    </div>
                    <div className={`font-black font-mono text-base ${c.balColor}`}>{formatBalance(user.balance)}</div>
                    <div className={`text-[10px] font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                        {isPositive ? '+' : ''}{formatBalance(user.pnl24h || 500)}
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1 mt-1 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full" style={{ width: `${user.winRate || 75}%` }} />
                    </div>
                    <div className="text-[10px] text-white/50 font-medium">{user.winRate || 75}% win rate</div>
                </div>
            </div>
        </div>
    );
};

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAllUsers((fetchedUsers) => {
            const realActiveUsers = fetchedUsers.filter(u => u.status === 'active' && u.verificationStatus === 'verified');
            const allUsers = [...realActiveUsers, ...MOCK_LEADERS];
            const sortedUsers = allUsers.sort((a, b) => (parseFloat(b.balance) || 0) - (parseFloat(a.balance) || 0));
            setUsers(sortedUsers);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <div className="min-h-screen bg-background-main text-text-main pb-24 relative pt-[80px]">
            {/* Ambient background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/4 w-[200px] h-[200px] bg-yellow-500/5 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-2xl mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="relative inline-flex flex-col items-center mb-5">
                        <div className="absolute inset-0 w-40 h-40 bg-primary/15 rounded-full blur-[60px] mx-auto" />
                        <img
                            src="/leaderboard_light.png"
                            className="block dark:hidden w-28 h-28 object-contain relative z-10 drop-shadow-2xl animate-float-slow"
                            alt="Global Leaderboard"
                        />
                        <img
                            src="/leaderboard_dark.png"
                            className="hidden dark:block w-28 h-28 object-contain relative z-10 drop-shadow-glow animate-float-medium"
                            alt="Global Leaderboard"
                        />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-3 font-display italic">
                        Global <span className="text-transparent bg-clip-text bg-gradient-gold">Leaderboard</span>
                    </h1>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                        Track the world's top traders. Increase your portfolio to rise through the ranks.
                    </p>
                </div>

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-primary font-bold animate-pulse text-sm">Loading top traders...</p>
                    </div>
                ) : (
                    <>
                        {/* Top 3 Podium */}
                        {top3.length >= 3 && (
                            <div className="flex items-end gap-3 mb-6 px-1">
                                <PodiumCard user={top3[1]} rank={2} />
                                <PodiumCard user={top3[0]} rank={1} />
                                <PodiumCard user={top3[2]} rank={3} />
                            </div>
                        )}

                        {/* Rest of the list */}
                        {rest.length > 0 && (
                            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
                                {/* Column headers */}
                                <div className="grid grid-cols-[2rem_1fr_5rem_5rem] gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span>#</span>
                                    <span>Trader</span>
                                    <span className="text-center">Win Rate</span>
                                    <span className="text-right">Balance</span>
                                </div>

                                <div className="divide-y divide-gray-100 dark:divide-white/5">
                                    {rest.map((user, idx) => {
                                        const rank = idx + 4;
                                        const isPositive = (user.pnl24h || 500) >= 0;
                                        return (
                                            <div
                                                key={user.id || idx}
                                                className="grid grid-cols-[2rem_1fr_5rem_5rem] items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                            >
                                                {/* Rank number */}
                                                <span className="text-xs font-bold text-gray-400 w-8 text-center">
                                                    {rank}
                                                </span>

                                                {/* Trader */}
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                                        {user.isVIP
                                                            ? <ShieldCheck size={14} className="text-primary" />
                                                            : <User size={14} className="text-gray-400" />
                                                        }
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                            {maskName(user.name || user.email)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {user.isVIP && (
                                                                <span className="text-[7px] font-black bg-primary/15 text-primary px-1 rounded tracking-wider">VIP</span>
                                                            )}
                                                            <span className={`text-[9px] font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-red-400'}`}>
                                                                {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{formatBalance(user.pnl24h || 500)} 24h
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Win Rate */}
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-xs font-black font-mono ${user.winRate >= 80 ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                        {user.winRate || 75}%
                                                    </span>
                                                    <div className="w-10 h-0.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${user.winRate >= 80 ? 'bg-emerald-500' : 'bg-primary/60'}`}
                                                            style={{ width: `${user.winRate || 75}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Balance */}
                                                <div className="text-right">
                                                    <div className="text-sm font-black font-mono text-gray-900 dark:text-white">
                                                        {formatBalance(user.balance)}
                                                    </div>
                                                    <div className="text-[9px] text-gray-400 font-medium">
                                                        {formatNumber(user.totalTrades || 120)} trades
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
