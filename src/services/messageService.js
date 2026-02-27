import { db, auth } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    getDocs,
    updateDoc,
    doc
} from "firebase/firestore";

export const sendMessage = async (messageData) => {
    try {
        const { text, sender, userEmail } = messageData;
        let targetUserId;

        if (sender === 'admin') {
            if (!userEmail) throw new Error('User email required for admin message');
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", userEmail));
            const snapshot = await getDocs(q);

            if (snapshot.empty) throw new Error('User not found');
            targetUserId = snapshot.docs[0].id;
        } else {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');
            targetUserId = user.uid;
        }

        const messagesRef = collection(db, "messages");
        const docRef = await addDoc(messagesRef, {
            user_id: targetUserId,
            direction: sender === 'admin' ? 'outbound' : 'inbound',
            text: text,
            is_read: false,
            created_at: new Date().toISOString()
        });

        const newMessage = {
            id: docRef.id,
            user_id: targetUserId,
            direction: sender === 'admin' ? 'outbound' : 'inbound',
            text: text,
            is_read: false,
            created_at: new Date().toISOString()
        };

        // --- Send Telegram Notification ---
        if (sender !== 'admin') {
            try {
                const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
                const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

                if (botToken && chatId && botToken !== "YOUR_TELEGRAM_BOT_TOKEN_HERE") {
                    const userName = messageData.userName || messageData.userEmail || 'A User';
                    const telegramText = `*New Help Request on Aurelian Trade*\n*User:* ${userName}\n*Message:*\n${text}\n\n[Go to Admin Dashboard](https://aureliantdtrade.it.com/admin#support)`;

                    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: telegramText,
                            parse_mode: 'Markdown',
                            disable_web_page_preview: true
                        })
                    }).catch(err => console.error("Failed to send telegram message:", err));
                }
            } catch (tgError) {
                console.error('Telegram notification error:', tgError);
            }
        }
        // ----------------------------------

        return { success: true, message: newMessage };
    } catch (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
    }
};

export const subscribeToMessages = (userEmail, callback) => {
    let unsubscribe = null;

    const init = async () => {
        let userId;

        const user = auth.currentUser;
        if (user && user.email === userEmail) {
            userId = user.uid;
        } else {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", userEmail));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) userId = snapshot.docs[0].id;
        }

        if (!userId) return;

        const messagesRef = collection(db, "messages");
        const q = query(
            messagesRef,
            where("user_id", "==", userId)
            // Removed orderBy to avoid composite index requirement
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
            // Sort messages in JavaScript instead of Firestore
            const messages = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    const timeA = new Date(a.created_at).getTime();
                    const timeB = new Date(b.created_at).getTime();
                    return timeA - timeB; // ascending order
                });
            callback(messages);
        });
    };

    init();

    return () => {
        if (unsubscribe) unsubscribe();
    };
};

export const subscribeToConversations = (callback) => {
    const messagesRef = collection(db, "messages");
    const usersRef = collection(db, "users");

    let usersMap = {};

    const unsubUsers = onSnapshot(usersRef, (snapshot) => {
        snapshot.docs.forEach(doc => {
            usersMap[doc.id] = doc.data();
        });
    });

    const unsubMessages = onSnapshot(messagesRef, (snapshot) => {
        // Sort in JavaScript
        const messages = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => {
                const getTime = (t) => {
                    if (!t) return 0;
                    if (t.seconds) return t.seconds * 1000;
                    return new Date(t).getTime() || 0;
                };
                return getTime(a.created_at) - getTime(b.created_at);
            });

        const convMap = {};

        messages.forEach(msg => {
            const user = usersMap[msg.user_id];
            if (!user) return;

            const email = user.email;

            if (!convMap[email]) {
                convMap[email] = {
                    userEmail: email,
                    userName: user.displayName || user.fullName || email,
                    userId: msg.user_id,
                    messages: []
                };
            }
            convMap[email].messages.push(msg);
        });

        // Return array instead of object
        const conversationsArray = Object.values(convMap).map(conv => {
            const last = conv.messages[conv.messages.length - 1];
            return {
                ...conv,
                lastMessage: last.text,
                timestamp: new Date(last.created_at),
                unread: conv.messages.filter(m => m.direction === 'inbound' && !m.is_read).length
            };
        });

        callback(conversationsArray);
    });

    return () => {
        unsubUsers();
        unsubMessages();
    };
};

export const markMessagesAsRead = async (userEmail) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return { success: false, error: 'User not found' };
        const userId = snapshot.docs[0].id;

        const messagesRef = collection(db, "messages");
        const qMsg = query(
            messagesRef,
            where("user_id", "==", userId),
            where("direction", "==", "inbound"),
            where("is_read", "==", false)
        );

        const msgSnapshot = await getDocs(qMsg);

        const updatePromises = msgSnapshot.docs.map(doc =>
            updateDoc(doc.ref, { is_read: true })
        );

        await Promise.all(updatePromises);
        return { success: true };
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return { success: false, error: error.message };
    }
};
