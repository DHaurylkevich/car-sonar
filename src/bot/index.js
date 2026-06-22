import { Telegraf, session } from "telegraf";
import { createFiltersMenuList } from "./services/filtersServices.js";
import { createMenuHandlers } from "./handler/menuHandler.js";
import { filterHandler } from "./handler/filterHandler.js";
import { groupSectionHandler } from "./handler/groupSectionHandler.js";
import { moveButtonHandler } from "./handler/moveButtonHandler.js";
import { DEFAULT_COMMANDS } from "./constants/commands.js";
import { DEFAULT_FILTERS } from "./constants/filters.js";

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());
bot.use(Telegraf.log());

const defaultSession = () => ({
    inventory: { ...DEFAULT_FILTERS },
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
    console.error(`Error for user ${userId}:`, err);
});

export default bot;