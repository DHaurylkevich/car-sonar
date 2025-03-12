const puppeteer = require("puppeteer");
const CarService = require("./carService");
const RequestService = require("./requestsService");
const Logger = require("../utils/logger");

class ParserService {
    constructor() {
        this.browser = null;
    };

    links = {
        otomoto: "https://www.otomoto.pl/osobowe?search%5Border%5D=created_at_first%3Adesc",
        olx: "https://www.olx.pl/motoryzacja/samochody/?search%5Border%5D=created_at:desc",
        autoscout: "https://www.autoscout24.pl/lst?atype=C&cy=D%2CA%2CB%2CE%2CF%2CI%2CL%2CNL&damaged_listing=exclude&desc=1&powertype=kw&search_id=19u9c6xnoqx&sort=age&source=homepage_search-mask&ustate=N%2CU",
    };

    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ],
                headless: "false",
            });
        }
    };

    async parsePage(page, url, domain) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const listings = await this.seedPage(page, domain);
        await page.close();
        return listings;
    }

    async seedParse() {
        Logger.info("1 stage parser work");

        try {
            await this.initBrowser();
            const pages = await Promise.all([
                this.browser.newPage(),
                this.browser.newPage(),
                this.browser.newPage()
            ]);
            const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

            const [pageOtomoto, pageOlx, pageAutoscout] = pages;
            await Promise.all(pages.map(page => page.setUserAgent(userAgent)));

            const otomotoData = await this.parsePage(pageOtomoto, this.links.otomoto, "otomoto");
            const olxData = await this.parsePage(pageOlx, this.links.olx, "olx");
            const autoscoutData = await this.parsePage(pageAutoscout, this.links.autoscout, "autoscout");

            const listings = [{ data: otomotoData, domain: "otomoto" }, { data: olxData, domain: "olx" }, { data: autoscoutData, domain: "autoscout" }].filter(listing => listing.data.length > 0);;

            Logger.info("1 stage finished");
            return await CarService.saveCars(listings);
        } catch (err) {
            Logger.error("Error during page processing:", err);
            throw err;
        } finally {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
        }
    };

    async deepParse(bot, listings, parsedUrls) {
        try {
            await this.initBrowser();

            for (let listing of listings) {
                let page = await this.browser.newPage();
                await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
                if (parsedUrls.has(listing.link)) continue;

                try {
                    Logger.info(`🔍 Deep parsing for: ${listing.link}`);
                    await page.goto(listing.link, { waitUntil: 'domcontentloaded' });

                    const url = new URL(listing.link);
                    const domain = url.hostname.split('.')[1];
                    const [data] = await this.deepPage(page, domain);

                    if (data) {
                        const car = await CarService.updateCarAttr(listing.link, data);
                        await RequestService.getMatchingRequests(car, bot, domain);
                        parsedUrls.add(listing.link);
                    }

                    await page.close();
                } catch (error) {
                    console.error('Ошибка загрузки страницы:', error);
                }
            }

            Logger.info(`✅ Deep parsing finished`);
        } catch (err) {
            Logger.error("Error during page processing:", err);
            throw err;
        } finally {
            await this.browser.close();
            this.browser = null;
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

                    elements.forEach(element => {
                        const name = element.querySelector("h2")?.textContent.trim() || null;
                        const link = element.querySelector("a")?.href || null;
                        const price = element.querySelector("h3")?.textContent.trim() || null;
                        const time = element.querySelector("dd[data-parameter='year']")?.textContent.trim() || null;

                        items.push({ name, link, price, time });
                    });

                    return items;
                });
                break;
            case "olx":
                results = await page.evaluate(() => {
                    const items = [];
                    const elements = document.querySelectorAll("div[data-testid='l-card']");

                    elements.forEach(element => {
                        const name = element.querySelector("h4")?.textContent.trim() || null;
                        const link = element.querySelector("a")?.href || null;
                        const price = element.querySelector("p[data-testid='ad-price']")?.textContent.trim() || null;
                        const time = element.querySelector("p[data-testid='location-date']")?.textContent.trim() || null;

                        items.push({ name, link, price, time });
                    });

                    return items;
                });
                break;
            case "autoscout":
                results = await page.evaluate(() => {
                    const items = [];
                    let elements;

                    elements = document.querySelectorAll("article.cldt-summary-full-item");

                    elements.forEach(element => {
                        const name = element.querySelector("div.ListItem_header__J6xlG h2")?.textContent.trim() || null;
                        const link = element.querySelector("div.ListItem_header__J6xlG a")?.href || null;
                        const price = element.querySelector("p[data-testid='regular-price']")?.textContent.trim() || null;
                        const time = element.querySelector("span[data-testid='VehicleDetails-calendar']")?.textContent.trim() || null;

                        items.push({ name, link, price, time });
                    });

                    return items;
                });
                break;
        }

        Logger.info(`End parse ${domain} `);
        return results;
    };

    async deepPage(page, domain) {
        Logger.info(`Start parse ${domain} `);

        let sectionExists = "";
        switch (domain) {
            case "otomoto":
                await page.waitForSelector("div[data-testid='main-details-section']");
                sectionExists = await page.$("div[data-testid='main-details-section']");
                break;
            case "olx":
                await page.waitForSelector(".css-1wws9er");
                sectionExists = await page.$(".css-1wws9er");
                break;
            case "autoscout24":
                await page.waitForSelector(".VehicleOverview_containerMoreThanFourItems__691k2");
                sectionExists = await page.$(".VehicleOverview_containerMoreThanFourItems__691k2");
                break;
        }

        if (!sectionExists) {
            Logger.warn("Section not found");
            return [];
        }

        let results;
        switch (domain) {
            case "otomoto":
                results = await page.evaluate(() => {
                    const items = [];
                    const elements = document.querySelectorAll("p[data-sentry-element='DetailLabel']");

                    const allAttributes = Array.from(elements).map(element => {
                        return element.innerText.trim();
                    });

                    const year = document.querySelector("div[data-testid='year']>div>p.en2sar59.ooa-17xeqrd").innerText;
                    const photo = document.querySelector("div[data-testid='photo-gallery-item'] img")?.src;

                    items.push({
                        photo: photo || null,
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

                    const allAttributes = {};
                    Array.from(elements).map(element => {
                        const attr = element?.innerText.trim();
                        const key = attr.split(":")[0];
                        const value = attr.split(":")[1];
                        allAttributes[key] = value;
                    });
                    const photo = document.querySelector("img[data-testid='swiper-image']")?.src || null;

                    items.push({
                        photo: photo || null,
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

                    const allAttributes = {};
                    Array.from(elements).map(element => {
                        const title = element.querySelector('.VehicleOverview_itemTitle__S2_lb')?.innerText.trim();
                        const value = element.querySelector('.VehicleOverview_itemText__AI4dA')?.innerText.trim();
                        allAttributes[title] = value;
                    });

                    const photo = document.querySelector(".image-gallery-slide img")?.src;
                    const country = document.querySelector(".scr-link.LocationWithPin_locationItem__tK1m5")?.innerText.trim();
                    const generation = document.querySelector(".DataGrid_defaultDdStyle__3IYpG.DataGrid_fontBold__RqU01")?.innerText.trim();

                    items.push({
                        photo: photo || null,
                        mileage: parseInt(allAttributes["Przebieg"].replace(/\D/g, '')) || null,
                        year: parseInt(allAttributes["Pierwsza rejestracja"].split("/")[1]) || null,
                        generation: generation || null,
                        fuelType: allAttributes["Paliwo"] || null,
                        country: country.split(", ")[1]
                    });

                    return items;
                });

                const countryCodes = {
                    "DE": "Germany",
                    "FR": "French",
                    "ES": "Spain",
                    "AT": "Austria",
                    "BE": "Belgium",
                    "NL": "Holland",
                    "LU": "Luxembourg",
                    "IT": "Italy",
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