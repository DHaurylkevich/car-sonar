import "dotenv/config";
import parserManager from "./src/parser/index.js";
import { defaultAttributes } from "./src/db/services/attributeService.js"
import bot from "./src/bot/index.js";
import { connectToDB } from "./src/db/index.js";
import { sendMessage } from "./src/bot/services/messageService.js";

try {
    await connectToDB();
    await bot.launch();
    const parser = new parserManager();

    /* Загрузить дефолтные значения
    * await defaultAttributes();
    */

    // Парсинг данных
    const messageData = await parser.startParsing();

    // Отправить пользователям
    await sendMessage(bot, messageData);

    // повторить через время
    console.log("Parser and bot launched");
} catch (error) {
    console.log(error);
}