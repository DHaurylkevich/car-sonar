import { Sequelize } from "sequelize";
import { logger } from "../utils/logger.js";
const NODE_ENV = process.env.NODE_ENV || "development";
logger.info(NODE_ENV);

const config = {
    url: NODE_ENV === "test" ? process.env.DB_URL : process.env.DB_URL_DEV || null,
    dialect: "postgres",
    logging: false
};

export const sequelize = new Sequelize(config.url, config);

export const connectToDB = async () => {
    if (!config.url) {
        logger.error("Database URL is not provided");
    }

    try {
        logger.info("Connecting database...");
        await sequelize.authenticate();
        logger.info("Database connected successfully!");

        if (NODE_ENV === "test") {
            await sequelize.sync({ force: true });
            logger.info("Database synchronized successfully!");
        }

    } catch (e) {
        logger.error("Error connecting to database", e);
    }
};