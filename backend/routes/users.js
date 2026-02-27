import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [req.user.email]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = users[0];
        res.json({
            success: true,
            user: {
                email: user.email,
                fullName: user.full_name,
                username: user.username,
                points: parseFloat(user.points),
                status: user.status,
                verificationStatus: user.verification_status,
                tradeResult: user.trade_result
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

// Update user balance
router.patch('/balance', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;

        await db.query(
            'UPDATE users SET points = points + ? WHERE email = ?',
            [amount, req.user.email]
        );

        const [users] = await db.query('SELECT points FROM users WHERE email = ?', [req.user.email]);

        res.json({
            success: true,
            newBalance: parseFloat(users[0].points)
        });
    } catch (error) {
        console.error('Update balance error:', error);
        res.status(500).json({ success: false, error: 'Failed to update balance' });
    }
});

export default router;
