const { Op } = require("sequelize");
const db = require("../models");
const Logger = require("../utils/logger");

const findOrCreateRequest = async (attributes, transaction) => {
    const whereAttributes = {
        brandId: attributes.brands || null,
        fuelId: attributes.fuelTypes || null,
        countryId: attributes.countries || null,
        generationId: attributes.generations || null,
        yearFrom: attributes.yearFrom || null,
        yearTo: attributes.yearTo || null,
        priceFrom: attributes.priceFrom || null,
        priceTo: attributes.priceTo || null,
        mileageFrom: attributes.mileageFrom || null,
        mileageTo: attributes.mileageTo || null,
    };

    let existingRequest = await db.Requests.findOne({ where: whereAttributes, transaction });

    if (!existingRequest) {
        console.log("Request not found");
        existingRequest = await db.Requests.create(whereAttributes, { transaction });
    }

    return existingRequest;
};

async function currencyEUR() {
    const api = 'https://api.nbp.pl/api/exchangerates/rates/a/eur/';

    try {
        const response = await fetch(api);
        const data = await response.json();
        return data.rates[0].mid;
    } catch (error) {
        console.error('Ошибка при получении курса обмена:', error);
        return;
    }
};

const RequestsServices = {
    checkAnyRequest: async () => {
        const request = await db.Requests.findAll();
        return request.length !== 0
    },
    addOrSetRequest: async (filters, userId) => {
        const transaction = await db.sequelize.transaction();

        try {
            const user = await db.Users.findOne({ where: { telegram_id: userId }, transaction });

            const existingRequest = await findOrCreateRequest(filters, transaction);

            if (filters.id) {
                await db.UsersRequests.update(
                    { requestId: existingRequest.id },
                    { where: { userId: user.id, requestId: filters.id }, transaction }
                );
            } else {
                if (user.isPremium) {
                    await user.addRequest(existingRequest.id, { transaction });
                } else {
                    await user.setRequests([existingRequest.id], { transaction });
                }
            }

            await transaction.commit();
            return;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },
    getRequestByUserId: async (userId) => {
        try {
            const requests = await db.Requests.findAll({
                include: [
                    {
                        model: db.Brands,
                        raw: true,
                        as: 'brand',
                    },
                    {
                        model: db.FuelTypes,
                        raw: true,
                        as: 'fuel',
                    },
                    {
                        model: db.Countries,
                        raw: true,
                        as: 'country',
                    },
                    {
                        model: db.Generations,
                        raw: true,
                        as: 'generation',
                    },
                    {
                        model: db.Users,
                        through: { attributes: [] },
                        raw: true,
                        as: 'users',
                        where: { telegram_id: userId },
                    }
                ]
            });

            const filters = [];
            if (requests.length > 0) {
                requests.forEach(request => {
                    filters.push({
                        id: request.id,
                        brands: request.brandId || "",
                        fuelTypes: request.fuelId || "",
                        countries: request.countryId || "",
                        generations: request.generationId || "",
                        yearFrom: request.yearFrom || "",
                        yearTo: request.yearTo || "",
                        priceFrom: request.priceFrom || "",
                        priceTo: request.priceTo || "",
                        mileageFrom: request.mileageFrom || "",
                        mileageTo: request.mileageTo || "",
                    });
                });
                return requests[0].users[0].isPremium ? filters : filters[0];
            }

            return filters;
        } catch (err) {
            throw err;
        }
    },
    getMatchingRequests: async (car, bot, domain) => {
        Logger.info("Этап Обработка запросов для отправки");
        if (domain === "autoscout24") car.price = await currencyEUR(car.price);

        try {
            const requests = await db.Requests.findAll({
                where: {
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { brandId: car.brandId },
                                { brandId: null }
                            ]
                        },
                        {
                            [Op.or]: [
                                { fuelId: car.fuelId },
                                { fuelId: null }
                            ]
                        },
                        {
                            [Op.or]: [
                                { countryId: car.countryId },
                                { countryId: null }
                            ]
                        },
                        {
                            [Op.or]: [
                                { generationId: car.generationId },
                                { generationId: null }
                            ]
                        },
                        {
                            [Op.or]: [
                                { yearFrom: { [Op.lte]: car.year } },
                                { yearFrom: null }
                            ]
                        },
                        {
                            [Op.or]: [
                                { yearTo: { [Op.gte]: car.year } },
                                { yearTo: null }
                            ]
                        },
                        {
                            [Op.or]: [
                                { priceFrom: { [Op.lte]: car.price } },
                                { priceFrom: null }
                            ]
                        },
                        {
                            [Op.or]: [
                                { priceTo: { [Op.gte]: car.price } },
                                { priceTo: null }
                            ]
                        },
                        {
                            [Op.or]: [
                                { mileageFrom: { [Op.lte]: car.mileage } },
                                { mileageFrom: null }
                            ]
                        },
                        {
                            [Op.or]: [
                                { mileageTo: { [Op.gte]: car.mileage } },
                                { mileageTo: null }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: db.Users,
                        as: "users",
                        through: { attributes: {} },
                    }
                ]
            });

            console.log(car);
            if (requests.length === 0) return Logger.info("Подходящих запросов нет");

            const message = `\n📌 Name: ${car.name}\n💰 Price: ${car.price}\n⏰ Year: ${car.year} \n🌍 Country: ${car.country.name} \n⛽ Fuel: ${car.fuel.name} \n🔄 Generation: ${car.generation.name} \n📏 Mileage: ${car.mileage} \n🔗 Link ${car.link}`;
            console.log("Подходящие запросы найдены. Сообщение", message);

            const messagesPromises = requests.map(request => {
                request.users.map(user =>
                    bot.telegram.sendPhoto(
                        user.telegram_id,
                        car.photo ? car.photo : "https://via.placeholder.com/150",
                        { caption: message }
                    )
                );
            });

            await Promise.all(messagesPromises.flat());
        } catch (err) {
            throw err;
        }
    },
    deleteUserRequest: async (userId, requestId) => {
        try {
            await db.UsersRequests.destroy({
                where: { requestId: requestId },
                include: [
                    {
                        model: db.Users,
                        where: { telegram_id: userId },
                    }
                ]
            });
        } catch (err) {
            throw err;
        }
    },
    resetUser: async (userId) => {
        try {
            const user = await db.Users.findOne({ where: { telegram_id: userId } });

            if (!user) {
                throw new Error("User not found");
            }

            await db.UsersRequests.destroy({
                where: { userId: user.id }
            });

            await user.destroy();
        } catch (err) {
            throw err;
        }
    }
};

module.exports = RequestsServices;