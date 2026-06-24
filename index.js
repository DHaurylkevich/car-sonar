import "dotenv/config";
import parserManager from "./src/parser/index.js";
import { defaultAttributes } from "./src/db/services/attributeService.js"
import bot from "./src/bot/index.js";
import { connectToDB } from "./src/db/index.js";

try {
    connectToDB();
    bot.launch();
    // await defaultAttributes()x
    // const parser = new parserManager();
    // let newCarData = await parser.parsingAllSite();
} catch (error) {
    console.log(error);
} finally {
    console.log("Parser and bot launched");
    // bot.launch();
    // ParserManager.run();
}
