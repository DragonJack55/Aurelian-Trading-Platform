import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

    try {
        console.log('Navigating to production...');
        await page.goto('https://aureliantdtrade.it.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('Page loaded title:', await page.title());

        // Check if "Login" button is visible (desktop nav)
        const loginBtn = await page.$('a[href="/login"]');
        if (loginBtn) {
            console.log('Login button found.');
        } else {
            console.log('Login button NOT found. Mobile view?');
        }

        // We can't easily test Verification without login.
        // But we can check if the main bundle crashed.

    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        await browser.close();
        process.exit(0);
    }
})();
