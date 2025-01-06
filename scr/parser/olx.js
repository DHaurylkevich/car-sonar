const logger = require("../utils/logger");


// querySelectorAll
// const element = document.querySelector(".css-qfzx1y");
const parseOlx = async (page) => {
    logger.info("Start parse");

    const sectionExists = await page.$(".css-qfzx1y");
    if (!sectionExists) {
        logger.warn("Section not found");
        return [];
    }

    const result = await page.evaluate(() => {
        const sponsoredAd = document.querySelector("div#div-gpt-ad-listing-sponsored-ad");
        if (!sponsoredAd) {
            console.warn("Sponsored ad not found");
            return [];
        }
        const section = sponsoredAd.nextElementSibling;
        if (!section) {
            console.warn("No element found after sponsored ad");
            return null;
        }

        const photo = section.querySelector("img")?.src || null;
        const name = section.querySelector("h4")?.textContent.trim() || null;
        const link = section.querySelector("a")?.href || null;
        const price = section.querySelector("p[data-testid='ad-price']")?.textContent.trim() || null;
        const time = section.querySelector("p[data-testid='location-date']")?.textContent.trim() || null;

        return { photo, name, link, price, time };
    });

    if (!result) {
        logger.warn("No elements found in section");
        return [];
    }

    logger.info("End parse");
    return [result]
};

module.exports = parseOlx;