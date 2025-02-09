const logger = require("../utils/logger");

const parseOlx = async (page) => {
    logger.info("Start parse");

    const sectionExists = await page.$("div[data-testid='listing-grid']");
    if (!sectionExists) {
        logger.warn("Section not found");
        return [];
    }

    const results = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll("div[data-testid='l-card']");

        if (!elements) {
            console.warn("Section not found");
            return items;
        }

        elements.forEach(element => {
            const photo = element.querySelector("img")?.src || null;
            const name = element.querySelector("h4")?.textContent.trim() || null;
            const link = element.querySelector("a")?.href || null;
            const price = element.querySelector("p[data-testid='ad-price']")?.textContent.trim() || null;
            const time = element.querySelector("p[data-testid='location-date']")?.textContent.trim() || null;

            items.push({ photo, name, link, price, time });
        });

        return items;
    });

    logger.info("End parse");
    return results
};

module.exports = parseOlx;