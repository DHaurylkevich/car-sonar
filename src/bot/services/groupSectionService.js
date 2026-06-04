import { DEFAULT_FILTERS_MENU } from "../constants/filters.js";
import { createFilterGroupMenu } from "../components/groupSectionKeyboard.js";

export function createTextForMenu(requests) {
    let text = "📋 Your Filter Groups:\n";

    if (!requests?.length) {
        text += "List empty. Click 'Create new'";
    }
    return text;
};

export async function checkGroupLimit(ctx, isPremium, requests, backPages) {
    if (!isPremium && requests.length === 1 && backPages === "create_group") {
        await ctx.answerCbQuery("Regular users can have only one Group filter!");
        return;
    }
};

export function createFiltersList(filtersGroup) {
    return DEFAULT_FILTERS_MENU
        .filter(req => filtersGroup[req.key] !== "")
        .map(req => {
            const value = req.options !== undefined
                ? req.options.find(filter => filter.id === request[req.key]).name
                : request[req.key];
            return `\n${req.name}: ${value}`
        })
        .join("");
}

export async function deleteRequest(ctx) {
    const requestId = Number(ctx.match[1]);
    const message = ctx.message ? ctx.message : ctx.callbackQuery.message;
    let text = "📋 Your requests:\n";

    ctx.session.requests = ctx.session.requests.find(req => req.id !== requestId);
    if (ctx.session.requests === undefined) {
        ctx.session.requests = [];
        text += "List empty. Click 'Create new'";
    }

    // await deleteUserRequest(message.chat.id, requestId);

    await ctx.answerCbQuery("Request delete!");
    await ctx.editMessageText(text, createFilterGroupMenu(ctx.session.requests, ctx.session.pages.page));
};