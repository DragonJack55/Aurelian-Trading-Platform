import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, onSnapshot, Timestamp, startAfter } from 'firebase/firestore';
import { notifyKYCSubmitted } from './telegramService';


// Helper to map Firestore doc to frontend structure
const mapVerification = (docData, docId, userEmail = null, userFullName = null) => ({
    id: docId,
    userId: docData.userId,
    email: docData.userEmail || userEmail,
    verificationStatus: docData.status,
    verificationData: {
        fullName: docData.fullName || userFullName || '',
        idNumber: docData.idNumber || '',
        frontIdBase64: docData.frontImageUrl,
        backIdBase64: docData.backImageUrl,
        submittedAt: docData.submittedAt || null
    },
    profiles: {
        email: docData.userEmail || userEmail,
        full_name: docData.fullName || userFullName
    }
});

export const submitVerification = async (user, formData, frontBase64, backBase64) => {
    try {
        if (!frontBase64 || !backBase64) {
            throw new Error('Both Front and Back ID images are required.');
        }

        if (!user || !user.uid) {
            throw new Error('User not authenticated. Please log in and try again.');
        }

        const userId = user.uid;
        const userEmail = user.email;

        // Create verification document
        const verificationRef = doc(collection(db, 'verifications'));
        const verificationData = {
            userId: userId,
            userEmail: userEmail,
            frontImageUrl: frontBase64,
            backImageUrl: backBase64,
            status: 'pending',
            fullName: formData?.fullName || '',
            idNumber: formData?.idNumber || '',
            submittedAt: Timestamp.now(),
            createdAt: Timestamp.now()
        };

        await setDoc(verificationRef, verificationData);

        // Update user profile with verification status and full name
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            verificationStatus: 'pending',
            fullName: formData?.fullName || ''
        });

        // Notify admin via Telegram (non-blocking)
        notifyKYCSubmitted({
            fullName: formData?.fullName || 'Unknown',
            email: userEmail,
            idNumber: formData?.idNumber || ''
        });

        return { success: true, id: verificationRef.id };

    } catch (error) {
        console.error('Error submitting verification:', error);
        return { success: false, error: error.message };
    }
};

export const getVerificationStatus = async (userIdOrEmail) => {
    try {
        let userId = userIdOrEmail;

        // If input looks like an email, lookup the UID from users collection
        if (String(userIdOrEmail).includes('@')) {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', userIdOrEmail), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: true, status: 'unverified' };
            }

            userId = querySnapshot.docs[0].id;
        }

        // Fetch all verifications for the user (single where clause to avoid missing index errors)
        const verificationsRef = collection(db, 'verifications');
        const anyQuery = query(
            verificationsRef,
            where('userId', '==', userId)
        );
        let docsList = [];
        try {
            const anySnapshot = await getDocs(anyQuery);
            if (!anySnapshot.empty) {
                docsList = anySnapshot.docs.map(d => d.data());
            }
        } catch (queryErr) {
            console.warn('Verification query failed (likely permission rules), falling back to profile status:', queryErr.message);
        }

        if (docsList.length > 0) {

            // 1. Check if ANY record is verified
            const verifiedDoc = docsList.find(d => d.status === 'verified');
            if (verifiedDoc) {
                return { success: true, status: 'verified', data: verifiedDoc };
            }

            // 2. Check for pending verification
            const pendingDoc = docsList.find(d => d.status === 'pending');
            if (pendingDoc) {
                return {
                    success: true,
                    status: pendingDoc.status,
                    rejectionReason: pendingDoc.rejectionReason,
                    data: pendingDoc
                };
            }

            // 3. Fallback to the latest record (e.g. rejected)
            docsList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            const latest = docsList[0];
            return {
                success: true,
                status: latest.status,
                rejectionReason: latest.rejectionReason,
                data: latest
            };
        }

        // Fallback to user profile status if no docs found or query failed
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                    success: true,
                    status: userData.verificationStatus || 'unverified'
                };
            }
        } catch (profileErr) {
            console.error('Failed to fallback to user profile:', profileErr.message);
        }

        return { success: true, status: 'unverified' };
    } catch (error) {
        console.error('Error getting verification status:', error);
        return { success: false, error: error.message };
    }
};

// Admin Functions

export const getAllVerifications = async () => {
    try {
        const verificationsRef = collection(db, 'verifications');
        const q = query(verificationsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const verifications = [];
        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            // Fetch user data for email and full name
            let userEmail = data.userEmail;
            let userFullName = data.fullName;

            if (data.userId) {
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    userEmail = userData.email || userEmail;
                    userFullName = userData.fullName || userFullName;
                }
            }

            verifications.push(mapVerification(data, docSnap.id, userEmail, userFullName));
        }

        return { success: true, verifications };
    } catch (error) {
        console.error('Error getting all verifications:', error);
        return { success: false, error: error.message };
    }
};

export const subscribeToAllVerifications = (callback) => {
    const verificationsRef = collection(db, 'verifications');
    const q = query(verificationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const verifications = [];
        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            let userEmail = data.userEmail;
            let userFullName = data.fullName;

            if (data.userId) {
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    userEmail = userData.email || userEmail;
                    userFullName = userData.fullName || userFullName;
                }
            }

            verifications.push(mapVerification(data, docSnap.id, userEmail, userFullName));
        }
        callback(verifications);
    }, (error) => {
        console.error('Error in verifications subscription:', error);
    });

    return unsubscribe;
};

export const getVerificationsPaginated = async (lastDoc = null, limitCount = 10) => {
    try {
        const verificationsRef = collection(db, 'verifications');
        let q = query(verificationsRef, orderBy('createdAt', 'desc'), limit(limitCount));

        if (lastDoc) {
            q = query(verificationsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
        }

        const querySnapshot = await getDocs(q);
        const verifications = [];

        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            let userEmail = data.userEmail;
            let userFullName = data.fullName;

            if (data.userId) {
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    userEmail = userData.email || userEmail;
                    userFullName = userData.fullName || userFullName;
                }
            }

            verifications.push(mapVerification(data, docSnap.id, userEmail, userFullName));
        }

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        return {
            success: true,
            verifications,
            lastDoc: lastVisible,
            hasMore: querySnapshot.docs.length === limitCount
        };
    } catch (error) {
        console.error('Error getting paginated verifications:', error);
        return { success: false, error: error.message };
    }
};

export const updateVerificationStatus = async (id, status, rejectionReason = null, userId = null) => {
    try {
        const verificationRef = doc(db, 'verifications', id);
        const updateData = { status };

        if (rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        await updateDoc(verificationRef, updateData);

        // Get userId if not provided
        let targetUserId = userId;
        if (!targetUserId) {
            const verificationDoc = await getDoc(verificationRef);
            if (verificationDoc.exists()) {
                targetUserId = verificationDoc.data().userId;
            }
        }

        // Sync status to user profile
        if (targetUserId) {
            const userRef = doc(db, 'users', targetUserId);
            await updateDoc(userRef, {
                verificationStatus: status
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Error updating verification status:', error);
        return { success: false, error: error.message };
    }
};
