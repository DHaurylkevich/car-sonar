import { logger } from "../../utils/logger.js";

export async function sendMessage(bot, messageData) {
    logger.info("Sending messages");

    if (!messageData || !messageData.length) return logger.warn("Not found car for sending!");

    const messagesPromises = messageData.flatMap(request => {
        const car = request.car;
        const users = request.telegramIds;

        const message = `\n📌 Name: ${car.name}\n * Brand: ${car.brand}\n💰 Price: ${car.price} zł\n⏰ Year: ${car.year} \n⛽ Fuel: ${car.fuelType} \n🔄 Generation: ${car.generation}\n📏 Mileage: ${car.mileage} \n🔗 Link ${car.link}`;

        return users.map(telegram_id =>
            bot.telegram.sendPhoto(
                telegram_id,
                car.photo ? car.photo : "https://via.placeholder.com/150",
                { caption: message }
            )
        );
    });

    const results = await Promise.allSettled(messagesPromises);
    results.forEach(result => {
        if (result.status === "rejected") {
            logger.error(`Failed to send message: ${result.reason?.message ?? result.reason}`);
        }
    });

    logger.info("Messages are sended");
};