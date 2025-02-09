require("dotenv").config();
require("../configs/db");

const cron = require("node-cron");
const { Telegraf, session } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const FilterManager = require("../bot/filtersManager")
const menuActions = require("./action/menuActions");
const filterActions = require("./action/filterActions");
const requestAction = require("./action/requestAction");
const moveButtonActions = require("./action/moveButtonActions");

// bot.use(Telegraf.log());

bot.use(session());

bot.use((ctx, next) => {
    if (!ctx.session) {
        ctx.session = {
            inventory: { ...FilterManager.DEFAULT_FILTERS },
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
        };
        FilterManager.filtersMenuList();
    }
    return next();
});

bot.telegram.setMyCommands([
    { command: "start", description: "Запуск бота" },
    { command: "menu", description: "Открыть меню" },
    { command: "stop", description: "Остановить поиск" },
]);

menuActions(bot);
moveButtonActions(bot);
requestAction(bot);
filterActions(bot);

bot.catch(async (err, ctx) => {
    console.error(`Error for user ${ctx.from.id}:`, err);
});

bot.launch();
process.once("SIGINT", () => { bot.stop("SIGINT") });
process.once("SIGTERM", () => { bot.stop("SIGTERM") });