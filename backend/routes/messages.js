import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Send message
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { message, sender } = req.body;

        await db.query(
            'INSERT INTO messages (user_email, user_name, sender, message) VALUES (?, ?, ?, ?)',
            [req.user.email, req.user.fullName || req.user.email, sender || 'user', message]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

// Get messages
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [messages] = await db.query(
            'SELECT * FROM messages WHERE user_email = ? ORDER BY created_at ASC',
            [req.user.email]
        );

        res.json({
            success: true,
            messages: messages.map(m => ({
                id: m.id,
                sender: m.sender,
                message: m.message,
                read: m.is_read,
                createdAt: { seconds: Math.floor(new Date(m.created_at).getTime() / 1000) }
            }))
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});

// Mark as read
router.patch('/read', authenticateToken, async (req, res) => {
    try {
        await db.query(
            'UPDATE messages SET is_read = TRUE WHERE user_email = ? AND sender = ?',
            [req.user.email, 'admin']
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
    }
});

export default router;
