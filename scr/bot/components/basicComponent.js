const { Markup } = require("telegraf");

module.exports = async (ctx) => {
    const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
    if (message.text === "/start") {
        await ctx.reply(
            "Hello! I'm a car search bot. Please choose what you want to do:",
            Markup.inlineKeyboard([
                Markup.button.callback("Filters", "filters"),
                Markup.button.callback("Parser", "parser"),
            ])
                .oneTime()
                .resize()
        );
        await ctx.deleteMessage(message.message_id);
    } else {
        await ctx.editMessageText(
            "Hello! I'm a car search bot. Please choose what you want to do:",
            Markup.inlineKeyboard([
                Markup.button.callback("Filters", "filters"),
                Markup.button.callback("Parser", "parser"),
            ])
                .oneTime()
                .resize()
        );
        await ctx.answerCbQuery();
    }
}