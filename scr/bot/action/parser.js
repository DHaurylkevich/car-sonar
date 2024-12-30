const { scrapeCarse, scrapeSchedule } = require("../../services/parserService");
const { getUserMessageId, updateUser } = require("../../services/userService");

const parser = {
    action: (bot) => {
        bot.action("parserr", async (ctx) => {
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
        bot.action("parser", async (ctx) => {
            await scrapeSchedule()
            await ctx.answerCbQuery()
        });
    }
};
module.exports = parser;