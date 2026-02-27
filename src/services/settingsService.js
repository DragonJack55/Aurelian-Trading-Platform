import { db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * Get deposit settings (addresses + QR codes) from Firestore
 */
export const getDepositSettings = async () => {
    try {
        const settingsRef = doc(db, 'settings', 'deposits');
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
            return { success: true, settings: settingsDoc.data() };
        }

        return { success: true, settings: {} };
    } catch (error) {
        console.error('[SettingsService] Error getting deposit settings:', error);
        return { success: true, settings: {} };
    }
};

/**
 * Update deposit settings (Admin only)
 */
export const updateDepositSettings = async (settings) => {
    try {
        const settingsRef = doc(db, 'settings', 'deposits');
        await setDoc(settingsRef, settings, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('[SettingsService] Error updating deposit settings:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Subscribe to deposit settings changes (real-time)
 */
export const subscribeToDepositSettings = (callback) => {
    const settingsRef = doc(db, 'settings', 'deposits');

    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            callback({});
        }
    }, (error) => {
        console.error('[SettingsService] Subscription error:', error);
        callback({});
    });

    return unsubscribe;
};
