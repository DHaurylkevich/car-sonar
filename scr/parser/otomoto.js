const logger = require("../utils/logger");


const parseOtomoto = async (page) => {
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

module.exports = parseOtomoto;