import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Submit deposit
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { amount, currency, proofUrl, transactionId } = req.body;

        const [result] = await db.query(
            'INSERT INTO deposits (user_email, amount, currency, proof_url, transaction_id) VALUES (?, ?, ?, ?, ?)',
            [req.user.email, amount, currency || 'USD', proofUrl, transactionId]
        );

        res.json({
            success: true,
            deposit: {
                id: result.insertId,
                amount,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Submit deposit error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit deposit' });
    }
});

// Get user deposits
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [deposits] = await db.query(
            'SELECT * FROM deposits WHERE user_email = ? ORDER BY created_at DESC',
            [req.user.email]
        );

        res.json({
            success: true,
            deposits: deposits.map(d => ({
                id: d.id,
                amount: parseFloat(d.amount),
                currency: d.currency,
                status: d.status,
                createdAt: d.created_at
            }))
        });
    } catch (error) {
        console.error('Get deposits error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch deposits' });
    }
});

export default router;
