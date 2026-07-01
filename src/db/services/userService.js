import db from "../models/index.js";
import { logger } from "../../utils/logger.js";
import { destroyUserReq, findOrphanedRequests, deleteOrphanedRequests } from "./userRequestService.js";

export const createUser = async (userData) => {
    try {
        await db.Users.create(userData);
        logger.info(`User created: telegram_id=${userData.telegram_id}`);
    } catch (err) {
        logger.error("Error creating user:", err);
        throw err;
    }
};

export const findUserByTelegramId = async (telegramId, transaction) => {
    const user = await db.Users.findOne({ where: { telegram_id: telegramId }, transaction });
    return user;
};

export const resetUser = async (userId) => {
    const transaction = await db.sequelize.transaction();

    try {
        const user = await findUserByTelegramId(userId, transaction);

        if (!user) {
            throw new Error("User not found");
        }

        // Найти все requests пользователя ДО удаления связей
        const userRequests = await db.UsersRequests.findAll({
            attributes: ['requestId'],
            where: { userId: user.id },
            raw: true,
            transaction
        });

        const requestIds = userRequests.map(ur => ur.requestId);
        logger.info(`[User ${userId}] Found ${requestIds.length} requests before deletion`);

        // Удалить все связи UsersRequests
        await destroyUserReq(user.id, transaction);

        // Найти orphaned requests (те что больше ни к кому не привязаны)
        const orphanedIds = await findOrphanedRequests(requestIds, transaction);
        logger.info(`[User ${userId}] Found ${orphanedIds.length} orphaned requests`);

        // Удалить orphaned requests
        if (orphanedIds.length > 0) {
            await deleteOrphanedRequests(orphanedIds, transaction);
            logger.info(`[User ${userId}] Deleted ${orphanedIds.length} orphaned requests`);
        }

        await user.destroy({ transaction });

        await transaction.commit();
        logger.info(`[User ${userId}] User deleted successfully with cleanup`);
    } catch (err) {
        await transaction.rollback();
        logger.error(`[User ${userId}] Error resetting user:`, err);
        throw err;
    }
};

// export const getUserMessageId = async (telegramId) => {
//     try {
//         const user = await db.Users.findOne({ where: { telegram_id: telegramId }, attributes: ["post_message_id"] });

//         return user;
//     } catch (err) {
//         throw err;
//     }
// };

// export const updateUser = async (userData) => {
//     try {
//         const user = await db.Users.findOne({ where: { telegram_id: userData.telegram_id } });
//         const newUser = await user.update({ post_message_id: userData.postMessageId });
//         return newUser;
//     } catch (err) {
//         throw err;
//     }
// };