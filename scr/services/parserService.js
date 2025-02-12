const puppeteer = require("puppeteer");
const CarService = require("./carService");
const Logger = require("../utils/logger");

class ParserService {
    links = {
        otomoto: "https://www.otomoto.pl/osobowe?search%5Border%5D=created_at_first%3Adesc",
        olx: "https://www.olx.pl/motoryzacja/samochody/?search%5Border%5D=created_at:desc",
        autoscout: "https://www.autoscout24.pl/lst?atype=C&cy=D%2CA%2CB%2CE%2CF%2CI%2CL%2CNL&damaged_listing=exclude&desc=1&powertype=kw&search_id=19u9c6xnoqx&sort=age&source=homepage_search-mask&ustate=N%2CU",
    };

    async seedParse() {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'], headless: true });

        try {
            // const pageOtomoto = await browser.newPage();
            // await pageOtomoto.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
            // await pageOtomoto.goto(this.links.otomoto, { waitUntil: 'load' })

            // const pageOlx = await browser.newPage();
            // await pageOlx.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
            // await pageOlx.goto(this.links.olx, { waitUntil: 'load' });

            const pageAutoscout = await browser.newPage();
            await pageAutoscout.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
            await pageAutoscout.goto(this.links.autoscout, { waitUntil: 'load' });

            const [olxData] = await Promise.all([
                // const [autoscoutData, olxData, autoscountData] = Promise.all([
                // this.seedPage(pageOtomoto, "otomoto"),
                // this.seedPage(pageOlx, "olx"),
                this.seedPage(pageAutoscout, "autoscout"),
            ]);

            // const autoscoutData = [
            //     {
            //         photo: null,
            //         name: 'Peugeot 108 VTI 68 ETG5 Allure',
            //         link: 'https://www.autoscout24.pl/oferta/peugeot-108-vti-68-etg5-allure-benzyna-fioletowy-96bf01e1-66bd-464d-b5d5-ed1dad6b49c1',
            //         price: '€ 8 950,-',
            //         time: '03/2017'
            //     },
            //     {
            //         photo: 'https://prod.pictures.autoscout24.net/listing-images/39640ae3-909b-4b46-8588-196cf39c858f_7458c423-466e-40a5-b7f3-5c9ba563833f.jpg/250x188.webp',
            //         name: 'Fiat Panda Panda 1.0 firefly hybrid City Life - AZIENDALE',
            //         link: 'https://www.autoscout24.pl/oferta/fiat-panda-panda-1-0-firefly-hybrid-city-life-aziendale-elektryczno-benzynowy-bialy-39640ae3-909b-4b46-8588-196cf39c858f',
            //         price: '€ 11 900,-',
            //         time: '03/2022'
            //     }
            // ]

            // const listings = [{ data: otomotoData, domain: "otomoto" }, { data: olxData, domain: "olx" }, { olxData: autoscoutData, domain: "autoscout" }]
            const listings = [{ data: olxData, domain: "olx" }]
            return await CarService.saveCars(listings);
        } catch (err) {
            Logger.error("Error during page processing:", err);
            throw err;
        } finally {
            await browser.close();
        }
    };

    async deepParse(url, domain) {
        Logger.info(`🔍 Парсим детали для: ${url}`);
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'], headless: true });

        try {
            const page = await browser.newPage();
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
            await page.goto(url, { waitUntil: 'load' });

            const [data] = await this.deepPage(page, domain);

            const car =  await CarService.updateCarAttr(url, data);

            Logger.info(`✅ Детальный парсинг завершен: ${url}`);
            return car;
        } catch (err) {
            Logger.error("Error during page processing:", err);
            throw err;
        } finally {
            await browser.close();
        }
    };

