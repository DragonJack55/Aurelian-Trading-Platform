import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, updateDoc, onSnapshot, Timestamp, getDoc, startAfter } from 'firebase/firestore';

export const submitWithdrawal = async (data) => {
    try {
        const withdrawalRef = doc(collection(db, 'withdrawals'));
        const withdrawalData = {
            userId: data.userId,
            userEmail: data.userEmail || '',
            amount: parseFloat(data.amount),
            method: data.method || 'crypto',
            details: data.details || {},
            status: 'pending',
            createdAt: Timestamp.now()
        };

        await setDoc(withdrawalRef, withdrawalData);
        return { success: true, id: withdrawalRef.id };
    } catch (error) {
        console.error('Error submitting withdrawal:', error);
        return { success: false, error: error.message };
    }
};

export const getWithdrawals = async (userId) => {
    try {
        const withdrawalsRef = collection(db, 'withdrawals');
        const q = query(
            withdrawalsRef,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const withdrawals = [];

        querySnapshot.forEach((doc) => {
            withdrawals.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return { success: true, withdrawals };
    } catch (error) {
        console.error('Error getting withdrawals:', error);
        return { success: false, error: error.message };
    }
};

// Admin Functions

export const getWithdrawalsPaginated = async (lastDoc = null, limitCount = 20) => {
    try {
        const withdrawalsRef = collection(db, 'withdrawals');
        let q = query(withdrawalsRef, orderBy('createdAt', 'desc'), limit(limitCount));

        if (lastDoc) {
            q = query(withdrawalsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
        }

        const querySnapshot = await getDocs(q);
        const withdrawals = [];

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

            withdrawals.push({
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
            withdrawals,
            hasMore: querySnapshot.docs.length === limitCount
        };
    } catch (error) {
        console.error('Error getting paginated withdrawals:', error);
        return { success: false, error: error.message };
    }
};

export const subscribeToAllWithdrawals = (callback) => {
    const withdrawalsRef = collection(db, 'withdrawals');
    const q = query(withdrawalsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const withdrawals = [];

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

            withdrawals.push({
                id: docSnap.id,
                ...data,
                profiles: {
                    email: userEmail,
                    full_name: fullName
                }
            });
        }

        callback(withdrawals);
    }, (error) => {
        console.error('Error in withdrawals subscription:', error);
    });

    return unsubscribe;
};

export const updateWithdrawalStatus = async (id, status) => {
    try {
        const withdrawalRef = doc(db, 'withdrawals', id);
        await updateDoc(withdrawalRef, { status });
        return { success: true };
    } catch (error) {
        console.error('Error updating withdrawal status:', error);
        return { success: false, error: error.message };
    }
};
