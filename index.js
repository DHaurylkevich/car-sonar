import "dotenv/config";
import cron from "node-cron";
import parserManager from "./src/parser/index.js";
import { defaultAttributes } from "./src/db/services/attributeService.js"
import bot from "./src/bot/index.js";
import { connectToDB } from "./src/db/index.js";
import { sendMessage } from "./src/bot/services/messageService.js";
import { logger } from "./src/utils/logger.js";

const PARSE_CRON = process.env.PARSE_CRON || "*/10 * * * *";

const parser = new parserManager();
let isParsing = false;

async function runParsingCycle() {
    if (isParsing) {
        logger.warn("Previous parsing cycle still running, skipping");
        return;
    }

    isParsing = true;
    try {
        const messageData = await parser.startParsing();
        await sendMessage(bot, messageData);
        logger.info("Parsing cycle finished");
    } catch (error) {
        logger.error(`Parsing cycle failed: ${error.message}`);
    } finally {
        isParsing = false;
    }
}

try {
    await connectToDB();

    /* Загрузить дефолтные значения
    * await defaultAttributes();
    */

    const parsingTask = cron.schedule(PARSE_CRON, runParsingCycle);

    process.once("SIGINT", () => {
        parsingTask.stop();
        bot.stop("SIGINT");
    });
    process.once("SIGTERM", () => {
        parsingTask.stop();
        bot.stop("SIGTERM");
    });

    logger.info(`Bot starting, parsing scheduled: "${PARSE_CRON}"`);
    runParsingCycle();

    // bot.launch() резолвится только при остановке бота, поэтому await стоит последним
    await bot.launch();
} catch (error) {
    logger.error(error);
    process.exit(1);
}
