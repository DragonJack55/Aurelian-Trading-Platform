import puppeteer from 'puppeteer';

const BASE_URL = 'https://aurelian-td-trade.web.app';

async function runAdminTest() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log('[AdminTest] Starting Admin Login Verification...');

    try {
        // Go to Admin page
        await page.goto(`${BASE_URL}/admin`);

        // Wait for password input
        await page.waitForSelector('input[type="password"]', { timeout: 10000 });
        console.log('[AdminTest] Input found.');

        // Enter password
        await page.type('input[type="password"]', 'nkundakigali');

        // Click Login
        await page.click('button[type="submit"]'); // Changed from button[type="submit"] to generic button check if needed, but type=submit is standard
        console.log('[AdminTest] Login clicked.');

        // Wait for Dashboard (Success Indicator)
        // We look for "Pending Users" which indicates the dashboard loaded
        await page.waitForFunction(() => document.body.innerText.includes('Pending Users'), { timeout: 30000 });
        console.log('[AdminTest] SUCCESS: Admin Dashboard text "Pending Users" found.');

    } catch (error) {
        console.error('[AdminTest] FAILED:', error.message);
        // await page.screenshot({ path: 'tests/screenshots/admin_fail.png' });
        console.log('Page Content:', await page.content());
    } finally {
        await browser.close();
    }
}

runAdminTest();
