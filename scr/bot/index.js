require("dotenv").config();

const cron = require("node-cron");
const { Telegraf, session } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const menu = require("./components/menu");

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

bot.telegram.setMyCommands([
    { command: "start", description: "Запуск бота" },
    { command: "menu", description: "Открыть меню" },
    { command: "stop", description: "Остановить поиск" }
]);

menu(bot);

// const task = cron.schedule("*/1 * * * *", async () => {
//     try {
//         console.log("Начало выполнения задачи...");
//         await parser.schedule(bot);
//     } catch (error) {
//         console.error("Ошибка при выполнении задачи:", error);
//     }
// });
// task.start();

// bot.catch(async (err, ctx) => {
//     if (ctx.callbackQuery?.message?.chat.id || ctx.message?.chat.id) {
//         const chatId = ctx.callbackQuery.message.chat.id;
//         let postMessageId = await getUserMessageId(chatId);
//         console.log("ERROR");
//         if (postMessageId.post_message_id) {
//             await ctx.telegram.editMessageText(chatId, postMessageId.post_message_id, null, "An error occurred.");
//         }
//     } else {
//         const message = await ctx.reply("Error");
//         await updateUser({ postMessageId: message.message_id, telegram_id: message.chat.id });
//     }
// });

bot.launch();
process.once("SIGINT", () => { bot.stop("SIGINT") });
process.once("SIGTERM", () => { bot.stop("SIGTERM") });