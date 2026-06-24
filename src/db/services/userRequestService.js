import db from "../models/index.js"

export async function updateUserReq(userId, oldRequestId, newRequestId) {
    await db.UsersRequests.update(
        { requestId: newRequestId },
        {
            where: {
                userId: userId,
                requestId: oldRequestId
            }
        }
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