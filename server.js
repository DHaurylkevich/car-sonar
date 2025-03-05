const express = require('express');
const app = express();
const Manager = require("./src/index");
const CarService = require("./src/services/carService");
const { defaultAttributes } = require("./src/services/attributeService");
let intervalId = null;
// const bot = require("./src/bot");
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/start-parsing', async (req, res) => {
    res.send("Get Cars!");
    await Manager.run(bot);
    // await defaultAttributes();
    // await Manager.run(bot);

    intervalId = setInterval(async () => {
        console.log("Start parsing");
        await Manager.run(bot);
    }, 300000);
});

app.get('/clear', async (req, res) => {
    await CarService.clear();
    res.send("Delete old listings from Database!");
});

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

process.once("SIGINT", () => {
    clearInterval(intervalId);
    server.close(() => {
        process.exit(0)
    })
});
process.once("SIGTERM", () => {
    clearInterval(intervalId);
    server.close(() => { process.exit(0) })
});