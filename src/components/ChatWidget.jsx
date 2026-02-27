import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { sendMessage, subscribeToMessages, markMessagesAsRead } from '../services/messageService';
import { useApp } from '../context/AppContext';

const ChatWidget = () => {
    const { isChatOpen, setIsChatOpen, t, user } = useApp(); // Get user from AppContext
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [position, setPosition] = useState({ x: 24, y: 100 });
    const [isDraggingState, setIsDraggingState] = useState(false);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const messagesEndRef = useRef(null);
    const unsubscribeRef = useRef(null);

    // ... (keeping existing drag handlers)

    const handleDragStart = (clientX, clientY) => {
        isDragging.current = false;
        dragStart.current = {
            x: clientX,
            y: clientY,
            initialRight: position.x,
            initialBottom: position.y
        };
    };

    const handleDragMove = (clientX, clientY) => {
        const dx = dragStart.current.x - clientX;
        const dy = dragStart.current.y - clientY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging.current = true;
            setIsDraggingState(true);
            setPosition({
                x: Math.max(0, dragStart.current.initialRight + dx),
                y: Math.max(0, dragStart.current.initialBottom + dy)
            });
        }
    };

    // Mouse handlers
    const handleMouseDown = (e) => {
        handleDragStart(e.clientX, e.clientY);

        const handleMouseMove = (moveEvent) => {
            handleDragMove(moveEvent.clientX, moveEvent.clientY);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setIsDraggingState(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Touch handlers
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
    };

    // Subscribe to real-time messages
    useEffect(() => {
        if (!user?.email) return;

        console.log('[ChatWidget] Subscribing to messages for:', user.email);

        const unsubscribe = subscribeToMessages(user.email, (newMessages) => {
            console.log('[ChatWidget] ===== MESSAGE SUBSCRIPTION FIRED =====');
            console.log('[ChatWidget] Total messages received:', newMessages.length);
            console.log('[ChatWidget] Full messages array:', JSON.stringify(newMessages, null, 2));

            // Log each message
            newMessages.forEach((msg, idx) => {
                console.log(`[ChatWidget] Message ${idx}:`, {
                    sender: msg.sender,
                    message: msg.message,
                    userId: msg.userId,
                    createdAt: msg.createdAt,
                    read: msg.read
                });
            });

            setMessages(newMessages);

            // Count unread messages from admin
            const unread = newMessages.filter(msg => {
                const isAdminMessage = msg.sender === 'admin' || msg.userName === 'Support Team';
                const isUnread = !msg.read;
                console.log(`[ChatWidget] Message from ${msg.sender} (${msg.userName}): isAdmin=${isAdminMessage}, isUnread=${isUnread}`);
                return isAdminMessage && isUnread;
            }).length;
            console.log('[ChatWidget] Total unread admin messages:', unread);
            setUnreadCount(unread);
        });

        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [user]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mark messages as read when opening chat
    useEffect(() => {
        if (isChatOpen && user?.email && unreadCount > 0) {
            markMessagesAsRead(user.email);
            setUnreadCount(0);
        }
    }, [isChatOpen, user, unreadCount]);

    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !user?.email || isSending) return;

        setIsSending(true);
        const currentMessage = inputMessage.trim(); // Capture current message

        const messageData = {
            userId: user.email,
            userEmail: user.email,
            userName: user.username || user.name || user.email,
            sender: 'user',
            text: currentMessage,  // Changed from 'message' to 'text'
            read: false,
            createdAt: new Date().toISOString()
        };

        console.log('[ChatWidget] Sending message:', messageData);

        // Optimistically clear input to prevent "text stays there" feeling
        setInputMessage('');

        const result = await sendMessage(messageData);

        console.log('[ChatWidget] Send result:', result);

        if (!result.success) {
            console.error('[ChatWidget] Failed to send message:', result.error);
            // Restore message if failed
            setInputMessage(currentMessage);
        } else {
            // Check if this is the first user message (no previous messages from user)
            const userMessageCount = messages.filter(m => m.direction === 'inbound').length;

            if (userMessageCount === 0) {
                // Send automatic welcome message
                console.log('[ChatWidget] First message detected, sending auto-reply...');

                setTimeout(async () => {
                    const autoReplyData = {
                        userId: user.email,
                        userEmail: user.email,
                        userName: 'Support Team',
                        sender: 'admin',
                        text: 'One of our Customer Support agents will be with you soon. Stay tuned!',  // Changed from 'message' to 'text'
                        read: false,
                        createdAt: new Date().toISOString()
                    };

                    await sendMessage(autoReplyData);
                }, 1000); // 1 second delay to feel more natural
            }
        }

        setIsSending(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        // Handle Firestore Timestamp object ({ seconds: ... })
        if (timestamp.seconds) {
            const date = new Date(timestamp.seconds * 1000);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        // Handle ISO string or date object
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Floating Chat Button */}
            <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onClick={(e) => {
                    if (!isDragging.current) setIsChatOpen(true);
                }}
                style={{
                    position: 'fixed',
                    bottom: position.y,
                    right: position.x,
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#4169E1',
                    display: isChatOpen ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(65, 105, 225, 0.4)',
                    cursor: isDraggingState ? 'grabbing' : 'pointer',
                    zIndex: 1050,
                    transition: isDraggingState ? 'none' : 'transform 0.2s',
                    touchAction: 'none'
                }}
                onMouseEnter={(e) => !isDraggingState && (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => !isDragging.current && (e.currentTarget.style.transform = 'scale(1)')}
            >
                <MessageCircle size={28} color="white" />
                {unreadCount > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ff3d00',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </div>

            {/* Chat Window */}
            {isChatOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '24px',
                    width: '350px',
                    height: '500px',
                    background: '#131313', // Dark background
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    display: 'flex',
                    border: '1px solid #333',
                    flexDirection: 'column',
                    zIndex: 1050,
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px',
                        background: '#4169E1',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '2px solid rgba(255,255,255,0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fff'
                            }}>
                                <img
                                    src="/customer_service_agent.png"
                                    alt="Agent"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('customerService')}</span>
                        </div>
                        <X
                            size={20}
                            onClick={() => setIsChatOpen(false)}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        background: '#0a0a0a', // Darker background for messages
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {!user ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: 'var(--text-secondary)'
                            }}>
                                <p>{t('pleaseLoginChat') || "Please log in to chat with customer service"}</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: 'var(--text-secondary)'
                            }}>
                                <MessageCircle size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                                <p>{t('startConversation') || "Start a conversation with our team!"}</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isAdmin = msg.direction === 'outbound';
                                return (
                                    <div key={msg.id || index} style={{
                                        display: 'flex',
                                        justifyContent: isAdmin ? 'flex-start' : 'flex-end'
                                    }}>
                                        <div style={{
                                            maxWidth: '70%',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            background: isAdmin ? '#2a2a2a' : '#4169E1',
                                            color: isAdmin ? '#fff' : 'white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {isAdmin && (
                                                <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px', fontWeight: 'bold' }}>
                                                    Support Team
                                                </div>
                                            )}
                                            <div style={{ fontSize: '14px', wordWrap: 'break-word' }}>
                                                {msg.text}
                                            </div>
                                            <div style={{
                                                fontSize: '10px',
                                                opacity: 0.7,
                                                marginTop: '4px',
                                                textAlign: 'right'
                                            }}>
                                                {formatTime(msg.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    {user && (
                        <div style={{
                            padding: '12px',
                            borderTop: '1px solid #333',
                            background: '#131313',
                            display: 'flex',
                            gap: '8px'
                        }}>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t('typeMessage') || "Type a message..."}
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #333',
                                    fontSize: '14px',
                                    outline: 'none',
                                    background: '#1e1e1e',
                                    color: '#fff'
                                }}
                            />
                            <button
                                onClick={(e) => {
                                    console.log('[ChatWidget] Send button clicked!', {
                                        hasMessage: !!inputMessage.trim(),
                                        userEmail: user?.email,
                                        isSending
                                    });
                                    handleSendMessage();
                                }}
                                disabled={!inputMessage.trim()}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    background: inputMessage.trim() ? '#4169E1' : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                                    pointerEvents: inputMessage.trim() ? 'auto' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatWidget;
