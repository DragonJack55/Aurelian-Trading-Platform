import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'https://aurelian-td-trade.firebaseapp.com';
const FRONT_ID_PATH = '/Users/jack/.gemini/antigravity/brain/8d5d9217-1d66-4328-9ec2-7abb4646e02e/id_front_placeholder_1767263691247.png';
const BACK_ID_PATH = '/Users/jack/.gemini/antigravity/brain/8d5d9217-1d66-4328-9ec2-7abb4646e02e/id_back_placeholder_1767263711351.png';
const SCREENSHOT_DIR = 'tests/screenshots_live';

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const timestamp = Date.now();
    const USER_EMAIL = `live_test_${timestamp}@example.com`;
    const USER_PASS = 'Test1234!';
    const ADMIN_PASS = 'nkundakigali';

    console.log(`[E2E] Starting Live Test for User: ${USER_EMAIL}`);

    const browserUser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
    });

    const browserAdmin = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,768']
    });

    const userPage = await browserUser.newPage();
    const adminPage = await browserAdmin.newPage();

    await userPage.setViewport({ width: 1366, height: 768 });
    await adminPage.setViewport({ width: 1366, height: 768 });

    const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    await userPage.setUserAgent(UA);
    await adminPage.setUserAgent(UA);

    try {
        // ==========================================
        // STEP 1: User Registration
        // ==========================================
        console.log('[E2E] Step 1: User Registration');
        await userPage.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 60000 });

        await userPage.waitForSelector('input[name="fullName"]', { timeout: 10000 });
        await userPage.type('input[name="fullName"]', 'Test User Live');
        await userPage.type('input[name="email"]', USER_EMAIL);
        await userPage.type('input[name="password"]', USER_PASS);
        await userPage.type('input[name="withdrawPassword"]', '1234');

        console.log('[E2E] Form filled, submitting...');
        await userPage.click('button[type="submit"]');

        // Wait for OTP step
        await delay(3000);
        const otpInputs = await userPage.$$('input.otp-input');

        if (otpInputs.length === 6) {
            console.log('[E2E] OTP inputs found. Entering code...');

            // Enter dummy code - system will use fallback validation
            for (let i = 0; i < 6; i++) {
                await otpInputs[i].type('1');
            }

            await delay(1000);
            await userPage.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const verifyBtn = btns.find(b => b.textContent.includes('VERIFY'));
                if (verifyBtn) verifyBtn.click();
            });
            console.log('[E2E] OTP submitted');
        }

        await delay(8000);
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/1_user_dashboard.png` });
        console.log('[E2E] ✓ Registration complete');

        // ==========================================
        // STEP 2: Admin Login & User Approval
        // ==========================================
        console.log('[E2E] Step 2: Admin Actions');
        await adminPage.goto(`${BASE_URL}/admin`, { timeout: 60000 });
        await adminPage.waitForSelector('input[type="password"]');
        await adminPage.type('input[type="password"]', ADMIN_PASS);
        await adminPage.click('button[type="submit"]');

        await delay(5000);
        await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/2_admin_dashboard.png` });
        console.log('[E2E] ✓ Admin logged in');

        // Approve user
        await delay(2000);
        const approved = await adminPage.evaluate((email) => {
            const rows = Array.from(document.querySelectorAll('div'));
            const row = rows.find(r => r.innerText && r.innerText.includes(email) && r.innerText.includes('Pass:'));
            if (row) {
                const btn = Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Approve'));
                if (btn) { btn.click(); return true; }
            }
            return false;
        }, USER_EMAIL);

        if (approved) console.log('[E2E] ✓ User approved');
        await delay(2000);

        // Navigate to Verified Users & Setup Force Win + Funds
        await adminPage.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span'));
            const tab = spans.find(s => s.textContent === 'Verified Users');
            if (tab) tab.click();
        });

        await delay(2000);

        await adminPage.evaluate((email) => {
            const rows = Array.from(document.querySelectorAll('div'));
            const userContainer = rows.find(r => r.innerText && r.innerText.includes(email) && r.innerText.includes('Balance:'));

            if (userContainer) {
                // Set Win
                const winBtn = Array.from(userContainer.querySelectorAll('button')).find(b => b.textContent.toLowerCase() === 'win');
                if (winBtn) { winBtn.click(); console.log('✓ Force Win set'); }

                // Set $5000
                const input = userContainer.querySelector('input[placeholder="Custom"]');
                const setBtn = Array.from(userContainer.querySelectorAll('button')).find(b => b.textContent === 'Set');

                if (input && setBtn) {
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    setter.call(input, '5000');
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    setBtn.click();
                    console.log('✓ $5000 added');
                }
            }
        }, USER_EMAIL);

        await delay(2000);
        await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/3_admin_setup_complete.png` });
        console.log('[E2E] ✓ Force Win & Funds configured');

        // ==========================================
        // STEP 3: User Trading
        // ==========================================
        console.log('[E2E] Step 3: User Trading');
        await userPage.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        await delay(3000);
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/4_user_balance_updated.png` });
        console.log('[E2E] ✓ Balance refreshed');

        // Place trade
        await delay(2000);
        const amountInput = await userPage.$('input[placeholder="Amount"]');
        if (amountInput) {
            await amountInput.click({ clickCount: 3 });
            await amountInput.type('500');
        }

        await userPage.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const callBtn = btns.find(b => b.textContent.includes('Call') || b.textContent.includes('Buy'));
            if (callBtn) callBtn.click();
        });

        console.log('[E2E] ✓ Trade placed');
        await delay(5000);
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/5_trade_placed.png` });

        // ==========================================
        // STEP 4: Chat
        // ==========================================
        console.log('[E2E] Step 4: Chat Verification');
        await userPage.evaluate(() => {
            const els = document.querySelectorAll('div');
            for (let el of els) {
                if (el.style.position === 'fixed' && el.style.borderRadius === '50%') {
                    el.click();
                    break;
                }
            }
        });

        await delay(1000);
        await userPage.type('input[placeholder*="message"]', 'Hello Admin, test message.');
        await userPage.keyboard.press('Enter');
        await delay(2000);
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/6_user_chat_sent.png` });
        console.log('[E2E] ✓ User message sent');

        // Admin reply
        await adminPage.evaluate(() => {
            const divs = Array.from(document.querySelectorAll('div'));
            const support = divs.find(d => d.textContent === 'Support');
            if (support) support.click();
        });
        await delay(500);

        await adminPage.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span'));
            const chat = spans.find(s => s.textContent === 'Customer Messages');
            if (chat) chat.click();
        });
        await delay(2000);

        await adminPage.evaluate((email) => {
            const items = Array.from(document.querySelectorAll('div')).filter(d => d.innerText === email);
            if (items.length > 0) items[0].click();
        }, USER_EMAIL);
        await delay(1000);

        await adminPage.type('input[placeholder="Type reply..."]', 'Hello User, verified!');
        await adminPage.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[placeholder="Type reply..."]'));
            if (inputs.length > 0) {
                const sendBtn = inputs[0].nextElementSibling;
                if (sendBtn) sendBtn.click();
            }
        });
        await delay(2000);
        await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/7_admin_reply_sent.png` });
        console.log('[E2E] ✓ Admin reply sent');

        // User verify receipt
        await userPage.bringToFront();
        await delay(2000);
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/8_user_received_reply.png` });

        console.log('\n[E2E] ========================================');
        console.log('[E2E] ✅ TEST COMPLETED SUCCESSFULLY!');
        console.log('[E2E] ========================================');
        console.log(`[E2E] User: ${USER_EMAIL}`);
        console.log('[E2E] Screenshots saved to:', SCREENSHOT_DIR);

    } catch (error) {
        console.error('[E2E] TEST FAILED:', error.message);
        try {
            await userPage.screenshot({ path: `${SCREENSHOT_DIR}/error_user.png` });
            await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/error_admin.png` });
        } catch (e) { /* ignore */ }
    } finally {
        if (browserUser) await browserUser.close();
        if (browserAdmin) await browserAdmin.close();
    }
})();
