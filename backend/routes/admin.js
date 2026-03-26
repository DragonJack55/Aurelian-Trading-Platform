import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Delete Supabase User (Bypass RLS) via REST
// Placed BEFORE auth middleware to allow access via custom secret (since Supabase token != Backend token)
router.delete('/supabase-users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const adminSecret = req.headers['x-admin-secret'];

        // Security Check
        if (adminSecret !== 'super_secret_admin_key_123') {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = 'https://uyesfkxrrlfxsmzfsofd.supabase.co';

        if (!serviceKey) {
            return res.status(500).json({ success: false, error: 'Missing Supabase service key in environment variables' });
        }

        // Headers for Admin access
        const headers = {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
        };

        console.log(`[AdminAPI] Deleting Supabase user: ${id}`);

        // 1. Delete from Auth System
        const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!authRes.ok) {
            const txt = await authRes.text();
            console.warn('[AdminAPI] Auth delete warning:', txt);
        } else {
            console.log('[AdminAPI] Auth delete success');
        }

        // 2. Delete from Profiles Table
        const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!profileRes.ok) {
            const txt = await profileRes.text();
            throw new Error(`Profile delete failed: ${txt}`);
        }

        console.log('[AdminAPI] Profile delete success');
        res.json({ success: true });

    } catch (error) {
        console.error('[AdminAPI] Supabase delete failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// All admin routes require authentication and admin role
router.use(authenticateToken, isAdmin);

// Get all users
router.get('/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email != ? ORDER BY created_at DESC', ['admin@aureliantrade.com']);

        res.json({
            success: true,
            users: users.map(u => ({
                id: u.id,
                email: u.email,
                fullName: u.full_name,
                username: u.username,
                points: parseFloat(u.points),
                status: u.status,
                verificationStatus: u.verification_status,
                tradeResult: u.trade_result,
                createdAt: u.created_at
            }))
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

// Update user status
router.patch('/users/:email/status', async (req, res) => {
    try {
        const { email } = req.params;
        const { status } = req.body;

        await db.query('UPDATE users SET status = ? WHERE email = ?', [status, email]);

        res.json({ success: true });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
});

// Reset user password
router.patch('/users/:email/reset-password', async (req, res) => {
    try {
        const { email } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [passwordHash, email]);

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
});

// Update user trade result (Force Win/Lose)
router.patch('/users/:email/trade-result', async (req, res) => {
    try {
        const { email } = req.params;
        const { tradeResult } = req.body;

        await db.query('UPDATE users SET trade_result = ? WHERE email = ?', [tradeResult, email]);

        res.json({ success: true });
    } catch (error) {
        console.error('Update trade result error:', error);
        res.status(500).json({ success: false, error: 'Failed to update trade result' });
    }
});

// Add/Remove user points/crypto
router.patch('/users/:email/points', async (req, res) => {
    try {
        const { email } = req.params;
        const { amount, currency = 'USDT' } = req.body; // Positive to add, negative to remove

        let column = 'points';
        if (currency === 'BTC') column = 'btc_balance';
        if (currency === 'ETH') column = 'eth_balance';

        await db.query(`UPDATE users SET ${column} = ${column} + ? WHERE email = ?`, [amount, email]);

        const [users] = await db.query(`SELECT points, btc_balance, eth_balance FROM users WHERE email = ?`, [email]);

        res.json({
            success: true,
            newBalance: parseFloat(users[0][column]),
            balances: {
                USDT: parseFloat(users[0].points),
                BTC: parseFloat(users[0].btc_balance),
                ETH: parseFloat(users[0].eth_balance)
            }
        });
    } catch (error) {
        console.error('Update points error:', error);
        res.status(500).json({ success: false, error: 'Failed to update user wallet' });
    }
});

// Delete user
router.delete('/users/:email', async (req, res) => {
    try {
        const { email } = req.params;

        await db.query('DELETE FROM users WHERE email = ?', [email]);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
});

// Get all verifications
router.get('/verifications', async (req, res) => {
    try {
        const [verifications] = await db.query(
            'SELECT v.*, v.status as verification_status, u.points, u.status as user_status FROM verifications v LEFT JOIN users u ON v.user_email = u.email ORDER BY v.submitted_at DESC'
        );

        res.json({
            success: true,
            verifications: verifications.map(v => ({
                id: v.id,
                userEmail: v.user_email,
                fullName: v.full_name,
                idNumber: v.id_number,
                frontIdBase64: v.front_id_base64,
                backIdBase64: v.back_id_base64,
                verificationStatus: v.verification_status, // Fixed property name
                userStatus: v.user_status,
                status: v.verification_status, // Keep legacy just in case
                submittedAt: v.submitted_at
            }))
        });
    } catch (error) {
        console.error('Get verifications error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch verifications' });
    }
});

// Approve/Reject verification
router.patch('/verifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'verified' or 'rejected'

        const [verifications] = await db.query('SELECT user_email FROM verifications WHERE id = ?', [id]);

        if (verifications.length === 0) {
            return res.status(404).json({ success: false, error: 'Verification not found' });
        }

        const userEmail = verifications[0].user_email;

        await db.query('UPDATE verifications SET status = ?, reviewed_at = NOW() WHERE id = ?', [status, id]);
        await db.query('UPDATE users SET verification_status = ? WHERE email = ?', [status, userEmail]);

        res.json({ success: true });
    } catch (error) {
        console.error('Update verification error:', error);
        res.status(500).json({ success: false, error: 'Failed to update verification' });
    }
});

// Get all deposits
router.get('/deposits', async (req, res) => {
    try {
        const [deposits] = await db.query('SELECT * FROM deposits ORDER BY created_at DESC');

        res.json({
            success: true,
            deposits: deposits.map(d => ({
                id: d.id,
                userEmail: d.user_email,
                amount: parseFloat(d.amount),
                currency: d.currency,
                status: d.status,
                proofUrl: d.proof_url,
                createdAt: d.created_at
            }))
        });
    } catch (error) {
        console.error('Get deposits error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch deposits' });
    }
});

// Approve/Reject deposit
router.patch('/deposits/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const [deposits] = await db.query('SELECT * FROM deposits WHERE id = ?', [id]);

        if (deposits.length === 0) {
            return res.status(404).json({ success: false, error: 'Deposit not found' });
        }

        const deposit = deposits[0];

        await db.query('UPDATE deposits SET status = ?, processed_at = NOW() WHERE id = ?', [status, id]);

        // If approved, add funds to user
        if (status === 'approved') {
            await db.query('UPDATE users SET points = points + ? WHERE email = ?', [deposit.amount, deposit.user_email]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Update deposit error:', error);
        res.status(500).json({ success: false, error: 'Failed to update deposit' });
    }
});

// Get all withdrawals
router.get('/withdrawals', async (req, res) => {
    try {
        const [withdrawals] = await db.query('SELECT * FROM withdrawals ORDER BY created_at DESC');

        res.json({
            success: true,
            withdrawals: withdrawals.map(w => ({
                id: w.id,
                userEmail: w.user_email,
                amount: parseFloat(w.amount),
                currency: w.currency,
                status: w.status,
                walletAddress: w.wallet_address,
                walletType: w.wallet_type,
                createdAt: w.created_at
            }))
        });
    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch withdrawals' });
    }
});

// Approve/Reject withdrawal
router.patch('/withdrawals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await db.query('UPDATE withdrawals SET status = ?, processed_at = NOW() WHERE id = ?', [status, id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Update withdrawal error:', error);
        res.status(500).json({ success: false, error: 'Failed to update withdrawal' });
    }
});

