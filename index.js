import "dotenv/config";
import cron from "node-cron";
import { connectToDB } from "./src/db/index.js";
import bot from "./src/bot/index.js";
import parserManager from "./src/parser/index.js";
import { logger } from "./src/utils/logger.js";

const PARSE_CRON = process.env.PARSE_CRON || "*/8 * * * *";

// Глобальный обработчик unhandled promise rejections — предотвращает падение процесса
process.on("unhandledRejection", (reason) => {
    const message = reason?.message ?? reason;
    // Игнорируем частые Telegram-ошибки (они обрабатываются в safeEditMessageText)
    if (typeof message === "string" && message.includes("message is not modified")) {
        return;
    }
    logger.warn(`Unhandled rejection: ${message}`);
});

try {
    await connectToDB();
    bot.launch();

    const parser = new parserManager();

    // Первый запуск сразу при старте
    await parser.parsingCycle(bot);

    // Запуск по расписанию каждые 8 минут
    const parsingTask = cron.schedule(PARSE_CRON, () => {
        parser.parsingCycle(bot);
    });

    logger.info(`Parser scheduled with cron: ${PARSE_CRON}`);

    process.on("SIGINT", () => {
        parsingTask.stop();
        bot.stop("SIGINT");
    });
    process.on("SIGTERM", () => {
        parsingTask.stop();
        bot.stop("SIGTERM");
    });
} catch (error) {
    logger.error(error);
    process.exit(1);
}