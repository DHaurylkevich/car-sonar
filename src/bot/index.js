require("dotenv").config();
require("../configs/db");

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
    { command: "start", description: "Start Bot" },
    { command: "menu", description: "Open main menu" },
    { command: "stop", description: "Stop researching" },
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