const { scrapeCarse, scrapeSchedule } = require("../../services/parserService");
const { updateRequest } = require("../../services/requestsService");
const { getUserMessageId, updateUser } = require("../../services/userService");

const parser = {
    action: async (ctx) => {
        try {
            const chatId = ctx.callbackQuery.message.chat.id;

            if (ctx.session.lastMessage) {
                await ctx.telegram.deleteMessage(chatId, ctx.session.lastMessage);
                ctx.session.lastMessage = null;
            }

            const message = await ctx.reply("Wait seconds");
            postMessageId = message.message_id;

            const parserData = await scrapeCarse(ctx.session.filters);
            console.log(parserData)
            //TODO: отправлять сразу несколько сообщений
            const messageData = `\nName: ${parserData.name}\nPrice: ${parserData.price}\nTime: ${parserData.time}\nLink: ${parserData.link}`;

            const newMessage = await ctx.replyWithPhoto(parserData.photo, { caption: messageData });

            await ctx.telegram.deleteMessage(chatId, postMessageId);
            ctx.session.lastMessage = newMessage.message_id
            await ctx.answerCbQuery()
        } catch (err) {
            console.error(err);
            if (postMessageId) {
                await ctx.telegram.editMessageText(ctx.callbackQuery.message.chat.id, postMessageId, null, "Error: " + err.message);
            } else {
                await ctx.reply("Error: " + err.message);
            }
        }
    },
    schedule: async (bot) => {
        try {
            const results = await scrapeSchedule();

            if (!results || results.length === 0) {
                await ctx.reply("Нет данных для отправки.");
                return;
            }

            for (const result of results) {
                if (!result.parse || !result.userIds || !Array.isArray(result.userIds)) {
                    console.warn("Нет данных для отправки:", result);
                    continue;
                }
                const formattedTime = result.parse.time ? new Date(result.parse.time).toLocaleString("pl-PL") : "Неизвестно";

                const messageData = `
                    Name: ${result.parse.name || "Неизвестно"}
Price: ${result.parse.price || "Не указана"}
Time: ${formattedTime || "Неизвестно"}
Link: ${result.parse.link || "Не предоставлена"}`;

                for (const userId of result.userIds) {
                    try {
                        await bot.telegram.sendPhoto(
                            userId,
                            result.parse.photo || "https://via.placeholder.com/150",
                            { caption: messageData }
                        );
                    } catch (sendError) {
                        console.error(`Ошибка отправки пользователю ${userId}:`, sendError.message);
                    }
                }

                try {
                    await updateRequest(result.id, result.parse.time);
                } catch (updateError) {
                    console.error(`Ошибка обновления для результата ${result.id}:`, updateError.message);
                }
            }

        } catch (err) {
            throw err;
        }
    }
};

module.exports = parser;