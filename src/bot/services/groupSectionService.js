import { DEFAULT_FILTERS_MENU } from "../constants/filters.js";
import { deleteUserReqByTelegramId } from "../../db/services/userRequestService.js";
import { logger } from "../../utils/logger.js";

export function createTextForMenu(requests) {
    let text = "📋 Your Filter Groups:\n";

    if (!requests?.length) {
        text += "List empty. Click 'Create new'";
    }
    return text;
};

export async function checkGroupLimit(ctx, isPremium, requests, backPages) {
    // if (!isPremium && requests.length === 1 && backPages === "create_group") {
    if (!isPremium && requests.length === 1) {
        await ctx.answerCbQuery("Regular users can have only one Group filter!");
        return;
    }
};

export function createFiltersList(filtersGroup) {
    if (!filtersGroup) {
        logger.warn("createFiltersList called with undefined/null filtersGroup");
        return "";
    }

    return DEFAULT_FILTERS_MENU
        .filter(req => filtersGroup[req.key] !== null)
        .map(req => {
            const value = req.options !== undefined
                ? req.options.find(filter => filter.id === filtersGroup[req.key])?.name || "Unknown"
                : filtersGroup[req.key];
            return `\n${req.name}: ${value}`
        })
        .join("");
}