import nodemailer from 'nodemailer';

/**
 * Email Service for sending OTP and notification emails
 */

// Create reusable transporter
const createTransporter = () => {
    // For development/testing, use a test account or Gmail
    // In production, you should use a proper email service like SendGrid, AWS SES, etc.

    const emailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    };

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('⚠️  Email credentials not configured. Emails will not be sent.');
        return { success: false, error: 'Email middleware not configured' };
    }

    return nodemailer.createTransporter(emailConfig);
};

/**
 * Send OTP email to user
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code to send
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendOTPEmail = async (email, otp) => {
    const transporter = createTransporter();

    if (!transporter) {
        return {
            success: false,
            error: 'Email service not configured'
        };
    }

    try {
        const mailOptions = {
            from: `"Aurelian TD Trade" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Verification Code - Aurelian TD Trade',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; letter-spacing: 8px; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Aurelian TD Trade</h1>
                            <p>Elite Trading Platform</p>
                        </div>
                        <div class="content">
                            <h2>Verify Your Email Address</h2>
                            <p>Thank you for registering with Aurelian TD Trade. Please use the following verification code to complete your registration:</p>
                            
                            <div class="otp-code">${otp}</div>
                            
                            <p><strong>This code will expire in 10 minutes.</strong></p>
                            
                            <p>If you didn't request this code, please ignore this email.</p>
                            
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Aurelian TD Trade. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Your Aurelian TD Trade verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
        };

        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Email sending error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send welcome email to new user
 * @param {string} email - Recipient email address
 * @param {string} fullName - User's full name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendWelcomeEmail = async (email, fullName) => {
    const transporter = createTransporter();

    if (!transporter) {
        return {
            success: false,
            error: 'Email service not configured'
        };
    }

    try {
        const mailOptions = {
            from: `"Aurelian TD Trade" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to Aurelian TD Trade',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to Aurelian TD Trade!</h1>
                        </div>
                        <div class="content">
                            <p>Dear ${fullName},</p>
                            <p>Welcome to the elite trading platform. Your account has been successfully verified and you can now start trading.</p>
                            <p>Get started by exploring our features and making your first trade.</p>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Aurelian TD Trade. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('Email sending error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export default {
    sendOTPEmail,
    sendWelcomeEmail
};
