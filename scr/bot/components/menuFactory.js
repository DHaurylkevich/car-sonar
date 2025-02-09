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
            [Markup.button.callback('📋 Мои запросы', 'requests')],
            [Markup.button.callback('⏹ Остановить поиск', 'stop_bot')]
        ];
        isPremium || buttons.push([Markup.button.callback('💎 Получить премиум', 'get_premium')]);

        return Markup.inlineKeyboard(buttons).resize().oneTime();
    },
    // Надо доделать кнопки вперед назад 
    createRequestMenu(requests, page) {
        const buttons = [];

        if (requests.length) {
            requests.map((req, index) => buttons.push([
                Markup.button.callback(`Запрос #${index + 1}`, `show_request_${req.id}`),
                Markup.button.callback("✏️", `edit_request_${req.id}`),
                Markup.button.callback("🗑️", `delete_request_${req.id}`),
            ]));
        }

        buttons.push(
            [Markup.button.callback("Back", "menu")],
            [Markup.button.callback("➕ Создать новый", "create_request")]
        );

        return Markup.inlineKeyboard(buttons);
    },
    async createFiltersListMenu(wasChosen, requestCount) {
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
    createFiltersChooseMenu(filtersElements, page, userInventory) {
        if (filtersElements === undefined) {
            return Markup.inlineKeyboard([Markup.button.callback("Back", "create_request")]).resize();
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
            Markup.button.callback("Back", "create_request"),
            Markup.button.callback("Next ➡️", "next_filters")
        ]);

        return Markup.inlineKeyboard(buttonRows).resize();
    },
};

module.exports = MenuFactory;