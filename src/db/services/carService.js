import { logger } from "../../utils/logger.js";
import db from '../models/index.js';
import { getAllAttributes, createAttribute } from "./attributeService.js";

export const findOrCreateAllNewCars = async (carsData) => {
    const transaction = await db.sequelize.transaction();

    try {
        const results = [];
        for (const car of carsData) {
            results.push(
                await db.Cars.findOrCreate({
                    where: { link: car.link },
                    defaults: car,
                    transaction,
                })
            );
        }

        await transaction.commit();
        return results;
    } catch (error) {
        await transaction.rollback();
        logger.error('Finding or created cars error:', error);
        throw error;
    }
};

export const clear = async () => {
    await db.Cars.destroy({ where: { createdAt: { [db.Sequelize.Op.lt]: new Date() } } });
};