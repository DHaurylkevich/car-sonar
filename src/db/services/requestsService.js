import { Op } from "sequelize";
import db from "../models/index.js";
import { logger } from "../../utils/logger.js";
import { findUserByTelegramId } from "./userService.js";
import { updateUserReq } from "./userRequestService.js";
import { isInRange, dataFormatting } from "../../utils/utils.js";

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

export async function getAllRequestsWithUser() {
    const requests = await db.Requests.findAll({
        raw: true,
        nest: true,
        include: [{
            model: db.Users,
            attributes: ["telegram_id"],
            as: 'users',
        }]
    })

    return requests;
};

export async function createRequest(attributes, transaction) {
    let newRequest = await db.Requests.create(attributes, { transaction });
    return newRequest.get({ plain: true });
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
    const transaction = await db.sequelize.transaction();

    try {
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