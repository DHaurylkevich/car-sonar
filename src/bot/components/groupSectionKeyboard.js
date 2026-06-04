import { Markup } from "telegraf";

//Можно сделать переключение страниц
export function createFilterGroupMenu(requests, page) {
    const buttons = [];

    if (requests.length) {
        requests.map((req, index) => buttons.push([
            Markup.button.callback(`Filter group #${index + 1}`, `show_request_${req.id}`),
            Markup.button.callback("✏️", `edit_group_${req.id}`),
            Markup.button.callback("🗑️", `delete_group_${req.id}`),
        ]));
    }

    buttons.push(
        [Markup.button.callback("Back", "menu")],
        [Markup.button.callback("➕ Create a new", "create_group")]
    );

    return Markup.inlineKeyboard(buttons);
};