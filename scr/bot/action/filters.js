const createKeyboard = require("../components/createKeyboard");
const filtersConfig = require("../filterList")

const updateMessage = async (ctx, text, keyboard) => {
    try {
        const { chat, message_id } = ctx?.callbackQuery ? ctx.callbackQuery.message : ctx;
        await ctx.telegram.editMessageText(chat.id, message_id, undefined, text, keyboard);
    } catch (e) {
        console.error('Error updating message:', e.message);
    }
};

const filter = (bot) => {
    let wasChosen = false;

    bot.action("filters", async (ctx) => {
        try {
            const keyboard = createKeyboard.keyboard(filtersConfig, wasChosen ? "save" : "back");
            wasChosen = false;

            await updateMessage(ctx, "Please choose a filter to set:", keyboard);
            await ctx.answerCbQuery();
            return;
        } catch (e) {
            console.error('Error updating message:', e.message);
        }
    });

    bot.on("callback_query", async (ctx) => {
        try {
            const action = ctx.callbackQuery.data;

            const selectedFilter = filtersConfig.find((filter) => filter.key === action);
            if (selectedFilter) {
                ctx.session.pages.key = selectedFilter.key;
                ctx.session.pages.text = `Please choose a ${selectedFilter.name}`;
                ctx.session.pages.list = selectedFilter.options;
                ctx.session.pages.back = "filters";

                let keyboard;
                if (selectedFilter.options) {
                    keyboard = createKeyboard.listKeyboard(ctx.session.pages, ctx.session.filters);
                } else {
                    keyboard = createKeyboard.backKeyboard();
                    ctx.session.lastMessage = ctx;
                    ctx.session.pages.text += ctx.session.filters[action].length ? `\n You chose: ${ctx.session.filters[action]}` : "";
                }

                await updateMessage(ctx, ctx.session.pages.text, keyboard);
                await ctx.answerCbQuery();
                return;
            }

            if (action.startsWith("set_")) {
                const [_, option] = action.split("_");
                const key = ctx.session.pages?.key;

                if (key) {
                    ctx.session.filters[key] = ctx.session.filters[key] || [];
                    const isSelected = ctx.session.filters[key].includes(option);

                    if (isSelected) {
                        ctx.session.filters[key] = ctx.session.filters[key].filter((item) => item !== option);
                    } else {
                        ctx.session.filters[key].push(option);
                    }

                    wasChosen = true;
                    const keyboard = createKeyboard.listKeyboard(ctx.session.pages, ctx.session.filters);
                    await updateMessage(ctx, ctx.session.pages.text, keyboard);
                    await ctx.answerCbQuery();
                }
                return;
            }

            // if (action === "back") {
            //     const { back } = ctx.session.pages || {};
            //     if (back === "filters") {
            //         const keyboard = createKeyboard.keyboard(filtersConfig, "back");
            //         await updateMessage(ctx, "Please choose a filter to set:", keyboard);
            //         await ctx.answerCbQuery();
            //     }
            // }
        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Something went wrong. Please try again.");
        }
    });

    bot.on("text", async (ctx) => {
        //TO DO: to check the program wait text 
        try {
            const { key } = ctx.session.pages || {};
            if (!key) return;

            ctx.session.filters = ctx.session.filters || {};
            ctx.session.filters[key] = ctx.session.filters[key] || [];
            ctx.session.filters[key].push(ctx.message.text);

            const pattern = /You chose: .*/;
            if (pattern.test(ctx.session.pages?.text)) {
                ctx.session.pages.text = ctx.session.pages.text.replace(pattern, `You chose: ${ctx.message.text}`);
            } else {
                ctx.session.pages.text += `\n You chose: ${ctx.message.text}`;
            }

            await ctx.deleteMessage(ctx.message.message_id);

            wasChosen = true;
            const keyboard = createKeyboard.backKeyboard();

            await updateMessage(ctx.session.lastMessage, ctx.session.pages.text, keyboard);
        } catch (e) {
            console.error(e);
        }
    });
};

module.exports = filter;