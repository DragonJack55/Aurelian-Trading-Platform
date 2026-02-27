const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

/**
 * Sync all Firebase Auth users to Firestore
 * This function lists all users in Firebase Authentication
 * and creates/updates Firestore documents for each one
 * 
 * Call this via HTTP: https://us-central1-aurelian-td-trade.cloudfunctions.net/syncAuthUsersToFirestore
 */
exports.syncAuthUsersToFirestore = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        try {
            console.log('Starting Auth to Firestore sync...');

            const results = {
                synced: 0,
                skipped: 0,
                errors: [],
                users: []
            };

            // List all users from Firebase Auth (handles pagination automatically)
            let nextPageToken;
            do {
                const listUsersResult = await auth.listUsers(1000, nextPageToken);

                for (const userRecord of listUsersResult.users) {
                    try {
                        const userDocRef = db.collection('users').doc(userRecord.uid);
                        const docSnapshot = await userDocRef.get();

                        if (!docSnapshot.exists) {
                            // Create new Firestore document for this Auth user
                            const userData = {
                                uid: userRecord.uid,
                                email: userRecord.email || '',
                                displayName: userRecord.displayName || '',
                                full_name: userRecord.displayName || '',
                                role: 'client',
                                status: 'approved',
                                balance: 0,
                                points: 0,
                                assets: 0,
                                trade_result: null,
                                verificationStatus: 'unverified',
                                createdAt: userRecord.metadata.creationTime || new Date().toISOString(),
                                syncedFromAuth: true,
                                syncedAt: new Date().toISOString()
                            };

                            await userDocRef.set(userData);
                            results.synced++;
                            results.users.push({
                                uid: userRecord.uid,
                                email: userRecord.email,
                                action: 'created'
                            });
                            console.log(`Created Firestore doc for: ${userRecord.email}`);
                        } else {
                            results.skipped++;
                            results.users.push({
                                uid: userRecord.uid,
                                email: userRecord.email,
                                action: 'skipped (already exists)'
                            });
                        }
                    } catch (userError) {
                        console.error(`Error syncing user ${userRecord.uid}:`, userError);
                        results.errors.push({
                            uid: userRecord.uid,
                            email: userRecord.email,
                            error: userError.message
                        });
                    }
                }

                nextPageToken = listUsersResult.pageToken;
            } while (nextPageToken);

            console.log(`Sync complete. Synced: ${results.synced}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);

            res.json({
                success: true,
                message: `Synced ${results.synced} users, skipped ${results.skipped} existing users`,
                results: results
            });

        } catch (error) {
            console.error('Sync error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
});

/**
 * Trigger: Auto-create Firestore document when new user registers
 * This ensures future registrations always have Firestore docs
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    try {
        const userDocRef = db.collection('users').doc(user.uid);
        const docSnapshot = await userDocRef.get();

        if (!docSnapshot.exists) {
            await userDocRef.set({
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                full_name: user.displayName || '',
                role: 'client',
                status: 'approved',
                balance: 0,
                points: 0,
                assets: 0,
                trade_result: null,
                verificationStatus: 'unverified',
                createdAt: new Date().toISOString()
            });
            console.log(`Auto-created Firestore doc for new user: ${user.email}`);
        }
    } catch (error) {
        console.error(`Error auto-creating Firestore doc for ${user.uid}:`, error);
    }
});

/**
 * Trigger: Clean up Firestore document when user is deleted from Auth
 */
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
    try {
        await db.collection('users').doc(user.uid).delete();
        console.log(`Deleted Firestore doc for user: ${user.uid}`);
    } catch (error) {
        console.error(`Error deleting Firestore doc for ${user.uid}:`, error);
    }
});

/**
 * Delete a user from both Firebase Auth and Firestore
 * Called by the admin panel to completely remove a user
 * 
 * Body: { userId: string }
 */
exports.deleteUser = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        // Only allow POST requests
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }

        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({ success: false, error: 'userId is required' });
            }

            console.log(`Attempting to delete user: ${userId}`);

            let authDeleted = false;
            let firestoreDeleted = false;

            // Delete from Firebase Auth
            try {
                await auth.deleteUser(userId);
                authDeleted = true;
                console.log(`Deleted Auth user: ${userId}`);
            } catch (authError) {
                // User might not exist in Auth (already deleted or never existed)
                console.log(`Auth user not found or already deleted: ${userId}`, authError.code);
                if (authError.code === 'auth/user-not-found') {
                    authDeleted = true; // Consider it a success if user doesn't exist
                }
            }

            // Delete from Firestore
            try {
                const userDocRef = db.collection('users').doc(userId);
                const docSnapshot = await userDocRef.get();

                if (docSnapshot.exists) {
                    await userDocRef.delete();
                    firestoreDeleted = true;
                    console.log(`Deleted Firestore doc: ${userId}`);
                } else {
                    firestoreDeleted = true; // Consider it a success if doc doesn't exist
                    console.log(`Firestore doc not found: ${userId}`);
                }
            } catch (firestoreError) {
                console.error(`Error deleting Firestore doc: ${userId}`, firestoreError);
            }

            // Also delete related data (verifications, deposits, withdrawals, trades)
            try {
                // Delete verifications for this user
                const verificationsSnapshot = await db.collection('verifications')
                    .where('userId', '==', userId)
                    .get();

                const batch = db.batch();
                verificationsSnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`Deleted ${verificationsSnapshot.size} verifications for user: ${userId}`);
            } catch (relatedError) {
                console.log(`Could not delete related data for: ${userId}`, relatedError.message);
            }

            res.json({
                success: authDeleted || firestoreDeleted,
                message: `User ${userId} deleted successfully`,
                details: {
                    authDeleted,
                    firestoreDeleted
                }
            });

        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
});

// ─── SERVER-SIDE TRADE EXECUTION ──────────────────────────────────────────────
/**
 * Executes Trade Securely
 * 
 * - Validates balance
 * - Creates a Pending trade
 * - Waits for `duration` (in ms natively)
 * - Fetches Binance exact final price
 * - Uses exact rules to win/lose + admin force
 * - Handles point system natively inside admin context
 */
exports.executeTradeNode = functions
    .runWith({ timeoutSeconds: 300, memory: '256MB' })
    .https.onRequest((req, res) => {
        cors(req, res, async () => {
            if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

            let decodedToken;
            try { decodedToken = await verifyAuth(req); }
            catch (e) { return res.status(401).json({ success: false, error: 'Unauthorized' }); }

            try {
                const { symbol, direction, amount, duration, entryPrice, profitRate, tvSymbol } = req.body;

                if (!symbol || !direction || !amount || !duration || !entryPrice) {
                    return res.status(400).json({ success: false, error: 'Missing trade parameters' });
                }

                const uid = decodedToken.uid;
                const userRef = db.collection('users').doc(uid);

                // 1. Transactionally debit balance and create exact trade rules
                const tradeData = await db.runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists) throw new Error("User not found");

                    const userData = userDoc.data();
                    const currentBalance = parseFloat(userData.balance || 0);
                    const tradeAmount = parseFloat(amount);

                    if (currentBalance < tradeAmount) throw new Error("Insufficient balance");
                    if (userData.isFrozen) throw new Error("Account frozen");

                    // Deduct
                    transaction.update(userRef, { balance: currentBalance - tradeAmount });

                    const newTradeRef = db.collection('trades').doc();
                    const pendingTrade = {
                        user_id: uid,
                        symbol: symbol,
                        amount: tradeAmount,
                        direction: direction,
                        duration: parseInt(duration),
                        status: 'pending',
                        outcome: 'pending',
                        payout: 0,
                        entryPrice: parseFloat(entryPrice),
                        profitRate: parseFloat(profitRate || 80),
                        createdAt: new Date().toISOString(),
                        startTime: Date.now()
                    };

                    transaction.set(newTradeRef, pendingTrade);

                    return { id: newTradeRef.id, trade: pendingTrade, settings: userData };
                });

                // Immediately respond to the client with the created trade ID so their frontend can track it
                res.json({ success: true, tradeId: tradeData.id });

                // 2. Perform the server-side wait completely out-of-band so cheating via closing the tab is impossible
                const waitMs = tradeData.trade.duration * 1000;
                await new Promise(resolve => setTimeout(resolve, waitMs));

                // 3. Fetch exact exit price securely
                let exitPrice = tradeData.trade.entryPrice;
                try {
                    const binanceSymbol = tvSymbol ? tvSymbol.replace('BINANCE:', '') : (symbol.replace('/', '') + 'USDT');
                    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`);
                    exitPrice = parseFloat(response.data.price);
                } catch (e) {
                    console.error("Failed to fetch exact price from Binance, defaulting to unchanged", e.message);
                }

                // 4. Determine Win/Loss securely
                let isWin = tradeData.trade.direction === 'up' ? exitPrice > tradeData.trade.entryPrice : exitPrice < tradeData.trade.entryPrice;

                // Handle Admin Force Results
                const forcedResult = tradeData.settings.trade_result || tradeData.settings.tradeResult;
                if (forcedResult === 'win') isWin = true;
                if (forcedResult === 'loss' || forcedResult === 'lose') isWin = false;

                const profitDecimal = tradeData.trade.profitRate / 100;
                const payoutAmount = isWin ? tradeData.trade.amount + (tradeData.trade.amount * profitDecimal) : 0;
                const winLossMetric = isWin ? (tradeData.trade.amount * profitDecimal) : -tradeData.trade.amount;

                // 5. Transactionally append winnings + exit trade
                await db.runTransaction(async (t) => {
                    const tDocRef = db.collection('trades').doc(tradeData.id);
                    const usrDoc = await t.get(userRef);

                    t.update(tDocRef, {
                        status: 'completed',
                        outcome: isWin ? 'win' : 'loss',
                        payout: payoutAmount,
                        exitPrice: exitPrice,
                        result: winLossMetric,
                        completedAt: new Date().toISOString()
                    });

                    if (isWin) {
                        const newBal = parseFloat(usrDoc.data().balance || 0) + payoutAmount;
                        t.update(userRef, { balance: newBal });
                    }
                });

                console.log(`[CloudTrade] Successfully resolved trade ${tradeData.id} for ${uid}. Win: ${isWin}. Payout: ${payoutAmount}`);
            } catch (error) {
                console.error('Error during cloud execution:', error);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, error: error.message });
                }
            }
        });
    });

