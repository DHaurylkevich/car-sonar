import { createFilterGroupMenu } from "../components/groupSectionKeyboard.js";
import { createFiltersTypeMenu } from "../components/filterKeyboard.js";
import { backButton } from "../components/menusKeyboard.js";
//Показывает меню для работы с группой фильтров
export const showGroupSection = async (ctx, requests, pages, text) => {
    const keyboard = createFilterGroupMenu(requests, pages.page);
    await ctx.editMessageText(text, keyboard);
    ctx.answerCbQuery();
};
//Меню с типами фильтров (brand, model и т.д.)
export const showChoseFilerMenu = async (ctx, session, message) => {
    const keyboard = await createFiltersTypeMenu(session.wasChosen);
    const text = "Create new Filters Group! \n Please choose filters what you want:"

    if (message.text !== "/start") {
        ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, text, keyboard);
        ctx.answerCbQuery();
    } else {
        ctx.reply(text, keyboard);
    }
};
//Показывает какие фильтры сохранены в группу фильтров
export function showFiltersByGroup(ctx, message, text) {
    const keyboard = backButton(ctx);
    ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, text, keyboard);
    ctx.answerCbQuery("Show filter group");
};