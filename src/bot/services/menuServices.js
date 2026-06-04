// import { getRequestByUserId, deleteUserRequest } from "../../db/services/requestsService.js";
// import { createOrGetUser } from "../../db/services/userService.js";

export async function getBasicUserData(chatId, username) {
    const { isExist, isPremium } = { isExist: true, isPremium: false };
    const userRequests = [];
    // const { isExist, isPremium } = await createOrGetUser({ telegram_id: chatId, username: username });
    // const userRequests = isExist ? await getRequestByUserId(chatId) : [];
    return { isExist, isPremium, userRequests };
};

export async function resetBot(ctx) {
    const message = ctx.callbackQuery.message;
    // await resetUser(message.chat.id);
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