const db = require("../models");

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
}

const RequestsServices = {
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
    getRequestsUnique: async () => {
        try {
            const EUR = currencyEUR();

            const newCars = await db.Cars.findAll({ where: { sendedUSer: false } });

            const normalizeCars = newCars.map(car => {
                if (car.site === "autoscout") {
                    car.price *= EUR;
                }
            })

            const requests = [];
            for (const car of normalizeCars) {
                const matchingRequests = await db.Requests.findAll({
                    where: {
                        [Op.and]: [
                            { brandId: car.brandId },
                            { minYear: { [Op.lte]: car.year } },
                            { maxYear: { [Op.gte]: car.year } },
                            { minPrice: { [Op.lte]: car.price } },
                            { maxPrice: { [Op.gte]: car.price } }
                        ]
                    },
                    include: [
                        {
                            model: db.UsersRequests,
                            attribute: ["userId"]
                        }
                    ],
                    transaction
                });

                if (matchingRequests && matchingRequests.UsersRequests) {
                    requests.push(
                        {}
                    );
                }
            };

            const filters = uniqueRequests.map(request => {
                const attributes = {};
                request.attributes.forEach(attribute => {
                    if (!attributes[attribute.type]) {
                        attributes[attribute.type] = [];
                    }
                    if (!attributes[attribute.type].includes(attribute.value)) {
                        attributes[attribute.type].push(attribute.value);
                    }
                });

                return {
                    id: request.id,
                    otomoto: request.otomoto,
                    olx: request.olx,
                    autoscount: request.autoscount,
                    userIds: request.userRequests.map(userRequest => userRequest.user.telegram_id),
                    attributes
                };
            });

            return filters;
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