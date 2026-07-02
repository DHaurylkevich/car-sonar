import "dotenv/config";
import parserManager from "./src/parser/index.js";
import { defaultAttributes } from "./src/db/services/attributeService.js"
import bot from "./src/bot/index.js";
import { connectToDB } from "./src/db/index.js";
import { saveCars } from "./src/db/services/carService.js";

async function startParsing() {
    // const parser = new parserManager();
    // let newCarData = await parser.parsingAllSite();

    let newCarData = [
        {
            link: 'https://www.otomoto.pl/osobowe/oferta/volkswagen-t-roc-ID6I8NfG.html',
            photo: 'https://ireland.apollo.olxcdn.com/v1/files/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmbiI6Imo3dDdzYnN3MmJhajMtT1RPTU9UT1BMIiwidyI6W3siZm4iOiJ3ZzRnbnFwNnkxZi1PVE9NT1RPUEwiLCJzIjoiMTYiLCJhIjoiMCIsInAiOiIxMCwtMTAifV19.iK60H3z05idJqqV1elUPSidAbhyy6VhXY8shogTOIfQ/image;s=360x0;q=80',
            name: 'Volkswagen T-Roc',
            brand: 'Volkswagen',
            model: 'T-Roc',
            generation: 'SUV',
            fuelTypes: 'Diesel',
            year: 2019,
            mileage: 157790,
            price: 59500
        },
        {
            link: 'https://www.olx.pl/d/oferta/opel-corsa-klimatyzacja-1-0-CID5-ID1bcYra.html?search_reason=search%7Corganic',
            photo: 'https://ireland.apollo.olxcdn.com:443/v1/files/bk32a45rst9j3-PL/image;s=389x272',
            name: 'Opel corsa Klimatyzacja 1.0',
            price: 4900,
            brand: 'Opel',
            model: 'Corsa',
            year: 2009,
            fuelTypes: 'Benzyna',
            generation: 'Hatchback',
            mileage: 184000
        }
    ];

    // Загрузить все машины в БД
    await saveCars(newCarData);
    // получить нужные машины с бд вместе с id чатов

    // вернуть массив с машинами и id чатов
    return newCarData;
}

try {
    connectToDB();
    bot.launch();
    // await defaultAttributes(); - Загрузить дефолтные значения

    const carAndUser = await startParsing();
    console.log(carAndUser);
    // Отправить пользователям
    // вывести сообщение в лог
    // повторить через время
} catch (error) {
    console.log(error);
} finally {
    console.log("Parser and bot launched");
    // bot.launch();
    // ParserManager.run();
}
