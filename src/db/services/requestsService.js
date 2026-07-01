import { Op } from "sequelize";
import db from "../models/index.js";
import { logger } from "../../utils/logger.js";
import { findUserByTelegramId } from "./userService.js";
import { updateUserReq } from "./userRequestService.js";

export async function findRequest(attributes) {
    try {
        const request = await db.Requests.findOne({ where: attributes, raw: true });
        if (request) {
            logger.debug(`Found request: id=${request.id}`);
        }
        return request;
    } catch (err) {
        logger.error("Error finding request:", err);
        throw err;
    }
};

export async function createRequest(attributes, transaction) {
    let newRequest = await db.Requests.create(attributes, { transaction });
    return newRequest.get({ plain: true });
};

async function currencyEUR() {
    const api = 'https://api.nbp.pl/api/exchangerates/rates/a/eur/';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(api, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const rate = data.rates[0].mid;
        logger.debug(`EUR rate fetched: ${rate}`);
        return rate;
    } catch (error) {
        logger.error('Error fetching EUR currency:', error);
        return null; // Return null instead of undefined
    } finally {
        clearTimeout(timeout);
    }
};
function dataFormatting(request) {
    return {
        id: request.id,
        brands: request.brandId ?? null,
        fuelTypes: request.fuelId ?? null,
        generations: request.generationId ?? null,
        yearFrom: request.yearFrom ?? null,
        yearTo: request.yearTo ?? null,
        priceFrom: request.priceFrom ?? null,
        priceTo: request.priceTo ?? null,
        mileageFrom: request.mileageFrom ?? null,
        mileageTo: request.mileageTo ?? null,
    }
};

async function getOrCreateReq(attributes, transaction) {
    const whereAttributes = {
        brandId: attributes.brands || null,
        fuelId: attributes.fuelTypes || null,
        generationId: attributes.generations || null,
        yearFrom: attributes.yearFrom || null,
        yearTo: attributes.yearTo || null,
        priceFrom: attributes.priceFrom || null,
        priceTo: attributes.priceTo || null,
        mileageFrom: attributes.mileageFrom || null,
        mileageTo: attributes.mileageTo || null,
    };

    const request = await findRequest(whereAttributes);
    if (!request) {
        logger.info("Request not found, creating new request", { whereAttributes });
        const newRequest = await createRequest(whereAttributes, transaction);
        logger.info(`New request created: id=${newRequest.id}`);
        return newRequest;
    }

    logger.debug(`Using existing request: id=${request.id}`);
    return dataFormatting(request);
};

export const requestExists = async () => {
    const request = await db.UsersRequests.findAll();
    return request.length !== 0
};

export const addOrSetRequest = async (filters, userId) => {
    try {
        const transaction = await db.sequelize.transaction();

        const user = await findUserByTelegramId(userId, transaction);

        const request = await getOrCreateReq(filters, transaction);

        if (filters.id) {
            await updateUserReq(user.id, filters.id, request.id, transaction);
        } else {
            if (user.isPremium) {
                await user.addRequest(request.id, { transaction });
            } else {
                await user.setRequests([request.id], { transaction });
            }
        }

        await transaction.commit();
        return dataFormatting(request);
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

export const getRequestByUserId = async (userId) => {
    const requests = await db.Requests.findAll({
        raw: true,
        nest: true,
        include: [
            {
                model: db.Brands,
                as: 'brand',
            },
            {
                model: db.FuelTypes,
                as: 'fuel',
            },
            {
                model: db.Generations,
                as: 'generation',
            },
            {
                model: db.Users,
                through: { attributes: [] },
                as: 'users',
                where: { telegram_id: userId },
            }
        ]
    });

    let filters = [];
    if (requests.length > 0) {
        filters = requests.map(request => dataFormatting(request));
    }

    return filters;
};

export const getMatchingRequests = async (car, bot, domain) => {
    Logger.info("Stage of processing requests for sending messages");
    if (!car) return;
    if (domain === "autoscout24" && car.price) {
        car.price = await currencyEUR(car.price);
    }

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
                    where: { [Op.not]: { id: null } },
                    through: { attributes: {} },
                }
            ]
        });

        if (requests.length === 0) return Logger.info("No matching requests found");

        const message = `\n📌 Name: ${car.name}\n💰 Price: ${car.price} zł\n⏰ Year: ${car.year} \n⛽ Fuel: ${car.fuel.name} \n🔄 Generation: ${car.generation.name} \n📏 Mileage: ${car.mileage} \n🔗 Link ${car.link}`;
        Logger.info("Sending messages to users");

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
};