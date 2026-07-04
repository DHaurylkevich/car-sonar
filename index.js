import "dotenv/config";
import { connectToDB } from "./src/db/index.js";
import bot from "./src/bot/index.js";
import parserManager from "./src/parser/index.js";
import cron from 'node-cron';
import { sendMessage } from "./src/bot/services/messageService.js";
import { defaultAttributes } from "./src/db/services/attributeService.js"
import { logger } from "./src/utils/logger.js";

const PARSE_CRON = process.env.PARSE_CRON || '0/10 0 * * *';
/* Загрузить дефолтные значения
* await defaultAttributes();
*/

try {
    await connectToDB();
    const parser = new parserManager();

    let parsingTask = cron.schedule(PARSE_CRON, parser.parsingCycle);

    logger.info("Parser and bot launched");

    process.on("SIGINT", () => {
        parsingTask.stop();
        bot.stop("SIGINT");
    });
    process.on("SIGTERM", () => {
        parsingTask.stop();
        bot.stop("SIGTERM");
    });

    logger.info("Bot starting, parsing scheduled :", PARSE_CRON);
    parser.parsingCycle(bot);

    await bot.launch();
} catch (error) {
    logger.error(error);
    process.exit(1);
}