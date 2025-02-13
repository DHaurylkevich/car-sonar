const MenuService = require("../services/menuServices");
const cron = require("node-cron");

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

    // parser.schedule(bot);
    // const task = cron.schedule("*/1 * * * *", async () => {
    //     try {
    //         console.log("Start tasks...");
            // await parser.schedule(bot);
    //     } catch (error) {
    //         console.error("Error with working task:", error);
    //         ctx.reply("Sorry, there was an error while searching for cars.");
    //     }
    // });
    // task.start();
    // process.once("SIGINT", () => { task.stop() });
};

module.exports = filter;