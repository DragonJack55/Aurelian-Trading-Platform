import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAayBsbg1Qk5v3NbsFh5TjsBbgnLIoq754",
    authDomain: "aurelian-td-trade.firebaseapp.com",
    projectId: "aurelian-td-trade",
    storageBucket: "aurelian-td-trade.firebasestorage.app",
    messagingSenderId: "16907272262",
    appId: "1:16907272262:web:d49c7d521d81e3b7468a47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
