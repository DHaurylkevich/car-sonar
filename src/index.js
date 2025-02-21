require("dotenv").config();

const ParserService = require("./services/parserService.js");
const RequestService = require("./services/requestsService.js");
const Logger = require("./utils/logger.js");

class Manager {
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

module.exports = new Manager;