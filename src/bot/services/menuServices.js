import { getRequestByUserId } from "../../db/services/requestsService.js";
import { createUser, resetUser, findUserByTelegramId } from "../../db/services/userService.js";
import { logger } from "../../utils/logger.js";

export async function getBasicUserData(chatId, username) {
    try {
        const user = await findUserByTelegramId(chatId);

        if (!user) {
            logger.info("User does not exist");
            await createUser({ telegram_id: chatId, username: username });
            return { isExist: false, isPremium: false };
        }

        return { isExist: true, isPremium: user.isPremium };
    } catch (error) {
        logger.error("Error in getBasicUserData:", error);
        throw error;
    }
};

export async function resetBot(ctx) {
    const message = ctx.callbackQuery.message;
    const userId = message.chat.id;

    try {
        await resetUser(userId);
        await ctx.telegram.deleteMessage(userId, message.message_id);

        ctx.session.pages.listAttr = [];
        ctx.session.inventory = [];
        ctx.session.requests = [];

        logger.info(`[User ${userId}] Bot reset successfully`);
    } catch (err) {
        logger.error(`[User ${userId}] Error resetting bot:`, err);
        throw err;
    }
};

export function buildWriteText(pattern, pagesText, newText) {
    if (pattern.test(pagesText)) {
        return pagesText.replace(pattern, `You chose: ${newText}`);
    } else {
        return pagesText + `\n You chose: ${newText}`;
    }
};