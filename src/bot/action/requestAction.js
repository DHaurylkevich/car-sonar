const FilterManager = require("../filtersManager");
const MenuService = require("../services/menuServices");

const request = (bot) => {
    bot.action("requests", async (ctx) => {
        await MenuService.requestsMenu(ctx);
    });

    bot.action("create_request", async (ctx) => {
        ctx.session.pages.back = "create_request";
        if(!ctx.session.wasChosen){
            ctx.session.inventory = { ...FilterManager.DEFAULT_FILTERS };
        }

        await MenuService.filtersTypeMenu(ctx, "Create new request!\n");
    });

    bot.action(/show_request_(\d+)/, (ctx) => {
        MenuService.showRequestFilters(ctx);
    });

    bot.action(/edit_request_(\d+)/, async (ctx) => {
        const requestId = Number(ctx.match[1]);
        const request = ctx.session.requests.find(request => request.id === requestId);
        ctx.session.pages.back = "edit_request_" + requestId;

        if (ctx.session.inventory.id !== requestId) {
            ctx.session.inventory = { ...request };
        }

        ctx.answerCbQuery("Editing...");
        await MenuService.filtersTypeMenu(ctx, "Edit your request!\n");
    });

    bot.action(/delete_request_(\d+)/, async (ctx) => {
        await MenuService.deleteRequest(ctx);
    });
};

module.exports = request;