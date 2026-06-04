import { createFiltersMenu } from "../components/filterKeyboard.js";

export function showFilterSection(ctx, pages, selectedFilter, message) {
    const keyboard = createFiltersMenu(pages.listAttr, pages.page, selectedFilter, pages.back);

    ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, pages.text, keyboard);
    ctx.answerCbQuery();
};