// const puppeteer = require("puppeteer");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
const CarService = require("./carService");
const RequestService = require("./requestsService");
const AdaptiveThrottle = require("./throttleService");
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
                    "--disable-software-rasterizer",
                    "--single-process",
                    "--no-zygote",
                ],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath() || "/usr/bin/chromium",
                headless: "new",
                ignoreHTTPSErrors: true,
            });
        }
    }


    async seedParse() {
        Logger.info("1 stage parser work");

        try {
            await this.initBrowser();
            const [pageOtomoto, pageOlx, pageAutoscout] = await Promise.all([
                this.browser.newPage(),
                this.browser.newPage(),
                this.browser.newPage()
            ]);

            await pageOtomoto.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
            await pageOtomoto.goto(this.links.otomoto, { waitUntil: 'domcontentloaded' })
            const otomotoData = await this.seedPage(pageOtomoto, "otomoto");
            await pageOtomoto.close();

            await pageOlx.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
            await pageOlx.goto(this.links.olx, { waitUntil: 'domcontentloaded' });
            const olxData = await this.seedPage(pageOlx, "olx");
            await pageOlx.close();

            await pageAutoscout.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
            await pageAutoscout.goto(this.links.autoscout, { waitUntil: 'domcontentloaded' });
            const autoscoutData = await this.seedPage(pageAutoscout, "autoscout");
            await pageAutoscout.close();

            for (const page of await this.browser.pages()) {
                await page.close();
            }

            const listings = [{ data: otomotoData, domain: "otomoto" }, { data: olxData, domain: "olx" }, { data: autoscoutData, domain: "autoscout" }];
            Logger.info("1 stage finished");
            return await CarService.saveCars(listings);
        } catch (err) {
            Logger.error("Error during page processing:", err);
            throw err;
        }
    };

    async deepParse(bot, listings, parsedUrls) {
        try {
            await this.initBrowser();
            const page = await this.browser.newPage();

            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");

            for (const listing of listings) {
                const url = new URL(listing.link);
                const hostname = url.hostname;
                const subdomain = hostname.split('.')[1];

                if (parsedUrls.has(listing.link)) continue;
                await AdaptiveThrottle.wait();

                await page.goto(listing.link, { waitUntil: 'domcontentloaded' });

                const [data] = await this.deepPage(page, subdomain);

                const car = await CarService.updateCarAttr(listing.link, data);

                await RequestService.getMatchingRequests(car, bot, subdomain);

                parsedUrls.add(listing.link);
                Logger.info(`🔍 Deep parsing for: ${url} `);
            };

            for (const page of await this.browser.pages()) {
                await page.close();
            }

            Logger.info(`✅ Deep parsing finished`);
        } catch (err) {
            Logger.error("Error during page processing:", err);
            throw err;
        } finally {
            await this.browser.close();
        }
    };

    async seedPage(page, domain) {
        Logger.info(`Start parse ${domain} `);

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
                        // const photo = element.querySelector("img")?.src || null;
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

                    const allAttributes = Array.from(elements).map(element => {
                        return element.innerText.trim();
                    });

                    const year = document.querySelector("div[data-testid='year']>div>p.eoqsciq8.ooa-17xeqrd").innerText;
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