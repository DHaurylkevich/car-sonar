const Telegraf = require('telegraf');
const { Markup } = Telegraf;

const createKeyboard = {
    backKeyboard: () => {
        return Markup.inlineKeyboard([Markup.button.callback("Back", "filters")]).resize();
    },
    keyboard: (filtersList, backPage) => {
        let opt = [];
        const buttonKey = "save" === backPage ? "Save" : "Back";
        const nav = [Markup.button.callback(buttonKey, backPage)];

        filtersList.forEach(filter => {
            opt.push(Markup.button.callback(filter.name, filter.key));
        });
        const buttonRows = opt.reduce((rows, button, index) => {
            if (index % 2 === 0) {
                rows.push([button]);
            } else {
                rows[rows.length - 1].push(button);
            }
            return rows;
        }, []);

        buttonRows.push(nav);
        let keyboard = Markup.inlineKeyboard(buttonRows).resize();
        return keyboard;
    },
    listKeyboard: (globalPages, userFilters) => {
        let opt = [];
        const nav = [
            Markup.button.callback("⬅️ Previous", "prev"),
            Markup.button.callback("Back", globalPages.back),
            Markup.button.callback("Next ➡️", "next")
        ];

        const currentFilters = globalPages.list.slice(globalPages.page, globalPages.page + 12);

        currentFilters.forEach(filter => {
            if (userFilters[globalPages.key].includes(filter)) {
                opt.push(Markup.button.callback(`*${filter}*`, `set_${filter}`));
            } else {
                opt.push(Markup.button.callback(filter, `set_${filter}`));
            }
        });

        const buttonRows = opt.reduce((rows, button, index) => {
            if (index % 2 === 0) {
                rows.push([button]);
            } else {
                rows[rows.length - 1].push(button);
            }
            return rows;
        }, []);

        buttonRows.push(nav);
        let keyboard = Markup.inlineKeyboard(buttonRows).resize();
        return keyboard;
    }
}

module.exports = createKeyboard;