import { DEFAULT_FILTERS } from "../constants/filters.js";
import { createFiltersList } from "../services/groupSectionService.js";
import { showGroupSection, showChoseFilerMenu, showFiltersByGroup } from "../ui/groupSectionUI.js";
import { checkGroupLimit, createTextForMenu } from "../services/groupSectionService.js";
import { deleteUserReqByTelegramId } from "../../db/services/userRequestService.js";
import { logger } from "../../utils/logger.js";
import { wasChange } from "../services/filtersServices.js";
import { addOrSetRequest, getRequestByUserId } from "../../db/services/requestsService.js";


function checkNewFilters(session) {
    if (session.mainInv === null) {
        session.mainInv = { ...DEFAULT_FILTERS };
        session.inventory = { ...session.mainInv };
    }
    session.wasChosen = wasChange(session.mainInv, session.inventory);
};

function filterMenu(ctx) {
    const text = createTextForMenu(ctx.session.requests);
    ctx.session.pages.page = 0;
    ctx.session.mainInv = null;

    showGroupSection(ctx, ctx.session.requests, ctx.session.pages, text);
};

export const groupSectionHandler = (bot) => {
    //Показать меню с группами фильтров для создания новых/удаления/редактирования группы
    bot.action("filterGroup", async (ctx) => {
        try {
            const chatId = ctx.message ? ctx.message.chat.id : ctx.callbackQuery.message.chat.id;

            ctx.session.requests = await getRequestByUserId(chatId);

            filterMenu(ctx);
            logger.info(`[User ${ctx.from?.id}] Viewing filter groups menu`);
        } catch (err) {
            logger.error(`[User ${ctx.from?.id}] Error updating filter groups message:`, err);
            ctx.answerCbQuery("Error loading groups!");
        }
    });
    //Показать меню со всеми типами фильтров
    bot.action("create_group", async (ctx) => {
        ctx.session.pages.back = "create_group";

        //проверяем, что пользователь может выбрать группу фильтров 
        if (!ctx.session.isPremium && ctx.session.requests.length === 1) {
            await ctx.answerCbQuery("Regular users can have only one Group filter!");
            return;
        }

        checkNewFilters(ctx.session);

        await showChoseFilerMenu(ctx, ctx.session.wasChosen, ctx.message ? ctx.message : ctx.callbackQuery.message);
    });

    bot.action("save", async (ctx) => {
        try {
            const notEmpty = Object.values(ctx.session.inventory).some(item => Boolean(item));
            if (!notEmpty) {
                ctx.answerCbQuery("Please fill all fields!");
                return;
            }

            const userId = ctx.callbackQuery.message.chat.id;
            logger.info(`[User ${userId}] Saving request with filters: ${JSON.stringify(ctx.session.inventory)}`);

            ctx.session.requests.push(await addOrSetRequest(ctx.session.inventory, userId));
            console.log(ctx.session.requests);
            filterMenu(ctx);
            ctx.answerCbQuery("Success!");
            logger.info(`[User ${userId}] Request saved successfully`);
        } catch (err) {
            const userId = ctx.callbackQuery?.message?.chat?.id ?? "unknown";
            logger.error(`[User ${userId}] Error saving request:`, err);
            ctx.answerCbQuery("Error: Failed to save request. Please try again.");
        }
    });

    bot.action(/show_group_(\d+)/, async (ctx) => {
        try {
            const requestId = Number(ctx.match[1]);
            const request = ctx.session.requests.find(request => request.id === requestId);

            if (!request) {
                logger.warn(`[User ${ctx.from?.id}] Request ${requestId} not found in session`);
                ctx.answerCbQuery("Request not found!");
                return;
            }

            const text = "FILTERS" + createFiltersList(request);
            showFiltersByGroup(ctx, ctx.callbackQuery.message, text);
        } catch (err) {
            logger.error(`[User ${ctx.from?.id}] Error showing group:`, err);
            ctx.answerCbQuery("Error loading group!");
        }
    });

    bot.action(/edit_group_(\d+)/, async (ctx) => {
        try {
            const requestId = Number(ctx.match[1]);
            checkNewFilters(ctx.session);

            if (!ctx.session.mainInv) {
                logger.warn(`[User ${ctx.from?.id}] Request ${requestId} not found for editing`);
                ctx.answerCbQuery("Request not found!");
                return;
            }

            ctx.session.pages.back = `edit_group_${requestId}`;

            await ctx.answerCbQuery("Editing...");
            await showChoseFilerMenu(ctx, ctx.session.wasChosen, ctx.callbackQuery.message);

            logger.info(`[User ${ctx.from?.id}] Started editing request ${requestId}`);
        } catch (err) {
            logger.error(`[User ${ctx.from?.id}] Error editing request:`, err);
            ctx.answerCbQuery("Error editing request!");
        }
    });

    bot.action(/delete_group_(\d+)/, async (ctx) => {
        try {
            const requestId = Number(ctx.match[1]);
            const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
            const userId = message.chat.id;

            // Delete from database
            await deleteUserReqByTelegramId(userId, requestId);

            // Update session
            ctx.session.requests = ctx.session.requests.filter(req => req.id !== requestId);

            // Update UI
            const text = createTextForMenu(ctx.session.requests);

            showGroupSection(ctx, ctx.session.requests, ctx.session.pages, text);

            logger.info(`[User ${userId}] Request ${requestId} deleted successfully`);
        } catch (err) {
            const userId = ctx.from?.id ?? "unknown";
            logger.error(`[User ${userId}] Error deleting group:`, err);
            ctx.answerCbQuery("Error deleting request!");
        }
    });

};