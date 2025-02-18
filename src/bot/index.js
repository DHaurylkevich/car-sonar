require("dotenv").config();
require("../configs/db");

const cron = require("../utils/cron");
const { Telegraf, session } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const FilterManager = require("../bot/filtersManager")
const menuActions = require("./action/menuActions");
const filterActions = require("./action/filterActions");
const requestAction = require("./action/requestAction");
const moveButtonActions = require("./action/moveButtonActions");

bot.use(session());
// bot.use(Telegraf.log());

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

bot.launch();

menuActions(bot);
moveButtonActions(bot);
requestAction(bot);
filterActions(bot);

bot.catch(async (err, ctx) => {
    console.error(`Error for user ${ctx.from.id}:`, err);
});

module.exports = bot;