const logger = require("../utils/logger");

const parseAutoscount = async (page) => {
    logger.info("Start parse");

    const sectionExists = await page.$("div>article");
    if (!sectionExists) {
        logger.warn("Section not found");
        return [];
    }

    const result = await page.evaluate(() => {
        const section = document.querySelector("div.gQe_i.zrALs.lfEF0._b8Yw");
        if (!section) {
            console.warn("section ad not found");
            return [];
        }
        const photo = section.querySelector("div>img")?.src || null;
        const name = section.querySelector('h2.QeGRL')?.textContent.trim() || null;
        const link = section.getAttribute('href') || null;
        const price = section.querySelector('span.fpviJ[data-testid="price-label"]')?.textContent.trim() || null;
        // const time = section.querySelector('').text().trim() || null;

        return { photo, name, link, price };
    });

    if (!result) {
        logger.warn("No elements found in section");
        return [];
    }

    logger.info("End parse");
    return [result]
};

module.exports = parseAutoscount;