const { getRequestsUnique } = require("../../scr/services/requestsService");
const link = require("../utils/generationLink");
const puppeteer = require("puppeteer");
const logger = require("../utils/logger");
const parserOtomoto = require("../parser/otomoto");
const parserOlx = require("../parser/olx");

const parseRelativeTime = (timeString) => {
    console.log(timeString);
    const now = new Date();

    if (timeString.includes("godzin temu" || timeString.includes("godziny temu"))) {
        const hoursAgo = parseInt(timeString.match(/\d+/)?.[0], 10);
        if (!isNaN(hoursAgo)) {
            now.setHours(now.getHours() - hoursAgo);
        }
    } else if (timeString.includes("minut temu") || timeString.includes("minuty temu")) {
        const minutesAgo = parseInt(timeString.match(/\d+/)?.[0], 10);
        if (!isNaN(minutesAgo)) {
            now.setMinutes(now.getMinutes() - minutesAgo);
        }
    }

    now.setMilliseconds(0);
    now.setSeconds(0);

    return now.toISOString();
};

const fetchHtml = async (url, typeParse) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'], headless: true });
    const page = await browser.newPage();

    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // await page.goto(url, { waitUntil: 'load' });

        let results;
        switch (typeParse) {
            case "otomoto":
                results = await parserOtomoto(page);
                break;
            case "olx":
                results = await parserOlx(page);
                break;
        }

        return results;
    } catch (err) {
        console.error("Error during page processing:", err);
        throw err;
    } finally {
        await browser.close();
    }
};

const scrapeCarse = async (filters = {}) => {
    const url = await link.otomoto(filters)

    try {
        // logger.info(`Scraping ${url}...`);
        let results = await Promise.all(
            // await fetchHtml(url, "otomoto"),
            await fetchHtml("https://www.olx.pl/motoryzacja/samochody/?search%5Border%5D=created_at:desc", "olx")
        );

        if (results.time) results.time = parseRelativeTime(results.time);

        return results[0];
    } catch (err) {
        throw err;
    }
};

const scrapeSchedule = async () => {
    let url = "https://www.otomoto.pl/osobowe/";

    try {
        let filters = await getRequestsUnique();
        // let results = [];

        if (filters.length > 0) {
            for (const element of filters) {
                const firstPartUrl = generationLink(element.attributes, url);
                const parseUrl = buildUrlWithFilters(firstPartUrl, element.attributes);
                logger.info(`Scraping ${parseUrl}...`);

                const parse = await fetchHtml(parseUrl);
                parse[0].time = parseRelativeTime(parse[0].time);
                const time = new Date(parse[0].time);

                if (time.getTime() !== element.lastPost.getTime())
                    element.parse = parse[0];
            }
        }

        return filters;
    } catch (err) {
        throw err;
    }
};

module.exports = { scrapeCarse, scrapeSchedule };