import "dotenv/config";
import parserManager from "./src/parser/index.js";
import bot from "./src/bot/index.js";
// import "./src/db/index.js";

// Сделать запуск бота и парсера в разных потоках и закрытие потоков при завершении работы, 
// Сделать, чтобы при ошибке в боте, он не завершал свою работу 

try {
    bot.launch();
    const parser = new parserManager();
    let newCarData = await parser.parsingAllSite();

} catch (error) {
    console.log(error);
} finally {
    console.log("Parser and bot launched");
    // bot.launch();
    // ParserManager.run();
}
