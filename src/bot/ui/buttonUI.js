import { showFilterSection } from "../ui/filterUI.js"
import { showGroupSection } from "./groupSectionUI.js"

export const manageBackButton = (ctx, page, selectedFilter, pageName, chatId, messageId) => {
    if (pageName === "filters") {
        showFilterSection(ctx, page, selectedFilter, chatId, messageId);
    } else {
        showGroupSection(ctx, page.listAttr, page.page);
    }
};