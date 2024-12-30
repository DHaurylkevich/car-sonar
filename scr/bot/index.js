require("dotenv").config();

const cron = require("node-cron");
const { Telegraf, session } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const filtersAction = require("./action/filters");
const parser = require("./action/parser");
const { getUserMessageId, updateUser, createUser } = require("../services/userService");
const { createOrUpdateRequest } = require("../services/requestsService");
const startPage = require("./components/basicComponent");
const moveButton = require("./components/moveButton");

require("../configs/db");
// bot.use(Telegraf.log());

bot.use(session());

bot.use((ctx, next) => {
    if (!ctx.session) {
        ctx.session = {
            filters: {
                brand: [],
                model: [],
                generation: [],
                city: [],
                fuelType: [],
                yearFrom: [],
                yearTo: [],
                mileageFrom: [],
                mileageTo: [],
                priceFrom: [],
                priceTo: [],
            },
            pages: {
                page: 0,
                list: [],
                back: "",
                text: "",
                key: "",
            },
        };
    }
    return next();
});

bot.start(async (ctx) => {
    await startPage(ctx);
    await createUser({ telegram_id: ctx.message.chat.id, username: ctx.message.chat.username }, ctx.session.filters);
});

bot.action("back", async (ctx) => {
    await startPage(ctx);
    await createUser({ telegram_id: ctx.callbackQuery.message.chat.id, username: ctx.callbackQuery.message.chat.username }, ctx.session.filters);
    console.log("Сессия после 'back':", ctx.session);
});

bot.action("save", async (ctx) => {
    await createOrUpdateRequest(ctx.session.filters, ctx.callbackQuery.message.chat.id)
    await startPage(ctx);
    await createUser({ telegram_id: ctx.callbackQuery.message.chat.id, username: ctx.callbackQuery.message.chat.username }, ctx.session.filters);
    console.log("Фильтры сохранены:", ctx.session.filters);

});

moveButton.prev(bot);
moveButton.next(bot);

filtersAction(bot);

parser.action(bot);

cron.schedule("*/5 * * * *", async () => {
    try {
        console.log("Начало выполнения задачи...");
        await parser.schedule(bot);
    } catch (error) {
        console.error("Ошибка при выполнении задачи:", error);
    }
});

bot.catch(async (err, ctx) => {
    console.error('Error:', err);

    let chatId;
    if (ctx.callbackQuery?.message?.chat.id) {
        chatId = ctx.callbackQuery.message.chat.id;
        let postMessageId = await getUserMessageId(chatId);
        console.log("ERROR");
        if (postMessageId.post_message_id) {
            await ctx.telegram.editMessageText(chatId, postMessageId.post_message_id, null, "An error occurred.");
        }
    } else {
        const message = await ctx.reply("Error");
        // await updateUser({ postMessageId: message.message_id, telegram_id: message.chat.id });
    }
});

// app.use(bot.webhookCallback("/webhook"));

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));