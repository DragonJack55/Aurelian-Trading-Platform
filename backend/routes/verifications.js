import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Submit verification
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { fullName, idNumber, frontIdBase64, backIdBase64 } = req.body;

        await db.query(
            'INSERT INTO verifications (user_email, full_name, id_number, front_id_base64, back_id_base64, status) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.email, fullName, idNumber, frontIdBase64, backIdBase64, 'pending']
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Submit verification error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit verification' });
    }
});

// Get user verification status
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const [verifications] = await db.query(
            'SELECT * FROM verifications WHERE user_email = ? ORDER BY submitted_at DESC LIMIT 1',
            [req.user.email]
        );

        if (verifications.length === 0) {
            return res.json({ success: true, status: null });
        }

        res.json({
            success: true,
            verification: {
                status: verifications[0].status,
                submittedAt: verifications[0].submitted_at
            }
        });
    } catch (error) {
        console.error('Get verification error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch verification status' });
    }
});

export default router;
