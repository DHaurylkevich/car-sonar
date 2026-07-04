import puppeteer from "puppeteer";

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let browser = null;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        });
    }
    return browser;
}

export async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}

export async function fetchPageWithBrowser(url) {
    const page = await (await getBrowser()).newPage();
    try {
        await page.setUserAgent(USER_AGENT);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        return await page.content();
    } finally {
        await page.close();
    }
}
