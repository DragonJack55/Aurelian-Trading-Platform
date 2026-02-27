import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

const formatError = (error) => {
    return error?.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : error?.message || 'An unknown error occurred';
};

export const initiateRegistration = async (formData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: formData.email,
            displayName: formData.fullName,
            full_name: formData.fullName,
            role: 'client',
            status: 'approved', // Set to approved so they appear in Active Users
            verificationStatus: 'unverified', // Initially, they have not submitted identity docs
            password: formData.password,
            points: 0,
            balance: 0,
            assets: 0,
            createdAt: new Date().toISOString()
        });

        return {
            success: true,
            user: { ...user, displayName: formData.fullName },
            session: { access_token: await user.getIdToken() }
        };
    } catch (error) {
        console.error('Registration Error:', error);
        return { success: false, error: formatError(error) };
    }
};

export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        try {
            await addDoc(collection(db, "login_history"), {
                userId: user.uid,
                email: email,
                loginTime: new Date().toISOString(),
                userAgent: navigator.userAgent
            });
        } catch (hError) {
            console.warn("Failed to record login history", hError);
        }

        return {
            success: true,
            user: user,
            session: { access_token: token }
        };
    } catch (error) {
        return { success: false, error: formatError(error) };
    }
};

export const loginAdmin = async (email, password) => {
    const result = await login(email, password);
    if (!result.success) return result;

    try {
        const docRef = doc(db, "users", result.user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.role === 'admin' || email === 'durantedante62@gmail.com') {
                return result;
            }
        }

        await logout();
        return { success: false, error: 'Access denied: Not an administrator' };
    } catch (e) {
        console.error('Admin Check Error:', e);
        return { success: false, error: 'Failed to verify admin privileges' };
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const sendOTPEmail = async () => {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        return { success: true, message: 'Verification email sent' };
    }
    return { success: false, error: 'No user logged in or already verified' };
};
