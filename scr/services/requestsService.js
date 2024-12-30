const db = require("../models");
const AppError = require("../utils/appError");

const RequestsServices = {
    createOrUpdateRequest: async (filters, userId) => {
        console.log("Creating request", filters);
        const transaction = await db.sequelize.transaction();
        try {
            const user = await db.Users.findOne({
                where: { telegram_id: userId },
                include: [
                    {
                        model: db.UserRequests,
                        as: "userRequest"
                    }
                ]
            });

            const filterAttributes = Object.entries(filters)
                .filter(([key, values]) => values.length > 0)
                .flatMap(([key, values]) =>
                    values.map(value => ({ type: key, value }))
                );

            if (filterAttributes.length === 0) {
                const userRequest = await db.UserRequests.findOne({
                    where: { userId: user.id },
                    transaction
                });

                await userRequest.destroy({ transaction });
                await transaction.commit();
                return
            }

            const attributes = await Promise.all(
                filterAttributes.map(async (attr) =>
                    db.Attributes.findOrCreate({
                        raw: true,
                        where: { type: attr.type, value: attr.value },
                        defaults: attr,
                        transaction
                    })
                )
            );
            const attributesIds = attributes.map(([instance]) => instance.id);

            console.log("Созданные/Найденные атрибуты:", attributesIds);

            // let existingRequest = await db.Requests.findOne({
            //     include: {
            //         model: db.Attributes,
            //         as: "attributes",
            //         where: { id: attributesIds },
            //         required: true,
            //     },
            //     transaction
            // });

            let existingRequest = await db.sequelize.query(`
                    SELECT
                        "Requests"."id"
                    FROM
                        "requests" AS "Requests"
                        INNER JOIN "request_attributes" AS "attributes" 
                            ON "Requests"."id" = "attributes"."requestId"
                    WHERE
                        "attributes"."id" IN (:attributesIds)
                    GROUP BY
                        "Requests"."id"
                    HAVING
                        COUNT(DISTINCT "attributes"."id") = :attributesLength
                        AND COUNT("attributes"."id") = :attributesLength
                        AND NOT EXISTS (
                            SELECT 1
                            FROM "request_attributes" AS "attributes2"
                            WHERE "attributes2"."requestId" = "Requests"."id"
                                AND "attributes2"."id" NOT IN (:attributesIds)
                        )
                `, {
                replacements: {
                    attributesIds: attributesIds,
                    attributesLength: attributesIds.length
                },
                type: db.Sequelize.QueryTypes.SELECT,
                transaction
            });
            console.log(existingRequest);
            if (existingRequest.length === 0) {
                console.log("Запрос не найден");
                existingRequest = await db.Requests.create({}, { transaction });
                await existingRequest.setAttributes(attributesIds, { transaction });
            }

            const userRequest = user.userRequest ? user.userRequest : null;

            if (userRequest) {
                const requestId = existingRequest[0]?.id ? existingRequest[0].id : existingRequest.id
                await userRequest.update({ requestId }, { transaction });
            } else {
                const requestId = existingRequest[0]?.id ? existingRequest[0].id : existingRequest.id
                await db.UserRequests.create(
                    { requestId, userId: user.id },
                    { transaction }
                );
            }

            await transaction.commit();
            return;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },
    getRequestByUserId: async (userId, userFilters) => {
        try {
            const requests = await db.Requests.findAll({
                include: [
                    {
                        model: db.Attributes,
                        as: 'attributes',
                        attributes: ['type', 'value']
                    },
                    {
                        model: db.UserRequests,
                        as: 'userRequests',
                        where: { userId: userId },
                    }
                ]
            });

            const userFilters = {};
            requests.forEach(request => {
                request.attributes.forEach(attribute => {
                    if (userFilters[attribute.type]) {
                        if (!userFilters[attribute.type].includes(attribute.value)) {
                            userFilters[attribute.type].push(attribute.value);
                        }
                    }
                });
            });

            return requests;
        } catch (err) {
            throw err;
        }
    },
    updateRequest: async (requestId, date) => {
        try {
            const request = await db.Requests.findByPk(requestId);
            if (!request) {
                throw new AppError("Request not found");
            }

            await request.update({ last_request: date });
            return request;
        } catch (err) {
            throw err;
        }
    },
    getRequestsUnique: async () => {
        try {
            const uniqueRequests = await db.Requests.findAll({
                attributes: ['lastPost'],
                include: {
                    model: db.Attributes,
                    as: 'attributes',
                    attributes: ['type', 'value'],
                },
            });
            let filters = {};
            uniqueRequests.forEach(request => {
                request.attributes.forEach(attribute => {
                    if (!filters[attribute.type]) {
                        filters[attribute.type] = [];
                    }
                    if (!filters[attribute.type].includes(attribute.value)) {
                        filters[attribute.type].push(attribute.value);
                    }
                });
            });

            return filters;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = RequestsServices;
