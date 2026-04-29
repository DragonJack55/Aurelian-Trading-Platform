/**
 * telegramService.js
 * Central service for sending Telegram notifications to the admin.
 * Uses VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID from .env
 */

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const ADMIN_URL = 'https://aureliantdtrade.it.com/admin';

/**
 * Base function — sends any message to the configured Telegram chat.
 * Silently fails so it never blocks the main user flow.
 */
const sendTelegramMessage = async (text) => {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('[Telegram] Bot token or chat ID not configured — skipping notification.');
        return;
    }

    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });
    } catch (err) {
        console.error('[Telegram] Failed to send notification:', err);
    }
};

/**
 * Notify admin when a new user registers.
 * @param {Object} userData - { fullName, email }
 */
export const notifyNewUserRegistered = async (userData) => {
    const { fullName, email } = userData;
    const text =
        `🟢 *New User Registered — Aurelian Trade*\n\n` +
        `👤 *Name:* ${fullName || 'Unknown'}\n` +
        `📧 *Email:* ${email}\n\n` +
        `[View in Admin Dashboard](${ADMIN_URL}#users)`;
    await sendTelegramMessage(text);
};

/**
 * Notify admin when a user submits KYC documents.
 * @param {Object} userData - { fullName, email, idNumber }
 */
export const notifyKYCSubmitted = async (userData) => {
    const { fullName, email, idNumber } = userData;
    const text =
        `📋 *New KYC Submission — Aurelian Trade*\n\n` +
        `👤 *Name:* ${fullName || 'Unknown'}\n` +
        `📧 *Email:* ${email}\n` +
        `🪪 *ID Number:* ${idNumber || 'Not provided'}\n\n` +
        `[Review in Admin Dashboard](${ADMIN_URL}#verifications)`;
    await sendTelegramMessage(text);
};
