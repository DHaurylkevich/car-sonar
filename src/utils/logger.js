const { createLogger, format, transports } = require("winston");

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
    ]
});

module.exports = logger;