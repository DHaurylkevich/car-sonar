import { DEFAULT_FILTERS } from "../constants/filters.js";
import { createFiltersList, deleteRequest } from "../services/groupSectionService.js";
import { showGroupSection, showChoseFilerMenu, showFiltersByGroup } from "../ui/groupSectionUI.js";
import { checkGroupLimit, createTextForMenu } from "../services/groupSectionService.js";


export const groupSectionHandler = (bot) => {
    //Показать меню с группами фильтров для создания новых/удаления/редактирования группы
    bot.action("filterGroup", async (ctx) => {
        try {
            let text = createTextForMenu(ctx.session.requests);
            ctx.session.pages.page = 0;

            showGroupSection(ctx, ctx.session.requests, ctx.session.pages, text);
        } catch (e) {
            console.error('Error updating message:', e.message);
        }
    });
    //Показать меню со всеми типами фильтров
    bot.action("create_group", async (ctx) => {
        ctx.session.pages.back = "create_group";

        //проверяем, что пользователь может выбрать группу фильтров 
        await checkGroupLimit(ctx, ctx.session.isPremium, ctx.session.requests, ctx.session.pages.back);

        //обнуляет инвентарь к дефолтным значениям
        if (!ctx.session.wasChosen) {
            ctx.session.inventory = { ...DEFAULT_FILTERS };
        }

        ctx.session.pages.page = 0;
        await showChoseFilerMenu(ctx, ctx.session, ctx.message ? ctx.message : ctx.callbackQuery.message);

    });

    bot.action(/show_group_(\d+)/, (ctx) => {
        const requestId = Number(ctx.match[1]);
        const request = ctx.session.requests.find(request => request.id === requestId);
        let text = "FILTERS";

        text += createFiltersList(request);

        showFiltersByGroup(ctx, ctx.callbackQuery.message, text);
    });

    bot.action(/edit_request_(\d+)/, async (ctx) => {
        const requestId = Number(ctx.match[1]);
        const request = ctx.session.requests.find(request => request.id === requestId);
        ctx.session.pages.back = "edit_request_" + requestId;

        if (ctx.session.inventory.id !== requestId) {
            ctx.session.inventory = { ...request };
        }

        ctx.answerCbQuery("Editing...");
        await createGroupHandler(ctx, "Edit your request!\n")
    });

    bot.action(/delete_group_(\d+)/, async (ctx) => {
        const requestId = Number(ctx.match[1]);
        const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
        let text = "📋 Your requests:\n";

        ctx.session.requests = ctx.session.requests.filter(req => req.id !== requestId);
        if (ctx.session.requests === undefined) {
            ctx.session.requests = [];
            text += "List empty. Click 'Create new'";
        }
        // await deleteUserRequest(message.chat.id, requestId);
        // await deleteGroup(ctx);


        await ctx.answerCbQuery("Request delete!");
        await ctx.editMessageText(text, createFilterGroupMenu(ctx.session.requests, ctx.session.pages.page));

    });
};