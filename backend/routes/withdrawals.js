import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Submit withdrawal
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { amount, currency, walletAddress, walletType } = req.body;

        const [result] = await db.query(
            'INSERT INTO withdrawals (user_email, amount, currency, wallet_address, wallet_type) VALUES (?, ?, ?, ?, ?)',
            [req.user.email, amount, currency || 'USD', walletAddress, walletType]
        );

        res.json({
            success: true,
            withdrawal: {
                id: result.insertId,
                amount,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Submit withdrawal error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit withdrawal' });
    }
});

// Get user withdrawals
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [withdrawals] = await db.query(
            'SELECT * FROM withdrawals WHERE user_email = ? ORDER BY created_at DESC',
            [req.user.email]
        );

        res.json({
            success: true,
            withdrawals: withdrawals.map(w => ({
                id: w.id,
                amount: parseFloat(w.amount),
                currency: w.currency,
                status: w.status,
                createdAt: w.created_at
            }))
        });
    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch withdrawals' });
    }
});

export default router;
