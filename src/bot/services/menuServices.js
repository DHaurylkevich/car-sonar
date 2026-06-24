import { getRequestByUserId } from "../../db/services/requestsService.js";
import { createUser, resetUser, findUserByTelegramId } from "../../db/services/userService.js";
import { logger } from "../../utils/logger.js";

export async function getBasicUserData(chatId, username) {
    try {
        const user = await findUserByTelegramId(chatId);

        if (!user) {
            logger.info("User does not exist");
            await createUser({ telegram_id: chatId, username: username });
            return { isExist: false, isPremium: false, userRequests: [] };
        }

        const userRequests = await getRequestByUserId(chatId);
        return { isExist: true, isPremium: user.isPremium, userRequests };
    } catch (error) {
        logger.error("Error in getBasicUserData:", error);
        throw error;
    }
};

export async function resetBot(ctx) {
    const message = ctx.callbackQuery.message;
    await resetUser(message.chat.id);
    await ctx.telegram.deleteMessage(message.chat.id, message.message_id);

    ctx.session.pages.listAttr = [];
    ctx.session.inventory = [];
    ctx.session.requests = [];
};

export function buildWriteText(pattern, pagesText, newText) {
    if (pattern.test(pagesText)) {
        return pagesText.replace(pattern, `You chose: ${newText}`);
    } else {
        return pagesText + `\n You chose: ${newText}`;
    }
};