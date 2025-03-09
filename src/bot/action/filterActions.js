const MenuService = require("../services/menuServices");

const filter = (bot) => {
    bot.action(/filters_(\w+)/, async (ctx) => {
        await MenuService.filtersMenu(ctx);
    });

    bot.action(/set_(\d+)/, async (ctx) => {
        MenuService.chooseFilter(ctx);
    });

    bot.action(/reset/, async (ctx) => {
        MenuService.resetFilter(ctx);
    });

    bot.on("text", async (ctx) => {
        try {
            MenuService.textCheck(ctx);
        } catch (e) {
            console.error(e);
        }
    });
};

module.exports = filter;