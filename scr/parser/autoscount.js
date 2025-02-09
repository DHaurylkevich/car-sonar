const logger = require("../utils/logger");

const parseAutoscount = async (page) => {
    logger.info("Start parse");

    const sectionExists = await page.$(".ListPage_main___0g2X");
    if (!sectionExists) {
        logger.warn("Section not found");
        return [];
    }

    const results = await page.evaluate(() => {
        const items = [];
        const elements = document.querySelectorAll("article.cldt-summary-full-item");

        if (!elements) {
            console.warn("Section not found");
            return items;
        }

        elements.forEach(element => {
            const photoElement = element.querySelector("img");
            const photo = photoElement?.getAttribute('src') || photoElement?.src || null;
            const name = element.querySelector("div.ListItem_header__J6xlG h2")?.textContent.trim() || null;
            const link = element.querySelector("div.ListItem_header__J6xlG a")?.href || null;
            const price = element.querySelector("p[data-testid='regular-price']")?.textContent.trim() || null;
            const time = element.querySelector("span[data-testid='VehicleDetails-calendar']")?.textContent.trim() || null;

            items.push({ photo, name, link, price, time });
        });

        return items;
    });

    logger.info("End parse");
    return results
};

module.exports = parseAutoscount;