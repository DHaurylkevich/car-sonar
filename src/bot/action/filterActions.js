const MenuService = require("../services/menuServices");

const filter = (bot) => {
    bot.action(/filters_(\w+)/, async (ctx) => {
        await MenuService.filtersChooseMenu(ctx);
    });

    bot.action(/set_(\d+)/, async (ctx) => {
        MenuService.chooseFilter(ctx);
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