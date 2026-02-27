import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';

export const sendSystemNotification = async (title, message, type = 'info') => {
    try {
        const notificationsRef = collection(db, 'system_notifications');
        await addDoc(notificationsRef, {
            title,
            message,
            type, // 'info', 'warning', 'urgent'
            createdAt: Timestamp.now(),
            active: true,
            readBy: [] // track users who have read it
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error: error.message };
    }
};

export const subscribeToSystemNotifications = (callback) => {
    const notificationsRef = collection(db, 'system_notifications');
    // Get last 10 notifications, newest first
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(notifications);
    }, (error) => {
        console.error('Error subscribing to notifications:', error);
    });

    return unsubscribe;
};

export const subscribeToAllSystemNotifications = (callback) => {
    const notificationsRef = collection(db, 'system_notifications');
    // Get last 50 notifications for admin view
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(notifications);
    }, (error) => {
        console.error('Error subscribing to notifications:', error);
    });

    return unsubscribe;
};

export const markNotificationAsRead = async (notificationId, userId) => {
    try {
        const notifRef = doc(db, 'system_notifications', notificationId);
        await updateDoc(notifRef, {
            readBy: arrayUnion(userId)
        });
        return { success: true };
    } catch (error) {
        console.error('Error marking as read:', error);
        return { success: false, error: error.message };
    }
};

export const deleteSystemNotification = async (notificationId) => {
    try {
        const notifRef = doc(db, 'system_notifications', notificationId);
        await deleteDoc(notifRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { success: false, error: error.message };
    }
};
