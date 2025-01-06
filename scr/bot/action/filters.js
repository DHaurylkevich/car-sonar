const createKeyboard = require("../components/createKeyboard");

const filtersConfig = [
    { name: "Brand", key: "brand", options: ["abarth", "acura", "aiways", "aixam", "alfa-romeo", "alpina", "alpine", "arcfox", "asia", "aston-martin", "audi", "austin", "autobianchi", "avatr", "baic", "bentley", "bmw", "brilliance", "bugatti", "buick", "byd", "cadillac", "casalini", "caterham", "cenntro", "changan", "chatenet", "chevrolet", "chrysler", "citroen", "cupra", "dacia", "daewoo", "daihatsu", "delorean", "dfm", "dfsk", "dkw", "dodge", "doosan", "dr-motor", "ds-automobiles", "e-go", "elaris", "faw", "fendt", "ferrari", "fiat", "fisker", "ford", "forthing", "gaz", "geely", "genesis", "gmc", "gwm", "hiphi", "honda", "hongqi", "hummer", "hyundai", "iamelectric", "ineos", "infiniti", "isuzu", "iveco", "jac", "jaecoo", "jaguar", "jeep", "jetour", "jinpeng", "kia", "ktm", "lada", "lamborghini", "lancia", "land-rover", "leapmotor", "levc", "lexus", "ligier", "lincoln", "lixiang", "lotus", "lti", "lucid", "lynk-and-co", "man", "maserati", "maximus", "maxus", "maybach", "mazda", "mclaren", "mercedes-benz", "mercury", "mg", "microcar", "mini", "mitsubishi", "morgan", "nio", "nissan", "nysa", "oldsmobile", "omoda", "opel", "inny", "peugeot", "piaggio", "plymouth", "polestar", "polonez", "pontiac", "porsche", "ram", "renault", "rolls-royce", "rover", "saab", "sarini", "saturn", "seat", "seres", "shuanghuan", "skoda", "skywell", "skyworth", "smart", "ssangyong", "subaru", "suzuki", "syrena", "tarpan", "tata", "tesla", "toyota", "trabant", "triumph", "uaz", "vauxhall", "velex", "volkswagen", "volvo", "voyah", "waltra", "marka_warszawa", "wartburg", "wolga", "xiaomi", "xpeng", "zaporozec", "zastawa", "zeekr", "zhidou", "zuk"] },
    // { name: "Model", key: "model" },
    { name: "Typ nadwozia", key: "generation", options: ["seg-mini", "seg-cabrio", "seg-city-car", "seg-combi", "seg-compact", "seg-coupe", "seg-minivan", "seg-sedan", "seg-suv"] },
    { name: "City", key: "city", options: ["warszawa"] },
    { name: "Fuel Type", key: "fuelType", options: ["petrol", "petrol-cng", "petrol-lpg", "diesel", "electric", "etanol", "hybrid", "plugin-hybrid", "hidrogen"] },
    { name: "Year From", key: "yearFrom" },
    { name: "Year To", key: "yearTo" },
    { name: "Mileage From", key: "mileageFrom" },
    { name: "Mileage To", key: "mileageTo" },
    { name: "Price From", key: "priceFrom" },
    { name: "Price To", key: "priceTo" },
];

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
            console.log(action.startsWith("set_"));
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

            if (action === "back") {
                const { back } = ctx.session.pages || {};
                if (back === "filters") {
                    const keyboard = createKeyboard.keyboard(filtersConfig, "back");
                    await updateMessage(ctx, "Please choose a filter to set:", keyboard);
                    await ctx.answerCbQuery();
                }
            }
        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Something went wrong. Please try again.");
        }
    });

    bot.on("text", async (ctx) => {
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