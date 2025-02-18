require("dotenv").config();

const ParserService = require("./services/parserService.js");
const RequestService = require("./services/requestsService.js");
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

        // const hasRequestInDB = await RequestService.checkAnyRequest();
        // if (!hasRequestInDB) return Logger.info("No one requests");

        // let listings = await ParserService.seedParse();
        // console.log(listings);
        let listings = [
            {
                id: 3223,
                name: 'Audi S6 Avant TDI 253(344)  tiptronic LED Luft Pano',
                year: null,
                mileage: 0,
                price: 116505,
                link: 'https://www.autoscout24.pl/oferta/audi-s6-avant-tdi-253-344-tiptronic-led-luft-pano-diesel-czarny-a8eae085-f5e1-4ee0-af63-84c8ded84a59',
                photo: '',
                site: 'autoscout',
                brandId: 1,
                fuelId: null,
                countryId: null,
                generationId: null
            },
            {
                id: 3224,
                name: 'Opel Corsa 1.2T XHL S/S GS-Line 100',
                year: 2022,
                mileage: 0,
                price: 11850,
                link: 'https://www.autoscout24.pl/oferta/opel-corsa-1-2t-xhl-s-s-gs-line-100-benzyna-szary-72dd7e4b-d9b8-4086-b1a4-da3201712daa',
                photo: '',
                site: 'autoscout',
                brandId: 9,
                fuelId: null,
                countryId: null,
                generationId: null

            },
            {
                id: 3225,
                name: 'CUPRA Formentor TSI VZ 4D DSG PANO LEDER MEMORY 360',
                year: 2022,
                mileage: 0,
                price: 33688,
                link: 'https://www.autoscout24.pl/oferta/cupra-formentor-tsi-vz-4d-dsg-pano-leder-memory-360-benzyna-szary-9499bdc1-b0b9-4211-9d8c-b3777ecfb2b1',
                photo: '',
                site: 'autoscout',
                brandId: null,
                fuelId: null,
                countryId: null,
                generationId: null

            },
            {

                id: 3226,
                name: 'Opel Corsa 1.2T XHL 74kW (100CV) GS',
                year: 2022,
                mileage: 0,
                price: 15339,
                link: 'https://www.autoscout24.pl/oferta/opel-corsa-1-2t-xhl-74kw-100cv-gs-benzyna-czerwony-a44ed2a9-a1d3-4bc6-aaed-ea076c79c7c8',
                photo: '',
                site: 'autoscout',
                brandId: 9,
                fuelId: null,
                countryId: null,
                generationId: null

            },
            {

                id: 3227,
                name: 'Opel Corsa 1.2 XEL S/S Edition 75',
                year: 2022,
                mileage: 0,
                price: 9995,
                link: 'https://www.autoscout24.pl/oferta/opel-corsa-1-2-xel-s-s-edition-75-benzyna-czerwony-867e62c6-0b12-4342-8de7-155ac87f7850',
                photo: '',
                site: 'autoscout',
                brandId: 9,
                fuelId: null,
                countryId: null,
                generationId: null

            },
            {

                id: 3228,
                name: 'Audi A4 2.0 TFSI Avant basis',
                year: 2019,
                mileage: 0,
                price: 19990,
                link: 'https://www.autoscout24.pl/oferta/audi-a4-2-0-tfsi-avant-basis-benzyna-czarny-0698d026-c63f-4435-81ab-1de3e728ef70',
                photo: '',
                site: 'autoscout',
                brandId: 1,
                fuelId: null,
                countryId: null,
                generationId: null

            },
            {

                id: 3229,
                name: 'Opel Corsa 1.2 Turbo Hybrid 130pk eDCT Ultimate | Automaat |',
                year: 2024,
                mileage: 0,
                price: 27440,
                link: 'https://www.autoscout24.pl/oferta/opel-corsa-1-2-turbo-hybrid-130pk-edct-ultimate-automaat-elektryczno-benzynowy-bialy-dbd934e7-50f1-4fa2-952a-da6ca1846ef7',
                photo: '',
                site: 'autoscout',
                brandId: 9,
                fuelId: null,
                countryId: null,
                generationId: null
            },
            {
                id: 3230,
                name: 'Opel Corsa 1.2 XEL S/S Edition 75',
                year: 2022,
                mileage: 0,
                price: 9995,
                link: 'https://www.autoscout24.pl/oferta/opel-corsa-1-2-xel-s-s-edition-75-benzyna-czerwony-a9c6da2f-479e-4845-a7ad-d203ee7df291',
                photo: '',
                site: 'autoscout',
                brandId: 9,
                fuelId: null,
                countryId: null,
                generationId: null

            },
            {
                id: 3231,
                name: 'Audi S6 Avant TDI 253(344)  tiptronic LED Luft Pano',
                year: null,
                mileage: 0,
                price: 116505,
                link: 'https://www.autoscout24.pl/oferta/audi-s6-avant-tdi-253-344-tiptronic-led-luft-pano-diesel-czarny-b0fc300b-ef17-4ab4-b209-3654b4a699cf',
                photo: '',
                site: 'autoscout',
                brandId: 1,
                fuelId: null,
                countryId: null,
                generationId: null
            }
        ];

        Logger.info("2 этап работы парсера");

        await ParserService.deepParse(bot, listings, this.parsedUrls);

        Logger.info("Parsing Finish");
    };
};

module.exports = new Manager;