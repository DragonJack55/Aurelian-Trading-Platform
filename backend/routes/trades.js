import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Create trade
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { symbol, amount, direction, duration } = req.body;
        const expiresAt = new Date(Date.now() + (duration || 60) * 1000);

        const [result] = await db.query(
            'INSERT INTO trades (user_email, symbol, amount, direction, duration, expires_at, result) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.email, symbol, amount, direction, duration || 60, expiresAt, 'pending']
        );

        // Deduct amount from user balance
        await db.query(
            'UPDATE users SET points = points - ? WHERE email = ?',
            [amount, req.user.email]
        );

        res.json({
            success: true,
            trade: {
                id: result.insertId,
                symbol,
                amount,
                direction,
                expiresAt
            }
        });
    } catch (error) {
        console.error('Create trade error:', error);
        res.status(500).json({ success: false, error: 'Failed to create trade' });
    }
});

// Get user trades
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [trades] = await db.query(
            'SELECT * FROM trades WHERE user_email = ? ORDER BY created_at DESC',
            [req.user.email]
        );

        res.json({
            success: true,
            trades: trades.map(t => ({
                id: t.id,
                symbol: t.symbol,
                amount: parseFloat(t.amount),
                direction: t.direction,
                result: t.result,
                profitLoss: parseFloat(t.profit_loss),
                createdAt: t.created_at,
                expiresAt: t.expires_at
            }))
        });
    } catch (error) {
        console.error('Get trades error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch trades' });
    }
});

// Settle trade (called by cron or manually)
router.post('/:id/settle', async (req, res) => {
    try {
        const { id } = req.params;
        const [trades] = await db.query('SELECT * FROM trades WHERE id = ?', [id]);

        if (trades.length === 0) {
            return res.status(404).json({ success: false, error: 'Trade not found' });
        }

        const trade = trades[0];

        // Check user's forced result setting
        const [users] = await db.query('SELECT trade_result FROM users WHERE email = ?', [trade.user_email]);
        const forcedResult = users[0].trade_result;

        let result = 'lose'; // Default
        let profitLoss = -trade.amount;

        if (forcedResult === 'win') {
            result = 'win';
            profitLoss = trade.amount * 0.85; // 85% profit
        } else if (forcedResult === 'lose') {
            result = 'lose';
            profitLoss = -trade.amount;
        } else {
            // Random 50/50 if not forced
            const random = Math.random();
            if (random > 0.5) {
                result = 'win';
                profitLoss = trade.amount * 0.85;
            }
        }

        // Update trade
        await db.query(
            'UPDATE trades SET result = ?, profit_loss = ?, settled_at = NOW() WHERE id = ?',
            [result, profitLoss, id]
        );

        // Update user balance if win
        if (result === 'win') {
            await db.query(
                'UPDATE users SET points = points + ? WHERE email = ?',
                [trade.amount + profitLoss, trade.user_email]
            );
        }

        res.json({ success: true, result, profitLoss });
    } catch (error) {
        console.error('Settle trade error:', error);
        res.status(500).json({ success: false, error: 'Failed to settle trade' });
    }
});

export default router;
