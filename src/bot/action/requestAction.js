const MenuFactory = require("../components/menuFactory");
const FilterManager = require("../filtersManager");
const MenuService = require("../services/menuServices");
const { deleteUserRequest } = require("../../services/requestsService");

const request = (bot) => {
    bot.action("requests", async (ctx) => {
        try {
            ctx.session.inventory = { ...FilterManager.DEFAULT_FILTERS };
            let text = "📋 Your requests:\n";

            const requests = ctx.session.requests;
            ctx.session.pages.page = 0;
            if (!requests?.length) {
                text += "List empty. Click 'Create new'";
            }

            await ctx.editMessageText(text, MenuFactory.createRequestMenu(requests, ctx.session.pages.page));
            ctx.answerCbQuery();
        } catch (e) {
            console.error('Error updating message:', e.message);
        }
    });

    bot.action("create_request", async (ctx) => {
        ctx.session.pages.back = "create_request";
        await MenuService.filtersListMenu(ctx, "Create new request!\n");
    });

    bot.action(/show_request_(\d+)/, async (ctx) => {
        MenuService.showRequestFilters(ctx);
    });

    bot.action(/edit_request_(\d+)/, async (ctx) => {
        const requestId = Number(ctx.match[1]);
        const request = ctx.session.requests.find(request => request.id === requestId);
        ctx.session.pages.back = "edit_request_" + requestId;

        ctx.session.inventory = request;
        ctx.answerCbQuery("Editing...");

        await MenuService.filtersListMenu(ctx, "Edit your request!\n");
    });

    bot.action(/delete_request_(\d+)/, async (ctx) => {
        const requestId = Number(ctx.match[1]);
        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        let text = "📋 Your requests:\n";

        ctx.session.requests = ctx.session.requests.find(req => req.id !== requestId);
        if (ctx.session.requests === undefined) {
            ctx.session.requests = [];
            text += "List empty. Click 'Create new'";
        }

        await deleteUserRequest(message.chat.id, requestId);

        await ctx.answerCbQuery("Request delete!");
        await ctx.editMessageText(text, MenuFactory.createRequestMenu(ctx.session.requests, ctx.session.pages.page));
    });
};

module.exports = request;