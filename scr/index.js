require("dotenv").config();

const ParserService = require("./services/parserService.js");
const RequestService = require("./services/requestsService.js");
const AdaptiveThrottle = require("./services/throttleService.js");
const Logger = require("./utils/logger.js");
// const ProxyRotator = require("./services/proxyService.js");

class Manager {
    constructor() {
        this.parsedUrls = new Set();
    };

    async run(bot) {
        Logger.info("Parser Start...");

        // const proxy = ProxyRotator.getNextProxy();
        // Logger.log(`🛠 Используем прокси: ${proxy}`);

        let listings = await ParserService.seedParse();

        for (const listing of listings) {
            const url = new URL(listing.link);
            const hostname = url.hostname;
            const subdomain = hostname.split('.')[1];

            if (this.parsedUrls.has(listing.link)) continue;

            await AdaptiveThrottle.wait();
            const car = await ParserService.deepParse(listing.link, subdomain);
            await RequestService.getMatchingRequests(car, bot, subdomain);

            this.parsedUrls.add(listing.link);
        };

        Logger.info("Parsing Finish");
    };
};

module.exports = new Manager;