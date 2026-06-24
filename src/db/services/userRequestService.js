import db from "../models/index.js"

export async function updateUserReq(userId, requestId) {
    await db.UsersRequests.update(
        { requestId: requestId },
        { where: { userId: userId, requestId: filters.id } }
    );
}

export async function destroyUserReq(userId) {
    await db.UsersRequests.destroy({
        where: { userId }
    });
};

export const deleteUserReqByTelegramId = async (userId, requestId) => {
    await db.UsersRequests.destroy({
        where: { requestId: requestId },
        include: [
            {
                model: db.Users,
                where: { telegram_id: userId },
            }
        ]
    });
};