// Get all messages (for customer chat)
router.get('/messages', async (req, res) => {
    try {
        const [messages] = await db.query(
            'SELECT DISTINCT user_email, user_name, MAX(created_at) as last_message FROM messages GROUP BY user_email ORDER BY last_message DESC'
        );

        res.json({
            success: true,
            conversations: messages.map(m => ({
                userEmail: m.user_email,
                userName: m.user_name,
                lastMessage: m.last_message
            }))
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});

// Get conversation with specific user
router.get('/messages/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const [messages] = await db.query(
            'SELECT * FROM messages WHERE user_email = ? ORDER BY created_at ASC',
            [email]
        );

        res.json({
            success: true,
            messages: messages.map(m => ({
                id: m.id,
                sender: m.sender,
                message: m.message,
                read: m.is_read,
                createdAt: m.created_at
            }))
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
    }
});

// Send admin reply
router.post('/messages/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { message } = req.body;

        await db.query(
            'INSERT INTO messages (user_email, user_name, sender, message) VALUES (?, ?, ?, ?)',
            [email, 'Admin', 'admin', message]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Send admin message error:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

// AI Professional Rewrite
router.post('/rewrite', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, error: 'AI service not configured' });
        }

        const prompt = `You are an expert customer support agent for Aurelian TD Trade, a premium institutional crypto trading platform. Rewrite the following draft message into a concise, professional, and empathetic customer service reply. Keep the same core intent but elevate the language to match a premium brand. Return ONLY the rewritten message text, with no preamble, quotes, or explanation.

Draft message: "${message.trim()}"`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.4, maxOutputTokens: 512 }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const rewritten = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!rewritten) {
            throw new Error('No content from AI');
        }

        res.json({ success: true, rewritten });
    } catch (error) {
        console.error('[AI Rewrite] Error:', error);
        // Graceful fallback: return the original message unchanged
        res.status(200).json({ success: true, rewritten: req.body.message, fallback: true });
    }
});

// Delete user conversation
router.delete('/messages/:email', async (req, res) => {
    try {
        const { email } = req.params;

        await db.query('DELETE FROM messages WHERE user_email = ?', [email]);

        res.json({ success: true });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete conversation' });
    }
});

// Delete Supabase User (Bypass RLS) via REST
router.delete('/supabase-users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = 'https://uyesfkxrrlfxsmzfsofd.supabase.co';

        if (!serviceKey) {
            return res.status(500).json({ success: false, error: 'Missing Supabase service key in environment variables' });
        }

        // Headers for Admin access
        const headers = {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
        };

        console.log(`[AdminAPI] Deleting Supabase user: ${id}`);

        // 1. Delete from Auth System
        const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!authRes.ok) {
            const txt = await authRes.text();
            console.warn('[AdminAPI] Auth delete warning:', txt);
        } else {
            console.log('[AdminAPI] Auth delete success');
        }

        // 2. Delete from Profiles Table
        const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${id}`, {
            method: 'DELETE',
            headers: headers
        });

        if (!profileRes.ok) {
            const txt = await profileRes.text();
            throw new Error(`Profile delete failed: ${txt}`);
        }

        console.log('[AdminAPI] Profile delete success');
        res.json({ success: true });

    } catch (error) {
        console.error('[AdminAPI] Supabase delete failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
