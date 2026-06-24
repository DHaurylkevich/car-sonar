import { getBasicUserData, resetBot } from "../services/menuServices.js";
import { showMainMenu } from "../ui/mainMenuUI.js";
import { addOrSetRequest } from "../../db/services/requestsService.js";

const menuHandler = async (ctx) => {
    const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
    const { isExist, isPremium, userRequests } = await getBasicUserData(message.chat.id, message.chat.username);

    ctx.session.requests = userRequests;
    ctx.session.pages.page = 0;
    ctx.session.isPremium = isPremium;

    showMainMenu(ctx, message, isExist);
};

export const createMenuHandlers = (bot) => {
    bot.command(["start", "menu"], async (ctx) => {
        await menuHandler(ctx);
    });

    bot.action("menu", async (ctx) => {
        await menuHandler(ctx);
    });

    bot.action("save", async (ctx) => {
        console.log(ctx.session.inventory);

        const notEmpty = Object.values(ctx.session.inventory).some(item => Boolean(item));
        if (notEmpty) {
            await addOrSetRequest(ctx.session.inventory, ctx.callbackQuery.message.chat.id);
            await menuHandler(ctx);
            ctx.session.pages.listAttr = [];
            ctx.session.wasChosen = false;
            ctx.session.pages.back = "";
            ctx.answerCbQuery("Success!");
            return;
        }

        ctx.answerCbQuery("Please fill all fields!");
        return;
    });

    bot.action("stop_bot", async (ctx) => {
        await resetBot(ctx);
        ctx.reply("Thank you for using our bot!");
        ctx.answerCbQuery("Request deleted successfully");
    });

    bot.command("stop", async (ctx) => {
        await resetBot(ctx);
        ctx.reply("Thank you for using our bot!");
    });

    bot.action("get_premium", async (ctx) => {
        // const message = ctx.message;
        // await resetUser(message.chat.id);
        // await ctx.telegram.deleteMessage(message.chat.id, message.message_id);

        // ctx.session.pages.listAttr = [];
        // ctx.session.inventory = [];
        // ctx.session.requests = [];

        ctx.answerCbQuery("Sorry, in progress yet!");
    });

    // bot.command("searching", async (ctx) => {
    // const chatId = ctx.callbackQuery.message.chat.id;
    // const chatId = ctx.message.chat.id;
    // await ctx.telegram.deleteMessage(chatId, ctx.callbackQuery.message.message_id);

    // const message = await ctx.reply("Wait seconds");
    // postMessageId = message.message_id;
    // await parser.schedule(ctx);

    // await ctx.telegram.deleteMessage(chatId, ctx.message.message_id);
    // await ctx.telegram.deleteMessage(chatId, postMessageId);
    // await ctx.answerCbQuery();
    // });
};