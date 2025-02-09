const MenuServices = require("../services/menuServices");
const { addOrSetRequest, resetUser } = require("../../services/requestsService");
const parser = require("../services/botParserServices");

const menubar = async (bot) => {
    bot.command(["start", "menu"], async (ctx) => {
        await MenuServices.basicMenu(ctx);
    });

    bot.action("menu", async (ctx) => {
        await MenuServices.basicMenu(ctx);
    });

    bot.action("save", async (ctx) => {
        await addOrSetRequest(ctx.session.inventory, ctx.callbackQuery.message.chat.id);
        await MenuServices.basicMenu(ctx);
        ctx.session.pages.listAttr = [];
        ctx.session.wasChosen = false;
    });

    bot.action("stop_bot", async (ctx) => {
        const message = ctx.callbackQuery.message;
        await resetUser(message.chat.id);
        await ctx.telegram.deleteMessage(message.chat.id, message.message_id);

        ctx.session.pages.listAttr = [];
        ctx.session.inventory = [];
        ctx.session.requests = [];

        ctx.reply("Спасибо за использование нашего бота!");
        ctx.answerCbQuery("Успешно удалено");
    });

    bot.command("stop", async (ctx) => {
        const message = ctx.message;
        await resetUser(message.chat.id);
        await ctx.telegram.deleteMessage(message.chat.id, message.message_id);

        ctx.session.pages.listAttr = [];
        ctx.session.inventory = [];
        ctx.session.requests = [];

        ctx.reply("Спасибо за использование нашего бота!");
    });

    bot.command("searching", async (ctx) => {
        // const chatId = ctx.callbackQuery.message.chat.id;
        const chatId = ctx.message.chat.id;
        // await ctx.telegram.deleteMessage(chatId, ctx.callbackQuery.message.message_id);

        // const message = await ctx.reply("Wait seconds");
        // postMessageId = message.message_id;
        await parser.schedule(ctx);

        await ctx.telegram.deleteMessage(chatId, ctx.message.message_id);
        // await ctx.telegram.deleteMessage(chatId, postMessageId);
        // await ctx.answerCbQuery();
    });
};

module.exports = menubar;