

import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
    Users, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, Shield, AlertTriangle,
    FileText, Check, X, Bell, Search, Filter, RefreshCw, ChevronDown, ChevronRight,
    MoreHorizontal, LogOut, Settings, MessageCircle, Send, Plus, Trash2, Menu,
    LayoutDashboard, UserCheck, ShieldAlert, Ban, FileCheck, ShoppingCart, Circle,
    History, ScrollText, Download, Clock, CheckCircle, XCircle, List, Upload,
    Headset, MessageSquare, Ticket, CheckSquare, BarChart, CandlestickChart, LogIn, Eye, EyeOff, ChevronLeft, ArrowDownToLine, ArrowUpFromLine, Minus, Key, Snowflake, Sparkles, Star
} from 'lucide-react';
import { subscribeToConversations, sendMessage } from '../services/messageService';
import { subscribeToAllUsers, updateUserPoints, updateUserTradeResult, getUsersPaginated, updateUserFreezeStatus, incrementUserPoints, resetUserPassword, markUserAsSeen, updateUserFavoriteStatus } from '../services/userService';
import { updateVerificationStatus, getVerificationsPaginated, subscribeToAllVerifications } from '../services/verificationService';
import { getDepositSettings, updateDepositSettings, updateDepositStatus, subscribeToAllDeposits } from '../services/depositService';
import { updateWithdrawalStatus, getWithdrawalsPaginated, subscribeToAllWithdrawals } from '../services/withdrawalService';
import { logout } from '../services/authService';
import { sendSystemNotification, subscribeToAllSystemNotifications, deleteSystemNotification } from '../services/notificationService';
import ConfirmationModal from '../components/ConfirmationModal';
import RejectionModal from '../components/RejectionModal';
import { subscribeToAllTrades } from '../services/tradeService';
import { subscribeToAllLoginHistory } from '../services/loginHistoryService';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    LineChart, 
    Line 
} from 'recharts';