    async seedPage(page, domain) {
        Logger.info(`Start parse ${domain}`);

        let sectionExists = "";
        switch (domain) {
            case "otomoto":
                sectionExists = await page.$("div[data-testid='search-results']");
                break;
            case "olx":
                sectionExists = await page.$("div[data-testid='listing-grid']");
                break;
            case "autoscout":
                sectionExists = await page.$(".ListPage_main___0g2X");
                break;
        };

        if (!sectionExists) {
            Logger.warn("Section not found");
            return [];
        }

        let results
        switch (domain) {
            case "otomoto":
                results = await page.evaluate(() => {
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
                break;
            case "olx":
                results = await page.evaluate(() => {
                    const items = [];
                    const elements = document.querySelectorAll("div[data-testid='l-card']");

                    if (!elements) {
                        console.warn("Section not found");
                        return items;
                    }

                    elements.forEach(element => {
                        const photo = element.querySelector("img.css-gwhqbt")?.src || null;
                        const name = element.querySelector("h4")?.textContent.trim() || null;
                        const link = element.querySelector("a")?.href || null;
                        const price = element.querySelector("p[data-testid='ad-price']")?.textContent.trim() || null;
                        const time = element.querySelector("p[data-testid='location-date']")?.textContent.trim() || null;

                        items.push({ photo, name, link, price, time });
                    });

                    return items;
                });
                break;
            case "autoscout":
                results = await page.evaluate(() => {
                    const items = [];
                    let elements;

                    elements = document.querySelectorAll("article.cldt-summary-full-item");

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
                break;
        }

        Logger.info("End parse Autoscout");
        return results;
    };

    async deepPage(page, domain) {
        Logger.info(`Start parse ${domain}`);

        let sectionExists = "";
        switch (domain) {
            case "otomoto":
                sectionExists = await page.$("div[data-testid='main-details-section']");
                break;
            case "olx":
                sectionExists = await page.$(".css-1wws9er");
                break;
            case "autoscout24":
                sectionExists = await page.$(".VehicleOverview_containerMoreThanFourItems__691k2");
                break;
        };

        if (!sectionExists) {
            Logger.warn("Section not found");
            return [];
        }

        let results;
        switch (domain) {
            case "otomoto":
                results = await page.evaluate(() => {
                    const items = [];
                    const elements = document.querySelectorAll(".e1btp7412.ooa-1rcllto");

                    if (!elements) {
                        return `${domain}`;
                    }

                    const allAttributes = Array.from(elements).map(element => {
                        return element.innerText.trim();
                    });

                    const year = document.querySelector("div[data-testid='year']>div>p.eoqsciq8.ooa-17xeqrd").innerText;

                    items.push({
                        mileage: parseInt(allAttributes[0].replace(/\D/g, ''), 10) || null,
                        year: parseInt(year),
                        generation: allAttributes[3] || null,
                        fuelType: allAttributes[1] || null,
                        country: "Polska"
                    });

                    return items;
                });
                break
            case "olx":
                results = await page.evaluate(() => {
                    const items = [];
                    const elements = document.querySelectorAll("p.css-1wgiva2");

                    if (!elements) {
                        return `${domain}`;
                    }

                    const allAttributes = {};
                    Array.from(elements).map(element => {
                        const attr = element?.innerText.trim();
                        const key = attr.split(":")[0];
                        const value = attr.split(":")[1];
                        allAttributes[key] = value;
                    });

                    items.push({
                        mileage: parseInt(allAttributes["Przebieg"].replace(/\D/g, '')) || null,
                        year: parseInt(allAttributes["Rok produkcji"]) || null,
                        generation: allAttributes["Typ nadwozia"] || null,
                        fuelType: allAttributes["Paliwo"] || null,
                        country: "Polska"
                    });

                    return items;
                });
                break;
            case "autoscout24":
                results = await page.evaluate(() => {
                    const items = [];
                    const elements = document.querySelectorAll("div.VehicleOverview_itemContainer__XSLWi");

                    if (!elements) {
                        return `${domain}`;
                    }

                    const allAttributes = {};
                    Array.from(elements).map(element => {
                        const title = element.querySelector('.VehicleOverview_itemTitle__S2_lb')?.innerText.trim();
                        const value = element.querySelector('.VehicleOverview_itemText__AI4dA')?.innerText.trim();
                        allAttributes[title] = value;
                    });

                    const country = document.querySelector(".scr-link.LocationWithPin_locationItem__tK1m5")?.innerText.trim();
                    const generation = document.querySelector(".DataGrid_defaultDdStyle__3IYpG.DataGrid_fontBold__RqU01")?.innerText.trim();

                    items.push({
                        mileage: parseInt(allAttributes["Przebieg"].replace(/\D/g, '')) || null,
                        year: parseInt(allAttributes["Pierwsza rejestracja"].split("/")[1]) || null,
                        generation: generation || null,
                        fuelType: allAttributes["Paliwo"] || null,
                        country: country.split(", ")[1]
                    });

                    return items;
                });
                const countryCodes = {
                    "DE": "Германия",
                    "FR": "Франция",
                    "ES": "Испания",
                    "AT": "Австрия",
                    "BE": "Бельгия",
                    "NL": "Голандия",
                    "LU": "Люксенбург",
                    "IT": "Италия",
                };
                results[0].country = countryCodes[results[0].country];
                results[0].generation = results[0].generation.includes("/") ? results[0].generation.split("/")[1] : results[0].generation;

                break;
        };

        Logger.info(`End parse ${domain} `);
        return results;
    };
};

module.exports = new ParserService();