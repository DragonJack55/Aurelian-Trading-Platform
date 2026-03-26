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
                btcBalance: parseFloat(user.btc_balance || 0),
                ethBalance: parseFloat(user.eth_balance || 0),
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

// Exchange assets
router.post('/exchange', authenticateToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { fromCurrency, toCurrency, amount } = req.body;
        
        if (!['USD', 'USDT', 'BTC', 'ETH'].includes(fromCurrency) || !['USD', 'USDT', 'BTC', 'ETH'].includes(toCurrency)) {
            return res.status(400).json({ success: false, error: 'Invalid currency' });
        }
        
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid amount' });
        }

        // 1. Fetch live rates
        let btcPrice = 65000;
        let ethPrice = 3500;
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
            const data = await response.json();
            if (data?.bitcoin?.usd) btcPrice = data.bitcoin.usd;
            if (data?.ethereum?.usd) ethPrice = data.ethereum.usd;
        } catch (err) {
            console.error('Failed to fetch live rates for exchange, using fallbacks.', err.message);
        }

        const getRateInUSD = (currency) => {
            if (currency === 'USD' || currency === 'USDT') return 1;
            if (currency === 'BTC') return btcPrice;
            if (currency === 'ETH') return ethPrice;
            return 1;
        };

        const fromRate = getRateInUSD(fromCurrency);
        const toRate = getRateInUSD(toCurrency);
        const convertedAmount = (parsedAmount * fromRate) / toRate;

        // 2. Start Transaction
        await connection.beginTransaction();

        // 3. Lock user row and check balance
        const [users] = await connection.query('SELECT points, btc_balance, eth_balance FROM users WHERE email = ? FOR UPDATE', [req.user.email]);
        if (users.length === 0) throw new Error('User not found');
        const user = users[0];

        const getColumnName = (currency) => {
            if (currency === 'USD' || currency === 'USDT') return 'points';
            if (currency === 'BTC') return 'btc_balance';
            if (currency === 'ETH') return 'eth_balance';
        };

        const fromColumn = getColumnName(fromCurrency);
        const toColumn = getColumnName(toCurrency);

        if (parseFloat(user[fromColumn]) < parsedAmount) {
            await connection.rollback();
            return res.status(400).json({ success: false, error: `Insufficient ${fromCurrency} balance` });
        }

        // 4. Execute deduction and addition
        await connection.query(
            `UPDATE users SET ${fromColumn} = ${fromColumn} - ? WHERE email = ?`,
            [parsedAmount, req.user.email]
        );
        
        await connection.query(
            `UPDATE users SET ${toColumn} = ${toColumn} + ? WHERE email = ?`,
            [convertedAmount, req.user.email]
        );

        await connection.commit();

        res.json({
            success: true,
            message: `Successfully exchanged ${parsedAmount} ${fromCurrency} for ${convertedAmount.toFixed(6)} ${toCurrency}`,
            convertedAmount,
            balances: {
                [fromCurrency]: parseFloat(user[fromColumn]) - parsedAmount,
                [toCurrency]: parseFloat(user[toColumn]) + convertedAmount
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Exchange error:', error);
        res.status(500).json({ success: false, error: 'Exchange failed' });
    } finally {
        connection.release();
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
