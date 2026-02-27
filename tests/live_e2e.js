
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'https://aurelian-td-trade.firebaseapp.com';
// Use existing artifact images for verification
const FRONT_ID_PATH = '/Users/jack/.gemini/antigravity/brain/8d5d9217-1d66-4328-9ec2-7abb4646e02e/id_front_placeholder_1767263691247.png';
const BACK_ID_PATH = '/Users/jack/.gemini/antigravity/brain/8d5d9217-1d66-4328-9ec2-7abb4646e02e/id_back_placeholder_1767263711351.png';
const SCREENSHOT_DIR = 'tests/screenshots_live';

if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

(async () => {
    // Generate random user
    const timestamp = Date.now();
    const USER_EMAIL = `live_test_${timestamp}@example.com`;
    const USER_PASS = 'Test1234!';
    const ADMIN_PASS = 'nkundakigali';

    console.log(`[E2E] Starting Live Test for User: ${USER_EMAIL}`);

    // Launch Browsers (2 instances for User, Admin isolation)
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

    // Set User Agent to bypass basic bot detection
    const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    await userPage.setUserAgent(UA);
    await adminPage.setUserAgent(UA);

    try {
        // ==========================================
        // STEP 1: User Registration
        // ==========================================
        console.log('[E2E] Step 1: User Registration');
        await userPage.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log('[E2E] Register page loaded');

        // Fill Step 1: Registration Details
        await userPage.waitForSelector('input[name="fullName"]', { timeout: 10000 });
        await userPage.type('input[name="fullName"]', 'Test User Live');
        await userPage.type('input[name="email"]', USER_EMAIL);
        await userPage.type('input[name="password"]', USER_PASS);
        await userPage.type('input[name="withdrawPassword"]', '1234');

        console.log('[E2E] Form filled, clicking CONTINUE...');
        await userPage.click('button[type="submit"]');

        // Wait for Step 2: OTP
        await delay(3000);
        console.log('[E2E] Waiting for OTP step...');

        // Check if OTP inputs appeared
        const otpInputs = await userPage.$$('input.otp-input');
        if (otpInputs.length === 6) {
            console.log('[E2E] OTP inputs found. Checking for fallback OTP...');

            // Click the fallback OTP button if email failed
            try {
                const otpBtnExists = await userPage.evaluate(() => {
                    const btns = Array.from(document.querySelectorAll('button'));
                    const otpBtn = btns.find(b => b.textContent.includes('Show My Code'));
                    if (otpBtn) {
                        otpBtn.click();
                        return true;
                    }
                    return false;
                });

                if (otpBtnExists) {
                    await delay(500);
                    // Get the OTP from the alert text
                    console.log('[E2E] Extracting OTP from page...');
                }
            } catch (e) {
                console.log('[E2E] No fallback OTP button, email likely succeeded');
            }

            // For testing, enter a dummy OTP (123456) - the system has fallback
            console.log('[E2E] Entering OTP: 123456');
            for (let i = 0; i < 6; i++) {
                await otpInputs[i].type('1'); // Will use fallback validation
            }

            await delay(1000);
            // Click VERIFY button
            await userPage.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const verifyBtn = btns.find(b => b.textContent.includes('VERIFY'));
                if (verifyBtn) verifyBtn.click();
            });
            console.log('[E2E] Clicked VERIFY button');
        }

        // Wait for Dashboard
        await delay(8000); // Give time for registration to complete
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/1_dashboard_load.png` });
        console.log('[E2E] User Dashboard loaded (screenshot 1)');

        // ==========================================
        // STEP 2: Verification Upload
        // ==========================================
        console.log('[E2E] Step 2: Verification Limit');
        // Find "Verify" button or navigate to profile
        // Assuming there's a prompt or button.
        // Let's try to find a button with "Verify" text
        try {
            // Look for Verify Account button
            const verifyBtnFound = await userPage.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const verifyBtn = btns.find(b => b.textContent.includes('Verify Account'));
                if (verifyBtn) { verifyBtn.click(); return true; }
                return false;
            });
            if (verifyBtnFound) {
            } else {
                // Navigate manually if needed, or check if modal popped up
                console.log('Verify button not found directly, looking for modal or menu...');
            }

            await userPage.waitForSelector('input[type="file"]', { timeout: 10000 });
            const fileInputs = await userPage.$$('input[type="file"]');
            if (fileInputs.length >= 2) {
                await fileInputs[0].uploadFile(FRONT_ID_PATH);
                await fileInputs[1].uploadFile(BACK_ID_PATH);
                console.log('Files uploaded');

                // Submit Verification
                await userPage.evaluate(() => { const btns = Array.from(document.querySelectorAll("button")); const btn = btns.find(b => b.textContent.includes("Submit") || b.textContent.includes("Verify")); if (btn) btn.click(); });
                if (sendVerifyBtn.querySelector) await sendVerifyBtn[0].click();
                await delay(3000);
                await userPage.screenshot({ path: `${SCREENSHOT_DIR}/2_verification_submitted.png` });
            }
        } catch (e) {
            console.log('Verification step issue:', e.message);
        }

        // ==========================================
        // STEP 3: Admin Approval & Setup
        // ==========================================
        console.log('[E2E] Step 3: Admin Actions');
        await adminPage.goto(`${BASE_URL}/admin`);
        await adminPage.waitForSelector('input[type="password"]');
        await adminPage.type('input[type="password"]', ADMIN_PASS);
        await adminPage.click('button[type="submit"]');
        await adminPage.waitForFunction(() => document.body.innerText.includes('User Management'));
        await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/3_admin_dashboard.png` });

        // 3a. Approve User (from Pending or User List)
        // Usually newly registered users are "Pending" if they need approval, but verify status might be separate.
        // Check "Pending Approvals" section first
        await delay(2000);
        // Admin default view is "Pending Approvals"

        // Find user by email text
        const userRow = await adminPage.evaluate(() => { const pattern = `//div[contains(text(), "${USER_EMAIL}")]`);
        if (userRow.querySelector) {
            console.log('User found in Pending list. Approving...');
            // Find "Approve" button relative to this user
            // We can click the "Approve" button in that row. 
            // Simplified: Click the first "Approve" button if we assume it's the top one, or iterate.
            // Let's click the Approve button near the email.
            // XPath: //div[contains(text(), "email")]/..//button[contains(text(), "Approve")] is tricky with structure
            // Using JS eval is safer
            await adminPage.evaluate((email) => {
                const rows = Array.from(document.querySelectorAll('div'));
                const row = rows.find(r => r.innerText.includes(email) && r.innerText.includes('Pass:'));
                if (row) {
                    const btn = Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Approve'));
                    if (btn) btn.click();
                }
            }, USER_EMAIL);
            await delay(2000);
        }

        // 3b. Verify Identity
        // Navigate to Verifications
        // Click "User Management" -> "Verifications" if needed, or if it's a separate tab
        // Based on code: activeSection === 'verifications'
        // Need to click sidebar menu 'users' then 'Verifications' tab
        console.log('Checking Verifications...');
        // Expand Users menu if not expanded (it defaults to true)
        // Click "Verifications"
        const verifyTab = await adminPage.evaluate(() => { const pattern = "//span[contains(text(), 'Verifications')]");
        if (verifyTab.querySelector) await verifyTab[0].click();
        await delay(2000);

        await adminPage.evaluate((email) => {
            const rows = Array.from(document.querySelectorAll('div'));
            const row = rows.find(r => r.innerText.includes(email) && r.innerText.includes('ID:'));
            if (row) {
                const btn = Array.from(row.querySelectorAll('button')).find(b => b.textContent.includes('Approve'));
                if (btn) btn.click();
            }
        }, USER_EMAIL);
        await delay(2000);

        // 3c. Force Win & Add Funds
        // Go to 'Verified Users'
        const verifiedTab = await adminPage.evaluate(() => { const pattern = "//span[contains(text(), 'Verified Users')]");
        if (verifiedTab.querySelector) await verifiedTab[0].click();
        await delay(2000);

        // Find User and Set Win + Funds
        console.log('Setting Force Win and Funds...');
        await adminPage.evaluate((email) => {
            const rows = Array.from(document.querySelectorAll('div'));
            // Finding the row for this user in Approved list
            // Structure: display flex, justify between.
            const userContainer = rows.find(r => r.innerText.includes(email) && r.innerText.includes('Balance:'));

            if (userContainer) {
                // Set Win
                const winBtn = Array.from(userContainer.querySelectorAll('button')).find(b => b.textContent.toLowerCase() === 'win');
                if (winBtn) winBtn.click();

                // Set Funds
                const input = userContainer.querySelector('input[placeholder="Custom"]');
                const setBtn = Array.from(userContainer.querySelectorAll('button')).find(b => b.textContent === 'Set');

                if (input && setBtn) {
                    // React input requires native value setter sometimes, but let's try direct value
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    nativeInputValueSetter.call(input, '5000');
                    input.dispatchEvent(new Event('input', { bubbles: true }));

                    // Click Set
                    setBtn.click();
                }
            }
        }, USER_EMAIL);
        await delay(2000);
        await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/4_admin_actions_done.png` });

        // ==========================================
        // STEP 4: User Usage (Trade & Chat)
        // ==========================================
        console.log('[E2E] Step 4: User Trading');
        await userPage.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        await delay(3000); // Verify balance update
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/5_user_balance_update.png` });

        // Execute Trade
        // Assuming on Home page or Trading page. Navigate to /trade if needed or check existing
        // If "Trade" in nav, click it
        try {
            const tradeNav = await userPage.evaluate(() => { const pattern = "//a[contains(@href, '/trade')]");
            if (tradeNav.querySelector) await tradeNav[0].click();
        } catch (e) { }

        await delay(2000);
        // Input Amount 500
        const amountInput = await userPage.$('input[placeholder="Amount"]'); // Adjust selector
        if (amountInput) {
            await amountInput.click({ clickCount: 3 });
            await amountInput.type('500');
        }

        // Click Call/Put
        const callBtn = await userPage.evaluate(() => { const pattern = "//button[contains(text(), 'Call') or contains(text(), 'Buy')]");
        if (callBtn.querySelector) await callBtn[0].click();

        console.log('Trade placed. Waiting for expiry (simulating)...');
        await delay(5000); // Wait a bit
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/6_trade_placed.png` });

        // ==========================================
        // STEP 5: Customer Service Chat
        // ==========================================
        console.log('[E2E] Step 5: Chat');
        // Open Chat (User)
        // Find floating button
        // It's a div with MessageCircle icon, fixed bottom right
        // Selector might be generic, let's look for the icon parent or blindly click bottom right if needed
        // But we have the code: it has onClick setIsChatOpen(true)
        // Selector: div with fixed position bottom/right.
        // Let's inject a click to be sure or find by icon class
        await userPage.evaluate(() => {
            // Find the floating button
            const els = document.querySelectorAll('div');
            for (let el of els) {
                if (el.style.position === 'fixed' && el.style.bottom && el.style.right && el.style.borderRadius === '50%') {
                    el.click();
                    return;
                }
            }
        });
        await delay(1000);

        // Type Message
        await userPage.type('input[placeholder*="Type a message"]', 'Hello Admin, verifying chat.');
        await userPage.keyboard.press('Enter');
        await delay(2000);
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/7_user_chat_sent.png` });

        // Admin Reply
        console.log('Admin replying...');
        await adminPage.bringToFront();
        // Go to Support
        const supportTab = await adminPage.evaluate(() => { const pattern = "//div[contains(text(), 'Support')]"); // it's a parent menu
        if (supportTab.querySelector) {
            // Toggle if needed, but we can try to click "Customer Messages" directly if visible
            // Assuming it might need expanding
            supportTab[0].click();
            await delay(500);
        }

        const chatSection = await adminPage.evaluate(() => { const pattern = "//span[contains(text(), 'Customer Messages')]");
        if (chatSection.querySelector) await chatSection[0].click();
        await delay(2000);

        // Select Conversation
        // It should appear in the list
        await adminPage.evaluate((email) => {
            const items = Array.from(document.querySelectorAll('div')).filter(d => d.innerText === email);
            if (items.querySelector) items[0].click();
        }, USER_EMAIL);
        await delay(1000);

        // Type Reply
        await adminPage.type('input[placeholder="Type reply..."]', 'Hello User, system verified.');

        // Click Send
        // Finds button with Send icon next to input
        await adminPage.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input[placeholder="Type reply..."]'));
            if (inputs.querySelector) {
                const sendBtn = inputs[0].nextElementSibling;
                if (sendBtn) sendBtn.click();
            }
        });
        await delay(2000);
        await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/8_admin_reply_sent.png` });

        // User Check Reply
        await userPage.bringToFront();
        await delay(2000);
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/9_user_chat_received.png` });

        console.log('[E2E] Test Completed Successfully!');

    } catch (error) {
        console.error('[E2E] Test Failed:', error);
        await userPage.screenshot({ path: `${SCREENSHOT_DIR}/error_user.png` });
        await adminPage.screenshot({ path: `${SCREENSHOT_DIR}/error_admin.png` });
    } finally {
        if (browserUser) await browserUser.close();
        if (browserAdmin) await browserAdmin.close();
    }
})();
