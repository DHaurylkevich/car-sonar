import db from "../models/index.js";
import { logger } from "../../utils/logger.js";
import { destroyUserReq } from "./userRequestService.js";

export const createUser = async (userData) => {
    try {
        await db.Users.create(userData);
        return;
    } catch (err) {
        throw err;
    }
};

export const findUserByTelegramId = async (telegramId) => {
    const user = await db.Users.findOne({ where: { telegram_id: telegramId } });
    return user;
};

export const resetUser = async (userId) => {
    try {
        const user = findUserByTelegramId(userId);

        if (!user) {
            throw new Error("User not found");
        }

        await destroyUserReq(user.id);

        await user.destroy();
    } catch (err) {
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