// Firestore Error Handling Utilities
// Use these helpers to ensure all Firestore listeners are crash-resistant

/**
 * Safely process a Firestore document
 * @param {DocumentSnapshot} doc - Firestore document
 * @param {Function} processor - Function to process document data
 * @returns {any|null} - Processed data or null if error
 */
export const safeProcessDoc = (doc, processor) => {
    try {
        if (!doc || !doc.exists || !doc.exists()) return null;
        const data = doc.data();
        if (!data) return null;
        return processor ? processor(data, doc.id) : { id: doc.id, ...data };
    } catch (error) {
        console.error(`[safeProcessDoc] Error processing document ${doc?.id}:`, error);
        return null;
    }
};

/**
 * Safely map and filter Firestore documents
 * @param {Array} docs - Array of Firestore documents
 * @param {Function} mapper - Function to map each document
 * @returns {Array} - Mapped and filtered array (no nulls)
 */
export const safeMapDocs = (docs, mapper) => {
    try {
        if (!docs || !Array.isArray(docs)) return [];
        return docs
            .map(doc => safeProcessDoc(doc, mapper))
            .filter(item => item !== null);
    } catch (error) {
        console.error('[safeMapDocs] Error mapping documents:', error);
        return [];
    }
};

/**
 * Create a robust onSnapshot listener with automatic error handling
 * @param {Query} query - Firestore query
 * @param {Function} callback - Success callback
 * @param {string} listenerName - Name for logging
 * @returns {Function} - Unsubscribe function
 */
export const createSafeListener = (query, callback, listenerName = 'Unknown') => {
    try {
        const { onSnapshot } = require('firebase/firestore');

        return onSnapshot(
            query,
            (snapshot) => {
                try {
                    if (!snapshot) {
                        console.warn(`[${listenerName}] Received null snapshot`);
                        callback([]);
                        return;
                    }
                    callback(snapshot);
                } catch (callbackError) {
                    console.error(`[${listenerName}] Error in success callback:`, callbackError);
                    callback(snapshot.empty ? [] : snapshot);
                }
            },
            (error) => {
                console.error(`[${listenerName}] Firestore listener error:`, error);
                // Call callback with empty data to prevent crashes
                try {
                    callback([]);
                } catch (fallbackError) {
                    console.error(`[${listenerName}] Error in error fallback:`, fallbackError);
                }
            }
        );
    } catch (setupError) {
        console.error(`[${listenerName}] Error setting up listener:`, setupError);
        return () => { }; // Return no-op unsubscribe
    }
};