const TransactionManagement = ({ depositRequests, withdrawals, updateDepositStatus, updateWithdrawalStatus, setRejectionModal, closeRejectionModal }) => {
    const [activeTab, setActiveTab] = useState('deposits');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDeposits = (depositRequests || []).filter(d => 
        (d.email || d.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.hash || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredWithdrawals = (withdrawals || []).filter(w => 
        (w.email || w.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.walletAddress || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex bg-white/5 p-1 rounded-xl w-fit">
                    <button 
                        onClick={() => setActiveTab('deposits')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'deposits' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Deposits
                    </button>
                    <button 
                        onClick={() => setActiveTab('withdrawals')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'withdrawals' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Withdrawals
                    </button>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by email or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary w-full md:w-64 transition-all"
                    />
                </div>
            </div>

            {activeTab === 'deposits' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDeposits.length > 0 ? filteredDeposits.map(deposit => (
                        <div key={deposit.id} className="bg-[#131b2f]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl hover:border-primary/20 transition-all group overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-green-500/10 rounded-2xl">
                                    <ArrowDownLeft className="text-green-500" size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    deposit.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    deposit.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                    {deposit.status}
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 mb-1 font-sans">User email</h4>
                                    <p className="text-white font-medium truncate">{deposit.userEmail || deposit.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 mb-1 font-sans">Amount</h4>
                                        <p className="text-xl font-bold text-primary font-mono">${parseFloat(deposit.amount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 mb-1 font-sans">Method</h4>
                                        <p className="text-white font-medium uppercase font-sans tracking-wide">{deposit.method || 'USDT'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 mb-1 font-sans">Transaction hash</h4>
                                    <p className="text-xs font-mono text-gray-400 break-all bg-black/20 p-2 rounded-lg border border-white/5">{deposit.hash || 'N/A'}</p>
                                </div>
                                {deposit.status === 'pending' && (
                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            onClick={() => updateDepositStatus(deposit.id, 'approved')}
                                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-600/20"
                                        >
                                            APPROVE
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setRejectionModal({
                                                    isOpen: true,
                                                    title: 'Reject Deposit',
                                                    onConfirm: async (reason) => {
                                                        await updateDepositStatus(deposit.id, 'rejected', reason);
                                                        closeRejectionModal();
                                                    }
                                                });
                                            }}
                                            className="flex-1 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl text-xs font-bold transition-all"
                                        >
                                            REJECT
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-[#131b2f]/40 rounded-3xl border border-dashed border-white/10">
                            <p className="text-gray-500 font-sans tracking-wide">No deposit requests found</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWithdrawals.length > 0 ? filteredWithdrawals.map(withdrawal => (
                        <div key={withdrawal.id} className="bg-[#131b2f]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl hover:border-primary/20 transition-all group overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-amber-500/10 rounded-2xl">
                                    <ArrowUpRight className="text-amber-500" size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    withdrawal.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                    withdrawal.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>
                                    {withdrawal.status}
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 mb-1 font-sans">User email</h4>
                                    <p className="text-white font-medium truncate">{withdrawal.userEmail || withdrawal.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 mb-1 font-sans">Amount</h4>
                                        <p className="text-xl font-bold text-primary font-mono">${parseFloat(withdrawal.amount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-400 mb-1 font-sans">Method</h4>
                                        <p className="text-white font-medium uppercase font-sans tracking-wide">{withdrawal.method || 'USDT'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 mb-1 font-sans">Wallet address</h4>
                                    <p className="text-xs font-mono text-gray-400 break-all bg-black/20 p-2 rounded-lg border border-white/5">{withdrawal.walletAddress || 'N/A'}</p>
                                </div>
                                {withdrawal.status === 'pending' && (
                                    <div className="flex gap-3 pt-2">
                                        <button 
                                            onClick={() => updateWithdrawalStatus(withdrawal.id, 'approved')}
                                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-600/20"
                                        >
                                            APPROVE
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setRejectionModal({
                                                    isOpen: true,
                                                    title: 'Reject Withdrawal',
                                                    onConfirm: async (reason) => {
                                                        await updateWithdrawalStatus(withdrawal.id, 'rejected', reason);
                                                        closeRejectionModal();
                                                    }
                                                });
                                            }}
                                            className="flex-1 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl text-xs font-bold transition-all"
                                        >
                                            REJECT
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-[#131b2f]/40 rounded-3xl border border-dashed border-white/10">
                            <p className="text-gray-500 font-sans tracking-wide">No withdrawal requests found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Admin = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'authenticated');
    const [emailInput, setEmailInput] = useState(() => localStorage.getItem('adminEmail') || 'admin@aureliantrade.com');
    const [passwordInput, setPasswordInput] = useState('');
    const [authError, setAuthError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Sidebar Navigation State
    const [activeSection, setActiveSection] = useState(() => localStorage.getItem('adminActiveSection') || 'pending');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({
        users: true,
        support: false,
        settings: false
    });

    // Persist active section
    useEffect(() => {
        localStorage.setItem('adminActiveSection', activeSection);
    }, [activeSection]);

    // Data State
    const [users, setUsers] = useState([]);
    const [pointsInput, setPointsInput] = useState({});
    const [pointsCurrency, setPointsCurrency] = useState({});
    const [verifications, setVerifications] = useState([]);
    const [selectedVerification, setSelectedVerification] = useState(null);

    // Deposit Settings State
    const [depositSettings, setDepositSettings] = useState({});
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Withdrawal Requests State
    const [withdrawals, setWithdrawals] = useState([]);

    // Deposit Requests State
    const [depositRequests, setDepositRequests] = useState([]);

    // Trades State (for Manage Order + Report)
    const [allTrades, setAllTrades] = useState([]);

    // Login History State
    const [loginHistory, setLoginHistory] = useState([]);

    // Chat State
    const [conversations, setConversations] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [isSending, setIsSending] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    const [isNewChatMode, setIsNewChatMode] = useState(false);
    const [newChatSearch, setNewChatSearch] = useState('');

    // Pagination State
    const [lastUserDoc, setLastUserDoc] = useState(null);
    const [lastVerificationDoc, setLastVerificationDoc] = useState(null);
    const [lastWithdrawalDoc, setLastWithdrawalDoc] = useState(null);
    const [hasMoreUsers, setHasMoreUsers] = useState(false);
    const [hasMoreVerifications, setHasMoreVerifications] = useState(false);
    const [hasMoreWithdrawals, setHasMoreWithdrawals] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [debugInfo, setDebugInfo] = useState({ error: null, usersCount: 0, url: '' });

    // Notification State
    const [systemNotifications, setSystemNotifications] = useState([]);
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');
    const [notifType, setNotifType] = useState('info');
    const [isSendingNotif, setIsSendingNotif] = useState(false);

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'Confirm',
        onConfirm: () => { }
    });

    const closeConfirmation = () => {
        setConfirmation(prev => ({ ...prev, isOpen: false }));
    };

    // Rejection Modal State
    const [rejectionModal, setRejectionModal] = useState({
        isOpen: false,
        title: 'Reject Item',
        onConfirm: () => { }
    });

    const closeRejectionModal = () => {
        setRejectionModal(prev => ({ ...prev, isOpen: false }));
    };

    // Auth state is initialized from sessionStorage
    useEffect(() => {
        if (isAuthenticated) {
            // Already authenticated, no further effect needed here for initial check
        }
    }, [isAuthenticated]);

    // Handle password login
    const handleLogin = async (e) => {
        e.preventDefault();
        console.log('Deployment ID: 2026-01-15_0240_FORCE_UPDATE');
        setIsLoggingIn(true);
        setAuthError('');

        try {
            // Firebase authentication with entered email
            const adminEmail = emailInput;
            localStorage.setItem('adminEmail', emailInput);

            // Attempt Firebase authentication
            await signInWithEmailAndPassword(auth, adminEmail, passwordInput);

            console.log('Admin Authenticated Successfully with Firebase');
            sessionStorage.setItem('adminAuth', 'authenticated');
            
            // Success: Now attempt to get a backend token for API access
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const backendResp = await fetch(`${apiUrl}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: adminEmail, 
                        password: passwordInput 
                    })
                });
                
                if (backendResp.ok) {
                    const data = await backendResp.json();
                    if (data.success && data.token) {
                        localStorage.setItem('adminToken', data.token);
                        console.log('Backend Admin Token acquired');
                    }
                } else {
                    console.warn('Backend login failed, using limited frontend mode');
                }
            } catch (bErr) {
                console.error('Backend connection failed:', bErr);
            }

            setIsAuthenticated(true);
            setAuthError('');
        } catch (err) {
            console.error('Admin Firebase Auth Failed:', err);
            setAuthError(`Authentication failed: ${err.message}`);
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        await logout();
        sessionStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        setPasswordInput('');
    };

    // Data Subscriptions
    useEffect(() => {
        if (!isAuthenticated) return;

        const unsubUsers = subscribeToAllUsers((updatedUsers) => {
            console.log('Admin Users Update:', updatedUsers);
            if (updatedUsers && updatedUsers.length > 0) {
                console.log('Sample User:', updatedUsers[0]);
            }
            setUsers(updatedUsers.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
            setDebugInfo(prev => ({ ...prev, usersCount: updatedUsers.length }));
        });

        const unsubConv = subscribeToConversations((data) => {
            setConversations(data);
        });

        const unsubWithdrawals = subscribeToAllWithdrawals((data) => {
            setWithdrawals(data);
        });

        const unsubVerifications = subscribeToAllVerifications((data) => {
            setVerifications(data);
        });

        const unsubDeposits = subscribeToAllDeposits((data) => {
            setDepositRequests(data);
        });

        const unsubNotifications = subscribeToAllSystemNotifications((data) => {
            setSystemNotifications(data);
        });

        const unsubTrades = subscribeToAllTrades((data) => {
            setAllTrades(data);
        });

        const unsubLoginHistory = subscribeToAllLoginHistory((data) => {
            setLoginHistory(data);
        });

        const initData = () => {
            // Load first page of users
            getUsersPaginated(null, 20).then(uResult => {
                if (uResult.success) {
                    setUsers(uResult.users);
                    setLastUserDoc(uResult.lastDoc);
                    setHasMoreUsers(uResult.hasMore);
                }
            });

            // Initial verification load
            getVerificationsPaginated(null, 10).then(vResult => {
                if (vResult.success) {
                    setLastVerificationDoc(vResult.lastDoc);
                    setHasMoreVerifications(vResult.hasMore);
                }
            });

            // Load first page of withdrawals
            getWithdrawalsPaginated(null, 20).then(wResult => {
                if (wResult.success) {
                    setWithdrawals(wResult.withdrawals);
                    setLastWithdrawalDoc(wResult.lastDoc);
                    setHasMoreWithdrawals(wResult.hasMore);
                }
            });

            getDepositSettings().then(dSettings => {
                if (dSettings.success) {
                    setDepositSettings(dSettings.settings || {});
                }
            });
        };

        initData();

        return () => {
            unsubUsers();
            unsubConv();
            unsubWithdrawals();
            unsubVerifications();
            unsubDeposits();
            unsubNotifications();
            unsubTrades();
            unsubLoginHistory();
        };
    }, [isAuthenticated]);

    // Derived win rates from users data - normalize to trade_result or tradeResult
    const winRates = {};
    users.forEach(user => {
        const result = user.trade_result || user.tradeResult;
        if (result) {
            winRates[user.email] = result;
        }
    });

    // Compute Dashboard Statistics
    const totalDespositsAmount = (depositRequests || [])
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    const totalWithdrawalsAmount = (withdrawals || [])
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

    const totalUsersBalance = (users || [])
        .filter(u => u.role !== 'admin')
        .reduce((sum, u) => sum + (parseFloat(u.balance) || 0), 0);

    const chartData = [
        { date: 'Mon', volume: 4500, profit: 2100, losses: 1200 },
        { date: 'Tue', volume: 5200, profit: 3400, losses: 800 },
        { date: 'Wed', volume: 3800, profit: 1800, losses: 1500 },
        { date: 'Thu', volume: 6100, profit: 4200, losses: 900 },
        { date: 'Fri', volume: 5500, profit: 2900, losses: 1100 },
        { date: 'Sat', volume: 4800, profit: 3800, losses: 600 },
        { date: 'Sun', volume: 5900, profit: 4500, losses: 400 }
    ];

    // Helper functions
    const handleSaveDepositSettings = async () => {
        setIsSavingSettings(true);
        await updateDepositSettings(depositSettings);
        setIsSavingSettings(false);
        alert('Deposit settings saved');
    };

    const handleFileUpload = (e, prefix) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = MAX_WIDTH;
                    const height = img.height * scaleSize;
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                    setDepositSettings(prev => ({
                        ...prev,
                        [`${prefix}Qr`]: compressedBase64
                    }));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateWithdrawalStatus = async (withdrawalId, newStatus, amount, userEmail) => {
        if (newStatus === 'rejected') {
            const reason = prompt('Reason for rejection:');
            if (reason === null) return; // Cancelled
            // Refund the user
            await incrementUserPoints(userEmail, parseFloat(amount));
        }

        await updateWithdrawalStatus(withdrawalId, newStatus);
    };

    const handleApproveDeposit = (deposit) => {
        setConfirmation({
            isOpen: true,
            title: 'Approve Deposit',
            message: `Are you sure you want to approve the deposit of $${deposit.amount}?`,
            type: 'info',
            confirmText: 'Approve',
            onConfirm: async () => {
                // 1. Update status
                await updateDepositStatus(deposit.id, 'approved');

                // 2. Fund user
                if (deposit.userEmail) {
                    await incrementUserPoints(deposit.userEmail, deposit.amount);
                    alert('Deposit approved and user funded.');
                } else {
                    alert('Error: User email missing on deposit record.');
                }
                closeConfirmation();
            }
        });
    };

    const handleRejectDeposit = async (deposit) => {
        const reason = prompt('Reason for rejection (optional):');
        if (reason === null) return;

        await updateDepositStatus(deposit.id, 'rejected', reason);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations, selectedUserId]);

    const handleSendReply = async () => {
        if (!replyMessage.trim() || !selectedUserId || isSending) return;
        setIsSending(true);
        const currentMessage = replyMessage.trim();
        setReplyMessage('');
        const result = await sendMessage({
            userId: selectedUserId,
            userEmail: selectedUserId,
            userName: 'Support Team',
            sender: 'admin',
            text: currentMessage,
            read: false
        });
        if (!result.success) {
            alert('Failed to send reply: ' + (result.error.message || result.error));
            setReplyMessage(currentMessage);
        }
        setIsSending(false);
    };

    const handleRewrite = async () => {
        if (!replyMessage.trim() || isRewriting) return;
        setIsRewriting(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const resp = await fetch(`${apiUrl}/admin/rewrite`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ message: replyMessage.trim() })
            });
            const data = await resp.json();
            if (data.success && data.rewritten) {
                setReplyMessage(data.rewritten);
            }
        } catch (err) {
            console.error('[Rewrite] Failed:', err);
        } finally {
            setIsRewriting(false);
        }
    };

    const handleClearHistory = () => {
        if (!selectedUserId) return;
        setConfirmation({
            isOpen: true,
            title: 'Clear History',
            message: 'Are you sure you want to delete this conversation history?',
            type: 'danger',
            confirmText: 'Clear',
            onConfirm: () => {
                alert('Clear history not supported in this version.');
                closeConfirmation();
            }
        });
    };

    const updateWinRate = async (userEmail, resultType) => {
        // Optimistically update local state immediately
        const userIndex = users.findIndex(u => u.email === userEmail);
        const originalUser = userIndex !== -1 ? users[userIndex] : null;

        if (userIndex !== -1) {
            const updatedUsers = [...users];
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], trade_result: resultType };
            setUsers(updatedUsers);
        }

        const result = await updateUserTradeResult(userEmail, resultType);

        if (!result.success) {
            // Revert on failure
            if (originalUser && userIndex !== -1) {
                const revertedUsers = [...users];
                revertedUsers[userIndex] = originalUser;
                setUsers(revertedUsers);
            }
            alert('Failed to update trade result: ' + result.error);
        }
    };



    const handleDeleteUser = (userId) => {
        setConfirmation({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to PERMANENTLY delete this user? This cannot be undone.',
            type: 'danger',
            confirmText: 'Delete Permanently',
            onConfirm: async () => {
                // Import deleteUserProfile dynamically or assume it's imported at top
                const { deleteUserProfile } = await import('../services/userService');
                const result = await deleteUserProfile(userId);

                if (result.success) {
                    // Remove from local state
                    setUsers(prev => prev.filter(u => u.id !== userId));
                    alert('User deleted permanently.');
                } else {
                    alert('Failed to delete user: ' + result.error);
                }
                closeConfirmation();
            }
        });
    };

    const updatePoints = async (userId, amount) => {
        const user = users.find(u => u.id === userId);
        if (user && user.email) {
            const currentPoints = user.balance || 0;
            await updateUserPoints(user.email, Math.max(0, currentPoints + amount), 'USDT');
        }
    };

    const setCustomPoints = async (userId) => {
        const amount = parseFloat(pointsInput[userId] || 0); // Use parseFloat for crypto precision
        if (!isNaN(amount)) {
            const user = users.find(u => u.id === userId);
            if (user && user.email) {
                const currency = pointsCurrency[userId] || 'USDT';
                await updateUserPoints(user.email, Math.max(0, amount), currency);
                setPointsInput({ ...pointsInput, [userId]: '' });
            }
        }
    };

    const handleMarkAsSeen = async (userId) => {
        // Optimistic UI update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, adminHasSeen: true } : u));

        // Backend update
        await markUserAsSeen(userId);
    };

    const handleResetPassword = async (email) => {
        const newPassword = prompt(`Enter new password for ${email}: `, 'password123');
        if (newPassword === null) return; // Cancelled

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        const result = await resetUserPassword(email, newPassword);
        if (result.success) {
            alert('Password reset successfully!');
        }
    };

    const handleToggleFreeze = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newStatus = !user.isFrozen;
        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFrozen: newStatus } : u));
        const result = await updateUserFreezeStatus(user.email, newStatus);
        if (!result.success) {
            // Revert on failure
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFrozen: !newStatus } : u));
            alert('Failed to update freeze status: ' + result.error);
        }
    };

    const handleToggleFavorite = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newFav = !user.isFavorite;
        // Optimistic update
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFavorite: newFav } : u));
        const result = await updateUserFavoriteStatus(userId, newFav);
        if (!result.success) {
            // Revert on failure
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFavorite: !newFav } : u));
            alert('Failed to update favorite status: ' + result.error);
        }
    };

    const loadMoreUsers = async () => {
        if (isLoadingMore || !hasMoreUsers) return;
        setIsLoadingMore(true);
        const result = await getUsersPaginated(lastUserDoc, 20);
        if (result.success) {
            setUsers(prev => [...prev, ...result.users]);
            setLastUserDoc(result.lastDoc);
            setHasMoreUsers(result.hasMore);
        }
        setIsLoadingMore(false);
    };

    const loadMoreVerifications = async () => {
        if (isLoadingMore || !hasMoreVerifications) return;
        setIsLoadingMore(true);
        const result = await getVerificationsPaginated(lastVerificationDoc, 10);
        if (result.success) {
            setVerifications(prev => [...prev, ...result.verifications]);
            setLastVerificationDoc(result.lastDoc);
            setHasMoreVerifications(result.hasMore);
        }
        setIsLoadingMore(false);
    };

    const loadMoreWithdrawals = async () => {
        if (isLoadingMore || !hasMoreWithdrawals) return;
        setIsLoadingMore(true);
        const result = await getWithdrawalsPaginated(lastWithdrawalDoc, 20);
        if (result.success) {
            setWithdrawals(prev => [...prev || [], ...result.withdrawals]);
            setLastWithdrawalDoc(result.lastDoc);
            setHasMoreWithdrawals(result.hasMore);
        }
        setIsLoadingMore(false);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : (timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp));
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const isAdminAccount = (u) => u.role === 'admin' || u.isAdmin === true || (u.email && u.email.toLowerCase().includes('admin'));
    
    // KYC Unverified users are those whose verificationStatus is not 'verified' (e.g. 'unverified', 'pending', or not set yet)
    const pendingUsers = users.filter(u => !isAdminAccount(u) && u.verificationStatus !== 'verified');
    // Broaden definition of 'approved'/active users to include anyone not pending/rejected
    const approvedUsers = users.filter(u => !isAdminAccount(u) && u.status !== 'pending' && u.status !== 'rejected');
    const rejectedUsers = users.filter(u => !isAdminAccount(u) && u.status === 'rejected');
    const pendingVerificationsCount = verifications.filter(v => v.verificationStatus === 'pending').length;

    // Sidebar Groups Configuration
    const sidebarGroups = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            action: () => setActiveSection('dashboard')
        },
        {
            id: 'users',
            label: 'Manage Users',
            icon: Users,
            submenu: [
                { id: 'activeUsers', label: 'Active Users', icon: UserCheck },
                { id: 'pending', label: 'KYC Unverified', icon: ShieldAlert },
                { id: 'banned', label: 'Banned Users', icon: Ban },
                { id: 'verifications', label: 'Identity Verification', icon: FileCheck },
                { id: 'notification', label: 'Send Notification', icon: Bell }
            ]
        },
        {
            id: 'manage_order',
            label: 'Manage Order',
            icon: ShoppingCart,
            submenu: [
                { id: 'open_order', label: 'Open Order', icon: Circle },
                { id: 'order_history', label: 'Order History', icon: History },
                { id: 'trade_history', label: 'Trade History', icon: ScrollText }
            ]
        },
        {
            id: 'transactions',
            label: 'Transactions',
            icon: DollarSign,
            submenu: [
                { id: 'manageTransactions', label: 'Manage Deposit & Withdrawal', icon: List },
                { id: 'depositRequests', label: 'Pending Deposits', icon: Clock },
                { id: 'withdrawals', label: 'Pending Withdrawals', icon: Upload }
            ]
        },
        {
            id: 'support',
            label: 'Support Ticket',
            icon: Headset,
            submenu: [
                { id: 'chat', label: 'Live Chat', icon: MessageSquare },
                { id: 'tickets', label: 'Pending Ticket', icon: Ticket },
                { id: 'closed_tickets', label: 'Closed Ticket', icon: CheckSquare }
            ]
        },
        {
            id: 'report',
            label: 'Report',
            icon: BarChart,
            submenu: [
                { id: 'transaction_history', label: 'Transaction History', icon: FileText },
                { id: 'login_history', label: 'Login History', icon: LogIn }
            ]
        },
        {
            id: 'settings',
            label: 'System Setting',
            icon: Settings,
            action: () => setActiveSection('settings')
        }
    ];

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#05080F] relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                </div>

                <div className="relative z-10 w-full max-w-md p-4 md:p-8">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col items-center mb-6 md:mb-10">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-gold p-[1px] mb-4 md:mb-6 shadow-glow">
                                <div className="w-full h-full rounded-2xl bg-[#0a0f1c] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white font-display tracking-wide mb-2">Admin Portal</h1>
                            <p className="text-gray-400 text-sm">Aurelian TD Trade Administration</p>
                            <p className="text-xs text-amber-500 mt-1 font-mono">v2026-01-15 (Debug)</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-primary mb-2 tracking-tight uppercase">Email Address</label>
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="admin@example.com"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:border-primary/50 focus:bg-black/60 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-primary mb-2 tracking-tight uppercase">Administrator Password</label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            value={passwordInput}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:border-primary/50 focus:bg-black/60 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-500"></div>
                                    </div>
                                </div>
                            </div>

                            {authError && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                                    {authError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full py-4 bg-gradient-gold text-black font-bold text-sm tracking-tight rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isLoggingIn ? 'Authenticating...' : 'Enter dashboard'}
                                    {!isLoggingIn && <ChevronRight size={16} />}
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>
                        </form>
                    </div>
                    <p className="text-center text-gray-600 text-xs mt-8">Secure Environment | Authorized Personnel Only</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#05080F] text-gray-100 font-sans overflow-hidden selection:bg-primary/30">
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={closeConfirmation}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
                type={confirmation.type}
                confirmText={confirmation.confirmText}
            />
            <RejectionModal
                isOpen={rejectionModal.isOpen}
                onClose={closeRejectionModal}
                onConfirm={rejectionModal.onConfirm}
                title={rejectionModal.title}
            />
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 bg-[#0a0f1c]/95 backdrop-blur-xl border-r border-[#D4AF37]/10 transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-72'} `}
            >
                <div className={`p-8 flex items-center ${isSidebarCollapsed ? 'justify-center p-4' : 'gap-4'} relative transition-all duration-300`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] shrink-0">
                        <span className="material-symbols-outlined text-black font-bold text-2xl">admin_panel_settings</span>
                    </div>

                    {!isSidebarCollapsed && (
                        <div className="overflow-hidden whitespace-nowrap">
                            <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-gold tracking-wider">AURELIAN</h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold ml-0.5">Admin Portal</p>
                        </div>
                    )}

                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden absolute right-4 top-8 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Desktop Collapse Button */}
                    {/* Desktop Collapse Button */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="hidden md:flex absolute -right-4 top-9 w-8 h-8 bg-[#0a0f1c] border border-white/20 rounded-full items-center justify-center text-gray-200 hover:text-white hover:border-primary hover:bg-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 z-50 group"
                        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isSidebarCollapsed ?
                            <ChevronRight size={18} className="group-hover:scale-110 transition-transform" /> :
                            <ChevronLeft size={18} className="group-hover:scale-110 transition-transform" />
                        }
                    </button>
                </div>

                <div className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-20">
                    {sidebarGroups.map((group) => (
                        <div key={group.id} className="mb-2">
                            {group.submenu ? (
                                <>
                                    <button
                                        onClick={() => !isSidebarCollapsed && toggleMenu(group.id)}
                                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-3'} text-gray-400 hover:text-white hover: bg - white/5 rounded-xl transition-all duration-300 group`}
                                        title={isSidebarCollapsed ? group.label : ''}
                                    >
                                        <div className={`flex items-center ${isSidebarCollapsed ? '' : 'gap-3'} `}>
                                            <group.icon size={18} className="group-hover:text-primary transition-colors" />
                                            {!isSidebarCollapsed && <span className="font-medium text-sm">{group.label}</span>}
                                        </div>
                                        {!isSidebarCollapsed && <ChevronDown size={14} className={`transition-transform duration-300 ${expandedMenus[group.id] ? 'rotate-180' : ''} `} />}
                                    </button>

                                    {!isSidebarCollapsed && (
                                        <div className={`overflow-hidden transition-all duration-300 ${expandedMenus[group.id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'} `}>
                                            <div className="pl-4 mt-1 space-y-1 relative">
                                                <div className="absolute left-6 top-0 bottom-0 w-px bg-white/5"></div>
                                                {group.submenu.map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => { setActiveSection(sub.id); setIsSidebarOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all duration-300 relative overflow-hidden pl-8 ${activeSection === sub.id
                                                            ? 'text-primary bg-primary/10 border-r-2 border-primary'
                                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                            } `}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full absolute left-3 transition-colors ${activeSection === sub.id ? 'bg-primary shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-gray-700'} `}></span>
                                                        {sub.label}
                                                        {sub.id === 'pending' && pendingUsers.length > 0 && <span className="ml-auto px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-bold rounded-full">{pendingUsers.length}</span>}
                                                        {sub.id === 'depositRequests' && depositRequests.length > 0 && <span className="ml-auto px-1.5 py-0.5 bg-green-500 text-black text-[9px] font-bold rounded-full">{depositRequests.length}</span>}
                                                        {sub.id === 'verifications' && pendingVerificationsCount > 0 && <span className="ml-auto px-1.5 py-0.5 bg-blue-500 text-black text-[9px] font-bold rounded-full">{pendingVerificationsCount}</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => { if(group.action) group.action(); setIsSidebarOpen(false); }}
                                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-300 group ${activeSection === group.id
                                        ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-2 border-primary'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        } `}
                                    title={isSidebarCollapsed ? group.label : ''}
                                >
                                    <group.icon size={18} className={`${activeSection === group.id ? 'text-primary' : 'group-hover:text-primary'} transition-colors`} />
                                    {!isSidebarCollapsed && <span className="font-medium text-sm">{group.label}</span>}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer User Profile */}
                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/5 bg-[#0a0f1c]/95 backdrop-blur-md">
                    <p className="text-[10px] text-gray-600 font-mono opacity-50">v1.9</p>
                    <button
                        onClick={handleLogout}
                        className={`w-full py-3 ${isSidebarCollapsed ? 'px-2 justify-center' : 'px-4 justify-center gap-2'} bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-xl text-red-200 text-sm font-semibold flex items-center transition-all duration-300 group`}
                        title={isSidebarCollapsed ? "Sign Out" : ""}
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {!isSidebarCollapsed && "Sign Out"}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-md"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className={`flex-1 ml-0 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'} p-4 md:p-8 lg:p-10 min-h-screen box-border bg-[#05080F] transition-all duration-300 relative overflow-y-auto custom-scrollbar`}>
                {/* Background Glow */}
                < div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" ></div >

                <div className="w-full relative z-10 transition-all duration-500 animate-fade-in pb-20">
                    {/* Header */}
                    <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 text-left">
                        <div>
                            <div className="flex items-center gap-3 md:hidden mb-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                                >
                                    <Menu size={20} />
                                </button>
                                <span className="font-display font-bold text-white">AURELIAN ADMIN</span>
                            </div>
                            <h2 className="text-xl md:text-3xl font-bold text-white font-display tracking-wide flex items-center gap-3">
                                {activeSection === 'dashboard' && <><span className="w-2 h-8 bg-gradient-gold rounded-full"></span> Dashboard Overview</>}
                                {activeSection === 'activeUsers' && <><span className="w-2 h-8 bg-green-500 rounded-full"></span> Active Users</>}
                                {activeSection === 'pending' && <><span className="w-2 h-8 bg-amber-500 rounded-full"></span> Pending Approvals</>}
                                {activeSection === 'banned' && <><span className="w-2 h-8 bg-red-500 rounded-full"></span> Banned Users</>}
                                {activeSection === 'verifications' && <><span className="w-2 h-8 bg-blue-500 rounded-full"></span> Identity Verifications</>}
                                {activeSection === 'depositRequests' && <><span className="w-2 h-8 bg-green-400 rounded-full"></span> Pending Deposits</>}
                                {activeSection === 'approvedDeposits' && <><span className="w-2 h-8 bg-green-600 rounded-full"></span> Approved Deposits</>}
                                {activeSection === 'rejectedDeposits' && <><span className="w-2 h-8 bg-red-400 rounded-full"></span> Rejected Deposits</>}
                                {activeSection === 'allDeposits' && <><span className="w-2 h-8 bg-gray-400 rounded-full"></span> All Deposits</>}
                                {activeSection === 'withdrawals' && <><span className="w-2 h-8 bg-red-400 rounded-full"></span> Pending Withdrawals</>}
                                {activeSection === 'approvedWithdrawals' && <><span className="w-2 h-8 bg-green-500 rounded-full"></span> Approved Withdrawals</>}
                                {activeSection === 'rejectedWithdrawals' && <><span className="w-2 h-8 bg-red-600 rounded-full"></span> Rejected Withdrawals</>}
                                {activeSection === 'allWithdrawals' && <><span className="w-2 h-8 bg-gray-400 rounded-full"></span> All Withdrawals</>}
                                {activeSection === 'chat' && <><span className="w-2 h-8 bg-primary rounded-full"></span> Customer Support</>}
                            </h2>
                            <p className="text-gray-400 mt-2 text-xs md:text-sm">Manage and monitor platform activity in real-time</p>
                        </div>

                        {/* Quick Stats Summary */}
                        <div className="hidden lg:flex gap-4">
                            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="text-xs text-gray-400 font-bold mb-1">Total Users</div>
                                <div className="text-xl font-bold text-white font-mono">{users.length}</div>
                            </div>
                            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="text-xs text-gray-400 font-bold mb-1">Pending</div>
                                <div className="text-xl font-bold text-amber-500 font-mono">{pendingUsers.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Section Rendering */}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Top Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-[#131b2f]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group hover:border-primary/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Users size={64} className="text-primary" />
                                    </div>
                                    <h3 className="text-gray-400 font-bold tracking-tight text-sm mb-1">Total Active Users</h3>
                                    <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                                        {approvedUsers.length} <span className="text-xs text-primary font-medium tracking-wider uppercase opacity-70">Verified</span>
                                    </div>
                                </div>

                                <div className="bg-[#131b2f]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group hover:border-green-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <ArrowDownToLine size={64} className="text-green-500" />
                                    </div>
                                    <h3 className="text-gray-400 font-medium tracking-wide text-sm mb-1 uppercase">Total Lifetime Deposits</h3>
                                    <div className="text-3xl font-bold text-green-500 flex items-baseline gap-2">
                                        ${totalDespositsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>

                                <div className="bg-[#131b2f]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group hover:border-red-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <ArrowUpFromLine size={64} className="text-red-500" />
                                    </div>
                                    <h3 className="text-gray-400 font-medium tracking-wide text-sm mb-1 uppercase">Total Lifetime Withdrawals</h3>
                                    <div className="text-3xl font-bold text-red-500 flex items-baseline gap-2">
                                        ${totalWithdrawalsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>

                                <div className="bg-[#131b2f]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <CandlestickChart size={64} className="text-purple-500" />
                                    </div>
                                    <h3 className="text-gray-400 font-bold tracking-tight text-sm mb-1">Total Platform Trapped Value</h3>
                                    <div className="text-3xl font-bold text-purple-400 flex items-baseline gap-2">
                                        ${totalUsersBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            {/* Main Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Trading Volume Chart */}
                                <div className="bg-[#131b2f]/80 backdrop-blur-xl p-4 md:p-6 rounded-3xl border border-white/5 shadow-xl">
                                    <h3 className="text-base md:text-lg font-bold tracking-wide text-white mb-6">Trading Volume (Last 7 Active Days)</h3>
                                    <div className="h-[250px] md:h-[300px] w-full">
                                        {chartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#d5a04e" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="#d5a04e" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: '#0a0f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                                                        itemStyle={{ color: '#d5a04e' }}
                                                    />
                                                    <Area type="monotone" dataKey="volume" stroke="#d5a04e" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" name="Traded Volume" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">Not enough trade data to display</div>
                                        )}
                                    </div>
                                </div>

                                {/* Win/Loss Split Chart */}
                                <div className="bg-[#131b2f]/80 backdrop-blur-xl p-4 md:p-6 rounded-3xl border border-white/5 shadow-xl">
                                    <h3 className="text-base md:text-lg font-bold tracking-wide text-white mb-6">User Performance Split</h3>
                                    <div className="h-[250px] md:h-[300px] w-full">
                                        {chartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                    <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: '#0a0f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                                                    />
                                                    <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={3} name="User Wins ($)" dot={{ r: 4, fill: '#16a34a' }} activeDot={{ r: 6 }} />
                                                    <Line type="monotone" dataKey="losses" stroke="#dc2626" strokeWidth={3} name="User Losses ($)" dot={{ r: 4, fill: '#dc2626' }} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">Not enough trade data to display</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reusing Existing Components for mapped sections */}
                    {(activeSection === 'users' || activeSection === 'activeUsers') && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            {approvedUsers.length === 0 ? (
                                <div className="p-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Users size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Active Users</h3>
                                    <p className="text-gray-400">There are no approved users in the system yet.</p>
                                </div>
                            ) : (
                                <>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5 border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User Details</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Credentials</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Balance</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Win Rate</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {approvedUsers.map(user => (
                                                <tr key={user.id} className="hover:bg-white/5 transition-colors group/row">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10">
                                                                {(user.full_name && user.full_name.length > 0 ? user.full_name : (user.email || '?')).charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white group-hover/row:text-primary transition-colors flex items-center gap-2">
                                                                    {user.full_name || user.name || 'Unknown User'}
                                                                    {user.isFavorite && (
                                                                        <Star size={13} className="text-yellow-400 fill-yellow-400 shrink-0" />
                                                                    )}
                                                                    {user.adminHasSeen === false && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleMarkAsSeen(user.id); }}
                                                                            className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse hover:bg-blue-500/40 transition-colors"
                                                                            title="Click to dismiss 'NEW' label"
                                                                        >
                                                                            NEW
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <span className="text-gray-500 w-16">Password:</span>
                                                                <span className="font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[10px]">
                                                                    ••••••••
                                                                </span>
                                                                <span className="text-gray-600 text-[9px]">(encrypted)</span>
                                                            </div>
                                                            {user.withdrawPassword && (
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="text-gray-500 w-16">W-Pass:</span>
                                                                    <span className="font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{user.withdrawPassword}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-2 bg-black/30 p-2 rounded-xl w-fit border border-white/5">
                                                            <div className="flex gap-4 mb-1">
                                                                <div className="text-xs">
                                                                    <span className="text-gray-500">USDT:</span> <span className="text-white font-bold font-mono">${user.balance?.toLocaleString() || '0'}</span>
                                                                </div>
                                                                {(user.btcBalance > 0) && (
                                                                    <div className="text-xs">
                                                                        <span className="text-gray-500">BTC:</span> <span className="text-white font-bold font-mono">{user.btcBalance}</span>
                                                                    </div>
                                                                )}
                                                                {(user.ethBalance > 0) && (
                                                                    <div className="text-xs">
                                                                        <span className="text-gray-500">ETH:</span> <span className="text-white font-bold font-mono">{user.ethBalance}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => updatePoints(user.id, -100)}
                                                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold rounded transition-all border border-red-500/20"
                                                                    title="Subtract $100"
                                                                >
                                                                    -100
                                                                </button>
                                                                <button
                                                                    onClick={() => updatePoints(user.id, 100)}
                                                                    className="px-2 py-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white text-xs font-bold rounded transition-all border border-green-500/20"
                                                                    title="Add $100"
                                                                >
                                                                    +100
                                                                </button>
                                                                
                                                                <select
                                                                    value={pointsCurrency[user.id] || 'USDT'}
                                                                    onChange={(e) => setPointsCurrency({ ...pointsCurrency, [user.id]: e.target.value })}
                                                                    className="w-16 px-1 py-1 bg-white/5 border border-white/10 rounded text-white text-[10px] font-bold outline-none focus:border-primary/50 ml-1"
                                                                >
                                                                    <option value="USDT">USDT</option>
                                                                    <option value="BTC">BTC</option>
                                                                    <option value="ETH">ETH</option>
                                                                </select>

                                                                <input
                                                                    type="number"
                                                                    placeholder="Amount"
                                                                    value={pointsInput[user.id] || ''}
                                                                    onChange={(e) => setPointsInput({ ...pointsInput, [user.id]: e.target.value })}
                                                                    className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:border-primary/50 focus:outline-none"
                                                                />
                                                                <button
                                                                    onClick={() => setCustomPoints(user.id)}
                                                                    className="px-2 py-1 bg-primary/10 hover:bg-primary text-primary hover:text-black text-xs font-bold rounded transition-all border border-primary/20"
                                                                    title="Set Custom Balance"
                                                                >
                                                                    Set
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex gap-1 bg-black/30 p-1 rounded-lg w-fit border border-white/5">
                                                            {['win', 'loss'].map(type => (
                                                                <button
                                                                    key={type}
                                                                    onClick={() => updateWinRate(user.email, type)}
                                                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all duration-300 ${winRates[user.email] === type || user.trade_result === type
                                                                        ? (type === 'win' ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]')
                                                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                                        }`}
                                                                >
                                                                    {type}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                            Active
                                                        </span>
                                                        <div className="text-[10px] text-gray-500 mt-2">
                                                            {user.registeredAt}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleToggleFavorite(user.id)}
                                                                className={`p-2 rounded-lg transition-all duration-300 border ${user.isFavorite ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30' : 'bg-white/5 text-gray-500 border-white/10 hover:text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/20'}`}
                                                                title={user.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                                                            >
                                                                <Star size={16} className={user.isFavorite ? 'fill-yellow-400' : ''} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleFreeze(user.id, user.isFrozen)}
                                                                className={`p-2 rounded-lg transition-all duration-300 border ${user.isFrozen ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-black' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'}`}
                                                                title={user.isFrozen ? "Unfreeze User" : "Freeze User"}
                                                            >
                                                                {user.isFrozen ? <CheckCircle size={18} /> : <Ban size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleResetPassword(user.email)}
                                                                className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-lg transition-all duration-300 border border-blue-500/20 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                                                title="Reset Password"
                                                            >
                                                                <RefreshCw size={18} />
                                                            </button>
                                                            <div className="w-px h-8 bg-white/10 mx-1"></div>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile User Cards View */}
                                <div className="md:hidden divide-y divide-white/5">
                                    {approvedUsers.map(user => (
                                        <div key={user.id} className="p-4 space-y-4 hover:bg-white/5 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10">
                                                        {(user.full_name && user.full_name.length > 0 ? user.full_name : (user.email || '?')).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white flex items-center gap-2">
                                                            {user.full_name || user.name || 'Unknown'}
                                                            {user.isFavorite && <Star size={12} className="text-yellow-400 fill-yellow-400 shrink-0" />}
                                                            {user.adminHasSeen === false && <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold">NEW</span>}
                                                        </div>
                                                        <div className="text-gray-500 text-[10px] break-all">{user.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">Active</span>
                                                    <div className="text-[9px] text-gray-600">{user.registeredAt}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                                <div>
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Balance</div>
                                                    <div className="text-lg font-bold text-primary font-mono">${user.balance?.toLocaleString() || '0'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Trade Result</div>
                                                    <div className="flex gap-1">
                                                        {['win', 'loss'].map(type => (
                                                            <button
                                                                key={type}
                                                                onClick={() => updateWinRate(user.email, type)}
                                                                className={`flex-1 py-1 rounded text-[9px] font-bold uppercase ${winRates[user.email] === type || user.trade_result === type
                                                                    ? (type === 'win' ? 'bg-green-500 text-black' : 'bg-red-500 text-white')
                                                                    : 'bg-white/5 text-gray-500'}`}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 pt-2">
                                                <div className="flex gap-1">
                                                    <button onClick={() => updatePoints(user.id, -100)} className="px-2 py-1.5 bg-red-500/10 text-red-500 rounded text-[10px] font-bold border border-red-500/10">-100</button>
                                                    <button onClick={() => updatePoints(user.id, 100)} className="px-2 py-1.5 bg-green-500/10 text-green-500 rounded text-[10px] font-bold border border-green-500/10">+100</button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleToggleFavorite(user.id)} className={`p-2 rounded-lg border ${user.isFavorite ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-white/5 text-gray-500 border-white/10'}`} title={user.isFavorite ? 'Unfavorite' : 'Favorite'}><Star size={15} className={user.isFavorite ? 'fill-yellow-400' : ''} /></button>
                                                    <button onClick={() => handleToggleFreeze(user.id, user.isFrozen)} className={`p-2 rounded-lg border ${user.isFrozen ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-gray-400 border-white/10'}`}><Ban size={16} /></button>
                                                    <button onClick={() => resetUserPassword(user.id)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20"><RefreshCw size={16} /></button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </>
                            )}
                            {hasMoreUsers && (
                                <div className="p-5 text-center border-t border-white/5">
                                    <button
                                        onClick={loadMoreUsers}
                                        disabled={isLoadingMore}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all hover:scale-105"
                                    >
                                        {isLoadingMore ? 'Loading...' : 'Load More Users'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pending Users (Existing) */}
                    {activeSection === 'pending' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            {pendingUsers.length === 0 ? (
                                <div className="p-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Check size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                                    <p className="text-gray-400">There are no pending user approvals at the moment.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-white/5 border-b border-white/5">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User Details</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Credentials</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">KYC Status</th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {pendingUsers.map(user => (
                                                    <tr key={user.id} className="hover:bg-white/5 transition-colors group/row">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10">
                                                                    {user.full_name && user.full_name.length > 0 ? user.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-white group-hover/row:text-primary transition-colors flex items-center gap-2">
                                                                        {user.full_name || user.name || 'Unknown User'}
                                                                        {user.adminHasSeen === false && (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); handleMarkAsSeen(user.id); }}
                                                                                className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse hover:bg-blue-500/40 transition-colors"
                                                                                title="Click to dismiss 'NEW' label"
                                                                            >
                                                                                NEW
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-gray-500 text-xs mt-0.5">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="text-gray-500 w-16">Password:</span>
                                                                    <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">{user.password}</span>
                                                                </div>
                                                                {user.withdrawPassword && (
                                                                    <div className="flex items-center gap-2 text-xs">
                                                                        <span className="text-gray-500 w-16">W-Pass:</span>
                                                                        <span className="font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{user.withdrawPassword}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border ${user.verificationStatus === 'pending'
                                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                                }`}>
                                                                {user.verificationStatus || 'unverified'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveSection('verifications');
                                                                    }}
                                                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                                                                >
                                                                    Check Documents
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Pending User Cards View */}
                                    <div className="md:hidden divide-y divide-white/5">
                                        {pendingUsers.map(user => (
                                            <div key={user.id} className="p-4 space-y-4 hover:bg-white/5 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10">
                                                            {user.full_name && user.full_name.length > 0 ? user.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white flex items-center gap-2">
                                                                {user.full_name || 'Unknown'}
                                                                {user.adminHasSeen === false && <span className="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold">NEW</span>}
                                                            </div>
                                                            <div className="text-gray-500 text-[10px] break-all">{user.email}</div>
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>
                                                </div>

                                                <div className="grid grid-cols-1 gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Password</span>
                                                        <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[10px]">{user.password}</span>
                                                    </div>
                                                    {user.withdrawPassword && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">W-Pass</span>
                                                            <span className="font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">{user.withdrawPassword}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="pt-2">
                                                    <button
                                                        onClick={() => setActiveSection('verifications')}
                                                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg"
                                                    >
                                                        Check Documents
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {hasMoreUsers && (
                                <div className="p-5 text-center border-t border-white/5">
                                    <button
                                        onClick={loadMoreUsers}
                                        disabled={isLoadingMore}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all hover:scale-105"
                                    >
                                        {isLoadingMore ? 'Loading...' : 'Load More Users'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}



                    {activeSection === 'depositRequests' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            {depositRequests.length === 0 ? (
                                <div className="p-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <DollarSign size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Requests</h3>
                                    <p className="text-gray-400">There are no deposit requests at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 p-6">
                                    {depositRequests.map(d => (
                                        <div key={d.id} className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:border-white/10 transition-all duration-300">
                                            {/* Proof Image */}
                                            <div className="w-full md:w-64 flex-shrink-0">
                                                <div className="bg-black/50 rounded-xl overflow-hidden border border-white/5 h-48 md:h-full relative group/img">
                                                    {d.proofBase64 ? (
                                                        <>
                                                            <img src={d.proofBase64} alt="Proof" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                                                <span className="text-xs font-bold uppercase tracking-widest text-white border border-white/20 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-md">View Receipt</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs italic">
                                                            No Proof Attached
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h4 className="text-2xl font-bold text-white font-mono">{d.amount} <span className="text-sm text-gray-500 font-sans">{d.currency.toUpperCase()}</span></h4>
                                                                <span className={`px - 2.5 py - 0.5 rounded-full text - [10px] font - bold uppercase tracking - wide border ${d.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : (d.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')} `}>
                                                                    {d.status}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-400 font-mono">{d.userEmail || d.userId}</div>
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono">
                                                            {d.createdAt?.seconds ? new Date(d.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {d.status === 'pending' && (
                                                    <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                                                        <button
                                                            onClick={() => handleApproveDeposit(d)}
                                                            className="flex-1 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                                                        >
                                                            <Check size={18} /> Approve & Fund
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectDeposit(d)}
                                                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all duration-300 border border-white/10 hover:border-red-500/50 hover:text-red-400"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'approved' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            {approvedUsers.length === 0 ? (
                                <div className="p-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Users size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Verified Users</h3>
                                    <p className="text-gray-400">Verified users will appear here.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5 border-b border-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">User Profile</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Financials</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Win Rate</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Management</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {approvedUsers.map(user => (
                                                <tr key={user.id} className="hover:bg-white/5 transition-colors group/row">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-[#0a0f1c] border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                                {user.full_name && user.full_name.length > 0 ? user.full_name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white flex items-center gap-2">
                                                                    {user.full_name || user.name || 'Unknown User'}
                                                                    {user.isFrozen && <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 rounded uppercase tracking-wider font-bold">Frozen</span>}
                                                                </div>
                                                                <div className="text-gray-500 text-xs mt-0.5 font-mono">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-2 bg-black/30 p-2 rounded-xl w-fit border border-white/5">
                                                            <div className="flex gap-4 mb-1">
                                                                <div className="text-xs">
                                                                    <span className="text-gray-500">USDT:</span> <span className="text-[13px] text-white font-bold font-mono">${(user.points || user.balance || 0).toLocaleString()}</span>
                                                                </div>
                                                                {(user.btcBalance > 0) && (
                                                                    <div className="text-xs">
                                                                        <span className="text-gray-500">BTC:</span> <span className="text-[13px] text-white font-bold font-mono">{user.btcBalance}</span>
                                                                    </div>
                                                                )}
                                                                {(user.ethBalance > 0) && (
                                                                    <div className="text-xs">
                                                                        <span className="text-gray-500">ETH:</span> <span className="text-[13px] text-white font-bold font-mono">{user.ethBalance}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-1 text-[10px]">
                                                                <button onClick={() => updatePoints(user.id, -100)} className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors"><Minus size={10} /></button>
                                                                <button onClick={() => updatePoints(user.id, 100)} className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-green-500/20 hover:text-green-400 transition-colors"><Plus size={10} /></button>
                                                                <div className="flex items-center ml-1">
                                                                    <select
                                                                        value={pointsCurrency[user.id] || 'USDT'}
                                                                        onChange={(e) => setPointsCurrency({ ...pointsCurrency, [user.id]: e.target.value })}
                                                                        className="w-14 bg-black/30 border border-white/10 rounded-l px-1 py-0.5 text-center text-white outline-none focus:border-primary/50"
                                                                    >
                                                                        <option value="USDT">USDT</option>
                                                                        <option value="BTC">BTC</option>
                                                                        <option value="ETH">ETH</option>
                                                                    </select>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Set"
                                                                        value={pointsInput[user.id] || ''}
                                                                        onChange={(e) => setPointsInput({ ...pointsInput, [user.id]: e.target.value })}
                                                                        className="w-14 bg-black/30 border-y border-r border-white/10 px-1 py-0.5 text-center outline-none focus:border-primary/50"
                                                                    />
                                                                    <button onClick={() => setCustomPoints(user.id)} className="px-2 py-0.5 bg-primary/20 hover:bg-primary/40 text-primary border-y border-r border-primary/20 rounded-r font-bold transition-colors">Set</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex gap-1 bg-black/30 p-1 rounded-lg w-fit border border-white/5">
                                                            {['win', 'loss'].map(type => (
                                                                <button
                                                                    key={type}
                                                                    onClick={() => updateWinRate(user.email, type)}
                                                                    className={`px - 3 py - 1 rounded - md text - [10px] font - bold uppercase transition-all duration-300 ${winRates[user.email] === type
                                                                        ? (type === 'win' ? 'bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]')
                                                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                                        } `}
                                                                >
                                                                    {type}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => handleResetPassword(user.email)} className="p-2 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black rounded-lg transition-all border border-amber-500/20" title="Reset Password"><Key size={16} /></button>
                                                            <button onClick={() => handleToggleFreeze(user.id)} className={`p - 2 rounded-lg transition-all border ${user.isFrozen ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-white/5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 border-white/10'} `} title={user.isFrozen ? "Unfreeze" : "Freeze"}><Snowflake size={16} /></button>
                                                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/20" title="Delete"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {hasMoreUsers && (
                                <div className="p-5 text-center border-t border-white/5">
                                    <button
                                        onClick={loadMoreUsers}
                                        disabled={isLoadingMore}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all hover:scale-105"
                                    >
                                        {isLoadingMore ? 'Loading...' : 'Load More Users'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'rejected' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            {rejectedUsers.length === 0 ? (
                                <div className="p-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <X size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Rejected Users</h3>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {rejectedUsers.map(user => (
                                        <div key={user.id} className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors opacity-60 hover:opacity-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold">
                                                    {(user.full_name && user.full_name.length > 0 ? user.full_name : (user.email || '?')).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white line-through decoration-red-500/50">{user.full_name || user.name || 'Unknown User'}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Permanently"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'verifications' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            {verifications.length === 0 ? (
                                <div className="p-20 flex flex-col items-center justify-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <FileCheck size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No active verifications</h3>
                                </div>
                            ) : (
                                <>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-white/5 border-b border-white/5">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Applicant</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {verifications.map(v => (
                                                    <tr key={v.id} className="hover:bg-white/5 transition-colors group/row">
                                                        <td className="px-6 py-5">
                                                            <div className="font-bold text-white">{v.verificationData?.fullName || 'N/A'}</div>
                                                            <div className="text-gray-500 text-xs mt-0.5">{v.email}</div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-xs text-gray-400"><span className="text-gray-600 uppercase font-bold mr-2">ID:</span> {v.verificationData?.idNumber || 'N/A'}</div>
                                                            <div className="text-xs text-gray-400 mt-1"><span className="text-gray-600 uppercase font-bold mr-2">Sent:</span> {v.verificationData?.submittedAt ? new Date(v.verificationData.submittedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${v.verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : (v.verificationStatus === 'verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')}`}>
                                                                {v.verificationStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => setSelectedVerification(v)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">View Docs</button>
                                                                {v.verificationStatus === 'pending' && (
                                                                    <>
                                                                        <button onClick={async () => {
                                                                            const result = await updateVerificationStatus(v.id, 'verified', null, v.userId);
                                                                            if (result.success) setVerifications(prev => prev.map(item => item.id === v.id ? { ...item, verificationStatus: 'verified' } : item));
                                                                        }} className="p-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-lg transition-all border border-green-500/20"><Check size={16} /></button>
                                                                        <button onClick={async () => {
                                                                            const reason = prompt('Reason:');
                                                                            if (reason !== null) {
                                                                                const result = await updateVerificationStatus(v.id, 'rejected', reason, v.userId);
                                                                                if (result.success) setVerifications(prev => prev.map(item => item.id === v.id ? { ...item, verificationStatus: 'rejected' } : item));
                                                                            }
                                                                        }} className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"><X size={16} /></button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="md:hidden divide-y divide-white/5">
                                        {verifications.map(v => (
                                            <div key={v.id} className="p-4 space-y-4 hover:bg-white/5 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{v.verificationData?.fullName || 'N/A'}</div>
                                                        <div className="text-gray-500 text-[10px] break-all">{v.email}</div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${v.verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : (v.verificationStatus === 'verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20')}`}>
                                                        {v.verificationStatus}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 bg-black/20 p-3 rounded-xl border border-white/5 text-[10px]">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600 font-bold uppercase">ID Number</span>
                                                        <span className="text-gray-300">{v.verificationData?.idNumber || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setSelectedVerification(v)} className="flex-1 py-1 px-3 bg-white/5 text-white border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors">Docs</button>
                                                    {v.verificationStatus === 'pending' && (
                                                        <>
                                                            <button onClick={async () => {
                                                                const result = await updateVerificationStatus(v.id, 'verified', null, v.userId);
                                                                if (result.success) setVerifications(prev => prev.map(item => item.id === v.id ? { ...item, verificationStatus: 'verified' } : item));
                                                            }} className="p-1 px-2 bg-green-500/10 text-green-500 rounded border border-green-500/20"><Check size={16} /></button>
                                                            <button onClick={async () => {
                                                                const reason = prompt('Reason:');
                                                                if (reason !== null) {
                                                                    const result = await updateVerificationStatus(v.id, 'rejected', reason, v.userId);
                                                                    if (result.success) setVerifications(prev => prev.map(item => item.id === v.id ? { ...item, verificationStatus: 'rejected' } : item));
                                                                }
                                                            }} className="p-1 px-2 bg-red-500/10 text-red-500 rounded border border-red-500/20"><X size={16} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {hasMoreVerifications && (
                                <div className="p-5 text-center border-t border-white/5">
                                    <button
                                        onClick={loadMoreVerifications}
                                        disabled={isLoadingMore}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all hover:scale-105"
                                    >
                                        {isLoadingMore ? 'Loading...' : 'Load More Verifications'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'chat' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[70vh] md:h-[calc(100vh-180px)] min-h-[500px] relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            {/* Sidebar /Chat List */}
                            <div className={`${selectedUserId ? 'hidden md:block' : 'w-full'} md:w-80 border-r border-white/5 overflow-y-auto bg-black/20`}>
                                <div className="p-4 border-b border-white/5 sticky top-0 bg-[#0a0f1c]/95 backdrop-blur-md z-10 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Conversations</h3>
                                        <button 
                                            onClick={() => setIsNewChatMode(!isNewChatMode)}
                                            className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                                            title="New Chat"
                                        >
                                            {isNewChatMode ? <X size={14} /> : <Plus size={14} />}
                                        </button>
                                    </div>
                                    {isNewChatMode && (
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input 
                                                type="text" 
                                                placeholder="Search user..."
                                                value={newChatSearch}
                                                onChange={(e) => setNewChatSearch(e.target.value)}
                                                className="w-full bg-black/40 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary/30 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                                {isNewChatMode ? (
                                    // New Chat mode: search through registered users
                                    users.filter(u => u.role !== 'admin' && (u.email.toLowerCase().includes(newChatSearch.toLowerCase()) || (u.displayName && u.displayName.toLowerCase().includes(newChatSearch.toLowerCase())))).slice(0, 50).map(u => (
                                        <div
                                            key={u.email}
                                            onClick={() => {
                                                setSelectedUserId(u.email);
                                                setIsNewChatMode(false);
                                                setNewChatSearch('');
                                            }}
                                            className={`p-4 border-b border-white/5 cursor-pointer flex gap-3 transition-all duration-200 ${selectedUserId === u.email ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs relative">
                                                {(u.displayName || u.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden flex-1 flex flex-col justify-center">
                                                <div className={`font-bold text-sm truncate ${selectedUserId === u.email ? 'text-primary' : 'text-gray-300'}`}>{u.displayName || u.email.split('@')[0]}</div>
                                                <div className="text-xs text-gray-500 truncate">{u.email}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        {conversations.length === 0 && (
                                            <div className="p-8 text-center">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                                    <MessageCircle size={20} className="text-gray-500" />
                                                </div>
                                                <div className="text-gray-500 text-sm">No messages yet</div>
                                            </div>
                                        )}
                                        {conversations.map(conv => {
                                            const unread = conv.unread || 0;
                                            return (
                                                <div
                                                    key={conv.userEmail}
                                                    onClick={() => setSelectedUserId(conv.userEmail)}
                                                    className={`p-4 border-b border-white/5 cursor-pointer flex gap-3 transition-all duration-200 ${selectedUserId === conv.userEmail ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-white/5 border-l-4 border-l-transparent'}`}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs relative">
                                                        {(conv.userName || conv.userEmail).charAt(0).toUpperCase()}
                                                        {unread > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0f1c]"></span>}
                                                    </div>
                                                    <div className="overflow-hidden flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className={`font-bold text-sm truncate ${selectedUserId === conv.userEmail ? 'text-primary' : 'text-gray-300'}`}>{conv.userName || conv.userEmail.split('@')[0]}</div>
                                                            <span className="text-[10px] text-gray-500">{conv.timestamp ? formatTime(conv.timestamp) : ''}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 truncate flex justify-between items-center">
                                                            <span>{conv.lastMessage}</span>
                                                            {unread > 0 && <span className="px-1.5 py-0.5 bg-primary text-black text-[9px] font-bold rounded-full">{unread}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 flex flex-col bg-black/20 min-h-0 h-full">
                                {selectedUserId ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0f1c]/95 backdrop-blur-md flex-shrink-0">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setSelectedUserId(null)}
                                                    className="md:hidden p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                                                    {selectedUserId.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{selectedUserId}</div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        <span className="text-xs text-green-500">Active Now</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleClearHistory}
                                                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                                title="Clear History"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar overscroll-contain touch-pan-y">
                                            {conversations.find(c => c.userEmail === selectedUserId)?.messages?.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm relative group ${msg.direction === 'outbound'
                                                        ? 'bg-gradient-gold text-black rounded-tr-none'
                                                        : 'bg-white/10 text-white rounded-tl-none hover:bg-white/15 transition-colors'
                                                        }`}>
                                                        <div className="text-sm font-medium leading-relaxed">{msg.text}</div>
                                                        <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${msg.direction === 'outbound' ? 'text-black/60 justify-end' : 'text-gray-400'}`}>
                                                            {formatTime(msg.created_at)}
                                                            {msg.direction === 'outbound' && <Check size={12} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input */}
                                        <div className="p-4 border-t border-white/5 bg-[#0a0f1c]/95 backdrop-blur-md flex-shrink-0">
                                            {/* AI rewrite badge */}
                                            {isRewriting && (
                                                <div className="flex items-center gap-2 mb-2 px-1 flex-shrink-0">
                                                    <Sparkles size={12} className="text-primary animate-pulse" />
                                                    <span className="text-[10px] text-primary font-medium tracking-wide">Rewriting with AI...</span>
                                                </div>
                                            )}
                                            <form
                                                onSubmit={(e) => { e.preventDefault(); handleSendReply(); }}
                                                className={`flex-shrink-0 flex gap-3 border rounded-xl p-2 transition-all duration-300 ${
                                                    isRewriting 
                                                        ? 'bg-primary/5 border-primary/40 shadow-[0_0_12px_rgba(212,175,55,0.15)]' 
                                                        : 'bg-black/40 border-white/10 focus-within:border-primary/50 focus-within:bg-black/60'
                                                }`}
                                            >
                                                <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors">
                                                    <Plus size={20} />
                                                </button>
                                                <input
                                                    type="text"
                                                    value={replyMessage}
                                                    onChange={(e) => setReplyMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    disabled={isRewriting}
                                                    className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder-gray-500 disabled:opacity-60"
                                                />
                                                {/* ✨ AI Rewrite Button */}
                                                <button
                                                    type="button"
                                                    onClick={handleRewrite}
                                                    disabled={!replyMessage.trim() || isRewriting}
                                                    title="Rewrite as Professional"
                                                    className={`p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 ${
                                                        replyMessage.trim() && !isRewriting
                                                            ? 'text-primary hover:bg-primary/10 hover:shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                                                            : 'text-gray-600'
                                                    }`}
                                                >
                                                    {isRewriting 
                                                        ? <RefreshCw size={18} className="animate-spin text-primary" />
                                                        : <Sparkles size={18} />
                                                    }
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!replyMessage.trim() || isSending || isRewriting}
                                                    className="p-2 bg-primary hover:bg-primary-dark text-black rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                                >
                                                    <Send size={20} />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse-slow">
                                            <MessageCircle size={40} className="text-gray-600" />
                                        </div>
                                        <p className="text-lg font-medium text-gray-400">Select a conversation to start chatting</p>
                                        <p className="text-sm text-gray-600 mt-2">Connecting you directly with your clients</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'manageTransactions' && (
                        <TransactionManagement 
                            depositRequests={depositRequests}
                            withdrawals={withdrawals}
                            updateDepositStatus={updateDepositStatus}
                            updateWithdrawalStatus={updateWithdrawalStatus}
                            setRejectionModal={setRejectionModal}
                            closeRejectionModal={closeRejectionModal}
                        />
                    )}

                    {activeSection === 'notification' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group p-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-black">
                                    <Bell size={20} />
                                </div>
                                Broadcast Notification
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                                {/* Compose Notification Form */}
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Compose Message</h4>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!notifTitle.trim() || !notifMessage.trim()) return;

                                        setIsSendingNotif(true);
                                        const res = await sendSystemNotification(notifTitle.trim(), notifMessage.trim(), notifType);
                                        setIsSendingNotif(false);

                                        if (res.success) {
                                            setNotifTitle('');
                                            setNotifMessage('');
                                            alert('Notification sent successfully!');
                                        } else {
                                            alert('Failed to send notification: ' + res.error);
                                        }
                                    }} className="space-y-5">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Title</label>
                                            <input
                                                type="text"
                                                value={notifTitle}
                                                onChange={(e) => setNotifTitle(e.target.value)}
                                                placeholder="Enter notification title"
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary/50 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Message</label>
                                            <textarea
                                                value={notifMessage}
                                                onChange={(e) => setNotifMessage(e.target.value)}
                                                placeholder="Enter notification content..."
                                                rows="4"
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary/50 outline-none resize-none"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Type (Importance)</label>
                                            <div className="flex gap-3">
                                                {['info', 'warning', 'urgent'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setNotifType(type)}
                                                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${notifType === type
                                                            ? type === 'urgent' ? 'bg-red-500 text-white border-red-500' : 'bg-primary text-black border-primary'
                                                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSendingNotif || !notifTitle.trim() || !notifMessage.trim()}
                                            className="w-full py-4 mt-4 bg-gradient-gold hover:opacity-90 text-black font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <Send size={18} />
                                            {isSendingNotif ? 'Sending...' : 'Send Broadcast'}
                                        </button>
                                    </form>
                                </div>

                                {/* Recent Notifications List */}
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col h-[500px]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Broadcasts</h4>
                                        <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded-full">{systemNotifications.length} Total</span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                        {systemNotifications.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                                <Bell size={32} className="mb-4 opacity-50" />
                                                <p className="text-sm">No recent notifications</p>
                                            </div>
                                        ) : (
                                            systemNotifications.map(notif => (
                                                <div key={notif.id} className="bg-white/5 border border-white/10 p-4 rounded-xl group/notif relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${notif.type === 'urgent' ? 'bg-red-500' :
                                                                notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                                                }`}></div>
                                                            <h5 className="text-white font-bold text-sm truncate max-w-[200px]">{notif.title}</h5>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500">
                                                            {notif.createdAt && new Date(notif.createdAt.seconds * 1000).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-xs line-clamp-2">{notif.message}</p>

                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Delete this notification?')) {
                                                                await deleteSystemNotification(notif.id);
                                                            }
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover/notif:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                                        title="Delete Notification"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'settings' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group p-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                            
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center text-black shadow-glow">
                                        <Settings size={24} />
                                    </div>
                                    Platform Settings
                                </h3>
                                <button
                                    onClick={handleSaveDepositSettings}
                                    disabled={isSavingSettings}
                                    className="px-8 py-3 bg-gradient-gold hover:opacity-90 text-black font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                >
                                    {isSavingSettings ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                                {['usdt', 'btc', 'eth'].map(coin => (
                                    <div key={coin} className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all group/card">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <Wallet size={20} />
                                            </div>
                                            <h4 className="text-lg font-bold text-white uppercase tracking-wider">{coin} Network</h4>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest font-bold">Wallet Address</label>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        value={depositSettings[`${coin}Address`] || ''} 
                                                        onChange={e => setDepositSettings({ ...depositSettings, [`${coin}Address`]: e.target.value })} 
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-primary/50 outline-none transition-all pr-12 font-mono text-sm"
                                                        placeholder={`Enter ${coin.toUpperCase()} address`}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                        <FileText size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest font-bold">QR Code Image</label>
                                                <div className="relative group/upload">
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={e => handleFileUpload(e, coin)} 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center group-hover/upload:border-primary/30 group-hover/upload:bg-white/10 transition-all">
                                                        <Upload size={24} className="text-gray-500 mb-2 group-hover/upload:text-primary transition-colors" />
                                                        <span className="text-xs text-gray-500 font-medium">Click or Drag Image</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {depositSettings[`${coin}Qr`] && (
                                                <div className="mt-4 relative group/qr">
                                                    <div className="absolute -top-2 -right-2 z-20">
                                                        <button 
                                                            onClick={() => setDepositSettings({ ...depositSettings, [`${coin}Qr`]: '' })}
                                                            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-2xl inline-block shadow-2xl relative">
                                                        <img src={depositSettings[`${coin}Qr`]} alt={`${coin} QR`} className="w-full max-w-[150px] h-auto rounded-lg" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                                            <span className="text-white text-[10px] font-bold uppercase">Change Image</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="flex-1">
                                    <h5 className="text-amber-500 font-bold text-sm mb-1 uppercase tracking-wide">Security Note</h5>
                                    <p className="text-amber-200/60 text-xs leading-relaxed">Ensure these addresses are correct. All user deposits will be sent to these addresses. Any mistakes could lead to loss of funds. Only authorized administrators should change these settings.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'depositRequests' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(depositRequests || []).filter(d => d.status === 'pending').length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                        <Check size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Pending Deposits</h3>
                                    <p className="text-gray-400">All deposit requests have been processed.</p>
                                </div>
                            ) : (
                                depositRequests.filter(d => d.status === 'pending').map(deposit => (
                                    <div key={deposit.id} className="bg-[#131b2f]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl hover:border-primary/20 transition-all group overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-green-500/10 rounded-2xl">
                                                <ArrowDownLeft className="text-green-500" size={24} />
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                {deposit.status}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">User Email</h4>
                                                <p className="text-white font-medium truncate">{deposit.userEmail || deposit.email}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">Amount</h4>
                                                    <p className="text-xl font-bold text-primary font-mono">${parseFloat(deposit.amount).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">Method</h4>
                                                    <p className="text-white font-medium uppercase font-sans tracking-wide">{deposit.method || 'USDT'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">Transaction Hash</h4>
                                                <p className="text-xs font-mono text-gray-400 break-all bg-black/20 p-2 rounded-lg border border-white/5">{deposit.hash || 'N/A'}</p>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button 
                                                    onClick={() => updateDepositStatus(deposit.id, 'approved')}
                                                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-600/20"
                                                >
                                                    APPROVE
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setRejectionModal({
                                                            isOpen: true,
                                                            title: 'Reject Deposit',
                                                            onConfirm: async (reason) => {
                                                                await updateDepositStatus(deposit.id, 'rejected', reason);
                                                                closeRejectionModal();
                                                            }
                                                        });
                                                    }}
                                                    className="flex-1 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    REJECT
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeSection === 'withdrawals' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {withdrawals.filter(w => w.status === 'pending').length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                        <Check size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Pending Withdrawals</h3>
                                    <p className="text-gray-400">All withdrawal requests have been processed.</p>
                                </div>
                            ) : (
                                withdrawals.filter(w => w.status === 'pending').map(w => (
                                    <div key={w.id} className="bg-[#131b2f]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl hover:border-primary/20 transition-all group overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-amber-500/10 rounded-2xl">
                                                <ArrowUpRight className="text-amber-500" size={24} />
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                {w.status}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">User Email</h4>
                                                <p className="text-white font-medium truncate">{w.userEmail || w.email}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">Amount</h4>
                                                    <p className="text-xl font-bold text-primary font-mono">${parseFloat(w.amount).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">Method</h4>
                                                    <p className="text-white font-medium uppercase font-sans tracking-wide">{w.method || 'USDT'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">Wallet Address</h4>
                                                <p className="text-xs font-mono text-gray-400 break-all bg-black/20 p-2 rounded-lg border border-white/5">{w.walletAddress || 'N/A'}</p>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button 
                                                    onClick={() => handleUpdateWithdrawalStatus(w.id, 'approved', w.amount, w.userEmail)}
                                                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-600/20"
                                                >
                                                    APPROVE
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setRejectionModal({
                                                            isOpen: true,
                                                            title: 'Reject Withdrawal',
                                                            onConfirm: async (reason) => {
                                                                await handleUpdateWithdrawalStatus(w.id, 'rejected', w.amount, w.userEmail, reason);
                                                                closeRejectionModal();
                                                            }
                                                        });
                                                    }}
                                                    className="flex-1 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    REJECT
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            {hasMoreWithdrawals && (
                                <div className="col-span-full p-8 text-center border-t border-white/5 mt-6">
                                    <button
                                        onClick={loadMoreWithdrawals}
                                        disabled={isLoadingMore}
                                        className="px-10 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold transition-all disabled:opacity-50 inline-flex items-center gap-2"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                                Loading...
                                            </>
                                        ) : 'Load More Withdrawals'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {/* ── Open Orders (active trades) ── */}
                    {activeSection === 'open_order' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-black"><Circle size={20} /></div>
                                <h3 className="text-xl font-bold text-white">Open Orders</h3>
                                <span className="ml-auto bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-full">{allTrades.filter(t => t.status === 'pending' || t.status === 'active').length} Active</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 text-left">User</th>
                                        <th className="px-6 py-4 text-left">Symbol</th>
                                        <th className="px-6 py-4 text-left">Direction</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-right">Entry Price</th>
                                        <th className="px-6 py-4 text-right">Duration</th>
                                        <th className="px-6 py-4 text-right">Placed</th>
                                    </tr></thead>
                                    <tbody>
                                        {allTrades.filter(t => t.status === 'pending' || t.status === 'active').length === 0 ? (
                                            <tr><td colSpan="7" className="px-6 py-20 text-center text-gray-500">No open orders</td></tr>
                                        ) : allTrades.filter(t => t.status === 'pending' || t.status === 'active').map(trade => (
                                            <tr key={trade.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400">{trade.user_id?.slice(0,8)}…</td>
                                                <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${trade.direction === 'up' || trade.direction === 'call' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{trade.direction === 'up' || trade.direction === 'call' ? '▲ CALL' : '▼ PUT'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-primary">${parseFloat(trade.amount || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-gray-300">${parseFloat(trade.entryPrice || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">{trade.duration}s</td>
                                                <td className="px-6 py-4 text-right text-gray-500 text-xs">{trade.createdAt ? new Date(trade.createdAt).toLocaleString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Order History (completed trades) ── */}
                    {activeSection === 'order_history' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-black"><History size={20} /></div>
                                <h3 className="text-xl font-bold text-white">Order History</h3>
                                <span className="ml-auto bg-white/5 text-gray-400 border border-white/10 text-xs font-bold px-3 py-1 rounded-full">{allTrades.filter(t => t.status === 'completed').length} Completed</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 text-left">User</th>
                                        <th className="px-6 py-4 text-left">Symbol</th>
                                        <th className="px-6 py-4 text-left">Direction</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-right">P&L</th>
                                        <th className="px-6 py-4 text-center">Result</th>
                                        <th className="px-6 py-4 text-right">Closed</th>
                                    </tr></thead>
                                    <tbody>
                                        {allTrades.filter(t => t.status === 'completed').length === 0 ? (
                                            <tr><td colSpan="7" className="px-6 py-20 text-center text-gray-500">No completed orders</td></tr>
                                        ) : allTrades.filter(t => t.status === 'completed').map(trade => (
                                            <tr key={trade.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400">{trade.user_id?.slice(0,8)}…</td>
                                                <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${trade.direction === 'up' || trade.direction === 'call' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{trade.direction === 'up' || trade.direction === 'call' ? '▲ CALL' : '▼ PUT'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-white">${parseFloat(trade.amount || 0).toLocaleString()}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${parseFloat(trade.result || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{parseFloat(trade.result || 0) >= 0 ? '+' : ''}${parseFloat(trade.result || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${trade.outcome === 'win' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{trade.outcome === 'win' ? 'WIN' : 'LOSS'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-500 text-xs">{trade.completedAt ? new Date(trade.completedAt).toLocaleString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Trade History (all trades) ── */}
                    {activeSection === 'trade_history' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-black"><ScrollText size={20} /></div>
                                <h3 className="text-xl font-bold text-white">Trade History</h3>
                                <span className="ml-auto bg-white/5 text-gray-400 border border-white/10 text-xs font-bold px-3 py-1 rounded-full">{allTrades.length} Total Trades</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 text-left">User</th>
                                        <th className="px-6 py-4 text-left">Symbol</th>
                                        <th className="px-6 py-4 text-left">Direction</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-right">P&L</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr></thead>
                                    <tbody>
                                        {allTrades.length === 0 ? (
                                            <tr><td colSpan="7" className="px-6 py-20 text-center text-gray-500">No trade records found</td></tr>
                                        ) : allTrades.map(trade => (
                                            <tr key={trade.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-gray-400">{trade.user_id?.slice(0,8)}…</td>
                                                <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${trade.direction === 'up' || trade.direction === 'call' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{trade.direction === 'up' || trade.direction === 'call' ? '▲ CALL' : '▼ PUT'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-white">${parseFloat(trade.amount || 0).toLocaleString()}</td>
                                                <td className={`px-6 py-4 text-right font-bold ${!trade.result ? 'text-gray-400' : parseFloat(trade.result) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trade.result != null ? `${parseFloat(trade.result) >= 0 ? '+' : ''}$${parseFloat(trade.result).toFixed(2)}` : '—'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${trade.status === 'pending' || trade.status === 'active' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : trade.outcome === 'win' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{trade.status === 'pending' || trade.status === 'active' ? 'OPEN' : trade.outcome === 'win' ? 'WIN' : 'LOSS'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-500 text-xs">{trade.createdAt ? new Date(trade.createdAt).toLocaleString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Transaction History (all approved deposits + withdrawals) ── */}
                    {activeSection === 'transaction_history' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-black"><FileText size={20} /></div>
                                <h3 className="text-xl font-bold text-white">Transaction History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 text-left">User</th>
                                        <th className="px-6 py-4 text-left">Type</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Date</th>
                                    </tr></thead>
                                    <tbody>
                                        {[
                                            ...(depositRequests || []).map(d => ({ ...d, type: 'deposit' })),
                                            ...(withdrawals || []).map(w => ({ ...w, type: 'withdrawal' }))
                                        ].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).length === 0 ? (
                                            <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-500">No transactions found</td></tr>
                                        ) : [
                                            ...(depositRequests || []).map(d => ({ ...d, type: 'deposit' })),
                                            ...(withdrawals || []).map(w => ({ ...w, type: 'withdrawal' }))
                                        ].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).map(tx => (
                                            <tr key={tx.id + tx.type} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4 text-white">{tx.userEmail || tx.email || '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-2 ${tx.type === 'deposit' ? 'text-green-400' : 'text-amber-400'}`}>
                                                        {tx.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                        <span className="text-xs font-bold uppercase">{tx.type}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-primary">${parseFloat(tx.amount || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : tx.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{tx.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-500 text-xs">{tx.createdAt?.seconds ? new Date(tx.createdAt.seconds * 1000).toLocaleString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Login History ── */}
                    {activeSection === 'login_history' && (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-black"><LogIn size={20} /></div>
                                <h3 className="text-xl font-bold text-white">Login History</h3>
                                <span className="ml-auto bg-white/5 text-gray-400 border border-white/10 text-xs font-bold px-3 py-1 rounded-full">{loginHistory.length} Records</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 text-left">User Email</th>
                                        <th className="px-6 py-4 text-left">IP Address</th>
                                        <th className="px-6 py-4 text-left">Device / Browser</th>
                                        <th className="px-6 py-4 text-right">Login Time</th>
                                    </tr></thead>
                                    <tbody>
                                        {loginHistory.length === 0 ? (
                                            <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-500">No login records found</td></tr>
                                        ) : loginHistory.map(entry => (
                                            <tr key={entry.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                                <td className="px-6 py-4 text-white">{entry.email || entry.userEmail || '—'}</td>
                                                <td className="px-6 py-4 font-mono text-gray-400 text-xs">{entry.ipAddress || entry.ip || '—'}</td>
                                                <td className="px-6 py-4 text-gray-400 text-xs max-w-[240px] truncate">{entry.userAgent || entry.device || '—'}</td>
                                                <td className="px-6 py-4 text-right text-gray-500 text-xs">{entry.loginTime ? new Date(entry.loginTime).toLocaleString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Pending Tickets ── */}
                    {activeSection === 'tickets' && (
                        <div className="space-y-4">
                            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Ticket size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-white">Pending Support Tickets</h4>
                                    <p className="text-sm text-gray-400">Users who have sent support messages and are waiting for a reply.</p>
                                </div>
                            </div>
                            {conversations.filter(c => c.unread > 0).length === 0 ? (
                                <div className="py-20 text-center bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl">
                                    <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                                    <p className="text-gray-400">No pending tickets — all messages have been replied to.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {conversations.filter(c => c.unread > 0).map(conv => (
                                        <div key={conv.userEmail} className="bg-[#131b2f]/80 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-500/40 transition-all cursor-pointer" onClick={() => { setActiveSection('chat'); setSelectedUserId(conv.userEmail); }}>
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-lg">{(conv.userName || conv.userEmail || '?')[0].toUpperCase()}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-bold text-white truncate">{conv.userName || conv.userEmail}</p>
                                                    <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                                                </div>
                                                <p className="text-gray-400 text-xs truncate">{conv.lastMessage}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Closed Tickets (conversations with no unread) ── */}
                    {activeSection === 'closed_tickets' && (
                        <div className="space-y-4">
                            <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-green-500/10 rounded-xl text-green-500"><CheckSquare size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-white">Closed Tickets</h4>
                                    <p className="text-sm text-gray-400">Conversations where all messages have been read and replied to.</p>
                                </div>
                            </div>
                            {conversations.filter(c => !c.unread || c.unread === 0).length === 0 ? (
                                <div className="py-20 text-center bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl">
                                    <Ticket size={40} className="text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No Closed Tickets</h3>
                                    <p className="text-gray-400">No resolved conversations yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {conversations.filter(c => !c.unread || c.unread === 0).map(conv => (
                                        <div key={conv.userEmail} className="bg-[#131b2f]/80 border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-green-500/20 transition-all cursor-pointer" onClick={() => { setActiveSection('chat'); setSelectedUserId(conv.userEmail); }}>
                                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 text-green-500 font-bold text-lg">{(conv.userName || conv.userEmail || '?')[0].toUpperCase()}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-bold text-white truncate">{conv.userName || conv.userEmail}</p>
                                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                                </div>
                                                <p className="text-gray-400 text-xs truncate">{conv.lastMessage}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Banned / Frozen Users ── */}
                    {activeSection === 'banned' && (() => {
                        const frozenUsers = users.filter(u => !isAdminAccount(u) && (u.isFrozen === true || u.status === 'banned'));
                        return (
                        <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><Ban size={20} /></div>
                                <h3 className="text-xl font-bold text-white">Frozen / Banned Users</h3>
                                <span className="ml-auto bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-full">{frozenUsers.length} Restricted</span>
                            </div>
                            {frozenUsers.length === 0 ? (
                                <div className="py-20 text-center text-gray-500">
                                    <CheckCircle size={40} className="text-green-500 mx-auto mb-4" />
                                    <p className="text-white font-bold mb-2">No Restricted Users</p>
                                    <p className="text-sm">All users are in good standing.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {frozenUsers.map(user => (
                                        <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10 text-sm">
                                                    {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{user.full_name || user.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    <Snowflake size={11} /> Frozen
                                                </span>
                                                <button
                                                    onClick={() => handleToggleFreeze(user.id)}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    Unfreeze
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        );
                    })()}

                    {/* ── Remaining legacy placeholders (not in screenshots) ── */}
                    {['approvedDeposits', 'rejectedDeposits', 'allDeposits', 'approvedWithdrawals', 'rejectedWithdrawals', 'allWithdrawals'].includes(activeSection) && (
                        <div className="flex flex-col items-center justify-center p-20 bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-3xl text-center">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                                <Settings size={40} className="text-gray-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Section Under Development</h3>
                            <p className="text-gray-400 max-w-md">This section is coming in the next update.</p>
                        </div>
                    )}
                </div>
            </div >

            {/* Verification Photo Modal */}
            {
                selectedVerification && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[2000] flex items-center justify-center p-6" onClick={() => setSelectedVerification(null)}>
                        <div className="bg-surface-dark border border-white/10 p-8 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{selectedVerification.verificationData?.fullName || 'N/A'}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedVerification.verificationStatus === 'pending' ? 'bg-amber-500 text-black' : (selectedVerification.verificationStatus === 'verified' ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}`}>
                                        {selectedVerification.verificationStatus}
                                    </span>
                                </div>
                                <button onClick={() => setSelectedVerification(null)} className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            {/* User Information */}
                            <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/5">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">Email</div>
                                        <div className="text-base font-semibold text-white">{selectedVerification.email}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">ID Number</div>
                                        <div className="text-base font-semibold text-white">{selectedVerification.verificationData?.idNumber || 'N/A'}</div>
                                    </div>
                                    {selectedVerification.verificationData?.submittedAt && (
                                        <div className="col-span-2">
                                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">Submitted</div>
                                            <div className="text-base font-semibold text-white">
                                                {new Date(selectedVerification.verificationData.submittedAt.seconds * 1000).toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ID Photos */}
                            <div className="text-sm font-bold text-white uppercase tracking-wider mb-4">Identity Documents</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase mb-3">Front of ID</div>
                                    {selectedVerification.verificationData?.frontIdBase64 ? (
                                        <div className="relative group overflow-hidden rounded-xl border-2 border-white/10">
                                            <img
                                                src={selectedVerification.verificationData.frontIdBase64}
                                                alt="Front ID"
                                                className="w-full h-auto transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                                                onClick={() => window.open(selectedVerification.verificationData.frontIdBase64)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="py-16 bg-white/5 rounded-xl text-center border-2 border-dashed border-white/10 text-gray-500 text-sm">
                                            No Image Available
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase mb-3">Back of ID</div>
                                    {selectedVerification.verificationData?.backIdBase64 ? (
                                        <div className="relative group overflow-hidden rounded-xl border-2 border-white/10">
                                            <img
                                                src={selectedVerification.verificationData.backIdBase64}
                                                alt="Back ID"
                                                className="w-full h-auto transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                                                onClick={() => window.open(selectedVerification.verificationData.backIdBase64)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="py-16 bg-white/5 rounded-xl text-center border-2 border-dashed border-white/10 text-gray-500 text-sm">
                                            No Image Available
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {selectedVerification.verificationStatus === 'pending' && (
                                <div className="flex gap-3 justify-end pt-5 border-t border-white/10">
                                    <button
                                        onClick={() => {
                                            setRejectionModal({
                                                isOpen: true,
                                                title: 'Reject Verification',
                                                onConfirm: async (reason) => {
                                                    const result = await updateVerificationStatus(selectedVerification.id, 'rejected', reason);
                                                    if (!result.success) {
                                                        alert('Update failed: ' + result.error);
                                                    } else {
                                                        setSelectedVerification(null);
                                                    }
                                                }
                                            });
                                        }}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await updateVerificationStatus(selectedVerification.id, 'verified');
                                            setSelectedVerification(null);
                                        }}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <Check size={18} /> Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Admin;