// ─── TERABOX STORAGE PROXY ──────────────────────────────────────────────

const Busboy = require('busboy');
const TeraboxUploader = require('terabox-upload-tool');
const os = require('os');
const path = require('path');
const fs = require('fs');

/**
 * Get TeraBox uploader instance from environment variables.
 * Credentials are stored in functions/.env file:
 *   TERABOX_NDUS, TERABOX_JSTOKEN, TERABOX_APPID
 */
function getTeraboxClient() {
    const ndus = process.env.TERABOX_NDUS;
    const jsToken = process.env.TERABOX_JSTOKEN;
    const appId = process.env.TERABOX_APPID || '250528';

    if (!ndus || !jsToken) {
        throw new Error('TeraBox credentials not configured. Add TERABOX_NDUS and TERABOX_JSTOKEN to functions/.env');
    }
    return new TeraboxUploader({
        ndus,
        jsToken,
        appId,
    });
}

/**
 * Verify Firebase Auth token from request header.
 * Returns the decoded user if valid, throws otherwise.
 */
async function verifyAuth(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }
    const idToken = authHeader.split('Bearer ')[1];
    return await auth.verifyIdToken(idToken);
}

/**
 * Upload a file to TeraBox.
 *
 * POST with multipart/form-data:
 *   - file: the file to upload
 *   - remotePath (optional): target directory in TeraBox (default: /newaura/{userId}/)
 *
 * Headers: Authorization: Bearer <firebase_id_token>
 *
 * Returns: { success, fsId, remotePath, fileName, fileSize }
 */
