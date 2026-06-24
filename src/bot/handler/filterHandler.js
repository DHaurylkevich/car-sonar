import { buildWriteText } from "../services/menuServices.js";
import { buildFilterText, getFilterByKey, manageFilterSelect, cleanLastFilter } from "../services/filtersServices.js";
import { showFilterSection } from "../ui/filterUI.js";

export const filterHandler = (bot) => {
    //Выводит меню с опциями выбраного типа фильтра 
    bot.action(/filters_(\w+)/, async (ctx) => {
        try {
            const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
            ctx.session.lastMessage = message.message_id;

            const selectedFilterTypeKey = ctx.match[1];
            ctx.session.pages.key = selectedFilterTypeKey;
            ctx.session.pages.page = 0;
            const filtersList = getFilterByKey(selectedFilterTypeKey);
            ctx.session.pages.listAttr = filtersList.options;

            const selectedFilter = ctx.session.inventory[selectedFilterTypeKey];
            ctx.session.pages.text = buildFilterText(ctx.session.pages.listAttr, filtersList.name, selectedFilter);

            showFilterSection(ctx, ctx.session.pages, selectedFilter, message.chat.id, ctx.session.lastMessage);
            return;
        } catch (e) {
            console.error('Error updating message:', e.message);
        }
    });

    bot.action(/set_(\d+)/, async (ctx) => {
        ctx.session.wasChosen = true;
        const selectedFilterKey = ctx.match[1];
        const filterIndex = Number(selectedFilterKey);
        const filterKey = ctx.session.pages?.key;

        ctx.session.inventory[filterKey] = manageFilterSelect(ctx.session.inventory[filterKey], filterIndex);

        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        showFilterSection(ctx, ctx.session.pages, ctx.session.inventory[filterKey], message.chat.id, ctx.session.lastMessage);
    });

    bot.action(/reset/, async (ctx) => {
        const lastPage = ctx.session.pages;
        const lastSelectedFilterKey = lastPage.key;

        if (ctx.session.inventory[lastSelectedFilterKey].length === 0 || ctx.session.inventory[lastSelectedFilterKey] === "") {
            ctx.answerCbQuery();
            return;
        }

        lastPage.text = cleanLastFilter(lastPage.text);
        ctx.session.inventory[lastSelectedFilterKey] = "";
        ctx.session.wasChosen = true

        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        showFilterSection(ctx, lastPage, ctx.session.inventory[lastSelectedFilterKey], message);
    });

    bot.on("text", async (ctx) => {
        try {
            const lastPage = ctx.session.pages
            const currentPagesKey = lastPage.key;
            if (!/To|From/.test(currentPagesKey) && currentPagesKey !== "model") return;

            const lastMessage = ctx.message;
            ctx.session.inventory[currentPagesKey] = lastMessage.text;

            ctx.session.pages.text = buildWriteText(/You chose: .*/, lastPage.text, ctx.message.text);

            ctx.deleteMessage(lastMessage.message_id);

            ctx.session.wasChosen = true;
            showFilterSection(ctx, lastPage, ctx.session.inventory[currentPagesKey], lastMessage);
        } catch (e) {
            console.error(e);
        }
    });
};