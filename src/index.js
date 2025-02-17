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

        const hasRequestInDB = await RequestService.checkAnyRequest();
        if (!hasRequestInDB) return Logger.info("No one requests");

        let listings = await ParserService.seedParse();
        console.log(listings);
        // let listings = [
        //     {
        //         photo: null,
        //         name: 'Citroen Nemo 1.3 hdi m-space Xtr Theatre',
        //         link: 'https://www.autoscout24.pl/oferta/citroen-nemo-1-3-hdi-m-space-xtr-theatre-diesel-a97fadee-3110-487e-b329-bee7d1e7053f',
        //         price: '€ 11 000,-',
        //         time: '01/2012'
        //     },
        //     {
        //         photo: 'https://ireland.apollo.olxcdn.com/v1/files/eyJmbiI6IjczaDhnMTlhN3QzYi1PVE9NT1RPUEwifQ.Syoi79DReTXmJnOywq23DVTMWnPnEKSmJ7ihB0xM3kg/image;s=320x240',
        //         name: 'Skoda RAPID',
        //         link: 'https://www.otomoto.pl/osobowe/oferta/skoda-rapid-1-2-tsi-salon-polska-1-wlasciciel-serwis-aso-klima-parktronic-ID6H8A6S.html',
        //         price: '32 500',
        //         time: '2014'
        //     },
        //     {
        //         photo: null,
        //         name: 'Volkswagen GOLF VI 1.4 MPi 2009r Polecam !!',
        //         link: 'https://www.olx.pl/d/oferta/volkswagen-golf-vi-1-4-mpi-2009r-polecam-CID5-ID14rbxc.html',
        //         price: '19 900 zł',
        //         time: 'Blizne - Dzisiaj o 20:05'
        //     },
        // ]
        Logger.info("2 этап работы парсера");

        await ParserService.deepParse(bot,listings, this.parsedUrls);

        Logger.info("Parsing Finish");
    };
};

module.exports = new Manager;