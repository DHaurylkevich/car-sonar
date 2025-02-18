const express = require('express')
const app = express()
const Manager = require("./src/index")
const bot = require("./src/bot");
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/cars', async (req, res) => {
    res.send("Get Cars!");
    await Manager.run(bot);
});

const server = app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

process.once("SIGINT", () => { server.close(() => { process.exit(0) }) });
process.once("SIGTERM", () => { server.close(() => { process.exit(0) }) });