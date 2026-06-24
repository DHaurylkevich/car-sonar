import { createFiltersMenu } from "../components/filterKeyboard.js";

export function showFilterSection(ctx, pages, selectedFilter, chatId, messageId) {
    const keyboard = createFiltersMenu(pages.listAttr, pages.page, selectedFilter, pages.back);

    ctx.telegram.editMessageText(chatId, messageId, undefined, pages.text, keyboard);
    ctx.answerCbQuery();
};