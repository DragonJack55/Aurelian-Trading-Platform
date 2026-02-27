import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { subscribeToConversations, sendMessage } from '../services/messageService';

const CustomerServicePanel = () => {
    const [conversations, setConversations] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const unsubscribe = subscribeToConversations((convos) => {
            setConversations(convos);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations, selectedUser]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedUser) return;

        const messageData = {
            userId: selectedUser,
            userEmail: selectedUser,
            userName: 'Admin',
            sender: 'admin',
            message: messageInput.trim(),
            read: false
        };

        const result = await sendMessage(messageData);

        if (result.success) {
            setMessageInput('');
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp?.seconds) return '';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getUnreadCount = (userId) => {
        const messages = conversations[userId] || [];
        return messages.filter(msg => msg.sender === 'user' && !msg.read).length;
    };

    const userList = Object.keys(conversations).sort((a, b) => {
        const lastA = conversations[a][conversations[a].length - 1];
        const lastB = conversations[b][conversations[b].length - 1];
        return (lastB?.createdAt?.seconds || 0) - (lastA?.createdAt?.seconds || 0);
    });

    const selectedMessages = selectedUser ? (conversations[selectedUser] || []) : [];

    return (
        <div style={{ display: 'flex', height: '600px', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* User List */}
            <div style={{ width: '300px', borderRight: '1px solid #e0e0e0', overflowY: 'auto' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold', fontSize: '16px' }}>
                    Conversations ({userList.length})
                </div>
                {userList.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                        No conversations yet
                    </div>
                ) : (
                    userList.map(userId => {
                        const messages = conversations[userId];
                        const lastMessage = messages[messages.length - 1];
                        const unread = getUnreadCount(userId);

                        return (
                            <div
                                key={userId}
                                onClick={() => setSelectedUser(userId)}
                                style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #f5f5f5',
                                    cursor: 'pointer',
                                    background: selectedUser === userId ? '#f0f7ff' : 'transparent',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedUser !== userId) {
                                        e.currentTarget.style.background = '#f9f9f9';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedUser !== userId) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                        {messages[0]?.userName || userId}
                                    </span>
                                    {unread > 0 && (
                                        <span style={{
                                            background: '#ff3d00',
                                            color: 'white',
                                            borderRadius: '10px',
                                            padding: '2px 6px',
                                            fontSize: '11px',
                                            fontWeight: 'bold'
                                        }}>
                                            {unread}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '12px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {lastMessage?.message}
                                    </span>
                                    <span style={{ marginLeft: '8px', flexShrink: 0 }}>{formatTime(lastMessage?.createdAt)}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!selectedUser ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                        Select a conversation to view messages
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>
                            {selectedMessages[0]?.userName || selectedUser}
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f9f9f9' }}>
                            {selectedMessages.map((msg, index) => (
                                <div key={msg.id || index} style={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{
                                        maxWidth: '70%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: msg.sender === 'admin' ? '#4169E1' : 'white',
                                        color: msg.sender === 'admin' ? 'white' : '#333',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ fontSize: '14px', wordWrap: 'break-word' }}>
                                            {msg.message}
                                        </div>
                                        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                                            {formatTime(msg.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: '12px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Type your reply..."
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim()}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    background: messageInput.trim() ? '#4169E1' : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '500'
                                }}
                            >
                                <Send size={16} /> Send
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomerServicePanel;
