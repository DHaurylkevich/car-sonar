const logger = require("../utils/logger");

const parseOtomoto = async (page) => {
    logger.info("Start parse");

    const sectionExists = await page.$("div[data-testid='search-results']");
    if (!sectionExists) {
        logger.warn("Section not found");
        return [];
    }

    const results = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll("div>article section.ooa-ljs66p.e8fzddy0");

        if (!elements) {
            console.warn("Section not found");
            return items;
        }

        elements.forEach(element => {
            const photo = element.querySelector("img")?.src || null;
            const name = element.querySelector("h2")?.textContent.trim() || null;
            const link = element.querySelector("a")?.href || null;
            const price = element.querySelector("h3")?.textContent.trim() || null;
            const time = dl?.querySelector("dd:nth-child(2) p")?.textContent.trim() || null;

            const dl = element.querySelector('dl.ooa-1o0axny');

            items.push({ photo, name, link, price, time });
        });

        return items;
    });

    logger.info("End parse");
    return results;
};

module.exports = parseOtomoto;