import { createFiltersMenu } from "../components/filterKeyboard.js";
import { safeEditMessageText } from "../services/messageService.js";

export function showFilterSection(ctx, pages, selectedFilter, chatId, messageId, isTextOn = false) {
    const keyboard = createFiltersMenu(pages.listAttr, pages.page, selectedFilter, pages.back);

    safeEditMessageText(ctx, chatId, messageId, pages.text, keyboard);
    if (!isTextOn) {
        ctx.answerCbQuery();
    }
};