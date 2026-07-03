import { getHtmlPage, getLinksAd, getCarData, getNewCarsData } from "./services/parserServices.js";
import otomotoParser from "./otomoto.js";
import olxParser from "./olx.js";
import { saveCars } from "./services/carServices.js";
import { getRequestsForSending } from "./services/requestService.js";

class parserManager {
    sites = [
        new otomotoParser(),
        new olxParser()
    ];

    async parseSite(site) {
        try {
            console.log("1. Getting main HTML page:", site.url);
            const mainHtmlPage = await getHtmlPage(site.url);
            // Надо последний URL как-то сохранять;

            console.log("2. Extracting ad links from HTML page");
            const linksAd = getLinksAd(mainHtmlPage, site.adMarker, site.lastUrl, site.getLinkFromHtml);
            console.log("Extracted ad links:", linksAd.length);

            site.lastUrl = linksAd[0];
            console.log("Updated last URL:", site.lastUrl);

            console.log("3. Extracting car data from HTML page");
            return await getNewCarsData(linksAd, site.getCarAttributes);
        } catch (e) {
            console.error("Error in parser loop:", e);
        }
    };

    async parsingAllSite() {
        let requests = await Promise.allSettled(
            this.sites.map(site => this.parseSite(site))
        );

        let x = requests.flatMap((result, index) => {
            if (result.status === "fulfilled") {
                console.log(`Site ${this.sites[index].url} parsed successfully`);
                return result.value;
            } else {
                console.error(`Error parsing site ${this.sites[index].url}:`, result.reason);
                return [];
            }
        });
        return x.filter(Boolean);
    };

    async startParsing() {
        let newCarData = await this.parsingAllSite();

        // Загрузить все машины в БД
        const savedCarsData = await saveCars(newCarData);

        // получить нужные машины с бд вместе с id чатов
        const messageData = await getRequestsForSending(savedCarsData);

        // вернуть массив с машинами и id чатов
        return messageData;
    };
};

export default parserManager;