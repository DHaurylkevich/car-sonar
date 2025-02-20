const MenuFactory = require("../components/menuFactory");

const moveButton = (bot) => {
    bot.action(/prev_(\w+)/, (ctx) => {
        const pageName = ctx.match[1];

        if (ctx.session.pages.page < 12)
            return ctx.answerCbQuery("Already on first page!");

        ctx.session.pages.page -= 12;

        let keyboard;
        if (pageName === "filters") {
            keyboard = MenuFactory.createFiltersChooseMenu(ctx.session.pages.listAttr, ctx.session.pages.page, ctx.session.inventory[ctx.session.pages.key]);
        } else {
            keyboard = MenuFactory.createRequestMenu(ctx.session.pages.listAttr, ctx.session.pages.page);
        }

        ctx.editMessageText(ctx.session.pages.text, keyboard);
        ctx.answerCbQuery();
    });

    bot.action(/next_(\w+)/, (ctx) => {
        const pageName = ctx.match[1];
        const length = ctx.session.pages.listAttr.length;

        if (ctx.session.pages.page + 12 >= length)
            return ctx.answerCbQuery("Already on last page!");

        ctx.session.pages.page += 12;
        ctx.session.pages.page = Math.min(ctx.session.pages.page, length)

        let keyboard;
        if (pageName === "filters") {
            keyboard = MenuFactory.createFiltersChooseMenu(ctx.session.pages.listAttr, ctx.session.pages.page, ctx.session.inventory[ctx.session.pages.key]);
        } else {
            keyboard = MenuFactory.createRequestMenu(ctx.session.pages.listAttr, ctx.session.pages.page);
        }

        ctx.editMessageText(ctx.session.pages.text, keyboard);
        ctx.answerCbQuery();
    });
};

module.exports = moveButton;