import { db } from '../firebase';
import {
    collection,
    onSnapshot
} from "firebase/firestore";

export const subscribeToAllLoginHistory = (callback) => {
    const historyRef = collection(db, "login_history");
    const unsubscribe = onSnapshot(historyRef, (snapshot) => {
        const history = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.loginTime || 0) - new Date(a.loginTime || 0));
        callback(history);
    }, (error) => {
        console.error("Error subscribing to login history:", error);
    });
    return unsubscribe;
};
