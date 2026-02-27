import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { translations } from '../utils/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        let unsubscribeAuth = null;
        let unsubscribeSnapshot = null;

        console.log('[AppContext] Initializing Firebase Auth Listener');

        unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                console.log('[AppContext] User Signed In:', firebaseUser.uid);

                const userRef = doc(db, "users", firebaseUser.uid);

                // Timeout fallback - if Firestore doesn't respond in 5s, use basic auth data
                let firestoreResolved = false;
                const timeoutId = setTimeout(() => {
                    if (!firestoreResolved) {
                        console.warn('[AppContext] Firestore timeout - using basic auth data');
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || firebaseUser.email
                        });
                        setLoading(false);
                    }
                }, 5000);

                // Try getDoc first for immediate data, then listen for updates
                try {
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        firestoreResolved = true;
                        clearTimeout(timeoutId);
                        const userData = docSnap.data();
                        console.log('[AppContext] Profile loaded via getDoc:', userData);
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...userData
                        });
                        setLoading(false);
                    }
                } catch (e) {
                    console.warn('[AppContext] getDoc failed, waiting for onSnapshot:', e);
                }

                // Keep onSnapshot for real-time updates
                unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        firestoreResolved = true;
                        clearTimeout(timeoutId);

                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...userData
                        });
                    } else {
                        console.warn('[AppContext] No profile found for user:', firebaseUser.uid);
                        setUser(firebaseUser);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error('[AppContext] Firestore Snapshot Error:', error);
                    // Still let the user in with basic auth data
                    if (!firestoreResolved) {
                        firestoreResolved = true;
                        clearTimeout(timeoutId);
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || firebaseUser.email
                        });
                    }
                    setLoading(false);
                });

            } else {
                console.log('[AppContext] User Signed Out');
                setUser(null);
                setLoading(false);
                if (unsubscribeSnapshot) unsubscribeSnapshot();
            }
        });

        return () => {
            console.log('[AppContext] CleanupListeners');
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const t = (key) => {
        return translations[language][key] || key;
    };

    const value = {
        language,
        setLanguage,
        t,
        isChatOpen,
        setIsChatOpen,
        user,
        loading
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
