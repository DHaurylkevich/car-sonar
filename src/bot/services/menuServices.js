const { getRequestByUserId } = require("../../services/requestsService");
const { defaultAttributes } = require("../../services/attributeService");
const { createOrGetUser } = require("../../services/userService");
const MenuFactory = require("../components/menuFactory");
const { keyboard } = require("telegraf/markup");
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
            await defaultAttributes(); //Убрать для админа
            await this.filtersListMenu(ctx, "Hello! I'm a car search bot. \n");
            ctx.deleteMessage(message.message_id);
        }
    },
    async filtersListMenu(ctx, text = "") {
        if (!ctx.session?.isPremium && ctx.session.requests.length === 1) {
            await ctx.answerCbQuery("Обычные пользователи могут иметь только один запрос!");
            return;
        }

        ctx.session.pages.page = 0;

        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        const keyboard = await MenuFactory.createFiltersListMenu(ctx.session.wasChosen, ctx.session.requests.length);

        if (message.text !== "/start") {
            ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, text + "Please choose filters what you want:", keyboard);
            ctx.answerCbQuery();
        } else {
            ctx.reply(text + "Please choose filters what you want:", keyboard);
        }
    },
    async filtersChooseMenu(ctx) {
        try {
            const filterKey = ctx.match[1];
            ctx.session.pages.key = filterKey;
            ctx.session.pages.page = 0;
            ctx.session.pages.listAttr = FilterManager.getFilterByKey(filterKey).options;
            const message = ctx.message ? ctx.message : ctx.callbackQuery.message;

            if (ctx.session.pages.listAttr !== undefined || ctx.session.pages.listAttr !== "") {
                ctx.session.pages.text = `Please choose a ${filterKey}`
            } else {
                ctx.session.pages.text = `Please write a ${filterKey}`;
                ctx.session.pages.text += ctx.session.inventory[filterKey] !== null ? `\n You chose: ${ctx.session.inventory[filterKey]}` : '';
                ctx.session.lastMessage = message.message_id;
            }

            const keyboard = MenuFactory.createFiltersChooseMenu(ctx.session.pages.listAttr, ctx.session.pages.page, ctx.session.inventory[filterKey]);

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
            ctx.session.inventory[filterKey] = null;
            // ctx.session.inventory[filterKey] = ctx.session.inventory[filterKey].filter((item) => item !== filterIndex);
        } else {
            ctx.session.inventory[filterKey] = filterIndex;
        }

        ctx.session.wasChosen = true;
        const keyboard = MenuFactory.createFiltersChooseMenu(ctx.session.pages.listAttr, ctx.session.pages.page, ctx.session.inventory[filterKey]);
        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, ctx.session.pages.text, keyboard);
        ctx.answerCbQuery();
    },
    textCheck(ctx) {
        const key = ctx.session.pages.key;
        if (!/To|From/.test(key)) return;
        ctx.session.inventory[key] = ctx.message.text;

        const pattern = /You chose: .*/;
        if (pattern.test(ctx.session.pages?.text)) {
            ctx.session.pages.text = ctx.session.pages.text.replace(pattern, `You chose: ${ctx.message.text}`);
        } else {
            ctx.session.pages.text += `\n You chose: ${ctx.message.text}`;
        }

        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        ctx.deleteMessage(message.message_id);

        ctx.session.wasChosen = true;
        const keyboard = MenuFactory.createFiltersChooseMenu(ctx.session.pages.listAttr, ctx.session.pages.page, ctx.session.inventory[key]);
        ctx.telegram.editMessageText(message.chat.id, ctx.session.lastMessage, undefined, ctx.session.pages.text, keyboard);
    },
    showRequestFilters(ctx) {
        const requestId = Number(ctx.match[1]);
        const request = ctx.session.requests.find(request => request.id === requestId);
        let text = "Фильтры";

        text += FilterManager.DEFAULT_FILTERS_MENU
            .map(req => {
                return request[req.key] !== '' ? `\n${req.name}: ${req.options[request[req.key]].name}` : " ";
            })
            .join("");

        ctx.telegram.editMessageText(ctx.callbackQuery.message.chat.id, ctx.callbackQuery.message.message_id, undefined, text, MenuFactory.backButton(ctx));
    },
};

module.exports = MenuServices;