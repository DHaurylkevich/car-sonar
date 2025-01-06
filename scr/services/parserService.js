const { getRequestsUnique } = require("../../scr/services/requestsService");
const puppeteer = require("puppeteer");
const logger = require("../utils/logger");

const generationLink = (filters, url) => {
    const pathParts = [];
    if (filters.brand) pathParts.push(filters.brand.join('--'));
    // if (filters.model) pathParts.push(filters.model);
    if (filters.generation) pathParts.push(filters.generation.join('--'));
    if (filters.startYear) pathParts.push(`od-${filters.startYear}`);
    if (filters.city) pathParts.push(filters.city);
    console.log(pathParts);
    return url + pathParts.join("/");
};

const buildUrlWithFilters = (baseUrl, filters) => {
    const params = [];

    if (filters.fuelType && Array.isArray(filters.fuelType)) {
        filters.fuelType.forEach((type) =>
            params.push(`search%5Bfilter_enum_fuel_type%5D%5B%5D=${encodeURIComponent(type)}`)
        );
    }

    if (filters.mileageFrom) {
        params.push(`search%5Bfilter_float_mileage%3Afrom%5D=${encodeURIComponent(filters.mileageFrom)}`);
    }
    if (filters.mileageTo) {
        params.push(`search%5Bfilter_float_mileage%3Ato%5D=${encodeURIComponent(filters.mileageTo)}`);
    }
    if (filters.priceFrom) {
        params.push(`search%5Bfilter_float_price%3Afrom%5D=${encodeURIComponent(filters.priceFrom)}`);
    }
    if (filters.priceTo) {
        params.push(`search%5Bfilter_float_price%3Ato%5D=${encodeURIComponent(filters.priceTo)}`);
    }
    if (filters.yearTo) {
        params.push(`search%5Bfilter_float_year%3Ato%5D=${encodeURIComponent(filters.yearTo)}`);
    }

    return params.length > 0 ? baseUrl + "?" + params.join("&") : baseUrl;
};

const fetchHtml = async (url) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
    });
    const page = await browser.newPage();
    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // await page.goto(url, { waitUntil: 'networkidle2' });

        const results = await parseHtml(page);
        return results;
    } catch (err) {
        console.error("Error during page processing:", err);
        throw err;
    } finally {
        await browser.close();
    }
};

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

const parseHtml = async (page) => {
    logger.info("Start parse");

    const sectionExists = await page.$("div.ooa-r53y0q.e1hsss911");
    if (!sectionExists) {
        logger.warn("Section not found");
        return [];
    }

    const results = await page.evaluate(() => {
        const items = [];
        const element = document.querySelector("div.ooa-r53y0q.e1hsss911 section");

        const photo = element.querySelector("img")?.src || null;
        const name = element.querySelector("h2.e1n1d04s0.ooa-1kyyooz.er34gjf0")?.textContent.trim() || null;
        const link = element.querySelector("a")?.href || null;
        const price = element.querySelector("h3")?.textContent.trim() || null;

        const dl = element.querySelector('dl.ooa-1o0axny');
        let time = dl?.querySelector("dd:nth-child(2) p")?.textContent.trim() || null;

        items.push({ photo, name, link, price, time });

        return items;
    });

    logger.info("End parse");
    return results;
};

const scrapeCarse = async (filters = {}) => {
    let url = "https://www.otomoto.pl/osobowe/";

    if (filters) {
        url = generationLink(filters, url);
        url = buildUrlWithFilters(url, filters);
    }

    try {
        logger.info(`Scraping ${url}...`);
        let results = await fetchHtml(url);
        console.log(results)

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