import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit, updateDoc, onSnapshot, Timestamp, where, getDoc, startAfter } from 'firebase/firestore';

// Helper to compress Base64 image
const compressImage = async (base64Str, maxWidth = 800) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6)); // 60% quality JPEG
        };
    });
};

export const getDepositSettings = async () => {
    try {
        const settingsRef = doc(db, 'settings', 'deposits');
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
            return { success: true, settings: settingsDoc.data() };
        }

        return { success: true, settings: {} };
    } catch (error) {
        console.error('Error getting deposit settings:', error);
        return { success: true, settings: {} };
    }
};

export const updateDepositSettings = async (settings) => {
    try {
        const settingsRef = doc(db, 'settings', 'deposits');
        await setDoc(settingsRef, settings, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error updating deposit settings:', error);
        return { success: false, error: error.message };
    }
};

export const submitDeposit = async (data) => {
    try {
        if (!data.amount) throw new Error('Amount is required');

        // Compress proof image
        let compressedProof = data.proofBase64;
        if (data.proofBase64 && data.proofBase64.length > 500 * 1024) {
            console.log('[Deposit] Compressing proof image...');
            compressedProof = await compressImage(data.proofBase64);
        }

        const depositRef = doc(collection(db, 'deposits'));
        const depositData = {
            userId: data.userId,
            userEmail: data.userEmail || '',
            amount: parseFloat(data.amount),
            method: data.currency || 'crypto',
            proofUrl: compressedProof,
            status: 'pending',
            createdAt: Timestamp.now()
        };

        await setDoc(depositRef, depositData);

        return { success: true, id: depositRef.id };
    } catch (error) {
        console.error('Error submitting deposit:', error);
        return { success: false, error: error.message };
    }
};

export const getDepositsPaginated = async (lastDoc = null, limitCount = 20) => {
    try {
        const depositsRef = collection(db, 'deposits');
        let q = query(depositsRef, orderBy('createdAt', 'desc'), limit(limitCount));

        if (lastDoc) {
            q = query(depositsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
        }

        const querySnapshot = await getDocs(q);
        const deposits = [];

        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();

            // Fetch user details
            let userEmail = data.userEmail;
            let fullName = '';

            if (data.userId) {
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    userEmail = userData.email || userEmail;
                    fullName = userData.fullName || '';
                }
            }

            deposits.push({
                id: docSnap.id,
                ...data,
                profiles: {
                    email: userEmail,
                    full_name: fullName
                }
            });
        }

        return {
            success: true,
            deposits,
            hasMore: querySnapshot.docs.length === limitCount
        };
    } catch (error) {
        console.error('Error getting paginated deposits:', error);
        return { success: false, error: error.message };
    }
};

export const subscribeToAllDeposits = (callback) => {
    const depositsRef = collection(db, 'deposits');
    const q = query(depositsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const deposits = [];

        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();

            // Fetch user details
            let userEmail = data.userEmail;
            let fullName = '';

            if (data.userId) {
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    userEmail = userData.email || userEmail;
                    fullName = userData.fullName || '';
                }
            }

            deposits.push({
                id: docSnap.id,
                ...data,
                profiles: {
                    email: userEmail,
                    full_name: fullName
                }
            });
        }

        callback(deposits);
    }, (error) => {
        console.error('Error in deposits subscription:', error);
    });

    return unsubscribe;
};

export const updateDepositStatus = async (depositId, status, rejectionReason = '') => {
    try {
        const depositRef = doc(db, 'deposits', depositId);
        const updateData = { status };

        if (rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        await updateDoc(depositRef, updateData);
        return { success: true };
    } catch (error) {
        console.error('Error updating deposit status:', error);
        return { success: false, error: error.message };
    }
};
