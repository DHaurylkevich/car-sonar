import { createMainMenu } from "../components/menusKeyboard.js";

export const showMainMenu = (ctx, message, isExist) => {
    const text = isExist
        ? "Hi! I'm a car search bot"
        : "Hello! I'm a car search bot\nI'm here to help you find your dream car.";

    const keyboard = createMainMenu(ctx.session.isPremium);

    if (message.text === "/start" || message.text === "/menu") {
        ctx.reply(text, keyboard);
        ctx.deleteMessage(message.message_id);
    } else {
        ctx.telegram.editMessageText(message.chat.id, message.message_id, undefined, text, keyboard);
        ctx.answerCbQuery();
    }
};