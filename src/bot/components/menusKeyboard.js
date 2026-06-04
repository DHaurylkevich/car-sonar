import { Markup } from "telegraf";

export function backButton() {
    return Markup.inlineKeyboard([Markup.button.callback("Back", "filterGroup")]).resize().oneTime();
};

export function createMainMenu(isPremium) {
    const buttons = [
        [Markup.button.callback('📋 My cars', 'filterGroup')],
        [Markup.button.callback('⏹ Stop researching', 'stop_bot')]
    ];

    isPremium || buttons.push([Markup.button.callback('💎 Buy premium', 'get_premium')]);

    // return Markup.inlineKeyboard(buttons).resize().oneTime();
    return Markup.inlineKeyboard(buttons).resize();
};