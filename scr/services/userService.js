const db = require("../models");
const logger = require("../utils/logger");
const { getRequestByUserId } = require("./requestsService");

const UserServices = {
    createOrGetUser: async (userData, userFilters) => {
        try {
            const user = await db.Users.findOne({ where: { telegram_id: userData.telegram_id } });
            if (user) {
                logger.info("User exists");
                return await getRequestByUserId(user.id, userFilters);
            }

            await db.Users.create(userData);
            return userFilters;
        } catch (err) {
            throw err;
        }
    },
    getUserMessageId: async (telegramId) => {
        try {
            const user = await db.Users.findOne({ where: { telegram_id: telegramId }, attributes: ["post_message_id"] });

            return user;
        } catch (err) {
            throw err;
        }
    },
    updateUser: async (userData) => {
        try {
            const user = await db.Users.findOne({ where: { telegram_id: userData.telegram_id } });
            console.log(userData.postMessageId);
            const newUser = await user.update({ post_message_id: userData.postMessageId });
            return newUser;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = UserServices;