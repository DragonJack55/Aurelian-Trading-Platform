import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import { sendOTPEmail } from '../utils/emailService.js';

const router = express.Router();

// Register
router.post('/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('fullName').trim().notEmpty(),
        body('withdrawPassword').notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { email, password, fullName, withdrawPassword } = req.body;

            // Check if user exists
            const [existing] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, error: 'Email already registered' });
            }

            // Hash passwords
            const passwordHash = await bcrypt.hash(password, 10);
            const withdrawHash = await bcrypt.hash(withdrawPassword, 10);

            // Insert user
            await db.query(
                'INSERT INTO users (email, password_hash, full_name, withdraw_password, status, verification_status) VALUES (?, ?, ?, ?, ?, ?)',
                [email, passwordHash, fullName, withdrawHash, 'approved', 'pending']
            );

            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await db.query(
                'INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)',
                [email, otp, expiresAt]
            );

            // Try to send OTP via email
            const emailResult = await sendOTPEmail(email, otp);

            if (emailResult.success) {
                // Email sent successfully via backend
                res.json({
                    success: true,
                    message: 'OTP sent to your email',
                    code: otp // Always return code for frontend fallback/redundancy
                });
            } else {
                // Email failed - return code in response as fallback
                console.warn(`Email delivery failed for ${email}:`, emailResult.error);
                res.json({
                    success: true,
                    message: 'Email delivery timeout. Please use the code displayed on screen.',
                    code: otp // Fallback: return code in response
                });
            }

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, error: 'Registration failed' });
        }
    }
);

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;

        const [otps] = await db.query(
            'SELECT * FROM otp_codes WHERE email = ? AND code = ? AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, code]
        );

        if (otps.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        await db.query('UPDATE otp_codes SET used = TRUE WHERE id = ?', [otps[0].id]);

        res.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Create new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save to DB
        await db.query(
            'INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        // Send email
        const emailResult = await sendOTPEmail(email, otp);

        if (emailResult.success) {
            res.json({
                success: true,
                message: 'New code sent to your email',
                code: otp
            });
        } else {
            console.warn(`Resend email failed for ${email}:`, emailResult.error);
            // Fallback
            res.json({
                success: true, // Treat as success so frontend moves on/uses fallback
                message: 'Email delivery timeout. Please use the code displayed.',
                code: otp
            });
        }

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, error: 'Failed to resend code' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if it's admin login
        if (email === 'admin@aureliantrade.com' || !email) {
            // Admin login with password only
            const adminPassword = password || req.body.password;

            const [users] = await db.query('SELECT * FROM users WHERE email = ?', ['admin@aureliantrade.com']);

            if (users.length === 0 || !(await bcrypt.compare(adminPassword, users[0].password_hash))) {
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { email: users[0].email, id: users[0].id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                token,
                user: {
                    email: users[0].email,
                    fullName: users[0].full_name,
                    points: parseFloat(users[0].points),
                    status: users[0].status
                }
            });
        }

        // Regular user login
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const user = users[0];

        if (!(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { email: user.email, id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                email: user.email,
                fullName: user.full_name,
                username: user.username,
                points: parseFloat(user.points),
                status: user.status,
                verificationStatus: user.verification_status
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

export default router;
