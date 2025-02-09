const CarService = require("../services/carService");
const link = require("../utils/generationLink");
const puppeteer = require("puppeteer");
const parserOtomoto = require("../parser/otomoto");
const parserOlx = require("../parser/olx");
const parserAutoscount = require("../parser/autoscount");
const parserMobile = require("../parser/mobile");

const fetchHtml = async (url, typeParse) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'], headless: true });
    const page = await browser.newPage();

    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");
        await page.goto(url, { waitUntil: 'load' });

        let results;
        switch (typeParse) {
            case "otomoto":
                results = await parserOtomoto(page);
                break;
            case "olx":
                results = await parserOlx(page);
                break;
            case "mobile":
                results = await parserMobile(page);
                break;
            case "autoscount":
                results = await parserAutoscount(page);
                break;
        }

        return results;
    } catch (err) {
        console.error("Error during page processing:", err);
        throw err;
    } finally {
        await browser.close();
    }
};

const scrapeCarse = async (filters = {}) => {
    const olx = link.olx(filters);
    const otomoto = link.otomoto(filters);
    // const mobile = (link.mobile(filters));
    const autoscount = link.autoscout(filters);

    try {
        let [otomotoData, olxData, autoscountData] = await Promise.all([
            fetchHtml(String(otomoto), "otomoto"),
            fetchHtml(String(olx), "olx"),
            fetchHtml(String(autoscount), "autoscount"),
        ]);

        return [otomotoData, olxData, autoscountData];
    } catch (err) {
        throw err;
    }
};

