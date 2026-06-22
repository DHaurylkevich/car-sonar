import ParserService from "../services/parserService.js";
import RequestService from "../db/services/requestsService.js";
import Logger from "../utils/logger.js";

class ParserManager {
    constructor() {
        this.parsedUrls = new Set();
    };

    async run(bot) {
        Logger.info("Parser Start...");

        const hasRequestInDB = await RequestService.checkAnyRequest();
        if (!hasRequestInDB) return Logger.info("No one requests");

        let listings = await ParserService.seedParse();

        Logger.info("2 этап работы парсера");

        await ParserService.deepParse(bot, listings, this.parsedUrls);

        Logger.info("Parsing Finish");
    };
};

export default new ParserManager;