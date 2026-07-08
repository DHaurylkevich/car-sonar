import { getHtmlPage, getLinksAd, getCarData, getNewCarsData } from "./services/parserServices.js";
import otomotoParser from "./otomoto.js";
import olxParser from "./olx.js";
import { saveCars } from "./services/carServices.js";
import { getRequestsForSending } from "./services/requestService.js";
import { sendMessage } from "../bot/services/messageService.js";
import { logger } from "../utils/logger.js";

class parserManager {
    sites = [
        new otomotoParser(),
        new olxParser()
    ];

    isParsing = false;


    async parseSite(site) {
        try {
            logger.info("1. Getting main HTML page:", site.url);
            const mainHtmlPage = await getHtmlPage(site.url);
            // Надо последний URL как-то сохранять;
            // site.lastUrl = "https://www.olx.pl/d/oferta/suzuki-swift-1-3b-2008-zadbany-5-drzwi-klima-raty-zamiana-samochod-CID5-ID1aOSzX.html?search_reason=search%7Cpromoted";
            logger.info("2. Extracting ad links from HTML page");
            const linksAd = getLinksAd(mainHtmlPage, site.adMarker, site.lastUrl, site.getLinkFromHtml);
            logger.info("Extracted ad links:", linksAd.length);

            site.lastUrl = linksAd[0];
            logger.info("Updated last URL:", site.lastUrl);

            logger.info("3. Extracting car data from HTML page");
            return await getNewCarsData(linksAd, site.getCarAttributes);
        } catch (e) {
            logger.error("Error in parser loop:", e);
        }
    };

    async parsingAllSite() {
        let requests = await Promise.allSettled(
            this.sites.map(site => this.parseSite(site))
        );

        let x = requests.flatMap((result, index) => {
            if (result.status === "fulfilled") {
                logger.info(`Site ${this.sites[index].url} parsed successfully`);
                return result.value;
            } else {
                logger.error(`Error parsing site ${this.sites[index].url}:`, result.reason);
                return [];
            }
        });

        return x.filter(Boolean);
    };


    async startParsing() {
        let newCarData = await this.parsingAllSite();

        const savedCarsData = await saveCars(newCarData);

        // получить нужные машины с бд вместе с id чатов
        const messageData = await getRequestsForSending(savedCarsData);

        return messageData;
    };
    async parsingCycle(bot) {
        if (this.isParsing) {
            logger.warn("Parsing is already in progress. Skipping this run.");
            return;
        }

        this.isParsing = true;

        try {
            // Парсинг данных
            const messageData = await this.startParsing();
            // Отправить пользователям


            await sendMessage(bot, messageData);
            logger.info("Parser and bot launched");
        } catch (error) {
            logger.error("Parsing error:", error);
        } finally {
            this.isParsing = false;
        }
    }
};

export default parserManager;