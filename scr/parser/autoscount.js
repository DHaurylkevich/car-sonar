const logger = require("../utils/logger");

// querySelectorAll
// const element = document.querySelector(".css-qfzx1y");
const parseAutoscount = async (page) => {
    logger.info("Start parse");

    const sectionExists = await page.$(".ListItem_wrapper__TxHWu");
    if (!sectionExists) {
        logger.warn("Section not found");
        return [];
    }

    const result = await page.evaluate(() => {
        const section = document.querySelector(".ListItem_wrapper__TxHWu");
        if (!section) {
            console.warn("section ad not found");
            return [];
        }
        const photo = section.querySelector("picture.NewGallery_picture__fNsZr img")?.src || null;
        const name = section.querySelector("div.ListItem_header__J6xlG h2")?.textContent.trim() || null;
        // const title = section.querySelector("h4")?.textContent.trim() || null;
        const link = section.querySelector("div.ListItem_header__J6xlG a")?.href || null;
        const price = section.querySelector("p[data-testid='regular-price']")?.textContent.trim() || null;
        const time = section.querySelector("span[data-testid='VehicleDetails-calendar']")?.textContent.trim() || null;

        return { photo, name, link, price, time };
    });

    if (!result) {
        logger.warn("No elements found in section");
        return [];
    }

    logger.info("End parse");
    return [result]
};

module.exports = parseAutoscount;