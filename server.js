const express = require('express');
const app = express();
const Manager = require("./src/index");
const CarService = require("./src/services/carService");
const bot = require("./src/bot");
const port = process.env.PORT || 3000;
const cron = require('node-cron');

// Парсинг каждые 5 минут
const parsingTask = cron.schedule('*/5 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Start parsing`);
    await Manager.run(bot);
}); // scheduled: true → задача запускается сразу

// Очистка базы раз в месяц (1-го числа в 00:00)
const cleanupTask = cron.schedule('0 0 1 * *', async () => {
    console.log("Executing monthly cleanup...");
    await CarService.clear();
});


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/start-parsing', async (req, res) => {
    res.send("Get Cars!");
    await Manager.run(bot);
});

app.get('/clear', async (req, res) => {
    await CarService.clear();
    res.send("Delete old listings from Database!");
});

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

process.once("SIGINT", () => {
    parsingTask.stop();
    cleanupTask.stop();

    server.close(() => {
        process.exit(0)
    })
});
process.once("SIGTERM", () => {
    parsingTask.stop();
    cleanupTask.stop();

    server.close(() => { process.exit(0) })
});