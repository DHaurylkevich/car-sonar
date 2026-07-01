import { getBasicUserData, resetBot } from "../services/menuServices.js";
import { showMainMenu } from "../ui/mainMenuUI.js";
import { addOrSetRequest } from "../../db/services/requestsService.js";
import { logger } from "../../utils/logger.js";

const menuHandler = async (ctx) => {
    const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
    const { isExist, isPremium } = await getBasicUserData(message.chat.id, message.chat.username);

    // ctx.session.requests = userRequests;
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

    bot.action("stop_bot", async (ctx) => {
        try {
            const userId = ctx.from?.id ?? "unknown";
            await resetBot(ctx);
            ctx.reply("Thank you for using our bot!");
            ctx.answerCbQuery("Request deleted successfully");
            logger.info(`[User ${userId}] Bot stopped by user`);
        } catch (err) {
            const userId = ctx.from?.id ?? "unknown";
            logger.error(`[User ${userId}] Error in stop_bot:`, err);
            ctx.answerCbQuery("Error: Failed to delete bot data.");
        }
    });

    bot.command("stop", async (ctx) => {
        await resetBot(ctx);
        ctx.reply("Thank you for using our bot!");
    });

    bot.action("get_premium", async (ctx) => {
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