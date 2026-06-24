import { manageBackButton } from "../ui/buttonUI.js";

export const moveButtonHandler = (bot) => {
    bot.action(/prev_(\w+)/, (ctx) => {
        if (ctx.session.pages.page < 12)
            return ctx.answerCbQuery("Already on first page!");

        ctx.session.pages.page -= 12;
        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;

        // manageBackButton(ctx, ctx.session.pages, ctx.session.inventory, ctx.match[1]);
        manageBackButton(ctx, ctx.session.pages, ctx.session.inventory[ctx.match[1]], ctx.match[1], message.chat.id, ctx.session.lastMessage);
    });

    bot.action(/next_(\w+)/, (ctx) => {
        const length = ctx.session.pages.listAttr.length;

        if (ctx.session.pages.page + 12 >= length)
            return ctx.answerCbQuery("Already on last page!");

        ctx.session.pages.page += 12;
        // ctx.session.pages.page = Math.min(ctx.session.pages.page, length);
        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;

        manageBackButton(ctx, ctx.session.pages, ctx.session.inventory[ctx.match[1]], ctx.match[1], message.chat.id, ctx.session.lastMessage);
    });
};