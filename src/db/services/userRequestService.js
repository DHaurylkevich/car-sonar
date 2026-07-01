import db from "../models/index.js"

export async function updateUserReq(userId, oldRequestId, newRequestId, transaction) {
    await db.UsersRequests.update(
        { requestId: newRequestId },
        {
            where: {
                userId: userId,
                requestId: oldRequestId
            },
            transaction
        }
    );
}

export async function destroyUserReq(userId, transaction) {
    await db.UsersRequests.destroy({
        where: { userId },
        transaction
    });
}

/**
 * Находит requests, которые больше не привязаны ни к одному пользователю (orphaned)
 * @param {Array<number>} requestIds - ID запросов для проверки
 * @param {Transaction} transaction - Sequelize транзакция
 * @returns {Array<number>} ID orphaned requests
 */
export async function findOrphanedRequests(requestIds, transaction) {
    if (!requestIds || requestIds.length === 0) {
        return [];
    }

    // Найти requests которые есть в UsersRequests
    const linkedRequests = await db.UsersRequests.findAll({
        attributes: ['requestId'],
        where: {
            requestId: requestIds
        },
        raw: true,
        transaction
    });

    const linkedRequestIds = new Set(linkedRequests.map(ur => ur.requestId));

    return requestIds.filter(id => !linkedRequestIds.has(id));
}

/**
 * Удаляет orphaned requests (без привязок пользователям)
 * @param {Array<number>} requestIds - ID запросов для удаления
 * @param {Transaction} transaction - Sequelize транзакция
 */
export async function deleteOrphanedRequests(requestIds, transaction) {
    if (!requestIds || requestIds.length === 0) {
        return;
    }

    await db.Requests.destroy({
        where: {
            id: requestIds
        },
        transaction
    });
}

export const deleteUserReqByTelegramId = async (userId, requestId, transaction = undefined) => {
    await db.UsersRequests.destroy({
        where: { requestId: requestId },
        include: [
            {
                model: db.Users,
                where: { telegram_id: userId },
            }
        ],
        transaction
    });

    const remainingLinks = await db.UsersRequests.count({
        where: { requestId: requestId },
        transaction
    });

    if (remainingLinks === 0) {
        await db.Requests.destroy({
            where: { id: requestId },
            transaction
        });
    }
};