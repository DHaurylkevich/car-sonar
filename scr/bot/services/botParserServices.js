const { scrapeCarse, scrapeSchedule } = require("../../services/parserService");
const { getRequestsUnique } = require("../../services/requestsService");

const parser = {
    action: async (ctx) => {
        try {
            const chatId = ctx.callbackQuery.message.chat.id;
            await ctx.telegram.deleteMessage(chatId, ctx.session.lastMessage);

            const message = await ctx.reply("Wait seconds");
            postMessageId = message.message_id;

            const parserData = await scrapeCarse(ctx.session.inventory);

            for (const item of parserData) {
                const messageData = `\nName: ${item[0].name}\nPrice: ${item[0].price}\nTime: ${item[0].time}\nLink: ${item[0].link}`;
                await ctx.replyWithPhoto(item[0].photo, { caption: messageData });
            };

            await ctx.telegram.deleteMessage(chatId, postMessageId);
            await ctx.answerCbQuery();
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
            await scrapeSchedule();

            const requests = await getRequestsUnique(newCars);

            // if (!parserRequests || parserRequests.length === 0) {
            //     console.log("No data for send");
            //     return;
            // }

            // const messages = [];
            // const updateData = [];

            // for (const request of parserRequests) {
            //     const parseCars = request.parse;
            //     for (const car of parseCars) {
            //         if (car.link !== request[car.domain]) {
            //             const formattedTime = car.time ? new Date(car.time).toLocaleString("pl-PL") : "No time available";
            //             const messageText = `\n📌 Name: ${car.name}\n💰 Price: ${car.price}\n⏰ Time: ${formattedTime}\n🔗 Link: ${car.link}`;

            //             const existingData = updateData.find(item => item.id === request.id);
            //             if (!existingData) {
            //                 updateData.push({
            //                     id: request.id,
            //                     [car.domain]: car.link
            //                 });
            //             } else {
            //                 existingData[car.domain] = car.link;
            //             }

            //             for (const userId of request.userIds) {
            //                 messages.push({ userId, photo: car.photo || "https://via.placeholder.com/150", caption: messageText });
            //             }
            //         }
            //     }
            // }

            // const messagesPromises = messages.map(message =>
            //     bot.telegram.sendPhoto(
            //         message.userId,
            //         message.photo,
            //         { caption: message.caption }
            //     )
            // );

            // await Promise.all(messagesPromises);

        } catch (err) {
            throw err;
        }
    }
};

module.exports = parser;