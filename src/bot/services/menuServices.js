const { getRequestByUserId, deleteUserRequest } = require("../../services/requestsService");
const { createOrGetUser } = require("../../services/userService");
const MenuFactory = require("../components/menuFactory");
const FilterManager = require("../filtersManager");

const MenuServices = {
    async basicMenu(ctx) {
        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        const { isExist, isPremium } = await createOrGetUser({ telegram_id: message.chat.id, username: message.chat.username });
        ctx.session.requests = isExist ? await getRequestByUserId(message.chat.id) : [];
        ctx.session.pages.page = 0;
        ctx.session.isPremium = isPremium;

        const text = "I'm a car search bot. How can I help you?";
        if (isExist) {
            if (message.text === "/start" || message.text === "/menu") {
                ctx.reply(text, MenuFactory.createMainMenu(isPremium));
                ctx.deleteMessage(message.message_id);
            } else {
                ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, text, MenuFactory.createMainMenu(isPremium));
                ctx.answerCbQuery();
            }
        } else {
            ctx.session.pages.back = "create_request";
            await this.filtersTypeMenu(ctx, "Hello! I'm a car search bot. \n");
            ctx.deleteMessage(message.message_id);
        }
    },
    async filtersTypeMenu(ctx, text = "") {
        if (!ctx.session?.isPremium && ctx.session.requests.length === 1 && ctx.session.pages.back === "create_request") {
            await ctx.answerCbQuery("Regular users can have only one request!");
            return;
        }

        ctx.session.pages.page = 0;

        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        const keyboard = await MenuFactory.createFiltersTypeMenu(ctx.session.wasChosen, ctx.session.requests.length);

        if (message.text !== "/start") {
            ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, text + "Please choose filters what you want:", keyboard);
            ctx.answerCbQuery();
        } else {
            ctx.reply(text + "Please choose filters what you want:", keyboard);
        }
    },
    async filtersMenu(ctx) {
        try {
            const filterKey = ctx.match[1];
            ctx.session.pages.key = filterKey;
            ctx.session.pages.page = 0;
            filtersList = FilterManager.getFilterByKey(filterKey);
            ctx.session.pages.listAttr = filtersList.options;
            const message = ctx.message ? ctx.message : ctx.callbackQuery.message;

            if (ctx.session.pages.listAttr === undefined || ctx.session.pages.listAttr === "") {
                ctx.session.pages.text = `Please write a ${filtersList.name.toLowerCase()}`;
                ctx.session.pages.text += ctx.session.inventory[filterKey] !== "" ? `\nYou chose: ${ctx.session.inventory[filterKey]}` : '';
                ctx.session.lastMessage = message.message_id;
            } else {
                ctx.session.pages.text = `Please choose a ${filtersList.name.toLowerCase()}`;
                // ctx.session.pages.text += ctx.session.inventory[filterKey] !== null ? `\n You chose: ${ctx.session.inventory[filterKey]}` : '';
                ctx.session.lastMessage = message.message_id;
            }

            const keyboard = MenuFactory.createFiltersMenu(ctx.session.pages.listAttr, ctx.session.pages.page, ctx.session.inventory[filterKey], ctx.session.pages.back);

            ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, ctx.session.pages.text, keyboard);
            ctx.answerCbQuery();
            return;
        } catch (e) {
            console.error('Error updating message:', e.message);
        }
    },
    chooseFilter(ctx) {
        const filterIndexStr = ctx.match[1];
        const filterIndex = Number(filterIndexStr);
        const filterKey = ctx.session.pages?.key;

        const isSelected = ctx.session.inventory[filterKey] ? ctx.session.inventory[filterKey] === filterIndex : false;

        if (isSelected) {
            ctx.session.inventory[filterKey] = "";
        } else {
            ctx.session.inventory[filterKey] = filterIndex;
        }

        ctx.session.wasChosen = true;
        const keyboard = MenuFactory.createFiltersMenu(ctx.session.pages.listAttr, ctx.session.pages.page, ctx.session.inventory[filterKey], ctx.session.pages.back);
        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, ctx.session.pages.text, keyboard);
        ctx.answerCbQuery();
    },
    resetFilter(ctx) {
        const filterKey = ctx.session.pages?.key;

        if (ctx.session.inventory[filterKey].length === 0 || ctx.session.inventory[filterKey] === "") {
            ctx.answerCbQuery();
            return;
        }

        if (ctx.session.pages.text.includes("You write:")) ctx.session.pages.text = ctx.session.pages.text.replace(/You write: .*/, '');

        ctx.session.inventory[filterKey] = "";
        ctx.session.wasChosen = true;
        const keyboard = MenuFactory.createFiltersMenu(ctx.session.pages.listAttr, ctx.session.pages.page, ctx.session.inventory[filterKey], ctx.session.pages.back);
        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, ctx.session.pages.text, keyboard);
        ctx.answerCbQuery();
    },
    textCheck(ctx) {
        const key = ctx.session.pages.key;
        if (!/To|From/.test(key) && key !== "model") return;
        ctx.session.inventory[key] = ctx.message.text;

        const pattern = /You write: .*/;
        if (pattern.test(ctx.session.pages?.text)) {
            ctx.session.pages.text = ctx.session.pages.text.replace(pattern, `You write: ${ctx.message.text}`);
        } else {
            ctx.session.pages.text += `\n You write: ${ctx.message.text}`;
        }

        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        ctx.deleteMessage(message.message_id);

        ctx.session.wasChosen = true;
        const keyboard = MenuFactory.createFiltersMenu(ctx.session.pages.listAttr, ctx.session.pages.page, ctx.session.inventory[key], ctx.session.pages.back);
        ctx.telegram.editMessageText(message.chat.id, ctx.session.lastMessage, undefined, ctx.session.pages.text, keyboard);
    },
    showRequestFilters(ctx) {
        const requestId = Number(ctx.match[1]);
        const request = ctx.session.requests.find(request => request.id === requestId);
        let text = "FILTERS";

        FilterManager.DEFAULT_FILTERS_MENU.forEach(req => {
            if (request[req.key] !== '') {
                if (req.options !== undefined) {
                    var value = req.options.find(filter => filter.id === request[req.key]).name;
                } else {
                    var value = request[req.key];
                }
                text += `\n${req.name}: ${value}`
            }
        });

        ctx.telegram.editMessageText(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id, undefined, text, MenuFactory.backButton(ctx));
        ctx.answerCbQuery("Show request");
    },
    async requestsMenu(ctx) {
        try {
            let text = "📋 Your requests:\n";

            const requests = ctx.session.requests;
            ctx.session.pages.page = 0;
            if (!requests?.length) {
                text += "List empty. Click 'Create new'";
            }

            await ctx.editMessageText(text, MenuFactory.createRequestMenu(requests, ctx.session.pages.page));
            ctx.answerCbQuery();
        } catch (e) {
            console.error('Error updating message:', e.message);
        }
    },
    async deleteRequest(ctx) {
        const requestId = Number(ctx.match[1]);
        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        let text = "📋 Your requests:\n";

        ctx.session.requests = ctx.session.requests.find(req => req.id !== requestId);
        if (ctx.session.requests === undefined) {
            ctx.session.requests = [];
            text += "List empty. Click 'Create new'";
        }

        await deleteUserRequest(message.chat.id, requestId);

        await ctx.answerCbQuery("Request delete!");
        await ctx.editMessageText(text, MenuFactory.createRequestMenu(ctx.session.requests, ctx.session.pages.page));
    }
};

module.exports = MenuServices;