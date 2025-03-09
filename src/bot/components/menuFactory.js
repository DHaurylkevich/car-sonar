const { Markup } = require("telegraf");
const FilterManager = require("../filtersManager")

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

const MenuFactory = {
    backButton() {
        return Markup.inlineKeyboard([Markup.button.callback("Back", "requests")]).resize().oneTime();
    },
    createMainMenu(isPremium) {
        const buttons = [
            [Markup.button.callback('📋 My cars', 'requests')],
            [Markup.button.callback('⏹ Stop researching', 'stop_bot')]
        ];
        isPremium || buttons.push([Markup.button.callback('💎 Buy premium', 'get_premium')]);

        return Markup.inlineKeyboard(buttons).resize().oneTime();
    },
    //Можно сделать переключение страниц
    createRequestMenu(requests, page) {
        const buttons = [];

        if (requests.length) {
            requests.map((req, index) => buttons.push([
                Markup.button.callback(`Request #${index + 1}`, `show_request_${req.id}`),
                Markup.button.callback("✏️", `edit_request_${req.id}`),
                Markup.button.callback("🗑️", `delete_request_${req.id}`),
            ]));
        }

        buttons.push(
            [Markup.button.callback("Back", "menu")],
            [Markup.button.callback("➕ Create a new", "create_request")]
        );

        return Markup.inlineKeyboard(buttons);
    },
    async createFiltersTypeMenu(wasChosen, requestCount) {
        const filtersList = await FilterManager.filtersMenuList();
        const buttons = [];

        filtersList.forEach(filter => {
            buttons.push(Markup.button.callback(filter.name, `filters_${filter.key}`));
        });

        const buttonRows = chunkArray(buttons, 2);

        buttonRows.push([
            Markup.button.callback("Save", "save", !wasChosen),
            Markup.button.callback("Back", "requests", !requestCount),
        ]);

        return Markup.inlineKeyboard(buttonRows).resize();
    },
    createFiltersMenu(filtersElements, page, userInventory, backPage) {
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
    },
};

module.exports = MenuFactory;