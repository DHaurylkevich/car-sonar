const { Sequelize } = require("sequelize");
const logger = require("../utils/logger");
const NODE_ENV = process.env.NODE_ENV || "development";
logger.info(NODE_ENV);


const config = {
    url: NODE_ENV === "test" ? process.env.DB_URL : process.env.DB_URL_DEV || null,
    logging: false
};

let sequelize;
if (config.url) {
    sequelize = new Sequelize(config.url, config);

    (async () => {
        try {
            logger.info("Database connected...");
            await sequelize.authenticate();
            logger.info("Database connected successfully!");

            if (NODE_ENV === "test") {
                await sequelize.sync({ force: true });
                logger.info("Database synchronized successfully!");
            }
        } catch (err) {
            logger.error("Error connecting to database");
        }
    }
    )();
} else {
    logger.error("Database URL is not provided");
}

module.exports = sequelize;