const { Markup } = require("telegraf");

const mainMenu = async (ctx) => {
    const message = ctx.message ? ctx.message : ctx.callbackQuery.message;

    let text = message.text === "/start" ? "Hello! I'm a car search bot. " : ""
    text += "Please choose what you want to do:";

    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback("Filters", "filters"),
        Markup.button.callback("Parser", "parser"),
        Markup.button.callback("Stop searching", "stop", true), //TODO: check if user looking for car
    ]).resize()


    if (message.text === "/start" || message.text === "/menu") {
        await ctx.reply(text, keyboard);
        await ctx.deleteMessage(message.message_id)
    } else {
        await ctx.editMessageText(text, keyboard);
        await ctx.answerCbQuery();
    }
};

module.exports = mainMenu;