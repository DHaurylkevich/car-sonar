const createKeyboard = require("../components/createKeyboard");

const filtersList = [
    { name: "Brand", key: "brand" },
    // { name: "Model", key: "model" },
    { name: "Typ nadwozia", key: "generation" },
    { name: "City", key: "city" },
    { name: "Fuel Type", key: "fuelType" },
    { name: "Year From", key: "yearFrom" },
    { name: "Year To", key: "yearTo" },
    { name: "Mileage From", key: "mileageFrom" },
    { name: "Mileage To", key: "mileageTo" },
    { name: "Price From", key: "priceFrom" },
    { name: "Price To", key: "priceTo" },
];

const carFilters =
{
    brand: ["abarth", "acura", "aiways", "aixam", "alfa-romeo", "alpina", "alpine", "arcfox", "asia", "aston-martin", "audi", "austin", "autobianchi", "avatr", "baic", "bentley", "bmw", "brilliance", "bugatti", "buick", "byd", "cadillac", "casalini", "caterham", "cenntro", "changan", "chatenet", "chevrolet", "chrysler", "citroen", "cupra", "dacia", "daewoo", "daihatsu", "delorean", "dfm", "dfsk", "dkw", "dodge", "doosan", "dr-motor", "ds-automobiles", "e-go", "elaris", "faw", "fendt", "ferrari", "fiat", "fisker", "ford", "forthing", "gaz", "geely", "genesis", "gmc", "gwm", "hiphi", "honda", "hongqi", "hummer", "hyundai", "iamelectric", "ineos", "infiniti", "isuzu", "iveco", "jac", "jaecoo", "jaguar", "jeep", "jetour", "jinpeng", "kia", "ktm", "lada", "lamborghini", "lancia", "land-rover", "leapmotor", "levc", "lexus", "ligier", "lincoln", "lixiang", "lotus", "lti", "lucid", "lynk-and-co", "man", "maserati", "maximus", "maxus", "maybach", "mazda", "mclaren", "mercedes-benz", "mercury", "mg", "microcar", "mini", "mitsubishi", "morgan", "nio", "nissan", "nysa", "oldsmobile", "omoda", "opel", "inny", "peugeot", "piaggio", "plymouth", "polestar", "polonez", "pontiac", "porsche", "ram", "renault", "rolls-royce", "rover", "saab", "sarini", "saturn", "seat", "seres", "shuanghuan", "skoda", "skywell", "skyworth", "smart", "ssangyong", "subaru", "suzuki", "syrena", "tarpan", "tata", "tesla", "toyota", "trabant", "triumph", "uaz", "vauxhall", "velex", "volkswagen", "volvo", "voyah", "waltra", "marka_warszawa", "wartburg", "wolga", "xiaomi", "xpeng", "zaporozec", "zastawa", "zeekr", "zhidou", "zuk"],
    generation: ["seg-mini", "seg-cabrio", "seg-city-car", "seg-combi", "seg-compact", "seg-coupe", "seg-minivan", "seg-sedan", "seg-suv"],
    city: ["warszawa"],
    fuelType: ["petrol", "petrol-cng", "petrol-lpg", "diesel", "electric", "etanol", "hybrid", "plugin-hybrid", "hidrogen"],
    mileageFrom: [1213], mileageTo: [123123],
    priceFrom: [10000], priceTo: [20000],
};
let wasChosen = false;
let messageForEdit;

const filter = (bot) => {
    bot.action("filters", async (ctx) => {
        if (wasChosen) {
            keyboard = createKeyboard.keyboard(filtersList, "save");
            wasChosen = false;
        } else {
            keyboard = createKeyboard.keyboard(filtersList, "back");
        }
        await ctx.editMessageText("Please choose a filter to set:", keyboard);
    });

    filtersList.forEach(({ key }) => {
        bot.action(key, async (ctx) => {
            ctx.session.pages.key = key;

            let keyboard;

            if (key.includes("To") || key.includes("From")) {
                const year = ctx.session.filters[key] ? ctx.session.filters[key][0] : ""
                ctx.session.pages.text = `Please choose a ${key}: ${year}`;
                keyboard = createKeyboard.backKeyboard();
            } else {
                ctx.session.pages.list = carFilters[key];
                ctx.session.pages.back = "filters";
                ctx.session.pages.text = `Please choose a ${key}`;

                keyboard = createKeyboard.listKeyboard(ctx.session.pages, ctx.session.filters);
            }

            await ctx.editMessageText(ctx.session.pages.text, keyboard);

            messageForEdit = ctx.callbackQuery.message;
            await ctx.answerCbQuery();
        })

        if (!key.includes("To") && !key.includes("From")) {
            carFilters[key].forEach(filter => {
                return bot.action(`set_${filter}`, async (ctx) => {
                    const selectedFilters = ctx.session.filters[key];
                    const isInUserFilters = ctx.session.filters[key].includes(filter);

                    if (isInUserFilters) {
                        ctx.session.filters[key] = selectedFilters.filter(item => item !== filter);
                    } else {
                        ctx.session.filters[key].push(filter);
                    }
                    wasChosen = true;

                    // console.log("CHOSE", selectedFilters)
                    const keyboard = createKeyboard.listKeyboard(ctx.session.pages, ctx.session.filters);
                    await ctx.editMessageText(ctx.session.pages.text, keyboard);
                    await ctx.answerCbQuery()
                })
            })
        }
    });
    bot.on("text", async (ctx) => {
        if (!ctx.session.filters[ctx.session.pages.key]) {
            ctx.session.filters[ctx.session.pages.key] = []
        }
        ctx.session.filters[ctx.session.pages.key].push(ctx.message.text);
        ctx.session.pages.text += `${ctx.session.filters[ctx.session.pages.key]}`

        await ctx.deleteMessage(ctx.message.message_id);

        wasChosen = true;
        keyboard = createKeyboard.backKeyboard();
        await ctx.telegram.editMessageText(messageForEdit.chat.id, messageForEdit.message_id, undefined, ctx.session.pages.text, keyboard);
    });
};

module.exports = filter;