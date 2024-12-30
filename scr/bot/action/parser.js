const { scrapeCarse, scrapeSchedule } = require("../../services/parserService");
const { updateRequest } = require("../../services/requestsService");
const { getUserMessageId, updateUser } = require("../../services/userService");

const parser = {
    action: async (bot) => {
        bot.action("parser", async (ctx) => {
            const chatId = ctx.callbackQuery?.message?.chat.id;
            // editMessageCaption
            let postMessageId = await getUserMessageId(chatId);
            if (postMessageId.post_message_id) {
                await ctx.telegram.deleteMessage(chatId, postMessageId.post_message_id);
            }

            const message = await ctx.reply("Wait seconds");
            postMessageId = message.message_id;

            try {
                console.log(ctx.session.filter);
                const parserData = await scrapeCarse(true, ctx.session.filter);
                const messageData = `
                Name: ${parserData.name}
Price: ${parserData.price}
Time: ${parserData.time}
Link: ${parserData.link}
            `;
                const newMessage = await ctx.replyWithPhoto(parserData.photo, { caption: messageData });

                await ctx.telegram.deleteMessage(chatId, postMessageId);
                await updateUser({ postMessageId: newMessage.message_id, telegram_id: chatId });
                await ctx.answerCbQuery()

            } catch (err) {
                console.error("PARSER ERROR");
                await ctx.telegram.editMessageText(chatId, postMessageId, null, "Error: " + err.message);
            }
        })
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

                const messageData = `
                    Name: ${result.parse.name || "Неизвестно"}
                    Price: ${result.parse.price || "Не указана"}
                    Time: ${result.parse.time || "Неизвестно"}
                    Link: ${result.parse.link || "Не предоставлена"}
                    `;

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

        } catch (error) {
            console.error("Ошибка выполнения парсинга:", error.message);
        }
    }
};
module.exports = parser;