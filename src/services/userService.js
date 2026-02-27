import { db, auth } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    getDoc,
    deleteDoc,
    increment,
    onSnapshot
} from "firebase/firestore";

export const subscribeToUser = (email, callback) => {
    if (!email) return () => { };

    if (auth.currentUser && auth.currentUser.email === email) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        return onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data());
            } else {
                callback(null);
            }
        });
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            callback(userData);
        } else {
            callback(null);
        }
    });

    return unsubscribe;
};

export const registerUser = async (userData) => {
    return { success: true };
};

export const subscribeToAllUsers = (callback) => {
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[subscribeToAllUsers] Fetched ${users.length} users`);
        callback(users);
    }, (error) => {
        console.error('[subscribeToAllUsers] Error fetching users:', error);
        console.error('[subscribeToAllUsers] Error code:', error.code);
        console.error('[subscribeToAllUsers] Error message:', error.message);
        // DO NOT call callback([]) here - it clears the user list!
        // Just log the error and keep the existing data
    });

    return unsubscribe;
};

export const getUsersPaginated = async (page = 0, limit = 20) => {
    try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const from = page * limit;
        const to = from + limit;
        const paginatedData = allUsers.slice(from, to);

        return {
            success: true,
            users: paginatedData,
            total: allUsers.length,
            hasMore: allUsers.length > to
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateUserStatus = async (email, status) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) throw new Error('User not found');
        const userDoc = snapshot.docs[0];

        await updateDoc(doc(db, "users", userDoc.id), { status });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateUserPoints = async (email, newPoints) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) throw new Error('User not found');
        const userDoc = snapshot.docs[0];

        await updateDoc(doc(db, "users", userDoc.id), { balance: newPoints });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateUserFreezeStatus = async (email, isFrozen) => {
    return updateUserStatus(email, isFrozen ? 'frozen' : 'active');
};

export const incrementUserPoints = async (email, amount) => {
    try {
        let userDocId = null;

        if (auth.currentUser && auth.currentUser.email === email) {
            userDocId = auth.currentUser.uid;
        } else {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const snapshot = await getDocs(q);

            if (snapshot.empty) throw new Error('User not found');
            userDocId = snapshot.docs[0].id;
        }

        await updateDoc(doc(db, "users", userDocId), {
            balance: increment(amount)
        });
        return { success: true };
    } catch (error) {
        console.error('incrementUserPoints failed:', error);
        return { success: false, error: error.message };
    }
};

export const resetUserPassword = async (email, password) => {
    console.warn('resetUserPassword: Not supported in client-only mode.');
    return { success: false, error: 'Password reset requires backend functions.' };
};

export const updateUserTradeResult = async (email, result) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) throw new Error('User not found');
        const userDoc = snapshot.docs[0];

        await updateDoc(doc(db, "users", userDoc.id), { trade_result: result });
        return { success: true };
    } catch (error) {
        console.error('updateUserTradeResult failed:', error.message);
        return { success: false, error: error.message };
    }
};

export const deleteUserProfile = async (userId) => {
    try {
        await deleteDoc(doc(db, "users", userId));
        return { success: true };
    } catch (error) {
        console.error('deleteUserProfile failed:', error.message);
        return { success: false, error: error.message };
    }
};

export const syncLocalStorageToFirestore = async () => {
    return { success: true };
};
