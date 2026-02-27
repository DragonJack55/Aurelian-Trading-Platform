import { db, auth } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    onSnapshot,
    updateDoc
} from "firebase/firestore";

export const saveTrade = async (_userEmail, tradeData, existingId = null) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        if (existingId) {
            const tradeDoc = doc(db, "trades", existingId);
            await updateDoc(tradeDoc, {
                status: tradeData.status,
                outcome: tradeData.status === 'completed' ? (tradeData.result >= 0 ? 'win' : 'loss') : 'pending',
                payout: tradeData.payout,
                exitPrice: tradeData.exitPrice,
                result: tradeData.result,
                completedAt: tradeData.completedAt ? new Date(tradeData.completedAt).toISOString() : null
            });
            return { success: true, tradeId: existingId };
        }

        const tradesRef = collection(db, "trades");
        const docRef = await addDoc(tradesRef, {
            user_id: user.uid,
            symbol: tradeData.symbol || tradeData.asset,
            amount: tradeData.amount,
            direction: tradeData.direction,
            duration: tradeData.duration || 60,
            status: tradeData.status || 'pending',
            outcome: 'pending', // Legacy support
            payout: tradeData.payout || 0,
            entryPrice: tradeData.entryPrice,
            profitRate: tradeData.profitRate,
            startTime: tradeData.startTime ? new Date(tradeData.startTime).toISOString() : new Date().toISOString(),
            createdAt: new Date().toISOString()
        });

        return { success: true, tradeId: docRef.id };
    } catch (error) {
        console.error('Error saving trade:', error);
        return { success: false, error: error.message };
    }
};

export const getUserTrades = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return { success: false, error: 'User not authenticated' };

        const tradesRef = collection(db, "trades");
        const q = query(
            tradesRef,
            where("user_id", "==", user.uid)
        );

        const snapshot = await getDocs(q);
        const trades = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return { success: true, trades };
    } catch (error) {
        console.error('Error getting trades:', error);
        return { success: false, error: error.message };
    }
};

export const subscribeToTrades = (_userEmail, callback) => {
    const user = auth.currentUser;
    if (!user) return () => { };

    const tradesRef = collection(db, "trades");
    const q = query(
        tradesRef,
        where("user_id", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const trades = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(trades);
    });

    return unsubscribe;
};

export const getAllTrades = async () => {
    try {
        const tradesRef = collection(db, "trades");
        const snapshot = await getDocs(tradesRef);
        const trades = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return { success: true, trades };
    } catch (error) {
        console.warn('[TradeService] getAllTrades failed:', error);
        return { success: false, error: error.message };
    }
};

export const subscribeToAllTrades = (callback) => {
    const tradesRef = collection(db, "trades");
    const unsubscribe = onSnapshot(tradesRef, (snapshot) => {
        const trades = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        callback(trades);
    }, (error) => {
        console.error("Error subscribing to all trades:", error);
    });
    return unsubscribe;
};
