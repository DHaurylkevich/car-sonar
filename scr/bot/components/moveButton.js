const createKeyboard = require("./createKeyboard");

const moveButton = async (bot) => {
    bot.action("prev", async (ctx) => {
        if (ctx.session.pages.page === 0)
            return await ctx.answerCbQuery("Already on last page!");
        ctx.session.pages.page -= 12;

        const keyboard = createKeyboard.listKeyboard(ctx.session.pages, ctx.session.filters);
        await ctx.editMessageText(
            ctx.session.pages.text,
            keyboard
        );
        await ctx.answerCbQuery();
    });

    bot.action("next", async (ctx) => {
        const length = ctx.session.pages.list.length
        if (ctx.session.pages.page >= length)
            return await ctx.answerCbQuery("Already on last page!");

        ctx.session.pages.page += 12;
        ctx.session.pages.page = Math.min(ctx.session.pages.page, ctx.session.pages.list.length)

        const keyboard = createKeyboard.listKeyboard(ctx.session.pages, ctx.session.filters);
        console.log(keyboard);

        await ctx.editMessageText(
            ctx.session.pages.text,
            keyboard
        );
        await ctx.answerCbQuery();
    });
};

module.exports = moveButton;