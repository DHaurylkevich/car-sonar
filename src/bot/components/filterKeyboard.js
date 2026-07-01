import { Markup } from "telegraf";
import { DEFAULT_FILTERS_MENU } from "../constants/filters.js";

function chunkArray(arr, size) {
    return arr.reduce((chunks, button, index) => {
        if (index % size === 0) {
            chunks.push([button]);
        } else {
            chunks[chunks.length - 1].push(button);
        }

        return chunks;
    }, []);
};

export async function createFiltersTypeMenu(wasChosen) {
    const filtersList = DEFAULT_FILTERS_MENU;
    const buttons = filtersList.map(filter =>
        Markup.button.callback(filter.name, `filters_${filter.key}`)
    );

    const buttonRows = chunkArray(buttons, 2);
    buttonRows.push([
        Markup.button.callback("Save", "save", !wasChosen),
        Markup.button.callback("Back", "filterGroup"),
    ]);

    return Markup.inlineKeyboard(buttonRows).resize();
};

export function createFiltersMenu(filtersElements, page, userInventory, backPage) {
    if (filtersElements === undefined) {
        return Markup.inlineKeyboard([
            Markup.button.callback("Back", backPage),
            Markup.button.callback("Reset filter", "reset", userInventory === "")
        ]).resize();
    }

    const buttons = [];
    const currentFilters = filtersElements.slice(page, page + 12);

    currentFilters.forEach(element => {
        if (userInventory === element.id) {
            buttons.push(Markup.button.callback(`*${element.name}*`, `set_${element.id}`));
        } else {
            buttons.push(Markup.button.callback(element.name, `set_${element.id}`));
        }
    });

    const buttonRows = chunkArray(buttons, 2);

    buttonRows.push([
        Markup.button.callback("⬅️ Previous", "prev_filters"),
        Markup.button.callback("Back", backPage),
        Markup.button.callback("Reset filter", "reset", !userInventory),
        Markup.button.callback("Next ➡️", "next_filters")
    ]);

    return Markup.inlineKeyboard(buttonRows).resize();
};