const scrapeSchedule = async () => {
    try {
        // let [otomotoData] = await Promise.all([
        // let [otomotoData, olxData, autoscountData] = await Promise.all([
        // fetchHtml("https://www.otomoto.pl/osobowe?search%5Border%5D=created_at_first%3Adesc", "otomoto"),
        // fetchHtml("https://www.olx.pl/motoryzacja/samochody/?search%5Border%5D=created_at:desc", "olx"),
        // fetchHtml("https://www.autoscout24.pl/lst?atype=C&cy=D%2CA%2CB%2CE%2CF%2CI%2CL%2CNL&damaged_listing=exclude&desc=1&powertype=kw&search_id=19u9c6xnoqx&sort=age&source=homepage_search-mask&ustate=N%2CU", "autoscount"),
        // ]);

        const autoscoutData = [
            {
                photo: null,
                name: 'Peugeot 108 VTI 68 ETG5 Allure',
                link: 'https://www.autoscout24.pl/oferta/peugeot-108-vti-68-etg5-allure-benzyna-fioletowy-96bf01e1-66bd-464d-b5d5-ed1dad6b49c1',
                price: '€ 8 950,-',
                time: '03/2017'
            },
            {
                photo: 'https://prod.pictures.autoscout24.net/listing-images/39640ae3-909b-4b46-8588-196cf39c858f_7458c423-466e-40a5-b7f3-5c9ba563833f.jpg/250x188.webp',
                name: 'Fiat Panda Panda 1.0 firefly hybrid City Life - AZIENDALE',
                link: 'https://www.autoscout24.pl/oferta/fiat-panda-panda-1-0-firefly-hybrid-city-life-aziendale-elektryczno-benzynowy-bialy-39640ae3-909b-4b46-8588-196cf39c858f',
                price: '€ 11 900,-',
                time: '03/2022'
            },
            {
                photo: null,
                name: 'Mercedes-Benz Vito 114 CDI MBUX Navi AHK Klima DAB ParkPaket',
                link: 'https://www.autoscout24.pl/oferta/mercedes-benz-vito-114-cdi-mbux-navi-ahk-klima-dab-parkpaket-diesel-bialy-41e97edf-1848-4982-8ff4-e6f0e0e6abd5',
                price: '€ 37 818,-',
                time: '01/2025'
            },
            {
                photo: null,
                name: 'Peugeot 108 VTI 68 ETG5 Allure',
                link: 'https://www.autoscout24.pl/oferta/peugeot-108-vti-68-etg5-allure-benzyna-fioletowy-91a9256f-1adc-484c-b401-6ca0cdca1f31',
                price: '€ 8 950,-',
                time: '03/2017'
            },
            {
                photo: null,
                name: 'Volkswagen Tiguan Highline BMT/Start-Stopp 4Motion',
                link: 'https://www.autoscout24.pl/oferta/volkswagen-tiguan-highline-bmt-start-stopp-4motion-benzyna-czarny-1a38f37d-25aa-4470-a521-06899f8e7d5f',
                price: '€ 26 590,-',
                time: '08/2020'
            },
            {
                photo: null,
                name: 'Volkswagen Sharan 2.0 TDI Blue Motion Comfortline',
                link: 'https://www.autoscout24.pl/oferta/volkswagen-sharan-2-0-tdi-blue-motion-comfortline-diesel-b6df6329-66fc-4b02-bdf3-d6c651b9728e',
                price: '€ 11 000,-',
                time: '02/2011'
            },
            {
                photo: null,
                name: 'Mercedes-Benz V 300 d 4M Avantgarde lang  AMG Panorama Distronic',
                link: 'https://www.autoscout24.pl/oferta/mercedes-benz-v-300-d-4m-avantgarde-lang-amg-panorama-distronic-diesel-czarny-01fa0db4-06f7-451d-ac2d-a6acd163ba33',
                price: '€ 93 605,-',
                time: '12/2024'
            },
            {
                photo: null,
                name: 'Dacia Sandero 1.2 16V 75 Live II',
                link: 'https://www.autoscout24.pl/oferta/dacia-sandero-1-2-16v-75-live-ii-benzyna-czarny-a7c77ac2-5013-4fde-a430-808665ad1178',
                price: '€ 4 200,-',
                time: '06/2012'
            },
            {
                photo: null,
                name: 'Mercedes-Benz V 300 d 4M Avantgarde lang  AMG Panorama Distronic',
                link: 'https://www.autoscout24.pl/oferta/mercedes-benz-v-300-d-4m-avantgarde-lang-amg-panorama-distronic-diesel-czarny-295d1907-6edc-47a6-9270-369fd67c7b61',
                price: '€ 93 605,-',
                time: '12/2024'
            },
            {
                photo: null,
                name: 'Toyota Yaris 5p 1.3 Sol c/CL auto',
                link: 'https://www.autoscout24.pl/oferta/toyota-yaris-5p-1-3-sol-c-cl-auto-benzyna-effb1fa2-f316-4b17-aa68-88fa016e5dc7',
                price: '€ 13 200,-',
                time: '09/2019'
            },
            {
                photo: null,
                name: 'Toyota Avensis 1.8 linea terra',
                link: 'https://www.autoscout24.pl/oferta/toyota-avensis-1-8-linea-terra-benzyna-e0c1f342-03f7-4bbd-ba04-7431f47e752f',
                price: '€ 1 350,-',
                time: '01/1999'
            },
            {
                photo: null,
                name: 'Mercedes-Benz V 300 d 4M lang Exclusive AMG NightMBUX Distronic',
                link: 'https://www.autoscout24.pl/oferta/mercedes-benz-v-300-d-4m-lang-exclusive-amg-nightmbux-distronic-diesel-szary-599698f9-7592-49a7-831d-b485a6d38e21',
                price: '€ 94 950,-',
                time: '10/2024'
            },
            {
                photo: null,
                name: 'Fiat 500 1.0 hybrid Hey Google 70cv',
                link: 'https://www.autoscout24.pl/oferta/fiat-500-1-0-hybrid-hey-google-70cv-elektryczno-benzynowy-bialy-7b387ad5-7996-43f3-ac7c-77d53c13f81e',
                price: '€ 12 900,-',
                time: '06/2021'
            },
            {
                photo: null,
                name: 'Volvo V60 1.6 T3 Momentum l Leder l Navi l Cruise l Clima l',
                link: 'https://www.autoscout24.pl/oferta/volvo-v60-1-6-t3-momentum-l-leder-l-navi-l-cruise-l-clima-l-benzyna-czarny-2de179f9-5ca5-4f18-a7c0-dc9e90e30fe3',
                price: '€ 5 950,-',
                time: '06/2012'
            },
            {
                photo: null,
                name: 'Mercedes-Benz V 300 d 4M lang Exclusive AMG NightMBUX Distronic',
                link: 'https://www.autoscout24.pl/oferta/mercedes-benz-v-300-d-4m-lang-exclusive-amg-nightmbux-distronic-diesel-szary-b28b4d24-11f9-46a1-9659-89e36a965919',
                price: '€ 94 950,-',
                time: '10/2024'
            },
            {
                photo: null,
                name: 'BMW 318 modèle sport',
                link: 'https://www.autoscout24.pl/oferta/bmw-318-modele-sport-diesel-ee1e0a9f-3243-4d98-b491-764d52e66dcd',
                price: '€ 8 999,-',
                time: '02/2014'
            },
            {
                photo: null,
                name: 'Mercedes-Benz CLA 35 AMG Edition 4matic auto',
                link: 'https://www.autoscout24.pl/oferta/mercedes-benz-cla-35-amg-edition-4matic-auto-benzyna-bialy-53980d9e-1e85-44f2-a1b7-6db7c5a7ef3c',
                price: '€ 34 900,-',
                time: '09/2020'
            },
            {
                photo: null,
                name: 'Opel Grandland',
                link: 'https://www.autoscout24.pl/oferta/opel-grandland-diesel-e86960fd-7a94-419d-b09a-f6a2c508590e',
                price: '€ 18 000,-',
                time: '01/2022'
            },
            {
                photo: null,
                name: 'Mercedes-Benz Vito 116 CDI 4M Kasten lang  MBUX Navi AHK',
                link: 'https://www.autoscout24.pl/oferta/mercedes-benz-vito-116-cdi-4m-kasten-lang-mbux-navi-ahk-diesel-bialy-a8eda96a-51f1-4ae0-bcf4-a0e11d218205',
                price: '€ 47 564,-',
                time: '01/2025'
            },
            {
                photo: null,
                name: 'Mercedes-Benz 233',
                link: 'https://www.autoscout24.pl/oferta/mercedes-benz-230-benzyna-bialy-7b2e3c2a-4ebe-48f9-be45-7dbf92c870a9',
                price: '€ 7 500,-',
                time: '12/1987'
            },
        ]

        let savedCars = await Promise.all([
            CarService.saveCars(autoscoutData, "autoscout"),
            // CarService.saveCars(olxData, "olx"),
            // CarService.saveCars(autoscountData, "autoscout"),
        ]);

        console.log(savedCars);

        // return [otomotoData, olxData, autoscountData];
    } catch (err) {
        throw err;
    }
};

module.exports = { scrapeCarse, scrapeSchedule };