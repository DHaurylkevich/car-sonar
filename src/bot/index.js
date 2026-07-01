import { Telegraf, session } from "telegraf";
import { createFiltersMenuList } from "./services/filtersServices.js";
import { createMenuHandlers } from "./handler/menuHandler.js";
import { filterHandler } from "./handler/filterHandler.js";
import { groupSectionHandler } from "./handler/groupSectionHandler.js";
import { moveButtonHandler } from "./handler/moveButtonHandler.js";
import { DEFAULT_COMMANDS } from "./constants/commands.js";
import { DEFAULT_FILTERS } from "./constants/filters.js";

import { logger } from "../utils/logger.js"

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());
// bot.use(Telegraf.log());

const defaultSession = () => ({
    inventory: { ...DEFAULT_FILTERS }, //контейнер для сохранения значений
    mainInv: null, //Инвентар по которому сравнивают значения добавленные в inventory
    requests: [],
    pages: {
        page: 0,
        listAttr: [],
        back: "",
        text: "",
        key: "",
    },
    isPremium: false,
    wasChosen: false,
});

bot.use((ctx, next) => {
    if (!ctx.session) ctx.session = defaultSession();
    return next();
});

bot.telegram.setMyCommands(DEFAULT_COMMANDS);

await createFiltersMenuList();

createMenuHandlers(bot);
moveButtonHandler(bot);
groupSectionHandler(bot);
filterHandler(bot);

bot.catch(async (err, ctx) => {
    const userId = ctx.from?.id ?? "unknown";

    // Handle specific Telegram errors
    if (err.message && err.message.includes("query is too old")) {
        logger.warn(`[User ${userId}] Query timeout - query is too old`);
        return;
    }

    if (err.response?.error_code === 403) {
        logger.warn(`[User ${userId}] Bot was blocked by user`);
        return;
    }

    if (err.response?.error_code === 400) {
        logger.warn(`[User ${userId}] Bad request: ${err.response?.description}`);
        return;
    }

    logger.error(`[User ${userId}] Unhandled bot error:`, {
        message: err.message,
        code: err.response?.error_code,
        description: err.response?.description
    });

    try {
        ctx.answerCbQuery("Unexpected error. Please try again.");
    } catch (answerErr) {
        logger.error(`[User ${userId}] Failed to answer callback query:`, answerErr);
    }
});

export default bot;