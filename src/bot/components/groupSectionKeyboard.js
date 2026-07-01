import { Markup } from "telegraf";

//Можно сделать переключение страниц
export function createFilterGroupMenu(requests, page) {
    const buttons = [];
    console.log(requests);
    if (requests.length) {
        requests.map((req, index) => buttons.push([
            Markup.button.callback(`Group #${index + 1}`, `show_group_${req.id}`),
            Markup.button.callback("✏️", `edit_group_${req.id}`),
            Markup.button.callback("🗑️", `delete_group_${req.id}`),
        ]));
    }

    buttons.push(
        [Markup.button.callback("➕ Create a new", "create_group")],
        [Markup.button.callback("Back", "menu")]
    );

    return Markup.inlineKeyboard(buttons);
};