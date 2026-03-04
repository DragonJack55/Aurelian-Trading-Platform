import React, { useState, useEffect, useRef } from 'react';
import { subscribeToSystemNotifications, markNotificationAsRead } from '../services/notificationService';
import { useApp } from '../context/AppContext';

const NotificationsDropdown = () => {
    const { user } = useApp();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            const unsubscribe = subscribeToSystemNotifications((notifs) => {
                setNotifications(notifs);
            });
            return () => unsubscribe();
        }
    }, [user]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userId = user?.uid || user?.id || user?.email;
    const unreadCount = notifications.filter(n => !n.readBy?.includes(userId)).length;

    const handleMarkAsRead = async (notif) => {
        if (userId && !notif.readBy?.includes(userId)) {
            await markNotificationAsRead(notif.id, userId);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!userId) return;
        const unreadNotifs = notifications.filter(n => !n.readBy?.includes(userId));
        for (const notif of unreadNotifs) {
            await markNotificationAsRead(notif.id, userId);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-text-muted hover:text-primary transition-colors focus:outline-none relative"
                title="Notifications"
            >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
                )}
            </button>

            {isOpen && (
                <div className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-full mt-2 w-80 max-h-[80vh] sm:max-h-96 overflow-y-auto bg-surface-dark border border-border-gold rounded-xl shadow-glass z-[100] animate-fade-in custom-scrollbar">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-surface-dark/95 backdrop-blur-md z-10">
                        <h3 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] uppercase tracking-wider font-bold text-primary hover:text-primary-light transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col">
                        {notifications.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-gray-600 text-4xl mb-2">notifications_off</span>
                                <div className="text-gray-400 text-sm">No new notifications</div>
                            </div>
                        ) : (
                            notifications.map(notif => {
                                const isUnread = !notif.readBy?.includes(userId);
                                return (
                                    <div
                                        key={notif.id}
                                        className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${isUnread ? 'bg-primary/5' : ''}`}
                                        onClick={() => handleMarkAsRead(notif)}
                                    >
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <span className={`font-bold text-sm leading-tight ${isUnread ? 'text-primary' : 'text-gray-900 dark:text-gray-300'}`}>
                                                {notif.title}
                                            </span>
                                            <span className="text-[9px] text-gray-400 dark:text-gray-500 whitespace-nowrap mt-0.5">{formatTime(notif.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