exports.teraboxUpload = functions
    .runWith({ timeoutSeconds: 300, memory: '512MB' })
    .https.onRequest((req, res) => {
        cors(req, res, async () => {
            if (req.method !== 'POST') {
                return res.status(405).json({ success: false, error: 'Method not allowed' });
            }

            let decodedToken;
            try {
                decodedToken = await verifyAuth(req);
            } catch (authErr) {
                return res.status(401).json({ success: false, error: authErr.message });
            }

            const userId = decodedToken.uid;

            // Parse multipart form data
            const busboy = Busboy({ headers: req.headers });
            let tmpFilePath = null;
            let fileName = null;
            let fileSize = 0;
            let customRemotePath = null;

            const filePromise = new Promise((resolve, reject) => {
                busboy.on('file', (fieldname, file, info) => {
                    fileName = info.filename;
                    tmpFilePath = path.join(os.tmpdir(), `${Date.now()}_${fileName}`);
                    const writeStream = fs.createWriteStream(tmpFilePath);

                    file.on('data', (data) => {
                        fileSize += data.length;
                    });

                    file.pipe(writeStream);

                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                busboy.on('field', (fieldname, val) => {
                    if (fieldname === 'remotePath') customRemotePath = val;
                });

                busboy.on('finish', () => {
                    if (!tmpFilePath) reject(new Error('No file uploaded'));
                });

                busboy.on('error', reject);
            });

            // For Cloud Functions, the raw body is in req.rawBody
            if (req.rawBody) {
                busboy.end(req.rawBody);
            } else {
                req.pipe(busboy);
            }

            try {
                await filePromise;

                const remotePath = customRemotePath || `/newaura/${userId}/`;
                const client = getTeraboxClient();

                console.log(`Uploading ${fileName} (${fileSize} bytes) to TeraBox at ${remotePath}`);

                const result = await client.uploadFile(
                    tmpFilePath,
                    (loaded, total) => {
                        console.log(`Upload progress: ${Math.round((loaded / total) * 100)}%`);
                    },
                    remotePath
                );

                // Clean up temp file
                fs.unlinkSync(tmpFilePath);

                console.log(`Upload complete for ${fileName}:`, JSON.stringify(result));

                res.json({
                    success: true,
                    fsId: result.fs_id || result.data?.fs_id || null,
                    remotePath: `${remotePath}${fileName}`,
                    fileName,
                    fileSize,
                    result,
                });

            } catch (error) {
                console.error('TeraBox upload error:', error);
                // Clean up temp file on error
                if (tmpFilePath && fs.existsSync(tmpFilePath)) {
                    fs.unlinkSync(tmpFilePath);
                }
                res.status(500).json({ success: false, error: error.message });
            }
        });
    });

/**
 * Get a download link for a TeraBox file.
 *
 * POST with JSON body: { fsId: string }
 * Headers: Authorization: Bearer <firebase_id_token>
 *
 * Returns: { success, downloadLink }
 */
exports.teraboxDownload = functions
    .runWith({ timeoutSeconds: 60, memory: '256MB' })
    .https.onRequest((req, res) => {
        cors(req, res, async () => {
            if (req.method !== 'POST') {
                return res.status(405).json({ success: false, error: 'Method not allowed' });
            }

            try {
                await verifyAuth(req);
            } catch (authErr) {
                return res.status(401).json({ success: false, error: authErr.message });
            }

            try {
                const { fsId } = req.body;
                if (!fsId) {
                    return res.status(400).json({ success: false, error: 'fsId is required' });
                }

                const client = getTeraboxClient();
                const result = await client.downloadFile(fsId);

                console.log(`Download link generated for fsId ${fsId}`);

                res.json({
                    success: true,
                    downloadLink: result.downloadLink || result.dlink || null,
                    result,
                });

            } catch (error) {
                console.error('TeraBox download error:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    });

/**
 * Delete a file from TeraBox.
 *
 * POST with JSON body: { filePaths: string[] }
 *   e.g. { filePaths: ["/newaura/uid123/document.pdf"] }
 *
 * Headers: Authorization: Bearer <firebase_id_token>
 *
 * Returns: { success }
 */
exports.teraboxDelete = functions
    .runWith({ timeoutSeconds: 60, memory: '256MB' })
    .https.onRequest((req, res) => {
        cors(req, res, async () => {
            if (req.method !== 'POST') {
                return res.status(405).json({ success: false, error: 'Method not allowed' });
            }

            try {
                await verifyAuth(req);
            } catch (authErr) {
                return res.status(401).json({ success: false, error: authErr.message });
            }

            try {
                const { filePaths } = req.body;
                if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
                    return res.status(400).json({ success: false, error: 'filePaths array is required' });
                }

                const client = getTeraboxClient();
                const result = await client.deleteFiles(filePaths);

                console.log(`Deleted ${filePaths.length} file(s) from TeraBox`);

                res.json({ success: true, result });

            } catch (error) {
                console.error('TeraBox delete error:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    });

