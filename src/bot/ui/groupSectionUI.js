import { createFilterGroupMenu } from "../components/groupSectionKeyboard.js";
import { createFiltersTypeMenu } from "../components/filterKeyboard.js";
import { backButton } from "../components/menusKeyboard.js";

export const showGroupSection = async (ctx, requests, pages, text) => {
    const keyboard = createFilterGroupMenu(requests, pages.page);
    await ctx.editMessageText(text, keyboard);
    ctx.answerCbQuery();
};

export const showChoseFilerMenu = async (ctx, session, message) => {
    const keyboard = await createFiltersTypeMenu(session.wasChosen, session.requests.length);
    const text = "Create new Filters Group! \n Please choose filters what you want:"

    if (message.text !== "/start") {
        ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, text, keyboard);
        ctx.answerCbQuery();
    } else {
        ctx.reply(text, keyboard);
    }
};

export function showFiltersByGroup(ctx, message, text) {
    const keyboard = backButton(ctx);
    ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, text, keyboard);
    ctx.answerCbQuery("Show filter group");
};