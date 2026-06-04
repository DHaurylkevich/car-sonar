import { showFilterSection } from "../ui/filterUI.js"
import { showGroupSection } from "./groupSectionUI.js"

export const manageBackButton = (ctx, page, inventory, pageName) => {
    if (pageName === "filters") {
        showFilterSection(ctx, page, inventory[page.key], page.back);
    } else {
        showGroupSection(ctx, page.listAttr, page.page);
    }
};