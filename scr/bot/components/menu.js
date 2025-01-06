const { createOrGetUser } = require("../../services/userService");
const { createOrUpdateRequest } = require("../../services/requestsService");
const mainMenu = require("./basicComponent");
const filtersAction = require("../action/filters");
const parser = require("../action/parser");
const moveButton = require("./moveButton");

const menubar = async (bot) => {
    bot.command(["start", "menu"], async (ctx) => {
        await mainMenu(ctx);
        await createOrGetUser({ telegram_id: ctx.message.chat.id, username: ctx.message.chat.username }, ctx.session.filters);
    });

    bot.action("back", async (ctx) => {
        await mainMenu(ctx);
        await createOrGetUser({ telegram_id: ctx.callbackQuery.message.chat.id, username: ctx.callbackQuery.message.chat.username }, ctx.session.filters);
        console.log("Сессия после back:", ctx.session.filters);
    });

    bot.action("save", async (ctx) => {
        await createOrUpdateRequest(ctx.session.filters, ctx.callbackQuery.message.chat.id)
        await mainMenu(ctx);
        await createOrFindUser({ telegram_id: ctx.callbackQuery.message.chat.id, username: ctx.callbackQuery.message.chat.username }, ctx.session.filters);
        console.log("Фильтры сохранены:", ctx.session.filters);
    });

    filtersAction(bot);

    parser.action(bot);

    moveButton(bot);
};

module.exports = menubar;